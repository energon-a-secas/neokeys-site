#!/usr/bin/env python3
"""
NeoKeys preflight — decide whether a site can take bare single-key shortcuts.

Rolling a bare `h` onto a site full of text fields is the one way this system
gets itself switched off everywhere. This scans a site's markup and JS and
reports which of three profiles it qualifies for, so the decision is made from
the site's own source rather than from someone's memory of it.

    python3 tools/preflight.py                 # every project
    python3 tools/preflight.py cardforge-site  # one project
    python3 tools/preflight.py --profile safe  # only sites in that tier

Profiles
  safe      No text surfaces the guard cannot see. Bare keys are fine.
  guarded   Has surfaces needing `typingSelector` or `data-neo-keys="off"`.
            Enable, but declare the editor region first.
  review    Uses shadow DOM, or already binds a reserved key. A person looks
            at this one before anything is enabled.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PROJECTS = ROOT / "projects"
SKIP = {"assistant", "fine-loop", "dyad"}

RESERVED = {"?", "h", "g"}

# Editor libraries that render text into elements the guard cannot classify.
EDITOR_SIGNATURES = {
    "cm-editor": "CodeMirror 6",
    "CodeMirror": "CodeMirror 5",
    "ProseMirror": "ProseMirror",
    "monaco": "Monaco",
    "ql-editor": "Quill",
    "tiptap": "TipTap",
}


def strip_comments(src: str) -> str:
    """Drop JS comments before matching signatures.

    The first run of this script flagged neokeys-site itself as a CodeMirror
    and ProseMirror user, because core.js names both in a comment explaining
    the typingSelector option. A preflight that reports things that are not
    there is one nobody reads, so comments come out before anything is
    counted. Strings are left alone: a real `document.querySelector('.cm-editor')`
    should still count as a hit.
    """
    src = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", " ", src)


def scan(site: Path) -> dict:
    html = []
    js = []
    for f in site.rglob("*"):
        if not f.is_file() or "node_modules" in f.parts or ".git" in f.parts:
            continue
        # rewind-site archives copies of other sites; counting them would
        # attribute another site's inputs to this one.
        if "snapshots" in f.parts:
            continue
        if f.suffix == ".html":
            html.append(f)
        elif f.suffix == ".js" and not f.name.startswith("neorgon-"):
            js.append(f)

    text = "\n".join(f.read_text(errors="replace") for f in html)
    code = strip_comments("\n".join(f.read_text(errors="replace") for f in js))

    r = {"site": site.name}

    # Surfaces the guard recognises on its own.
    r["inputs"] = len(re.findall(r"<input\b(?![^>]*type=[\"'](?:checkbox|radio|button|submit|range|color|file)[\"'])", text, re.I))
    r["textareas"] = len(re.findall(r"<textarea\b", text, re.I))
    r["contenteditable"] = len(re.findall(r"contenteditable", text, re.I))
    r["role_textbox"] = len(re.findall(r"role=[\"'](?:textbox|searchbox|combobox|spinbutton)[\"']", text, re.I))

    # Surfaces it cannot.
    r["editors"] = sorted({name for sig, name in EDITOR_SIGNATURES.items()
                           if sig in text or sig in code})
    r["shadow_dom"] = bool(re.search(r"attachShadow", code))

    # Inputs created at runtime never appear in the HTML, so a site can look
    # clean and still be full of fields.
    r["dynamic_inputs"] = bool(re.search(r"createElement\(\s*['\"](?:input|textarea)['\"]", code))

    # Reserved keys the site already binds bare.
    #
    # Matching any identifier, not just one literally named `key`. The first
    # version required the token `key` before the comparison and therefore
    # missed pathfinder, which normalises to a local `k` and then writes
    # `if (k === 'h')`. It reported that site clean for `h` while the site
    # shipped its own bare-H chrome toggle, which is the exact collision this
    # script exists to find. Scoped to files that handle keydown so an
    # unrelated `type === 'g'` elsewhere does not raise a flag.
    claimed = set()
    if "keydown" in code or "keyup" in code or "keypress" in code:
        for m in re.finditer(r"""[A-Za-z_$][\w$.]*\s*(?:===|==)\s*['"]([?hg])['"]""", code):
            window = code[max(0, m.start() - 240):m.start()]
            if not re.search(r"(altKey|ctrlKey|metaKey)", window):
                claimed.add(m.group(1))
    r["claims_reserved"] = sorted(claimed)

    r["text_surfaces"] = r["inputs"] + r["textareas"] + r["contenteditable"] + r["role_textbox"]

    if r["shadow_dom"] or r["claims_reserved"]:
        r["profile"] = "review"
    elif r["editors"] or r["dynamic_inputs"]:
        r["profile"] = "guarded"
    else:
        r["profile"] = "safe"

    reasons = []
    if r["claims_reserved"]:
        reasons.append(f"already binds bare {', '.join(r['claims_reserved'])}")
    if r["shadow_dom"]:
        reasons.append("uses shadow DOM (guard needs composedPath, which it has, but verify)")
    if r["editors"]:
        reasons.append(f"editor library: {', '.join(r['editors'])} — set typingSelector")
    if r["dynamic_inputs"]:
        reasons.append("builds inputs at runtime — markup count understates it")
    if not reasons:
        reasons.append(f"{r['text_surfaces']} text surface(s), all guard-visible")
    r["why"] = "; ".join(reasons)
    return r


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    want = None
    for a in sys.argv[1:]:
        if a.startswith("--profile"):
            want = a.split("=", 1)[1] if "=" in a else None

    targets = ([PROJECTS / a for a in args] if args
               else [p for p in sorted(PROJECTS.iterdir())
                     if p.is_dir() and p.name not in SKIP and (p / "index.html").exists()])

    rows = [scan(t) for t in targets if t.exists()]
    if want:
        rows = [r for r in rows if r["profile"] == want]

    order = {"safe": 0, "guarded": 1, "review": 2}
    rows.sort(key=lambda r: (order[r["profile"]], -r["text_surfaces"]))

    if "--json" in sys.argv:
        print(json.dumps(rows, indent=1))
        return 0

    tally = {"safe": 0, "guarded": 0, "review": 0}
    print(f"{'site':26} {'profile':9} {'text':>5}  why")
    print("-" * 100)
    for r in rows:
        tally[r["profile"]] += 1
        print(f"{r['site']:26} {r['profile']:9} {r['text_surfaces']:5}  {r['why'][:58]}")
    print("-" * 100)
    print(f"safe {tally['safe']}   guarded {tally['guarded']}   review {tally['review']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

// ── Event wiring ─────────────────────────────────────────────
// Everything the page listens for that is not itself a NeoKeys shortcut.
// The shortcuts are registered here too, because registering them is the
// thing being demonstrated.

import { $ } from './utils.js';
import { state } from './state.js';
import { renderVerdict, logCollision } from './render.js';

let monitor = null;

/** Mirror every dispatch verdict into the monitor. */
export function onKeyVerdict(verdict, e) {
  state.lastVerdict = verdict;
  if (!monitor) return;
  renderVerdict(monitor, verdict, e.key);
}

export function initMonitor() {
  monitor = { keyEl: $('monKey'), badgeEl: $('monBadge'), whyEl: $('monWhy') };
  renderVerdict(monitor, null, null);
}

/* ── Buttons that trigger the kit ─────────────────────────────
   Delegated, because the hero chips and the mechanic cards are both rendered
   and both use data-action. */
export function bindActions(kit) {
  const run = {
    sheet: () => kit.sheet.toggle(),
    chrome: () => kit.chrome.toggle(),
    fleet: () => kit.fleet.toggle(),
    store: () => kit.store.toggle(),
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn && run[btn.dataset.action]) { run[btn.dataset.action](); return; }

    const copy = e.target.closest('[data-copy]');
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => {
        const original = copy.textContent;
        copy.textContent = 'Copied';
        setTimeout(() => { copy.textContent = original; }, 1400);
      });
    }
  });

  $('openSheet')?.addEventListener('click', () => kit.sheet.toggle());
  $('openFleet')?.addEventListener('click', () => kit.fleet.toggle());
}

/* ── Collision lab ────────────────────────────────────────────
   Registers for real against the live registry. Anything accepted here shows
   up in the ? sheet immediately, which is the proof that the sheet is
   generated rather than written. */
export function bindCollisionLab(kit) {
  const form = $('collideForm');
  const log = $('collideLog');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = $('collideKey').value.trim();
    const label = $('collideLabel').value.trim() || 'Unnamed shortcut';

    if (!key) {
      logCollision(log, { ok: false, key: '', reason: 'Enter a key first.' });
      return;
    }

    const { accepted, rejected } = kit.register([{
      key,
      label,
      hint: 'Added from this page',
      run: () => {
        const el = $('monWhy');
        if (el) el.textContent = `Your shortcut "${label}" ran.`;
      },
    }]);

    if (rejected.length) {
      logCollision(log, { ok: false, key, reason: rejected[0].reason });
      return;
    }
    state.labEntries.push(accepted[0].id);
    logCollision(log, { ok: true, key, label });
    $('collideKey').value = '';
    $('collideLabel').value = '';
  });
}

/* The guard demo only proves anything if the probes actually take focus and
   the page does not steal it back. Nothing to bind: core.js reads
   document.activeElement's tag at dispatch time. This function exists to
   register the site's own shortcuts, which is what a real site would do. */
export function registerPageShortcuts(kit) {
  kit.register([
    {
      key: 't',
      label: 'Jump to the tutorial',
      hint: 'A site-owned shortcut, registered like any other',
      run: () => document.getElementById('install-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    },
    {
      key: 'k',
      label: 'Jump to the key map',
      hint: 'Site-owned',
      run: () => document.getElementById('map-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    },
  ]);
}

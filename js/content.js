/**
 * Page content as data.
 *
 * The survey numbers here are measured, not remembered: they come from reading
 * every keydown handler in the 65 project folders, with rewind-site's
 * snapshots/ directory excluded because it holds archived copies of other
 * sites and inflates every count that touches it.
 */

export const MECHANICS = [
  {
    key: '?',
    name: 'The shortcut sheet',
    owner: 'Kit owns it',
    body: 'Lists whatever is registered, generated on open. A page cannot ship a help '
        + 'screen that disagrees with its own bindings, because there is no second list to disagree with.',
    action: 'sheet',
    cta: 'Open the sheet',
  },
  {
    key: 'H',
    name: 'Hide the chrome',
    owner: 'Kit owns it, sites opt in',
    body: 'Drops the header and footer and hands the space back. Measured on sortie-site: '
        + '56px of header and 48.6px of footer, 104.6px in total, about 13% of an 800px viewport.',
    action: 'chrome',
    cta: 'Hide it',
  },
  {
    key: 'G',
    name: 'Jump to a site',
    owner: 'Kit owns it',
    body: 'Fuzzy filter over every live Neorgon site, read from the same registry that '
        + 'generates the fleet docs. Before this, the only route between two sites was going back to the hub.',
    action: 'fleet',
    cta: 'Open the switcher',
  },
  {
    key: 'Esc',
    name: 'Close the top layer',
    owner: 'Convention only',
    body: 'Deliberately not reserved. Nearly every site already binds Escape for its own '
        + 'panels, so a kit that claimed it would either break them or be a rule nobody keeps. '
        + 'The meaning is fixed; the handler stays yours.',
    action: null,
    cta: null,
  },
];

export const INSTALL = [
  {
    title: 'Copy the kit in',
    body: 'One directory, no build step and no dependencies. It ships its own stylesheet.',
    code: 'packages/neorgon-ui/sync-keys.sh --to my-site',
    lang: 'bash',
  },
  {
    title: 'Start it once',
    body: 'Installs a single document listener. Everything else hangs off the registry.',
    code: `import { init } from './neokeys/index.js';\ninit();`,
    lang: 'js',
  },
  {
    title: 'Register what the page does',
    body: 'This is the only step with judgment in it. Give every shortcut a label, because '
        + 'the label is what the sheet shows and what a collision warning names.',
    code: `NeoKeys.register([\n  { key: 'c', label: 'Console',   run: goConsole },\n  { key: 't', label: 'Transform', run: cycleForm },\n]);`,
    lang: 'js',
  },
];

export const KEYMAP = [
  {
    tier: 'Fleet reserved',
    note: 'The kit binds these. Registering one is refused.',
    tone: 'reserved',
    rows: [
      { key: '?', meaning: 'Shortcut sheet', detail: 'Generated from the registry' },
      { key: 'H', meaning: 'Hide chrome', detail: 'Opt in with a meta tag' },
      { key: 'G', meaning: 'Go to a site', detail: 'Fuzzy fleet switcher' },
    ],
  },
  {
    tier: 'Fleet convention',
    note: 'The kit does not implement these. If a site uses the key, it has to mean this.',
    tone: 'convention',
    rows: [
      { key: '/', meaning: 'Focus search or filter', detail: '8 sites converged here with no coordination' },
      { key: 'Esc', meaning: 'Close the topmost layer', detail: 'Already near universal' },
      { key: 'S', meaning: 'Share or copy link', detail: '' },
      { key: 'E', meaning: 'Export or download', detail: '' },
      { key: 'R', meaning: 'Reset, reroll, regenerate', detail: '' },
      { key: '[ ]', meaning: 'Previous and next in a series', detail: '' },
    ],
  },
  {
    tier: 'Yours',
    note: 'Everything else. Register it and it shows up in the sheet for free.',
    tone: 'site',
    rows: [
      { key: 'C F M T O', meaning: "Sortie's own bindings", detail: 'Site-owned, and that is fine' },
      { key: 'Alt+H', meaning: 'High contrast', detail: 'pathfinder and cartograph; modifiers are never claimed' },
    ],
  },
];

/* The three findings that shaped the design. Each one is checkable, which is
   the only reason to put a number on a page. */
export const SURVEY = [
  {
    stat: '8',
    label: 'sites already use /',
    body: 'agentlore, incident-runbook, interviews, neorgon, parla, questline, snippets and stash '
        + 'all focus search with it, none of them having agreed to. That is what an unmanaged '
        + 'convention looks like when it goes right. It usually does not.',
  },
  {
    stat: '1',
    label: 'project claims bare H',
    body: 'rush-q-cards binds it to a tutorial. It runs no header kit, so the reservation never '
        + 'reaches it, but the survey that missed it nearly shipped a collision as a guarantee.',
  },
  {
    stat: '0',
    label: 'sites could list their keys',
    body: 'Except rush-q-cards, which had a working help modal built from declarative arrays. '
        + 'This kit is that idea, moved somewhere every site can reach it.',
  },
];

/* The five layers that stop a bare key landing in a text field. Ordered by
   how early they act, because the earlier ones are the ones that scale. */
export const SAFETY = [
  {
    n: '1',
    title: 'The guard reads the real target',
    body: 'Inputs, textareas, selects, contenteditable, and the ARIA roles textbox, searchbox, '
        + 'combobox and spinbutton. It resolves the event through composedPath, so an input inside '
        + 'a shadow root is still an input rather than the plain div the browser reports.',
  },
  {
    n: '2',
    title: 'Composition beats everything',
    body: 'While an input method editor is composing, every keystroke belongs to the candidate '
        + 'window. Checked before any binding is consulted, and checked two ways, because '
        + 'isComposing is missing on some older engines that still send keyCode 229.',
  },
  {
    n: '3',
    title: 'A site can widen the guard',
    body: 'Mark any subtree with data-neo-keys="off" and everything inside it counts as text. '
        + 'For editor libraries, pass typingSelector to init and the kit treats those roots the '
        + 'same way. Two escape hatches, because the kit cannot know every editor.',
  },
  {
    n: '4',
    title: 'The visitor gets the last word',
    body: 'One switch in the sheet turns single-key shortcuts off for the site, and any key can '
        + 'be moved. Preferences persist per site. This is the WCAG 2.1.4 requirement, and it '
        + 'doubles as the escape hatch when something slips through the first three layers.',
  },
  {
    n: '5',
    title: 'Nothing rolls out unaudited',
    body: 'tools/preflight.py reads a site source and sorts it into safe, guarded, or review. '
        + 'It found that slides binds a bare G for its grid view and pathfinder has grown its own '
        + 'bare H, neither of which careful reading had turned up.',
  },
];

export const A11Y = [
  {
    title: 'Turn them off',
    body: 'One switch in the sheet disables every single-key shortcut. Modified combinations '
        + 'and Escape keep working, because those were never the problem.',
  },
  {
    title: 'Move them',
    body: 'Rebind anything to any character. Conflicts are refused with a reason rather than '
        + 'silently taking the key from whatever held it.',
  },
  {
    title: 'Focus decides',
    body: 'Shortcuts never fire while focus sits in an input, a textarea, a select, or anything '
        + 'contenteditable. That last one is the case people forget, and it is the one that '
        + 'breaks editors.',
  },
];

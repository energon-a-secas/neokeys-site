// ── Entry point ──────────────────────────────────────────────
// Start NeoKeys, render the page from content.js, wire the demos.

import { init } from './neokeys/index.js';
import { $ } from './utils.js';
import { renderHeroKeys, renderMechanics, renderInstall, renderKeyMap, renderA11y, renderSafety } from './render.js';
import { initTips } from './tips.js';
import { initMonitor, bindActions, bindCollisionLab, registerPageShortcuts, onKeyVerdict } from './events.js';

const HERO_KEYS = [
  { key: '?', label: 'Shortcuts', action: 'sheet' },
  { key: 'H', label: 'Hide chrome', action: 'chrome' },
  { key: 'G', label: 'Go to a site', action: 'fleet' },
  { key: 'M', label: 'Store', action: 'store' },
];

const kit = init({ onKey: onKeyVerdict });

renderHeroKeys($('heroKeys'), HERO_KEYS);
renderMechanics($('mechGrid'));
renderInstall($('installSteps'));
renderKeyMap($('keyMap'));
renderSafety($('safetyLayers'));
renderA11y($('a11yGrid'));

initMonitor();
bindActions(kit);
bindCollisionLab(kit);
registerPageShortcuts(kit);
initTips($('tipStrip'));

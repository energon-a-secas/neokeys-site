/**
 * NeoKeys — assembly.
 *
 * The one file a site imports. Registers the kit's own shortcuts, installs the
 * single document listener, and exposes window.NeoKeys for sites that are not
 * module-based (the same escape hatch window.NeoHeader already provides).
 *
 *   import { init } from './neokeys/index.js';
 *   init();
 *   NeoKeys.register([{ key: 'c', label: 'Console', run: goConsole }]);
 */

import * as core from './core.js';
import * as sheet from './overlay.js';
import * as chrome from './chrome.js';
import * as fleet from './fleet.js';
import * as store from './store.js';

let started = false;

/**
 * @param {object}  [opts]
 * @param {boolean} [opts.chromeToggle]  bind H (default: the meta tag decides)
 * @param {boolean} [opts.fleetSwitcher] bind G (default: true)
 * @param {string}  [opts.fleetSource]   URL of the site list for G
 * @param {string}  [opts.typingSelector] extra selector treated as a text surface
 * @param {Function}[opts.onKey]         called with every dispatch verdict
 */
export function init(opts = {}) {
  if (started) return window.NeoKeys;
  started = true;

  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content;
  const wantChrome = opts.chromeToggle ?? meta('neo-chrome-toggle') === 'on';
  const wantFleet = opts.fleetSwitcher ?? true;
  if (opts.fleetSource) fleet.setSource(opts.fleetSource);
  if (opts.typingSelector) core.setTypingSelector(opts.typingSelector);

  const kit = [{
    key: '?',
    id: 'kit:sheet',
    label: 'Shortcut sheet',
    hint: 'Everything this page listens for',
    group: 'Fleet',
    run: () => sheet.toggle(),
  }];

  if (wantChrome) {
    kit.push({
      key: 'h',
      id: 'kit:chrome',
      label: 'Hide chrome',
      hint: 'Header and footer, about 105px back',
      group: 'Fleet',
      run: () => chrome.toggle(),
    });
  }
  if (wantFleet) {
    kit.push({
      key: 'g',
      id: 'kit:fleet',
      label: 'Go to a site',
      hint: 'Jump anywhere in the fleet',
      group: 'Fleet',
      run: () => fleet.toggle(),
    });
  }
  if (store.enabled()) {
    kit.push({
      key: 'm',
      id: 'kit:store',
      label: 'Premium store',
      hint: 'It is a joke',
      group: 'Fleet',
      run: () => store.toggle(),
    });
  }

  core.register(kit, 'kit');
  core.listen(opts.onKey);
  if (wantChrome) chrome.restore();

  window.NeoKeys = {
    register: (defs) => core.register(defs, 'site'),
    list: core.list,
    classify: core.classify,
    remap: core.remap,
    resetRemaps: core.resetRemaps,
    remaps: core.remaps,
    setDisabled: core.setDisabled,
    isDisabled: core.isDisabled,
    activeKey: core.activeKey,
    onChange: core.onChange,
    isTypingTarget: core.isTypingTarget,
    setTypingSelector: core.setTypingSelector,
    sheet,
    chrome,
    fleet,
    store,
    RESERVED: core.RESERVED,
    CONVENTIONAL: core.CONVENTIONAL,
  };
  return window.NeoKeys;
}

export { core, sheet, chrome, fleet, store };

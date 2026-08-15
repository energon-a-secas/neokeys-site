/**
 * NeoKeys — the H chrome toggle.
 *
 * Hides the header bar and the footer, handing the page back the vertical
 * space they occupy. Measured on sortie-site: 56px of header plus 48.6px of
 * footer, 104.6px total, 13% of an 800px viewport.
 */

const COOKIE = 'neo_chrome';

/* Inline styles rather than a class, for two reasons that both bite:
   the fleet forbids site-local header CSS, and the kit's own .header-hidden
   class belongs to the app-mode scroll handler, which puts the bar back on
   the next scroll up. An inline display beats the stylesheet and touches
   none of the kit's rules. */
const TARGETS = ['.header-bar', '.neo-footer'];

let toastEl = null;

function readCookie() {
  const m = document.cookie.match(/(?:^|;\s*)neo_chrome=(on|off)/);
  return m ? m[1] : null;
}

function writeCookie(value) {
  /* Domain-scoped like neo_theme, so a visitor who wants a clean canvas gets
     it on every Neorgon tab rather than the one they set it in. On localhost
     the domain attribute is omitted — a Domain= that does not match the host
     makes the browser drop the cookie silently, which is a confusing way to
     find out your preference never saved. */
  const onNeorgon = location.hostname.endsWith('neorgon.com');
  const domain = onNeorgon ? '; domain=.neorgon.com' : '';
  document.cookie = `${COOKIE}=${value}; path=/; max-age=31536000; samesite=lax${domain}`;
}

export function isHidden() {
  return document.body.dataset.chrome === 'off';
}

function paint(on) {
  for (const sel of TARGETS) {
    const el = document.querySelector(sel);
    if (el) el.style.display = on ? '' : 'none';
  }
  document.body.dataset.chrome = on ? 'on' : 'off';
}

function toast(message) {
  toastEl?.remove();
  toastEl = document.createElement('div');
  toastEl.className = 'nk-toast';
  toastEl.setAttribute('role', 'status');
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  requestAnimationFrame(() => toastEl.classList.add('is-in'));
  setTimeout(() => {
    toastEl?.classList.remove('is-in');
    setTimeout(() => toastEl?.remove(), 300);
  }, 3200);
}

export function show() {
  paint(true);
  writeCookie('on');
}

export function hide() {
  paint(false);
  writeCookie('off');
  /* Hiding the bar removes the only visible control that brings it back, so
     the key is the sole remaining path and the toast is the only thing that
     names it. It has to appear at the moment it becomes the only path. */
  toast('Chrome hidden. Press H to bring it back.');
}

export function toggle() {
  isHidden() ? show() : hide();
}

/**
 * Apply the stored preference on load.
 *
 * The original proposal fired its toast only on toggle, which leaves the
 * restored case with no discovery path at all: a returning visitor lands on a
 * chrome-less page, nothing was toggled, so nothing tells them why or how to
 * undo it. That is precisely the failure the toast exists to prevent, so a
 * cookie-restored hide announces itself too.
 */
export function restore() {
  if (readCookie() !== 'off') {
    paint(true);
    return;
  }
  paint(false);
  toast('Chrome is hidden from a previous visit. Press H to bring it back.');
}

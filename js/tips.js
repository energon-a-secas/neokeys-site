/**
 * Loading-screen tips.
 *
 * Site content, not kit: the shortcut registry has no business shipping jokes,
 * and a site that wants these can copy the file. Half are true, half are the
 * voice, and the useful ones are deliberately mixed in with the nonsense
 * because that is the only reason anybody reads a loading screen.
 */

const TIPS = [
  'Switching to your second weapon is faster than reloading. Rebinding a shortcut is faster than arguing about it.',
  'All your base are belong to us. All your keys are belong to the registry.',
  'A shortcut nobody can list is not a feature, it is folklore.',
  'Press ? on any Neorgon site. If nothing happens, that site has not been upgraded yet.',
  'Eight sites picked / for search without ever holding a meeting about it.',
  'You cannot rebind ?. We tried too.',
  'The typing guard has never once fired while you were typing. That is the entire feature.',
  'Stay awhile and listen. Or press G and leave immediately.',
  'Escape closes one layer at a time. Mashing it closes one layer at a time, faster.',
  'The premium store has no items and no prices. Retail, perfected.',
  'Hiding the chrome gives you back about 105px. That is four and a half lines of code you were not reading anyway.',
  'Alt and Ctrl are yours. The kit has never claimed a modified key and never will.',
  'Screen readers use H for headings, so keep a button too. Accessibility is not a shortcut.',
  'If a shortcut fires while you are typing, that is a bug. It has not happened yet. Please do not read that as a challenge.',
  'This tip was selected at random from a list of 16. So was the last one. Statistically, one of them repeated.',
  'You have been playing for 0 hours. Consider taking a break.',
];

const ROTATE_MS = 9000;

export function initTips(host) {
  if (!host) return;

  const label = document.createElement('p');
  label.className = 'nk-tip__text';
  /* Not aria-live: a line that rewrites itself every nine seconds would
     interrupt a screen reader mid-sentence, forever. The whole strip is one
     button instead, so it is reachable on purpose rather than announced by
     accident. */
  host.appendChild(label);

  let i = Math.floor(Math.random() * TIPS.length);
  let timer = null;

  const paint = () => {
    label.classList.remove('is-in');
    setTimeout(() => {
      label.textContent = TIPS[i];
      label.classList.add('is-in');
    }, 180);
  };

  const next = () => {
    /* Step by a random stride rather than +1 so the sequence does not become
       memorable, and never land on the tip already showing. */
    i = (i + 1 + Math.floor(Math.random() * (TIPS.length - 1))) % TIPS.length;
    paint();
  };

  const start = () => { stop(); timer = setInterval(next, ROTATE_MS); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  host.addEventListener('click', () => { next(); start(); });
  host.addEventListener('mouseenter', stop);
  host.addEventListener('mouseleave', start);

  /* A tab in the background has nothing to rotate for, and Safari throttles
     the interval anyway, which desyncs the fade from the text swap. */
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  paint();
  start();
}

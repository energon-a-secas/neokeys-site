/** DOM rendering. Every section is built from js/content.js so the page and
    the prose stay in one place. */

import { MECHANICS, INSTALL, KEYMAP, SURVEY, A11Y, SAFETY } from './content.js';
import { el, escHtml } from './utils.js';

/* ── Hero key strip ─────────────────────────────────────────── */
export function renderHeroKeys(host, keys) {
  host.textContent = '';
  for (const k of keys) {
    const chip = el('button', 'nk-chip');
    chip.type = 'button';
    chip.dataset.action = k.action;
    chip.appendChild(el('kbd', 'nk-key', k.key));
    chip.appendChild(el('span', 'nk-chip__label', k.label));
    host.appendChild(chip);
  }
}

/* ── Mechanics ──────────────────────────────────────────────── */
export function renderMechanics(host) {
  host.textContent = '';
  for (const m of MECHANICS) {
    const card = el('article', 'card nk-mech');
    const head = el('div', 'nk-mech__head');
    head.appendChild(el('kbd', 'nk-key nk-key--lg', m.key));
    const titles = el('div');
    titles.appendChild(el('h3', 'nk-mech__name', m.name));
    titles.appendChild(el('span', 'nk-mech__owner', m.owner));
    head.appendChild(titles);
    card.appendChild(head);
    card.appendChild(el('p', 'nk-mech__body', m.body));
    if (m.action) {
      const btn = el('button', 'btn btn--ghost btn--sm');
      btn.type = 'button';
      btn.dataset.action = m.action;
      btn.textContent = m.cta;
      card.appendChild(btn);
    }
    host.appendChild(card);
  }
}

/* ── Install steps ──────────────────────────────────────────── */
export function renderInstall(host) {
  host.textContent = '';
  INSTALL.forEach((step) => {
    const li = el('li', 'nk-step');
    li.appendChild(el('h3', 'nk-step__title', step.title));
    li.appendChild(el('p', 'nk-step__body', step.body));

    const wrap = el('div', 'nk-code');
    const pre = el('pre');
    const code = el('code', `lang-${step.lang}`, step.code);
    pre.appendChild(code);
    const copy = el('button', 'nk-code__copy', 'Copy');
    copy.type = 'button';
    copy.dataset.copy = step.code;
    wrap.append(pre, copy);
    li.appendChild(wrap);
    host.appendChild(li);
  });
}

/* ── Key map ────────────────────────────────────────────────── */
export function renderKeyMap(host) {
  host.textContent = '';

  const stats = el('div', 'nk-stats');
  for (const s of SURVEY) {
    const b = el('div', 'nk-stat');
    b.appendChild(el('span', 'nk-stat__num', s.stat));
    b.appendChild(el('span', 'nk-stat__label', s.label));
    b.appendChild(el('p', 'nk-stat__body', s.body));
    stats.appendChild(b);
  }
  host.appendChild(stats);

  for (const tier of KEYMAP) {
    const block = el('div', `nk-tier nk-tier--${tier.tone}`);
    block.appendChild(el('h3', 'nk-tier__name', tier.tier));
    block.appendChild(el('p', 'nk-tier__note', tier.note));
    const table = el('div', 'nk-tier__rows');
    for (const r of tier.rows) {
      const row = el('div', 'nk-tier__row');
      const kw = el('div', 'nk-tier__key');
      r.key.split(' ').forEach((k) => kw.appendChild(el('kbd', 'nk-key', k)));
      row.appendChild(kw);
      const meaning = el('div', 'nk-tier__meaning');
      meaning.appendChild(el('span', null, r.meaning));
      if (r.detail) meaning.appendChild(el('span', 'nk-tier__detail', r.detail));
      row.appendChild(meaning);
      table.appendChild(row);
    }
    block.appendChild(table);
    host.appendChild(block);
  }
}

/* ── Safety layers ──────────────────────────────────────────── */
export function renderSafety(host) {
  host.textContent = '';
  for (const layer of SAFETY) {
    const row = el('div', 'nk-layer');
    row.appendChild(el('span', 'nk-layer__n', layer.n));
    const body = el('div', 'nk-layer__body');
    body.appendChild(el('h3', 'nk-layer__title', layer.title));
    body.appendChild(el('p', 'nk-layer__text', layer.body));
    row.appendChild(body);
    host.appendChild(row);
  }
}

/* ── Accessibility cards ────────────────────────────────────── */
export function renderA11y(host) {
  host.textContent = '';
  for (const a of A11Y) {
    const card = el('article', 'card nk-a11y');
    card.appendChild(el('h3', 'nk-a11y__title', a.title));
    card.appendChild(el('p', 'nk-a11y__body', a.body));
    host.appendChild(card);
  }
}

/* ── Live verdict monitor ───────────────────────────────────────
   The wording matters more than it looks. "typing" has to read as the system
   working rather than failing, because a visitor who reads it as a bug will
   conclude the shortcuts are broken and stop pressing keys. */
const VERDICT_COPY = {
  bound: (v) => `Fired "${v.entry.label}".`,
  unbound: () => 'Nothing is registered for that key, so nothing happened.',
  typing: () => 'Focus is in a text field, so the guard held. This is the whole reason a bare H is safe on an editor.',
  composing: () => 'An input method editor is composing. Every keystroke belongs to the candidate window until it commits.',
  modifier: () => 'A modifier was held. NeoKeys never claims modified combinations.',
  'shortcuts-off': () => 'Single-key shortcuts are switched off in the sheet. Turn them back on with the toggle there.',
  idle: () => 'Press a key anywhere on the page.',
};

export function renderVerdict({ keyEl, badgeEl, whyEl }, verdict, rawKey) {
  const reason = verdict?.reason || 'idle';
  keyEl.textContent = rawKey ? (rawKey.length === 1 ? rawKey.toUpperCase() : rawKey) : '·';
  badgeEl.textContent = reason === 'bound' ? 'fired' : reason;
  badgeEl.dataset.verdict = reason;
  whyEl.textContent = (VERDICT_COPY[reason] || VERDICT_COPY.idle)(verdict);
}

/* ── Collision log ──────────────────────────────────────────── */
export function logCollision(host, { ok, key, label, reason }) {
  const li = el('li', `nk-lab__entry is-${ok ? 'ok' : 'no'}`);
  const k = el('kbd', 'nk-key', key || '?');
  const text = el('span', null,
    ok ? `Registered as "${label}". Open the sheet and it is listed.` : reason);
  li.append(k, text);
  host.prepend(li);
  while (host.children.length > 6) host.lastChild.remove();
}

export { escHtml };

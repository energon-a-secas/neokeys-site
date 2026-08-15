// ── State ────────────────────────────────────────────────────
// This page has very little of its own. The interesting state lives in the
// NeoKeys registry, which is the point being demonstrated.

export const state = {
  /** Shortcuts the visitor added in the collision lab, so a redraw keeps them. */
  labEntries: [],
  /** Last dispatch verdict, mirrored for the monitor. */
  lastVerdict: null,
};

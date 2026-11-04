// Print windows (receipts, salary slips, menus, offer letters) are written by the app. They used to carry an inline
// onclick="window.print()", which a strict Content-Security-Policy blocks. Instead the template marks its button with
// data-print and this attaches the click from the app side — same behaviour, no inline script.
export function attachPrint(w) {
  try { w.document.querySelectorAll('[data-print]').forEach(b => b.addEventListener('click', () => w.print())); } catch { /* popup closed */ }
}

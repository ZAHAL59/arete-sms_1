// Screen readers need every form field tied to its label. Most fields are (via Field/Input), but many older screens
// place a <label> next to an <input> without linking them. This links them automatically, and gives a name to
// fields that have no label at all (from the column header + row, a placeholder or a title). Runs on every screen.
let counter = 0, scheduled = false;
const CTRL = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea';

function associate(root) {
  root.querySelectorAll('label:not([for])').forEach(l => {
    if (l.querySelector('input, select, textarea')) return;                       // wrapping labels already work
    let n = l.nextElementSibling, c = null;
    for (let i = 0; n && i < 2 && !c; i++, n = n.nextElementSibling) c = n.matches(CTRL) ? n : n.querySelector(CTRL);
    if (c && !c.labels?.length) { if (!c.id) c.id = 'al-' + (++counter); l.htmlFor = c.id; }
  });
  root.querySelectorAll(CTRL).forEach(c => {
    if (c.labels?.length || c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby')) return;
    let name = c.getAttribute('title') || c.getAttribute('placeholder') || '';
    const cell = c.closest('td');
    if (!name && cell) {                                                           // an input inside a table: "row — column"
      const row = cell.parentElement, idx = [...row.children].indexOf(cell), table = cell.closest('table');
      const head = table?.querySelectorAll('thead th')[idx]?.textContent.trim(), first = row.children[0]?.textContent.trim().split('\n')[0].slice(0, 40);
      name = [first && first !== cell.textContent.trim() ? first : '', head].filter(Boolean).join(' — ');
    }
    if (!name && c.tagName === 'SELECT') name = c.selectedOptions[0]?.text || c.options[0]?.text || '';
    if (!name) name = c.type === 'date' ? 'Date' : c.type === 'time' ? 'Time' : c.type === 'number' ? 'Number' : 'Text field';
    c.setAttribute('aria-label', name);
  });
}

// A region that scrolls sideways must be reachable by keyboard: make it focusable and name it (only while it overflows).
function markScrollable(root) {
  root.querySelectorAll('main div:has(> table), main [class*="overflow-x-auto"], main [class*="overflow-auto"]').forEach(el => {
    const scrolls = el.scrollWidth > el.clientWidth + 1;
    if (scrolls) {
      if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '0'); el.dataset.autoScroll = '1'; }
      if (!el.hasAttribute('role') && !el.hasAttribute('aria-label')) { el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Scrollable content'); }
    } else if (el.dataset.autoScroll) { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); delete el.dataset.autoScroll; }
  });
}

export function installAutoLabels() {
  const run = () => { scheduled = false; associate(document.body); markScrollable(document.body); };
  const queue = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(run); } };
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', queue);
  queue();
}

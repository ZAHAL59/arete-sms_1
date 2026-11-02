import { useState } from 'react';

// Remembers which collapsible sections of a page are open, so the page can offer "Expand all / Collapse all".
export default function useExpand(initiallyOpen = []) {
  const [open, setOpen] = useState(() => new Set(initiallyOpen));
  return {
    isOpen: id => open.has(id),
    toggle: id => setOpen(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }),
    expandAll: ids => setOpen(new Set(ids)),
    collapseAll: () => setOpen(new Set()),
    count: open.size,
  };
}

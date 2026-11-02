import { useState, useCallback } from 'react';
import { loadCampus, saveCampus, TODAY } from './constants';
import useStore from '../../store/useStore';

export default function useCampus() {
  const [c, setC] = useState(loadCampus);
  const updateDB = useStore(s => s.updateDB);
  const update = useCallback(fn => {
    setC(prev => { const next = fn(JSON.parse(JSON.stringify(prev))); saveCampus(next); return next; });
  }, []);
  const stamp = () => new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short' });

  return {
    c,
    // ── Complaints (shared DB so the Principal sees them) ──
    addComplaint: x => updateDB(d => { d.complaints.unshift({ ...x, id:'CP'+Date.now().toString().slice(-5), status:'Open', action:'Logged — awaiting review' }); return d; }),
    resolveComplaint: id => updateDB(d => { const x = d.complaints.find(k => k.id === id); if (x) { x.status = 'Resolved'; x.resolvedOn = TODAY; } return d; }),
    addComplaintNote: (id, note) => updateDB(d => { const x = d.complaints.find(k => k.id === id); if (x) x.action = note; return d; }),
    // ── Events ──
    addEvent: e => update(d => { d.events.push({ ...e, id:'EV'+Date.now().toString().slice(-5), alloc:0, allocTo:'', resources:[] }); d.events.sort((a, b) => a.date.localeCompare(b.date)); return d; }),
    allocateSeats: (id, alloc, allocTo) => update(d => { const e = d.events.find(x => x.id === id); if (e) { e.alloc = Math.min(alloc, e.seats); e.allocTo = allocTo; } return d; }),
    // ── Inventory ──
    addAsset: a => update(d => {
      d.inventory.push({ ...a, id:'A'+Date.now().toString().slice(-5), working:a.total, repair:0 });
      d.invLog.unshift({ date:stamp(), asset:a.name, action:'Added', qty:a.total, by:'Muhd Zahal' });
      return d;
    }),
    editAsset: (id, f, action) => update(d => {
      const i = d.inventory.find(x => x.id === id); if (!i) return d;
      const old = i.repair; Object.assign(i, f);
      if (i.working + i.repair > i.total) i.working = i.total - i.repair;
      d.invLog.unshift({ date:stamp(), asset:i.name, qty:Math.abs(i.repair - old) || 1, by:'Campus Admin',
        action: action || (i.repair > old ? 'Sent for repair' : i.repair < old ? 'Returned from repair' : 'Details updated') });
      return d;
    }),
    // ── Visitors ──
    addVisitor: v => update(d => { d.visitors.unshift({ ...v, id:'V'+Date.now().toString().slice(-5), timeOut:'', status:'In' }); return d; }),
    checkOut: id => update(d => { const v = d.visitors.find(x => x.id === id); if (v) { v.timeOut = new Date().toTimeString().slice(0, 5); v.status = 'Out'; } return d; }),
    // ── Library ──
    addBook: bk => update(d => { d.books.unshift({ ...bk, id:'BK'+Date.now().toString().slice(-6), issuedTo:null, due:null }); return d; }),
    issueBook: (id, studentId, due) => update(d => { const x = d.books.find(k => k.id === id); if (x) { x.issuedTo = studentId; x.due = due; } return d; }),
    returnBook: id => update(d => {
      const x = d.books.find(k => k.id === id); if (!x) return d;
      d.readHistory.unshift({ title:x.title, cat:x.cat, studentId:x.issuedTo, date:TODAY });
      x.issuedTo = null; x.due = null; return d;
    }),
  };
}

import { useState, useCallback } from 'react';
import { loadHostel, saveHostel } from './constants';

export default function useHostel() {
  const [h, setH] = useState(loadHostel);
  const update = useCallback(fn => {
    setH(prev => { const next = fn(JSON.parse(JSON.stringify(prev))); saveHostel(next); return next; });
  }, []);

  return {
    h,
    // Rooms
    assignRoom: (roomId, name) => update(d => {
      d.rooms.forEach(r => { r.inmates = r.inmates.filter(n => n !== name); });
      const r = d.rooms.find(x => x.id === roomId);
      if (r && r.inmates.length < r.capacity) r.inmates.push(name);
      return d;
    }),
    // One step: record the admission and put the student in the chosen room
    admitStudent: (rec, roomId) => update(d => {
      d.rooms.forEach(r => { r.inmates = r.inmates.filter(n => n !== rec.name); });
      const room = d.rooms.find(x => x.id === roomId); if (room && room.inmates.length < room.capacity) room.inmates.push(rec.name);
      d.admissions = [{ ...rec, id: 'HA' + Date.now().toString().slice(-6), roomId }, ...(d.admissions || []).filter(a => a.studentId !== rec.studentId)];
      return d;
    }),
    setFeeHeads: list => update(d => { d.feeHeads = list; return d; }),
    removeInmate: (roomId, name) => update(d => {
      const r = d.rooms.find(x => x.id === roomId);
      if (r) r.inmates = r.inmates.filter(n => n !== name);
      return d;
    }),
    // Outings
    addOuting: o => update(d => { d.outings.unshift({ ...o, id:'OUT'+Date.now().toString().slice(-4), status:'Pending Approval' }); return d; }),
    setOutingStatus: (id, status) => update(d => { const o = d.outings.find(x => x.id === id); if (o) o.status = status; return d; }),
    // Mess
    logCost: (date, amount) => update(d => { d.costLog.unshift({ date, amount, by:'Warden' }); return d; }),
    saveStock: (item, fields) => update(d => { const s = d.stock.find(x => x.item === item); if (s) Object.assign(s, fields); return d; }),
    addStock: s => update(d => { d.stock.push(s); return d; }),
    saveMenu: menu => update(d => { d.menu = menu; return d; }),
    // Incidents
    addIncident: i => update(d => { d.incidents.unshift({ by:'Warden', ...i, id:'INC'+Date.now().toString().slice(-4), status:'Open' }); return d; }),
    addOrder: o => update(d => { (d.orders ||= []).unshift({ ...o, id:'PO'+Date.now().toString().slice(-5), status:'Ordered', date:new Date().toISOString().slice(0,10) }); return d; }),
    receiveOrder: id => update(d => { const o = (d.orders || []).find(x => x.id === id); if (!o || o.status === 'Received') return d; (o.lines || []).forEach(l => { const s = d.stock.find(x => x.item === l.item); if (s) s.qty = s.qty + l.qty; }); o.status = 'Received'; o.receivedOn = new Date().toISOString().slice(0,10); return d; }),
    resolveIncident: id => update(d => { const i = d.incidents.find(x => x.id === id); if (i) i.status = 'Resolved'; return d; }),
  };
}

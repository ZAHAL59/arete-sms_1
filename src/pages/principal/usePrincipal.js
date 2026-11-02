import { useState, useCallback } from 'react';
import { loadPrincipal, savePrincipal, blankTimetable, TODAY } from './constants';

export default function usePrincipal() {
  const [p, setP] = useState(loadPrincipal);
  const update = useCallback(fn => setP(prev => { const next = fn(JSON.parse(JSON.stringify(prev))); savePrincipal(next); return next; }), []);
  const uid = pre => pre + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10);
  return {
    p,
    setSettings: s => update(d => { d.settings = { ...d.settings, ...s }; return d; }),
    // communication
    addAnnouncement: a => update(d => { d.announcements.unshift({ ...a, id:uid('AN'), sent:TODAY, read:'—' }); return d; }),
    deleteAnnouncement: id => update(d => { d.announcements = d.announcements.filter(x => x.id !== id); return d; }),
    addSlip: s => update(d => { d.slips.unshift({ ...s, id:uid('PS'), responses:0, status:'Open' }); return d; }),
    updateSlip: (id, f) => update(d => { const s = d.slips.find(x => x.id === id); if (s) Object.assign(s, f); return d; }),
    logMessage: m => update(d => { d.messages.unshift({ ...m, id:uid('MS'), at:new Date().toISOString() }); return d; }),
    // health
    addIncident: i => update(d => { d.incidents.unshift({ ...i, id:uid('IN') }); return d; }),
    deleteIncident: id => update(d => { d.incidents = d.incidents.filter(x => x.id !== id); return d; }),
    setImmunisation: (vaccine, f) => update(d => { const v = d.immunisation.find(x => x.vaccine === vaccine); if (v) Object.assign(v, f); return d; }),
    // payroll extras
    addExpense: e => update(d => { d.expenses.unshift({ ...e, id:uid('EX') }); return d; }),
    deleteExpense: id => update(d => { d.expenses = d.expenses.filter(x => x.id !== id); return d; }),
    setStatutory: list => update(d => { d.statutory = list; return d; }),
    // substitute cover: replace every cover entry for this absent teacher on this date
    saveCover: (date, absent, entries) => update(d => {
      d.substitutions = (d.substitutions || []).filter(x => !(x.date === date && x.absent === absent));
      entries.filter(e => e.sub).forEach(e => d.substitutions.push({ id: `${date}|${e.cls}|${e.row}`, date, absent, cls: e.cls, row: e.row, time: e.time, subject: e.subject, sub: e.sub }));
      return d;
    }),
    // timetable
    setTTCell: (cls, row, col, val) => update(d => { if (!d.timetable[cls]) d.timetable[cls] = blankTimetable(); d.timetable[cls].slots[row].cells[col] = val; return d; }),
    setTTMeta: (cls, f) => update(d => { if (!d.timetable[cls]) d.timetable[cls] = blankTimetable(); Object.assign(d.timetable[cls], f); return d; }),
    addBooking: b => update(d => { d.bookings.push({ ...b, id:uid('BK') }); return d; }),
    deleteBooking: id => update(d => { d.bookings = d.bookings.filter(x => x.id !== id); return d; }),
    // learning
    addResource: r => update(d => { const item = { ...r, id:uid('U'), views:0, rating:0 }; d.lms.library.unshift(item); d.lms.log.unshift({ at:new Date().toISOString(), ic:'📤', txt:`<b>${r.by}</b> added <b>${r.title}</b>` }); return d; }),
    addAssignment: a => update(d => { const res = d.lms.library.find(r => r.id === a.resId); d.lms.assignments.unshift({ ...a, id:uid('LA'), title:'Assigned: ' + (res?.title || ''), assigned:TODAY, engaged:0, completed:0 }); d.lms.log.unshift({ at:new Date().toISOString(), ic:'📌', txt:`<b>${res?.title}</b> assigned to ${a.to}` }); return d; }),
  };
}

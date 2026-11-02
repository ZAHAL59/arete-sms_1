import { useState, useCallback } from 'react';
import { loadAdmissions, saveAdmissions, STAGE_ID, JOURNEY_STAGES, ID_STAGE, normalize, autoStage } from './constants';

const stamp = (msg, by = 'Admissions Lead') => ({ time: new Date().toISOString(), msg, by });

export default function useAdmissions() {
  const [admissions, setAdmissions] = useState(loadAdmissions);
  const update = useCallback(fn => setAdmissions(prev => { const next = fn(JSON.parse(JSON.stringify(prev))); saveAdmissions(next); return next; }), []);
  const find = (list, id) => list.find(x => x.id === id);
  const settle = a => { const t = autoStage(a); if (t !== a.stage) { a.log.push(stamp(`Auto-advanced: ${a.stage} → ${t}`, 'System')); a.stage = t; } };

  return {
    admissions,
    addAdmission: data => update(list => {
      const a = normalize({ ...data, id: 'ADM-' + String(list.length + 1).padStart(3, '0'), applied: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), stage: 'Enquiry', seat: '',
        docs: { birthCert: false, tcCert: false, aadhaar: false, photos: false, medCert: false, addressProof: false }, log: [stamp('Enquiry registered')] });
      settle(a); list.push(a); return list;
    }),
    advanceStage: id => update(list => {
      const a = find(list, id); if (!a) return list;
      const next = JOURNEY_STAGES[JOURNEY_STAGES.findIndex(s => s.id === (STAGE_ID[a.stage] || 'enquiry')) + 1]; if (!next) return list;
      a.log.push(stamp(`Advanced: ${a.stage} → ${ID_STAGE[next.id]}`)); a.stage = ID_STAGE[next.id]; return list;
    }),
    // Save any section's fields, then let the record move forward on its own if it now qualifies
    updateAdmission: (id, fields, note) => update(list => { const a = find(list, id); if (!a) return list; Object.assign(a, fields); if (note) a.log.push(stamp(note)); settle(a); return list; }),
    updateDev: (id, dev) => update(list => { const a = find(list, id); if (a) { a.dev = { ...a.dev, ...dev }; a.log.push(stamp('Development profile updated')); } return list; }),
    toggleDoc: (id, key) => update(list => { const a = find(list, id); if (!a) return list; a.docs[key] = !a.docs[key]; a.log.push(stamp(`${key}: ${a.docs[key] ? 'received' : 'marked pending'}`)); settle(a); return list; }),
    addNote: (id, text) => update(list => { const a = find(list, id); if (a && text.trim()) a.log.push(stamp(text.trim())); return list; }),
    recordFee: (id, line) => update(list => {
      const a = find(list, id); if (!a) return list;
      const ex = a.feeLines.find(l => l.type === line.type);
      if (ex) { ex.paid += line.paid; ex.invoice = line.invoice || ex.invoice; ex.mode = line.mode || ex.mode; ex.ref = line.ref || ex.ref; ex.date = line.date; }
      else a.feeLines.push({ ...line, id: 'FL' + Date.now().toString().slice(-6) });
      a.log.push(stamp(`Fee: ${line.type} — ₹${line.paid.toLocaleString('en-IN')} paid (invoice ₹${(line.invoice || 0).toLocaleString('en-IN')})`)); return list;
    }),
    setWaitlist: (id, on) => update(list => {
      const a = find(list, id); if (!a) return list;
      if (on) { a.prevStage = a.stage; a.stage = 'Waitlisted'; a.log.push(stamp('Moved to waitlist')); }
      else { a.stage = 'Enquiry'; a.log.push(stamp('Restored from waitlist')); settle(a); }
      return list;
    }),
    // Enrol: create the student in the shared database and move paid fees into Finance
    enrol: (id, updateDB) => update(list => {
      const a = find(list, id); if (!a) return list;
      updateDB(d => {
        const sid = 'S' + String(d.students.length + 1).padStart(3, '0'); a.studentId = sid;
        const roll = parseInt(a.seat) || d.students.filter(s => s.cls === a.grade && s.section === (a.section || 'A')).length + 1;
        d.students.push({ id: sid, name: a.name, dob: a.dob || '', gender: a.gender, cls: a.grade, section: a.section || 'A', roll, adm: new Date().toISOString().slice(0, 10),
          learningStyle: a.dev.learningStyle, diet: a.dev.diet || a.diet, health: a.dev.health || 'None', needs: a.dev.needs || 'None', hobbies: a.dev.hobbies, langs: 'Malayalam, English',
          behav: a.dev.behav, expPref: a.dev.expPref, travel: a.busRoute ? 'Bus' : 'Own', busRoute: a.busRoute || '', boarding: !!a.boarding, parentName: a.parent, parentPhone: a.phone,
          email: a.email, address: a.address, category: a.category, status: 'Active', admId: a.id, notes: a.notes || '' });
        a.feeLines.filter(l => l.paid > 0).forEach(l => d.payments.unshift({ id: 'RC-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10), studentId: sid, category: l.type, amount: l.paid, date: l.date, mode: l.mode, ref: l.ref || 'Paid at admission' }));
        return d;
      });
      a.stage = 'Enrolled'; a.log.push(stamp(`Enrolled as student ${a.studentId}`, 'System')); return list;
    }),
  };
}

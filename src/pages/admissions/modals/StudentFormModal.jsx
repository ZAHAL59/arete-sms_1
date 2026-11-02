import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Field, inputCls } from '../../../components/ui/Kit';
import useStore from '../../../store/useStore';
import { getFeeStructure, termOf, fmt } from '../../finance/constants';
import { GRADES, LEARNING_STYLES, DIETS } from '../constants';

export default function StudentFormModal({ student, onClose }) {
  const db = useStore(s => s.db); const updateDB = useStore(s => s.updateDB);
  const [f, setF] = useState(() => ({ name: '', dob: '', cls: 'Grade 6', section: 'A', adm: new Date().toISOString().slice(0, 10), parentName: '', parentPhone: '', busRoute: '', boarding: false, learningStyle: 'Visual', diet: 'Vegetarian', hobbies: '', health: 'None', ...(student || {}) }));
  const [err, setErr] = useState(''); const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const fs = getFeeStructure()[f.cls] || {}; const transport = f.busRoute ? fs.transport || 0 : 0, hostel = f.boarding ? fs.hostel || 0 : 0;
  const total = termOf(fs) + (fs.activity || 0) + transport + hostel;
  function save() {
    if (!f.name.trim()) return setErr('Enter the student name.');
    updateDB(d => {
      const rec = { ...f, name: f.name.trim(), travel: f.busRoute ? 'Bus' : 'Own', needs: f.needs || (f.health && f.health !== 'None' ? f.health : 'None') };
      if (student) { const i = d.students.findIndex(x => x.id === student.id); if (i >= 0) d.students[i] = { ...d.students[i], ...rec }; }
      else d.students.push({ ...rec, id: 'S' + String(d.students.length + 1).padStart(3, '0'), roll: d.students.filter(x => x.cls === f.cls && x.section === f.section).length + 1, langs: 'Malayalam, English', behav: '', expPref: '', status: 'Active' });
      return d;
    });
    onClose();
  }
  return (
    <Modal open onClose={onClose} size="lg" title={student ? `Edit — ${student.name}` : 'New Student'} subtitle="Direct enrolment. For new families use the Applications pipeline."
      footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{err}</span><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>{student ? 'Save changes' : 'Enrol student'}</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name *" className="col-span-2"><input value={f.name} onChange={e => set('name', e.target.value)} className={inputCls} /></Field>
        <Field label="Date of birth"><input type="date" value={f.dob || ''} onChange={e => set('dob', e.target.value)} className={inputCls} /></Field>
        <Field label="Admission date"><input type="date" value={f.adm || ''} onChange={e => set('adm', e.target.value)} className={inputCls} /></Field>
        <Field label="Class"><select value={f.cls} onChange={e => set('cls', e.target.value)} className={inputCls}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></Field>
        <Field label="Section"><select value={f.section} onChange={e => set('section', e.target.value)} className={inputCls}>{['A', 'B', 'C'].map(g => <option key={g}>{g}</option>)}</select></Field>
        <Field label="Parent name"><input value={f.parentName} onChange={e => set('parentName', e.target.value)} className={inputCls} /></Field>
        <Field label="Parent phone"><input value={f.parentPhone} onChange={e => set('parentPhone', e.target.value)} className={inputCls} /></Field>
        <Field label="Bus route"><select value={f.busRoute || ''} onChange={e => set('busRoute', e.target.value)} className={inputCls}><option value="">None — own transport</option>{db.routes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.driver})</option>)}</select></Field>
        <Field label="Boarding / hostel"><select value={f.boarding ? '1' : '0'} onChange={e => set('boarding', e.target.value === '1')} className={inputCls}><option value="0">No — day scholar</option><option value="1">Yes — boarding student</option></select></Field>
        <Field label="Learning style"><select value={f.learningStyle} onChange={e => set('learningStyle', e.target.value)} className={inputCls}>{LEARNING_STYLES.map(g => <option key={g}>{g}</option>)}</select></Field>
        <Field label="Diet"><select value={f.diet} onChange={e => set('diet', e.target.value)} className={inputCls}>{DIETS.map(g => <option key={g}>{g}</option>)}</select></Field>
        <Field label="Hobbies & interests"><input value={f.hobbies} onChange={e => set('hobbies', e.target.value)} className={inputCls} /></Field>
        <Field label="Health / special needs"><input value={f.health} onChange={e => set('health', e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="mt-3 bg-[#FEF4F4] border border-[#FECACA] rounded-[6px] p-2.5 text-[12.5px] text-[#555]"><b>Fee breakdown ({f.cls}):</b> Terms {fmt(termOf(fs))} + Activity {fmt(fs.activity)}{transport ? ` + Transport ${fmt(transport)}` : ''}{hostel ? ` + Hostel ${fmt(hostel)}` : ''} = <b className="text-[#C8202E]">{fmt(total)} / year</b></div>
    </Modal>
  );
}

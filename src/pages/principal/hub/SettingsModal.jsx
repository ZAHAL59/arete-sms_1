import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Field, inputCls } from '../../../components/ui/Kit';

export default function SettingsModal({ initial, onSave, onClose }) {
  const [s, setS] = useState({ ...initial });
  const set = (k, v) => setS(x => ({ ...x, [k]: v }));
  return (
    <Modal open onClose={onClose} title="School Settings" subtitle="Applies across the Principal portal"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => { onSave({ ...s, lowAtt: Math.min(100, Math.max(1, +s.lowAtt || 75)) }); onClose(); }}>Save</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="School Name" className="col-span-2"><input value={s.school} onChange={e => set('school', e.target.value)} className={inputCls} /></Field>
        <Field label="Academic Year"><select value={s.year} onChange={e => set('year', e.target.value)} className={inputCls}>{['2026–27', '2025–26'].map(y => <option key={y}>{y}</option>)}</select></Field>
        <Field label="Board"><select value={s.board} onChange={e => set('board', e.target.value)} className={inputCls}>{['CBSE', 'ICSE', 'Kerala State'].map(y => <option key={y}>{y}</option>)}</select></Field>
        <Field label="Low Attendance Alert (%)" className="col-span-2"><input type="number" min={1} max={100} value={s.lowAtt} onChange={e => set('lowAtt', e.target.value)} className={inputCls} /><div className="text-[11px] text-[#AAA] mt-1">Students below this are flagged as an attendance risk.</div></Field>
      </div>
    </Modal>
  );
}

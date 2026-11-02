import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls } from '../../components/ui/Kit';
import { VEHICLE_TYPES, seatsOf } from './constants';

const BLANK = { name:'', vehicle:'', type:VEHICLE_TYPES[0], driver:'', phone:'', dept:'07:10' };

export default function Routes({ addRoute, updateRoute }) {
  const db = useStore(s => s.db);
  const [form, setForm] = useState(BLANK);
  const [mode, setMode] = useState(null);   // null | 'add' | route id
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function openEdit(r) { setForm({ name:r.name, vehicle:r.vehicle, type:r.type || VEHICLE_TYPES[0], driver:r.driver, phone:r.phone, dept:r.dept }); setMode(r.id); }
  function save() {
    if (!form.name.trim() || !form.driver.trim()) return;
    if (mode === 'add') addRoute({ ...form, vehicle: form.vehicle || 'TBC' });
    else updateRoute(mode, form);
    setMode(null); setForm(BLANK);
  }

  return (
    <div className="p-6">
      <PageHeader title="Routes & Drivers" subtitle={`${db.routes.length} routes · students are assigned in Admissions`}
        actions={<Button onClick={() => { setForm(BLANK); setMode('add'); }}>+ Add Route</Button>} />

      {db.routes.map(r => {
        const students = db.students.filter(s => s.busRoute === r.id && s.status === 'Active');
        const seats = seatsOf(r.type); const pct = seats ? Math.round(students.length / seats * 100) : 0;
        return (
          <Collapsible key={r.id} defaultOpen className="mb-3"
            header={
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[16px] flex-shrink-0" style={{ background:'linear-gradient(135deg,#C8202E,#9A1822)' }}>🚌</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111]">{r.name}</div>
                  <div className="text-[11.5px] text-[#777]">{r.vehicle} · {r.type || 'Vehicle'}</div>
                </div>
                <Badge variant="green">{r.status}</Badge>
                <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); openEdit(r); }}>✎ Edit</Button>
              </div>
            }>
            <div className="grid grid-cols-5 gap-4 p-4 border-t border-[#E4E4E4]">
              {[['Driver', r.driver], ['Phone', r.phone], ['Departure', r.dept], ['Arrival', r.arr]].map(([l, v]) => (
                <div key={l}><div className="text-[10.5px] text-[#AAA] mb-1">{l}</div><div className="text-[13px] font-bold text-[#111]">{v}</div></div>
              ))}
              <div>
                <div className="text-[10.5px] text-[#AAA] mb-1">Students</div>
                <div className="text-[13px] font-bold text-[#111]">{students.length}{seats ? <span className="text-[#AAA] font-normal"> / {seats}</span> : ''}</div>
                {seats > 0 && <div className="h-1.5 bg-[#E4E4E4] rounded-full mt-1.5 overflow-hidden"><div className="h-full rounded-full" style={{ width:`${Math.min(100, pct)}%`, background: pct > 90 ? '#DC2626' : '#C8202E' }} /></div>}
              </div>
            </div>
          </Collapsible>
        );
      })}

      <Modal open={!!mode} onClose={() => setMode(null)} title={mode === 'add' ? 'Add New Route' : 'Edit Route'}
        subtitle="Students assigned to this route in Admissions appear here automatically"
        footer={<><Button variant="outline" onClick={() => setMode(null)}>Cancel</Button><Button onClick={save}>{mode === 'add' ? 'Add Route' : 'Save Changes'}</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Route Name *"><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Route 5 — Malabar Road" className={inputCls} /></Field>
          <Field label="Vehicle Number"><input value={form.vehicle} onChange={e => set('vehicle', e.target.value)} placeholder="KL 11 XX 0000" className={inputCls} /></Field>
          <Field label="Vehicle Type">
            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>{VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}</select>
          </Field>
          <Field label="Driver Name *"><input value={form.driver} onChange={e => set('driver', e.target.value)} className={inputCls} /></Field>
          <Field label="Driver Phone"><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9447…" className={inputCls} /></Field>
          <Field label="Departure Time"><input type="time" value={form.dept} onChange={e => set('dept', e.target.value)} className={inputCls} /></Field>
        </div>
      </Modal>
    </div>
  );
}

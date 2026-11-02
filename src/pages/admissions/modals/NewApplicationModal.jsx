import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { GRADES, STAFF_NAMES, SOURCES } from '../constants';

const field = (label, key, type='text', placeholder='') => ({ label, key, type, placeholder });

export default function NewApplicationModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name:'', grade:'', dob:'', parent:'', phone:'', email:'', address:'',
    diet:'Vegetarian', boarding:false, busRoute:'', assigned:'Unassigned', notes:'', gender:'', source:SOURCES[0],
  });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  function save() {
    if (!form.name || !form.grade || !form.parent || !form.phone) return;
    onSave(form);
    onClose();
  }

  return (
    <Modal open onClose={onClose} size="lg" title="New Application" subtitle="Register a new enquiry / application"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Register Enquiry</Button></>}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Student Name *</label>
          <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Full name"
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4]"/>
        </div>
        <Select label="Applying for Grade *" value={form.grade} onChange={e=>set('grade',e.target.value)}>
          <option value="">— Select Grade —</option>
          {GRADES.map(g => <option key={g}>{g}</option>)}
        </Select>
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Date of Birth</label>
          <input type="date" value={form.dob} onChange={e=>set('dob',e.target.value)}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
        </div>
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Parent / Guardian *</label>
          <input value={form.parent} onChange={e=>set('parent',e.target.value)} placeholder="Parent name"
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
        </div>
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Phone *</label>
          <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="10-digit number"
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
        </div>
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="parent@email.com"
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
        </div>
        <div className="col-span-2">
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Address</label>
          <input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Home address"
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
        </div>
        <Select label="Gender" value={form.gender} onChange={e=>set('gender',e.target.value)}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></Select>
        <Select label="Source" value={form.source} onChange={e=>set('source',e.target.value)}>{SOURCES.map(s => <option key={s}>{s}</option>)}</Select>
        <Select label="Diet" value={form.diet} onChange={e=>set('diet',e.target.value)}>
          <option>Vegetarian</option><option>Non-Vegetarian</option><option>Vegan</option>
        </Select>
        <Select label="Assigned To" value={form.assigned} onChange={e=>set('assigned',e.target.value)}>
          {STAFF_NAMES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <div className="col-span-2 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.boarding} onChange={e=>set('boarding',e.target.checked)} className="w-4 h-4 accent-[#C8202E]"/>
            <span className="text-[13px] text-[#333] font-medium">Boarding required</span>
          </label>
        </div>
        <div className="col-span-2">
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] resize-none font-[inherit]"
            placeholder="Any initial notes..."/>
        </div>
      </div>
    </Modal>
  );
}

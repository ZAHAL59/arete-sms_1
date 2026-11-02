import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Kpi, Field, inputCls } from './ui';
import { INCIDENT_TYPES } from './constants';

const TYPE_VARIANT = { Health:'red', Behavioural:'amber', Safety:'red', Facility:'blue', Other:'grey' };

export default function Incidents({ h, addIncident, resolveIncident }) {
  const db = useStore(s => s.db);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const blank = () => ({ stuId:'', type:INCIDENT_TYPES[0], when:nowLocal(), desc:'', action:'', by:'Warden' });
  const [f, setF] = useState(blank);

  const rows = h.incidents.filter(i => filter === 'all' || i.status === filter || i.type === filter);
  const openCount = h.incidents.filter(i => i.status === 'Open').length;

  function save() {
    if (!f.stuId || !f.desc.trim()) return;
    const s = db.students.find(x => x.id === f.stuId);
    addIncident({ stuName:s.name, cls:s.cls, type:f.type, desc:f.desc.trim(), action:f.action.trim() || 'Under review', by:f.by.trim() || 'Warden', date:f.when.replace('T', ' ') });
    setOpen(false); setF(blank());
  }

  return (
    <div className="p-6">
      <PageHeader title="Incident Log" subtitle="Hostel incidents and actions taken"
        actions={<>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
            <option value="all">All</option><option>Open</option><option>Resolved</option>
            {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <Button onClick={() => setOpen(true)}>+ Log Incident</Button>
        </>} />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Kpi label="Total Incidents" value={h.incidents.length} note="All time" />
        <Kpi label="Open" value={openCount} note="Needs follow-up" color={openCount ? '#DC2626' : '#166534'} />
        <Kpi label="Health" value={h.incidents.filter(i => i.type === 'Health').length} note="Medical related" color="#B45309" />
      </div>

      <div className="space-y-2">
        {!rows.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">No incidents</div>}
        {rows.map(i => (
          <Collapsible key={i.id} defaultOpen={i.status === 'Open'}
            className={i.status === 'Open' ? '!border-l-[3px] !border-l-[#DC2626]' : '!border-l-[3px] !border-l-[#166534]'}
            header={
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111]">{i.stuName} <span className="font-normal text-[#AAA]">· {i.cls}</span></div>
                  <div className="text-[11.5px] text-[#777] mt-0.5">{i.date} · {i.by}</div>
                </div>
                <Badge variant={TYPE_VARIANT[i.type] || 'grey'}>{i.type}</Badge>
                <Badge variant={i.status === 'Open' ? 'red' : 'green'}>{i.status}</Badge>
              </div>
            }>
            <div className="px-4 py-3 border-t border-[#E4E4E4] space-y-3">
              <div><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">What happened</div><div className="text-[13px] text-[#333] leading-relaxed">{i.desc}</div></div>
              <div><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">Action taken</div><div className="text-[13px] text-[#333] leading-relaxed">{i.action || '—'}</div></div>
              {i.status === 'Open' && <Button size="sm" onClick={() => resolveIncident(i.id)}>✓ Mark Resolved</Button>}
            </div>
          </Collapsible>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Incident"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Incident</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Student *">
            <select value={f.stuId} onChange={e => setF(x => ({ ...x, stuId:e.target.value }))} className={inputCls}>
              <option value="">— Select —</option>
              {db.students.filter(s => s.boarding).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={f.type} onChange={e => setF(x => ({ ...x, type:e.target.value }))} className={inputCls}>
              {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Date & time"><input type="datetime-local" value={f.when} onChange={e => setF(x => ({ ...x, when:e.target.value }))} className={inputCls} /></Field>
          <Field label="Reported by"><input value={f.by} onChange={e => setF(x => ({ ...x, by:e.target.value }))} className={inputCls} /></Field>
          <Field label="Description *" className="col-span-2">
            <textarea rows={3} value={f.desc} onChange={e => setF(x => ({ ...x, desc:e.target.value }))} className={inputCls + ' resize-y'} />
          </Field>
          <Field label="Action taken" className="col-span-2">
            <textarea rows={2} value={f.action} onChange={e => setF(x => ({ ...x, action:e.target.value }))} className={inputCls + ' resize-y'} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

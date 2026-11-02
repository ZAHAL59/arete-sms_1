import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { DEP_REASONS, TODAY } from './constants';

export default function Departures({ t, addDeparture }) {
  const db = useStore(s => s.db);
  const [open, setOpen] = useState(false);
  const [stuId, setStuId] = useState('');
  const [time, setTime] = useState('14:30');
  const [reason, setReason] = useState(DEP_REASONS[0]);

  const busStudents = db.students.filter(s => s.busRoute);
  const stu = busStudents.find(s => s.id === stuId);
  const route = stu && db.routes.find(r => r.id === stu.busRoute);

  const today = t.departures.filter(d => d.date === TODAY);
  const week = t.departures.filter(d => (new Date(TODAY) - new Date(d.date)) / 86400000 < 7);
  const counts = {}; t.departures.forEach(d => { counts[d.reason] = (counts[d.reason] || 0) + 1; });
  const common = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  function save() {
    if (!stu) return;
    addDeparture({ studentId: stu.id, reason, time });
    setOpen(false); setStuId('');
  }

  return (
    <div className="p-6">
      <PageHeader title="Early Departure" subtitle="Notify the driver when a student leaves school early"
        actions={<Button onClick={() => setOpen(true)}>+ Log Early Departure</Button>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Today" value={today.length} note="Early departures" />
        <Kpi label="Last 7 Days" value={week.length} note="Departures" color="#1A5FB4" />
        <Kpi label="SMS Sent" value={`${t.departures.filter(d => d.smsSent).length}/${t.departures.length}`} note="Driver notified" color="#166534" />
        <Kpi label="Most Common" value={common.split(' ')[0]} note={common} color="#B45309" />
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Student</Th><Th>Class</Th><Th>Route</Th><Th>Reason</Th><Th>Time</Th><Th>Date</Th><Th>SMS</Th></tr></thead>
          <tbody>
            {!t.departures.length
              ? <tr><td colSpan={7} className="text-center py-10 text-[#AAA]">No early departures logged</td></tr>
              : t.departures.map(d => {
                  const s = db.students.find(x => x.id === d.studentId);
                  const r = db.routes.find(x => x.id === s?.busRoute);
                  return (
                    <tr key={d.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-4 py-2.5 font-semibold text-[#111]">{s?.name || d.studentId}</td>
                      <td className="px-4 py-2.5 text-[#555]">{s ? `${s.cls} ${s.section}` : '—'}</td>
                      <td className="px-4 py-2.5 text-[#555]">{r?.name || '—'}</td>
                      <td className="px-4 py-2.5 text-[#555]">{d.reason}</td>
                      <td className="px-4 py-2.5 font-bold text-[#111]">{d.time}</td>
                      <td className="px-4 py-2.5 text-[#555]">{d.date}</td>
                      <td className="px-4 py-2.5"><Badge variant={d.smsSent ? 'green' : 'amber'}>{d.smsSent ? 'Sent' : 'Pending'}</Badge></td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Early Departure"
        subtitle="Driver will be notified to skip this student's stop today"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Log & Send SMS</Button></>}>
        <div className="space-y-3">
          <Field label="Student *">
            <select value={stuId} onChange={e => setStuId(e.target.value)} className={inputCls}>
              <option value="">— Select bus student —</option>
              {busStudents.map(s => <option key={s.id} value={s.id}>{s.name} — {s.cls} {s.section}</option>)}
            </select>
          </Field>
          <div className="bg-[#F8F8F8] rounded-[6px] p-2.5 text-[12.5px] text-[#555]">
            {route ? <><strong>Driver:</strong> {route.driver} · {route.phone} · {route.name}</> : 'Select a student to see driver details'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Departure Time"><input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} /></Field>
            <Field label="Reason">
              <select value={reason} onChange={e => setReason(e.target.value)} className={inputCls}>
                {DEP_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          {route && stu && (
            <div className="bg-[#FEF4F4] border border-[#FECACA] rounded-[6px] p-3 text-[12.5px] text-[#9A1822]">
              📱 <strong>SMS to driver {route.driver}:</strong><br />
              "{stu.name} ({stu.cls}) has LEFT SCHOOL EARLY at <strong>{time}</strong>. NO need to wait for them. — Arete Model School"
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

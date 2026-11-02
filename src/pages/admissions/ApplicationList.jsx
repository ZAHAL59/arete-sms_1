import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/Layout';
import { Th } from '../../components/ui/Kit';
import { STAGE_VARIANT, GRADES, STAFF_NAMES } from './constants';
import { downloadCsv } from '../principal/constants';
import ApplicationDetailModal from './modals/ApplicationDetailModal';

const STAGES = ['Enquiry', 'Application Received', 'Docs Pending', 'Interview Scheduled', 'Seat Allocated', 'Waitlisted', 'Enrolled'];
const SHORT = { 'Application Received': 'Application', 'Docs Pending': 'Docs Pending', 'Interview Scheduled': 'Interview' };

export function feeBadge(a) {
  if (!a.feeLines.length) return <Badge variant="grey">No invoice</Badge>;
  const inv = a.feeLines.reduce((s, l) => s + l.invoice, 0), paid = a.feeLines.reduce((s, l) => s + l.paid, 0);
  return paid >= inv ? <Badge variant="green">All paid</Badge> : <Badge variant={paid ? 'amber' : 'red'}>{paid ? 'Part paid' : 'Unpaid'}</Badge>;
}

export default function ApplicationList({ A }) {
  const [stage, setStage] = useState('all'); const [q, setQ] = useState(''); const [grade, setGrade] = useState(''); const [officer, setOfficer] = useState(''); const [sel, setSel] = useState(null);
  const all = A.admissions;
  const rows = all.filter(a => (stage === 'all' || a.stage === stage) && (!grade || a.grade === grade) && (!officer || a.assigned === officer) &&
    (!q || [a.name, a.grade, a.parent].some(v => (v || '').toLowerCase().includes(q.toLowerCase()))));
  const sc = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]';
  const exportCsv = () => downloadCsv('applications.csv', ['ID', 'Child', 'Grade', 'Parent', 'Phone', 'Stage', 'Documents', 'Officer', 'Applied'],
    rows.map(a => [a.id, a.name, a.grade, a.parent, a.phone, a.stage, `${Object.values(a.docs).filter(Boolean).length}/${Object.keys(a.docs).length}`, a.assigned, a.applied]));

  return (
    <div className="p-6">
      <PageHeader title="All Applications" subtitle={`Showing ${rows.length} of ${all.length}`}
        actions={<><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, grade, parent…" className={sc + ' w-48'} />
          <select value={grade} onChange={e => setGrade(e.target.value)} className={sc}><option value="">All grades</option>{GRADES.map(g => <option key={g}>{g}</option>)}</select>
          <select value={officer} onChange={e => setOfficer(e.target.value)} className={sc}><option value="">All officers</option>{STAFF_NAMES.map(s => <option key={s}>{s}</option>)}</select>
          <Button variant="outline" onClick={exportCsv}>⬇ Export</Button></>} />
      <div className="flex gap-1.5 flex-wrap mb-3">{[['all', 'All'], ...STAGES.map(s => [s, SHORT[s] || s])].map(([id, l]) => {
        const n = id === 'all' ? all.length : all.filter(a => a.stage === id).length;
        return <button key={id} onClick={() => setStage(id)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer border ${stage === id ? 'bg-[#C8202E] text-white border-[#C8202E]' : 'bg-white text-[#555] border-[#E4E4E4] hover:border-[#C8202E]'}`}>{l} <span className="opacity-70">{n}</span></button>; })}</div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Applicant</Th><Th>Grade</Th><Th>Parent / Phone</Th><Th>Stage</Th><Th>Applied</Th><Th>Officer</Th><Th>Docs</Th><Th>Fees</Th><Th /></tr></thead>
          <tbody>{!rows.length ? <tr><td colSpan={9} className="text-center py-12 text-[#AAA]">No applications found</td></tr> : rows.map(a => { const dc = Object.values(a.docs).filter(Boolean).length, dt = Object.keys(a.docs).length; return (
            <tr key={a.id} onClick={() => setSel(a)} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8] cursor-pointer">
              <td className="px-3.5 py-2.5"><div className="font-semibold text-[#111]">{a.name}</div><div className="font-mono text-[10.5px] text-[#AAA]">{a.id}</div></td>
              <td className="px-3.5 py-2.5 text-[#555]">{a.grade}</td><td className="px-3.5 py-2.5 text-[#555]">{a.parent}<div className="font-mono text-[11px] text-[#AAA]">{a.phone}</div></td>
              <td className="px-3.5 py-2.5"><Badge variant={STAGE_VARIANT[a.stage] || 'grey'}>{a.stage}</Badge></td><td className="px-3.5 py-2.5 text-[#AAA] text-[12px]">{a.applied}</td><td className="px-3.5 py-2.5 text-[#555]">{a.assigned}</td>
              <td className="px-3.5 py-2.5"><div className="flex items-center gap-1.5"><div className="h-1.5 bg-[#E4E4E4] rounded-full w-12 overflow-hidden"><div className="h-full bg-[#C8202E] rounded-full" style={{ width: `${dc / dt * 100}%` }} /></div><span className="text-[11px] text-[#AAA]">{dc}/{dt}</span></div></td>
              <td className="px-3.5 py-2.5">{feeBadge(a)}</td><td className="px-3.5 py-2.5 text-[11px] font-semibold text-[#C8202E] underline">Open</td></tr>); })}</tbody>
        </table>
      </div>
      {sel && <ApplicationDetailModal app={sel} A={A} onClose={() => setSel(null)} />}
    </div>
  );
}

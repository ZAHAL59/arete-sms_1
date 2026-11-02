import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Collapsible from '../../components/ui/Collapsible';
import { Kpi, Th } from '../../components/ui/Kit';
import useExpand from '../../components/ui/useExpand';
import ExpandControls from '../../components/ui/ExpandControls';
import { getStudentDue, countsTowardDue, paidTowardDue } from '../finance/constants';
import { fmt } from './constants';

export default function FinanceSummary() {
  const db = useStore(s => s.db);
  const [q, setQ] = useState('');
  const paidBy = id => paidTowardDue(db.payments, id);
  const due = db.students.reduce((a, s) => a + getStudentDue(s), 0);
  const collected = db.payments.filter(p => p.studentId && countsTowardDue(p)).reduce((a, p) => a + p.amount, 0);
  const payroll = db.staff.reduce((a, s) => a + s.salary, 0);
  const students = db.students.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()));
  const classes = [...new Set(students.map(s => `${s.cls} ${s.section}`.trim()))].sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')) || a.localeCompare(b));
  const ex = useExpand([]);                                    // classes start collapsed; searching opens the matches
  const L = n => '₹' + (Math.round(n / 100000 * 10) / 10) + 'L';

  return (
    <div className="p-6">
      <PageHeader title="Finance Summary" subtitle="Read-only view — managed in the Finance portal" />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Billed" value={L(due)} note={`${db.students.length} students`} />
        <Kpi label="Collected" value={L(collected)} note={`${due ? Math.round(collected / due * 100) : 0}% of annual`} color="#166534" />
        <Kpi label="Outstanding" value={L(Math.max(0, due - collected))} note="Pending collection" color="#DC2626" />
        <Kpi label="Staff on Payroll" value={db.staff.length} note={`Monthly: ₹${Math.round(payroll / 1000)}K`} color="#1A5FB4" />
      </div>
      <Collapsible defaultOpen className="mb-3" header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Student Fee Status</span><span className="text-[11.5px] text-[#AAA]">by class</span>
        <input value={q} onClick={e => e.stopPropagation()} onChange={e => setQ(e.target.value)} placeholder="Search..." className="ml-auto px-2 py-1 border border-[#E4E4E4] rounded-[6px] text-[12px] outline-none w-36" /><span onClick={e => e.stopPropagation()}><ExpandControls ex={ex} ids={classes.map(x => 'k:' + x)} /></span></div>}>
        <div className="p-3 border-t border-[#E4E4E4]">
          {!classes.length && <div className="text-center text-[#AAA] text-[13px] py-6">No students found</div>}
          {classes.map(cn => {
            const list = students.filter(s => `${s.cls} ${s.section}`.trim() === cn);
            const due = list.reduce((a, s) => a + getStudentDue(s), 0), paid = list.reduce((a, s) => a + paidBy(s.id), 0), bal = Math.max(0, due - paid);
            return (
              <Collapsible key={cn} className="mb-1.5" open={q ? true : ex.isOpen('k:' + cn)} onToggle={() => ex.toggle('k:' + cn)}
                header={<div className="flex items-center gap-2.5"><span className="text-[13px] font-bold text-[#111]">{cn}</span><Badge variant="grey">{list.length} student{list.length === 1 ? '' : 's'}</Badge><span className="ml-auto text-[12px] text-[#777]">Balance <b style={{ color: bal ? '#DC2626' : '#166534' }}>{fmt(bal)}</b></span></div>}>
                <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
                  <thead><tr><Th>Student</Th><Th>Annual Due</Th><Th>Paid</Th><Th>Balance</Th><Th>Status</Th></tr></thead>
                  <tbody>{list.map(s => { const d = getStudentDue(s), p = paidBy(s.id), b2 = Math.max(0, d - p); return (
                    <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-4 py-2.5 font-semibold text-[#111]">{s.name}</td>
                      <td className="px-4 py-2.5 font-mono text-[12px]">{fmt(d)}</td><td className="px-4 py-2.5 font-mono text-[12px] text-[#166534]">{fmt(p)}</td>
                      <td className="px-4 py-2.5 font-mono text-[12px] font-bold" style={{ color: b2 ? '#DC2626' : '#166534' }}>{fmt(b2)}</td>
                      <td className="px-4 py-2.5"><Badge variant={!b2 ? 'green' : p ? 'amber' : 'red'}>{!b2 ? 'Paid' : p ? 'Partial' : 'Pending'}</Badge></td></tr>); })}</tbody>
                </table>
              </Collapsible>);
          })}
        </div>
      </Collapsible>
      <div className="grid grid-cols-2 gap-3">
        <Collapsible header={<span className="text-[13.5px] font-bold text-[#111]">Staff Payroll — {fmt(payroll)}/mo</span>}>
          <div className="divide-y divide-[#E4E4E4] border-t border-[#E4E4E4]">{db.staff.map(s => <div key={s.id} className="flex items-center px-4 py-2.5"><div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{s.name}</div><div className="text-[11.5px] text-[#777]">{s.subj}</div></div><span className="text-[13px] font-bold text-[#C8202E]">{fmt(s.salary)}</span></div>)}</div>
        </Collapsible>
        <Collapsible header={<span className="text-[13.5px] font-bold text-[#111]">Recent Payments</span>}>
          <div className="divide-y divide-[#E4E4E4] border-t border-[#E4E4E4]">{db.payments.filter(p => p.studentId).slice(0, 8).map(p => <div key={p.id} className="flex items-center px-4 py-2.5"><div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{db.students.find(s => s.id === p.studentId)?.name || '—'}</div><div className="text-[11.5px] text-[#777]">{p.category} · {p.date}</div></div><span className="text-[13px] font-bold text-[#166534]">{fmt(p.amount)}</span></div>)}</div>
        </Collapsible>
      </div>
    </div>
  );
}

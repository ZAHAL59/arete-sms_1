import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SalarySlipsModal from './modals/SalarySlips';
import { fmt, fmtL } from './constants';

export default function Payroll({ allPayments, processPayroll, payStaff, updateSalary }) {
  const db = useStore(s => s.db);
  const [slips, setSlips] = useState(null); const [edit, setEdit] = useState(null); const [sal, setSal] = useState('');
  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const totalPayroll = db.staff.reduce((a, s) => a + s.salary, 0);
  const paidThisMonth = allPayments.filter(p => p.category === 'Staff Salary' && new Date(p.date || '').getMonth() === now.getMonth() && new Date(p.date || '').getFullYear() === now.getFullYear());
  const paidIds = new Set(paidThisMonth.map(p => p.staffId || p.name));
  const paidTotal = paidThisMonth.reduce((a, p) => a + p.amount, 0);
  const ytd = id => allPayments.filter(p => p.staffId === id && p.category === 'Staff Salary').reduce((a, p) => a + p.amount, 0);
  const isPaid = s => paidIds.has(s.id) || paidIds.has(s.name);

  return (
    <div className="p-6">
      <PageHeader title="Staff Payroll" subtitle={`Salaries live from HR · ${monthLabel}`}
        actions={<><Button variant="outline" onClick={() => setSlips({ staff: db.staff, title: 'Salary Slips — all staff' })}>📋 Salary Slips</Button><Button onClick={processPayroll}>✓ Process All Payroll</Button></>} />
      <div className="bg-[#FEF4F4] border border-[#FECACA] rounded-[8px] p-3 mb-5 text-[12.5px] text-[#555]">🔗 <strong className="text-[#111]">Source: HR Portal.</strong> Staff and salaries come from the HR module — hire someone there and they appear here automatically.</div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[{ l: 'Monthly Payroll', v: fmtL(totalPayroll), c: '#C8202E' }, { l: 'Paid This Month', v: fmtL(paidTotal), c: '#166534' }, { l: 'Pending', v: fmtL(Math.max(0, totalPayroll - paidTotal)), c: '#DC2626' }, { l: 'Staff Processed', v: `${db.staff.filter(isPaid).length}/${db.staff.length}`, c: '#1A5FB4' }].map(k => (
          <div key={k.l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]" style={{ borderLeft: `3px solid ${k.c}` }}><div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.l}</div><div className="text-[20px] font-extrabold font-mono" style={{ color: k.c }}>{k.v}</div></div>))}
      </div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8]"><div className="text-[13.5px] font-bold text-[#111]">Staff Salary Register</div></div>
        <table className="w-full border-collapse text-[13px]">
          <thead><tr>{['Name', 'Subject', 'Joined', 'Monthly Salary', 'Status', 'YTD Paid', ''].map(h => <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>)}</tr></thead>
          <tbody>{db.staff.map(s => { const paid = isPaid(s); return (
            <tr key={s.id} className={`border-b border-[#E4E4E4] last:border-b-0 ${paid ? 'bg-[#F6FEF9]' : ''}`}>
              <td className="px-4 py-2.5 font-semibold text-[#111]">{s.name}</td><td className="px-4 py-2.5 text-[#555]">{s.subj}</td><td className="px-4 py-2.5 text-[#555]">{s.joined}</td>
              <td className="px-4 py-2.5 font-bold font-mono">{fmt(s.salary)}</td><td className="px-4 py-2.5"><Badge variant={paid ? 'green' : 'amber'}>{paid ? 'Paid' : 'Pending'}</Badge></td>
              <td className="px-4 py-2.5 font-mono text-[12px] font-semibold text-[#166534]">{fmt(ytd(s.id))}</td>
              <td className="px-4 py-2.5 whitespace-nowrap">{!paid && <button onClick={() => payStaff(s.id)} className="text-[11px] font-semibold text-[#166534] underline cursor-pointer bg-none border-none mr-3">Mark Paid</button>}
                <button onClick={() => { setEdit(s); setSal(String(s.salary)); }} className="text-[11px] font-semibold text-[#555] underline cursor-pointer bg-none border-none mr-3">Edit</button>
                <button onClick={() => setSlips({ staff: [s], title: `Salary Slip — ${s.name}` })} className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">Slip</button></td></tr>); })}</tbody>
          <tfoot><tr className="bg-[#F8F8F8]"><td colSpan={3} className="px-4 py-3 font-bold">Total</td><td className="px-4 py-3 font-extrabold font-mono text-[#C8202E] text-[14px]">{fmtL(totalPayroll)}</td><td /><td className="px-4 py-3 font-bold font-mono text-[#166534]">{fmtL(db.staff.reduce((a, s) => a + ytd(s.id), 0))}</td><td /></tr></tfoot>
        </table>
      </div>
      {slips && <SalarySlipsModal staff={slips.staff} title={slips.title} onClose={() => setSlips(null)} />}
      {edit && <Modal open onClose={() => setEdit(null)} title={`Edit salary — ${edit.name}`} subtitle="Changes the staff record everywhere" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={() => { if (+sal > 0) { updateSalary(edit.id, +sal); setEdit(null); } }}>Save</Button></>}>
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Monthly salary (₹)</label><input type="number" value={sal} onChange={e => setSal(e.target.value)} className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]" /></Modal>}
    </div>
  );
}

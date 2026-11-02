import { useState } from 'react';
import useStore from '../../store/useStore';
import useFinance from '../finance/useFinance';
import FeeOverview from '../finance/FeeOverview';
import StudentLedger from '../finance/StudentLedger';
import PaymentHistory from '../finance/PaymentHistory';
import Collapsible from '../../components/ui/Collapsible';
import { getStudentDue, countsTowardDue } from '../finance/constants';
import { Th } from '../../components/ui/Kit';
import { fmt } from './constants';

export default function Fees() {
  const db = useStore(s => s.db);
  const { allPayments, recordPayment } = useFinance();
  const [tab, setTab] = useState('overview');
  const grades = [...new Set(db.students.map(s => s.cls))].sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
  const rows = grades.map(g => {
    const sts = db.students.filter(s => s.cls === g), billed = sts.reduce((a, s) => a + getStudentDue(s), 0);
    const col = allPayments.filter(p => countsTowardDue(p) && sts.some(s => s.id === p.studentId)).reduce((a, p) => a + p.amount, 0);
    return { g, billed, col, pct: billed ? Math.round(col / billed * 100) : 0 };
  });
  const props = { allPayments, recordPayment };

  return (
    <div>
      <div className="px-6 pt-6"><Collapsible defaultOpen header={<span className="text-[13.5px] font-bold text-[#111]">Collection by Grade</span>}>
        <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]"><thead><tr><Th>Grade</Th><Th>Billed</Th><Th>Collected</Th><Th>Progress</Th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.g} className="border-b border-[#E4E4E4] last:border-b-0"><td className="px-4 py-2.5 font-semibold">{r.g}</td><td className="px-4 py-2.5 font-mono text-[12px]">{fmt(r.billed)}</td><td className="px-4 py-2.5 font-mono text-[12px] text-[#166534]">{fmt(r.col)}</td>
            <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="h-1.5 bg-[#E4E4E4] rounded-full w-28 overflow-hidden"><div className="h-full bg-[#C8202E] rounded-full" style={{ width: `${Math.min(100, r.pct)}%` }} /></div><span className="text-[11px] font-bold">{r.pct}%</span></div></td></tr>)}</tbody></table>
      </Collapsible></div>
      <div className="px-6 pt-4 flex gap-1 border-b border-[#E4E4E4] mx-6">{[['overview', 'Overview'], ['ledger', 'Student Ledger'], ['history', 'Payments']].map(([id, l]) => <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-none ${tab === id ? 'border-[#C8202E] text-[#C8202E]' : 'border-transparent text-[#777]'}`}>{l}</button>)}</div>
      {tab === 'overview' && <FeeOverview {...props} />}{tab === 'ledger' && <StudentLedger {...props} />}{tab === 'history' && <PaymentHistory {...props} />}
    </div>
  );
}

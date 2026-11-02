import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { fmt, FEE_CATEGORIES } from './constants';
import PaymentModal from './modals/PaymentModal';
import ReceiptModal from './modals/ReceiptModal';

export default function PaymentHistory({ allPayments, recordPayment }) {
  const db = useStore(s => s.db);
  const [q,    setQ]    = useState('');
  const [cat,  setCat]  = useState('');
  const [mode, setMode] = useState('');
  const [payOpen, setPayOpen] = useState(false); const [rcpt, setRcpt] = useState(null);

  const stuPayments = allPayments.filter(p=>p.studentId);
  const filtered = stuPayments.filter(p => {
    const stu = db.students.find(s=>s.id===p.studentId);
    const nm  = !q || (stu?.name||'').toLowerCase().includes(q.toLowerCase());
    const cm  = !cat  || p.category===cat;
    const mm  = !mode || p.mode===mode;
    return nm&&cm&&mm;
  });

  const modes = [...new Set(stuPayments.map(p=>p.mode))].filter(Boolean);

  return (
    <div className="p-6">
      <PageHeader title="Payment History" subtitle={`${stuPayments.length} total · ${filtered.length} showing`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search student..."
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] w-40"/>
            <select value={cat} onChange={e=>setCat(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
              <option value="">All Categories</option>
              {FEE_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={mode} onChange={e=>setMode(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
              <option value="">All Modes</option>
              {modes.map(m=><option key={m}>{m}</option>)}
            </select>
            <Button onClick={()=>setPayOpen(true)}>+ Record Payment</Button>
          </div>
        }
      />
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex items-center justify-between">
          <div className="text-[13.5px] font-bold text-[#111]">All Payments</div>
          <Badge variant="green">{filtered.length} records</Badge>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead><tr>{['Student','Class','Category','Amount','Date','Mode','Receipt'].map(h=>
            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
          )}</tr></thead>
          <tbody>
            {!filtered.length
              ? <tr><td colSpan={7} className="text-center py-10 text-[#AAA]">No records match</td></tr>
              : filtered.map(p=>{
                  const stu=db.students.find(s=>s.id===p.studentId);
                  return (
                    <tr key={p.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-4 py-2.5 font-semibold text-[#111]">{stu?.name||'—'}</td>
                      <td className="px-4 py-2.5 text-[#555]">{stu?.cls||'—'}</td>
                      <td className="px-4 py-2.5"><Badge variant="grey">{p.category}</Badge></td>
                      <td className="px-4 py-2.5 font-bold font-mono text-[#166534]">{fmt(p.amount)}</td>
                      <td className="px-4 py-2.5 text-[#555]">{p.date}</td>
                      <td className="px-4 py-2.5"><Badge variant={p.mode?.includes('Online')?'blue':p.mode==='Cash'?'green':'amber'}>{p.mode}</Badge></td>
                      <td className="px-4 py-2.5"><button onClick={()=>setRcpt(p)} className="font-mono text-[11px] text-[#C8202E] underline cursor-pointer bg-none border-none">{p.id}</button></td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>
      {rcpt && <ReceiptModal payment={rcpt} onClose={()=>setRcpt(null)}/>}
      {payOpen && <PaymentModal onClose={()=>setPayOpen(false)} onSave={recordPayment}/>}
    </div>
  );
}

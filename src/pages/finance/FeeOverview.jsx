import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { fmt, fmtL, getStudentDue, countsTowardDue } from './constants';
import PaymentModal from './modals/PaymentModal';
import ReceiptModal from './modals/ReceiptModal';

export default function FeeOverview({ allPayments, recordPayment }) {
  const db = useStore(s => s.db);
  const [payOpen, setPayOpen] = useState(false); const [rcpt, setRcpt] = useState(null);

  const totalDue       = db.students.reduce((a,s) => a+getStudentDue(s), 0);
  const totalCollected = allPayments.filter(p=>p.studentId && countsTowardDue(p)).reduce((a,p)=>a+p.amount,0);
  const otherCollected = allPayments.filter(p=>p.studentId && !countsTowardDue(p)).reduce((a,p)=>a+p.amount,0);   // admission fees, deposits, advances
  const outstanding    = Math.max(0, totalDue - totalCollected);

  const byCategory = {};
  allPayments.filter(p=>p.studentId).forEach(p=>{
    if(!byCategory[p.category]) byCategory[p.category]={count:0,total:0};
    byCategory[p.category].count++;
    byCategory[p.category].total+=p.amount;
  });

  const recent = allPayments.filter(p=>p.studentId).slice(0,8);

  const collPct = totalDue>0 ? Math.round(totalCollected/totalDue*100) : 0;

  return (
    <div className="p-6">
      <PageHeader title="Fee Overview" subtitle={`Live from student records · ${new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}`}
        actions={<Button onClick={()=>setPayOpen(true)}>+ Record Payment</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {label:'Total Collected',  value:fmtL(totalCollected), note:'All categories · AY 2026–27', color:'#166534'},
          {label:'Outstanding',      value:fmtL(outstanding),    note:`Pending from ${db.students.length} students`, color:'#DC2626'},
          {label:'Collection %',     value:collPct+'%',          note:'Against annual due', color:'#C8202E'},
          {label:'Transactions',     value:allPayments.filter(p=>p.studentId).length, note:'This academic year', color:'#1A5FB4'},
        ].map(k=>(
          <div key={k.label} className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 shadow-[0_1px_4px_rgba(0,0,0,.07)]"
            style={{borderLeft:`3px solid ${k.color}`}}>
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.label}</div>
            <div className="text-[22px] font-extrabold font-mono leading-none" style={{color:k.color}}>{k.value}</div>
            <div className="text-[11.5px] text-[#AAA] mt-1">{k.note}</div>
          </div>
        ))}
      </div>

      {/* Overall collection bar */}
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 mb-4 shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="flex justify-between text-[12.5px] font-semibold text-[#333] mb-2">
          <span>Collection Progress — AY 2026–27</span>
          <span>{fmtL(totalCollected)} / {fmtL(totalDue)}</span>
        </div>
        <div className="h-3 bg-[#E4E4E4] rounded-full overflow-hidden">
          <div className="h-full bg-[#C8202E] rounded-full transition-all" style={{width:`${collPct}%`}}/>
        </div>
        <div className="text-[11px] text-[#AAA] mt-1">{collPct}% collected · {fmtL(outstanding)} outstanding{otherCollected > 0 && <> · plus {fmt(otherCollected)} in admission fees, deposits and advances (not counted against annual fees)</>}</div>
      </div>

      {/* By category */}
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)] mb-4">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8]">
          <div className="text-[13.5px] font-bold text-[#111]">Collection by Category</div>
        </div>
        <div className="p-4 space-y-3">
          {Object.entries(byCategory).map(([cat,{count,total}])=>(
            <div key={cat} className="flex items-center gap-3">
              <span className="text-[13px] text-[#333] font-medium min-w-[160px]">{cat}</span>
              <div className="flex-1 h-1.5 bg-[#E4E4E4] rounded-full overflow-hidden">
                <div className="h-full bg-[#C8202E] rounded-full" style={{width:`${Math.min(100,total/totalCollected*100)}%`}}/>
              </div>
              <span className="text-[12.5px] font-bold text-[#111] font-mono min-w-[80px] text-right">{fmt(total)}</span>
              <span className="text-[11px] text-[#AAA] min-w-[60px]">{count} payments</span>
            </div>
          ))}
          {!Object.keys(byCategory).length && (
            <div className="text-center py-4 text-[#AAA]">No payments recorded yet</div>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex items-center justify-between">
          <div className="text-[13.5px] font-bold text-[#111]">Recent Payments</div>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead><tr>{['Student','Class','Category','Amount','Date','Mode','Receipt'].map(h=>
            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
          )}</tr></thead>
          <tbody>
            {!recent.length
              ? <tr><td colSpan={7} className="text-center py-10 text-[#AAA]">No payments yet — click Record Payment</td></tr>
              : recent.map(p=>{
                  const stu=db.students.find(s=>s.id===p.studentId);
                  return (
                    <tr key={p.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-4 py-2.5 font-semibold text-[#111]">{stu?.name||p.name||'—'}</td>
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

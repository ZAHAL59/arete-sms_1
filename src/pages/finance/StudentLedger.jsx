import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { fmt, fmtL, getStudentDue, countsTowardDue, paidTowardDue } from './constants';
import PaymentModal from './modals/PaymentModal';
import FeeStructureModal from './modals/FeeStructureModal';

const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'];

export default function StudentLedger({ allPayments, recordPayment }) {
  const db = useStore(s => s.db);
  const [q,      setQ]      = useState('');
  const [grade,  setGrade]  = useState('');
  const [filter, setFilter] = useState('all');
  const [payStu, setPayStu] = useState(null);
  const [fsOpen, setFsOpen] = useState(false); const [, setTick] = useState(0);

  const students = db.students.filter(s => {
    const qm = !q || s.name.toLowerCase().includes(q.toLowerCase());
    const gm = !grade || s.cls===grade;
    if (!qm||!gm) return false;
    const due  = getStudentDue(s);
    const paid = paidTowardDue(allPayments, s.id);
    const bal  = due-paid;
    if (filter==='paid')    return bal<=0;
    if (filter==='partial') return paid>0&&bal>0;
    if (filter==='pending') return paid===0;
    if (filter==='overdue') return bal>0;
    return true;
  });

  const totalDue  = db.students.reduce((a,s)=>a+getStudentDue(s),0);
  const totalPaid = allPayments.filter(p=>p.studentId && countsTowardDue(p)).reduce((a,p)=>a+p.amount,0);
  const outstanding = Math.max(0,totalDue-totalPaid);

  return (
    <div className="p-6">
      <PageHeader title="Fee Collection" subtitle="Per-student fee status · grade-wise progress"
        actions={
          <div className="flex gap-2 flex-wrap">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search student..."
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] w-40"/>
            <select value={grade} onChange={e=>setGrade(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
              <option value="">All Grades</option>
              {GRADES.map(g=><option key={g}>{g}</option>)}
            </select>
            <select value={filter} onChange={e=>setFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
              <option value="all">All Students</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Not Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <Button variant="outline" onClick={()=>setFsOpen(true)}>⚙ Fee Structure</Button>
            <Button onClick={()=>setPayStu('')}>+ Record Payment</Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {l:'Annual Due',      v:fmtL(totalDue),  c:'#C8202E'},
          {l:'Collected',       v:fmtL(totalPaid), c:'#166534'},
          {l:'Outstanding',     v:fmtL(outstanding),c:'#DC2626'},
          {l:'Showing',         v:`${students.length} students`,c:'#1A5FB4'},
        ].map(k=>(
          <div key={k.l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]"
            style={{borderLeft:`3px solid ${k.c}`}}>
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.l}</div>
            <div className="text-[20px] font-extrabold font-mono" style={{color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex items-center justify-between">
          <div className="text-[13.5px] font-bold text-[#111]">Student Fee Register</div>
          <Badge variant="green">{students.length} students</Badge>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead><tr>{['Student','Class','Annual Due','Paid','Balance','Progress','Status',''].map(h=>
            <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
          )}</tr></thead>
          <tbody>
            {!students.length
              ? <tr><td colSpan={8} className="text-center py-10 text-[#AAA]">No students match</td></tr>
              : students.map(s=>{
                  const due  = getStudentDue(s);
                  const paid = paidTowardDue(allPayments, s.id);
                  const bal  = due-paid;
                  const pct  = due>0?Math.round(paid/due*100):0;
                  const status = bal<=0?'Paid':paid>0?'Partial':'Pending';
                  return (
                    <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-3.5 py-2.5 font-semibold text-[#111]">{s.name}</td>
                      <td className="px-3.5 py-2.5 text-[#555]">{s.cls} {s.section}</td>
                      <td className="px-3.5 py-2.5 font-mono text-[12px] text-[#555]">{fmt(due)}</td>
                      <td className="px-3.5 py-2.5 font-mono text-[12px] font-bold text-[#166534]">{fmt(paid)}</td>
                      <td className="px-3.5 py-2.5 font-mono text-[12px] font-bold" style={{color:bal>0?'#DC2626':'#166534'}}>{fmt(Math.max(0,bal))}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 bg-[#E4E4E4] rounded-full w-16 overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${pct}%`,background:pct>=100?'#166534':pct>50?'#B45309':'#DC2626'}}/>
                          </div>
                          <span className="text-[11px] text-[#AAA]">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5"><Badge variant={status==='Paid'?'green':status==='Partial'?'amber':'red'}>{status}</Badge></td>
                      <td className="px-3.5 py-2.5">
                        <button onClick={()=>setPayStu(s.id)}
                          className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">Pay →</button>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {fsOpen && <FeeStructureModal onClose={()=>setFsOpen(false)} onSaved={()=>setTick(t=>t+1)}/>}
      {payStu!==null && <PaymentModal onClose={()=>setPayStu(null)} onSave={recordPayment} prefillStudent={payStu}/>}
    </div>
  );
}

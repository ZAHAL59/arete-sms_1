import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function Register({ hr, markStaffAtt }) {
  const db = useStore(s => s.db);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year]  = useState(now.getFullYear());

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const days = Array.from({length:daysInMonth},(_,i)=>i+1);
  const monthKey = `${year}-${String(month+1).padStart(2,'0')}`;

  function getStatus(staffId, day) {
    const k = staffId + '-' + monthKey;
    return (hr.staffAtt[k]||{})[day] || '';
  }

  function toggle(staffId, day) {
    const cur = getStatus(staffId, day);
    const next = cur==='P'?'A':cur==='A'?'L':'P';
    markStaffAtt(staffId, monthKey, day, next);
  }

  function calcStats(staffId) {
    const k = staffId + '-' + monthKey;
    const log = hr.staffAtt[k] || {};
    const p = Object.values(log).filter(v=>v==='P').length;
    const a = Object.values(log).filter(v=>v==='A').length;
    const l = Object.values(log).filter(v=>v==='L').length;
    const total = p+a+l;
    return { p,a,l, pct: total ? Math.round(p/total*100) : 100 };
  }

  return (
    <div className="p-6">
      <PageHeader title="Staff Attendance" subtitle="Click a cell to mark P / A / L"
        actions={
          <div className="flex gap-2 items-center">
            <button onClick={()=>setMonth(m=>Math.max(0,m-1))} className="px-2 py-1 border border-[#E4E4E4] rounded-[6px] cursor-pointer hover:bg-[#F8F8F8]">‹</button>
            <span className="font-semibold text-[13px] text-[#111] w-24 text-center">{MONTHS[month]} {year}</span>
            <button onClick={()=>setMonth(m=>Math.min(11,m+1))} className="px-2 py-1 border border-[#E4E4E4] rounded-[6px] cursor-pointer hover:bg-[#F8F8F8]">›</button>
          </div>
        }
      />

      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)] overflow-x-auto">
        <table className="border-collapse text-[12px]" style={{minWidth: 80+db.staff.length*60}}>
          <thead>
            <tr>
              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-r border-[#E4E4E4] bg-[#F8F8F8] sticky left-0 z-10 min-w-[140px]">Staff</th>
              {days.map(d=>{
                const dow = new Date(year,month,d).getDay();
                const isWeekend = dow===0||dow===6;
                return (
                  <th key={d} className={`px-2 py-2.5 text-center text-[10px] font-bold border-b border-r border-[#E4E4E4] ${isWeekend?'bg-[#F8F8F8] text-[#CCC]':'bg-[#F8F8F8] text-[#AAA] uppercase tracking-wider'}`}
                    style={{minWidth:28}}>
                    {d}
                  </th>
                );
              })}
              <th className="px-3 py-2.5 text-center text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">%</th>
            </tr>
          </thead>
          <tbody>
            {db.staff.map(s=>{
              const stats = calcStats(s.id);
              return (
                <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0">
                  <td className="px-3 py-2 border-r border-[#E4E4E4] sticky left-0 bg-white z-10">
                    <div className="font-semibold text-[#111] whitespace-nowrap">{s.name}</div>
                    <div className="text-[10.5px] text-[#AAA]">{s.subj}</div>
                  </td>
                  {days.map(d=>{
                    const dow = new Date(year,month,d).getDay();
                    const isWeekend = dow===0||dow===6;
                    const status = getStatus(s.id, d);
                    return (
                      <td key={d} onClick={()=>!isWeekend&&toggle(s.id,d)}
                        className={`text-center border-r border-[#E4E4E4] text-[10.5px] font-bold transition-colors ${isWeekend?'bg-[#F8F8F8]':'cursor-pointer hover:bg-[#FEF4F4]'}`}
                        style={{width:28,height:32,
                          background:isWeekend?'#F8F8F8':status==='P'?'#F0FDF4':status==='A'?'#FEF2F2':status==='L'?'#FFFBEB':'',
                          color:status==='P'?'#166534':status==='A'?'#DC2626':status==='L'?'#B45309':'#CCC'}}>
                        {isWeekend?'—':status||'·'}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <span className="font-bold text-[13px]" style={{color:stats.pct>=90?'#166534':stats.pct>=75?'#B45309':'#DC2626'}}>
                      {stats.pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-3 text-[11.5px] text-[#555]">
        {[['#166534','#F0FDF4','P — Present'],['#DC2626','#FEF2F2','A — Absent'],['#B45309','#FFFBEB','L — Late']].map(([col,bg,label])=>(
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-[4px] flex items-center justify-center text-[10px] font-bold" style={{background:bg,color:col}}>
              {label[0]}
            </span>
            {label}
          </div>
        ))}
        <span className="text-[#AAA]">Click cell to cycle P → A → L → clear</span>
      </div>
    </div>
  );
}

function Analytics({ hr }) {
  const db = useStore(s => s.db);
  const now = new Date(); const [month, setMonth] = useState(now.getMonth()); const year = now.getFullYear();
  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  const stats = db.staff.map(s => { const log = hr.staffAtt[s.id + '-' + key] || {}; const v = Object.values(log);
    const p = v.filter(x => x === 'P').length, l = v.filter(x => x === 'L').length, a = v.filter(x => x === 'A').length, total = p + l + a;
    return { name: s.name, subj: s.subj, p, l, a, total, pct: total ? Math.round((p + l * 0.5) / total * 100) : null }; }).filter(x => x.total > 0).sort((a, b) => b.pct - a.pct);
  return (
    <div className="p-6">
      <PageHeader title="Attendance Analytics" subtitle="Rate = (present + ½ × late) ÷ days marked"
        actions={<div className="flex gap-2 items-center"><button onClick={() => setMonth(m => Math.max(0, m - 1))} className="px-2 py-1 border border-[#E4E4E4] rounded-[6px] cursor-pointer">‹</button><span className="font-semibold text-[13px] w-24 text-center">{MONTHS[month]} {year}</span><button onClick={() => setMonth(m => Math.min(11, m + 1))} className="px-2 py-1 border border-[#E4E4E4] rounded-[6px] cursor-pointer">›</button></div>} />
      {!stats.length ? <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">No attendance marked for {MONTHS[month]} yet — mark it on the Register tab.</div> : <>
        <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 mb-4 space-y-3">{stats.map(s => { const c = s.pct >= 90 ? '#166534' : s.pct >= 70 ? '#B45309' : '#DC2626'; return (
          <div key={s.name}><div className="flex justify-between text-[12.5px] mb-1"><span className="font-semibold">{s.name}</span><span className="font-bold" style={{ color: c }}>{s.pct}%</span></div><div className="h-2 bg-[#E4E4E4] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: c }} /></div></div>); })}</div>
        <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden"><table className="w-full border-collapse text-[13px]"><thead><tr>{['Staff', 'Subject', 'Days marked', 'Present', 'Late', 'Absent', 'Rate'].map(h => <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>)}</tr></thead>
          <tbody>{stats.map(s => <tr key={s.name} className="border-b border-[#E4E4E4] last:border-b-0"><td className="px-4 py-2.5 font-semibold">{s.name}</td><td className="px-4 py-2.5 text-[#555]">{s.subj}</td><td className="px-4 py-2.5">{s.total}</td><td className="px-4 py-2.5 text-[#166534] font-semibold">{s.p}</td><td className="px-4 py-2.5 text-[#B45309] font-semibold">{s.l}</td><td className="px-4 py-2.5 text-[#DC2626] font-semibold">{s.a}</td><td className="px-4 py-2.5 font-bold">{s.pct}%</td></tr>)}</tbody></table></div></>}
    </div>
  );
}

export default function StaffAttendance(props) {
  const [tab, setTab] = useState('register');
  return (
    <div>
      <div className="px-6 pt-5 flex gap-1 border-b border-[#E4E4E4] mx-6">{[['register', '📅 Register'], ['analytics', '📊 Analytics']].map(([id, l]) => <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-none ${tab === id ? 'border-[#C8202E] text-[#C8202E]' : 'border-transparent text-[#777]'}`}>{l}</button>)}</div>
      {tab === 'register' ? <Register {...props} /> : <Analytics hr={props.hr} />}
    </div>
  );
}

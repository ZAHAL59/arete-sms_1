import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Collapsible from '../../components/ui/Collapsible';
import AttDetailModal from './modals/AttDetailModal';
import { TEACHER } from './constants';

export default function AttendanceHistory() {
  const db      = useStore(s => s.db);
  const attLog  = useStore(s => s.attLog);
  const [dateFilter, setDateFilter] = useState('');
  const [clsFilter,  setClsFilter]  = useState('');
  const [detailKey,  setDetailKey]  = useState(null);

  const keys = Object.keys(attLog).filter(k => {
    const datePart = k.slice(-10);
    const clsRaw   = k.slice(0,-11);
    const clsLabel = clsRaw.replace(/Grade(\d)/,'Grade $1').replace(/([0-9])([A-Z])$/,'$1 $2').trim();
    return (!clsFilter || clsLabel === clsFilter) && (!dateFilter || datePart === dateFilter);
  }).sort().reverse();

  // At-risk calculation
  const stuAtt = {};
  Object.values(attLog).forEach(log => {
    Object.entries(log).forEach(([sid,v]) => {
      if(!stuAtt[sid]) stuAtt[sid]={p:0,total:0};
      stuAtt[sid].total++;
      if(v==='P') stuAtt[sid].p++;
    });
  });
  const atRisk = db.students.filter(s => {
    const r = stuAtt[s.id];
    return r && r.total>=2 && r.p/r.total < 0.75;
  }).map(s => {
    const r = stuAtt[s.id];
    return { ...s, pct:Math.round(r.p/r.total*100), p:r.p, total:r.total };
  }).sort((a,b) => a.pct-b.pct);

  return (
    <div className="p-6">
      <PageHeader title="Attendance History"
        subtitle="Select a date to filter · risk students shown below"
        actions={
          <div className="flex gap-2">
            <select value={clsFilter} onChange={e=>setClsFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
              <option value="">All Classes</option>
              {TEACHER.classes.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]"/>
          </div>
        }
      />

      {/* At-risk */}
      {atRisk.length > 0 && (
        <Collapsible defaultOpen className="mb-4 !border-l-[3px] !border-l-[#DC2626]"
          header={
            <div className="flex items-center gap-2">
              <span className="text-[16px]">⚠️</span>
              <div>
                <div className="text-[13.5px] font-bold text-[#DC2626]">Attendance Risk</div>
                <div className="text-[11.5px] text-[#AAA]">{atRisk.length} student{atRisk.length>1?'s':''} below 75%</div>
              </div>
            </div>
          }
        >
          <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
            <thead><tr>{['Student','Class','Present','Days','Att %','Status'].map(h =>
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
            )}</tr></thead>
            <tbody>
              {atRisk.map(s => (
                <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#FFF5F5]">
                  <td className="px-4 py-2.5 font-semibold text-[#111]">{s.name}</td>
                  <td className="px-4 py-2.5 text-[#555]">{s.cls} {s.section}</td>
                  <td className="px-4 py-2.5 text-[#555]">{s.p}</td>
                  <td className="px-4 py-2.5 text-[#555]">{s.total}</td>
                  <td className="px-4 py-2.5 font-bold" style={{color:s.pct<50?'#DC2626':'#B45309'}}>{s.pct}%</td>
                  <td className="px-4 py-2.5"><Badge variant={s.pct<50?'red':'amber'}>{s.pct<50?'Critical':'At Risk'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
      )}

      {!keys.length
        ? <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-10 text-center text-[#AAA]">
            {dateFilter ? 'No attendance recorded for this date.' : 'No records yet — mark attendance from the Timetable view.'}
          </div>
        : (
          <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
            <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] text-[12px] text-[#AAA]">
              {dateFilter
                ? `Showing: ${new Date(dateFilter+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}`
                : 'All records — select a date to filter'}
            </div>
            <table className="w-full border-collapse text-[13px]">
              <thead><tr>{['Date','Class','Total','Present','Absent','Late','Att %',''].map(h =>
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
              )}</tr></thead>
              <tbody>
                {keys.map(k => {
                  const datePart = k.slice(-10);
                  const clsLabel = k.slice(0,-11).replace(/Grade(\d)/,'Grade $1').replace(/([0-9])([A-Z])$/,'$1 $2').trim();
                  const log = attLog[k]; let p=0,a=0,l=0;
                  Object.values(log).forEach(v => { if(v==='P')p++;else if(v==='A')a++;else if(v==='L')l++; });
                  const tot=p+a+l, pct=tot?Math.round(p/tot*100):0;
                  const col=pct>=90?'#166534':pct>=75?'#B45309':'#DC2626';
                  return (
                    <tr key={k} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-4 py-2.5 text-[#555]">{new Date(datePart+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</td>
                      <td className="px-4 py-2.5 font-semibold text-[#111]">{clsLabel}</td>
                      <td className="px-4 py-2.5 text-[#555]">{tot}</td>
                      <td className="px-4 py-2.5"><Badge variant="green">{p} P</Badge></td>
                      <td className="px-4 py-2.5"><Badge variant="red">{a} A</Badge></td>
                      <td className="px-4 py-2.5"><Badge variant="amber">{l} L</Badge></td>
                      <td className="px-4 py-2.5 font-bold" style={{color:col}}>{pct}%</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setDetailKey(k)}
                          className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">
                          View & Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }

      {detailKey && <AttDetailModal attKey={detailKey} onClose={() => setDetailKey(null)} />}
    </div>
  );
}

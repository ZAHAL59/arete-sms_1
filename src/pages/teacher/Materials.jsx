import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import { getMaterials, TYPE_VARIANT, TEACHER } from './constants';

export default function Materials() {
  const LMS_LIB = getMaterials();
  const [subj,  setSubj]  = useState('');
  const [grade, setGrade] = useState('');
  const [type,  setType]  = useState('');
  const [q,     setQ]     = useState('');

  const grades   = [...new Set(LMS_LIB.map(m=>m.grade))].sort();
  const types    = [...new Set(LMS_LIB.map(m=>m.type))].sort();
  const subjects = [...new Set(LMS_LIB.map(m=>m.subj))].sort();

  const filtered = LMS_LIB.filter(m =>
    (!subj  || m.subj===subj) && (!grade || m.grade===grade) &&
    (!type  || m.type===type) &&
    (!q || m.title.toLowerCase().includes(q.toLowerCase()) || m.topic.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="p-6">
      <PageHeader title="Study Materials" subtitle="Videos, simulations, AR/VR and resources"
        actions={
          <div className="flex gap-2 flex-wrap">
            {[
              [subjects,'All Subjects',subj,setSubj],
              [grades,'All Grades',grade,setGrade],
              [types,'All Types',type,setType],
            ].map(([opts,placeholder,val,setter],i) => (
              <select key={i} value={val} onChange={e=>setter(e.target.value)}
                className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
                <option value="">{placeholder}</option>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search topic..."
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] w-36"/>
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          ['Showing', filtered.length, `of ${LMS_LIB.length} total`,'#C8202E'],
          ['Your Resources', LMS_LIB.filter(m=>m.by===TEACHER.name).length, 'created by you','#1A5FB4'],
          ['AR / VR', LMS_LIB.filter(m=>m.type.includes('AR')||m.type.includes('VR')).length, 'immersive','#6D28D9'],
          ['Interactive', LMS_LIB.filter(m=>m.type==='Interactive Activity'||m.type==='Simulation').length, 'hands-on','#166534'],
        ].map(([l,v,n,col]) => (
          <div key={l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]">
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{l}</div>
            <div className="text-[22px] font-extrabold leading-none" style={{color:col}}>{v}</div>
            <div className="text-[11.5px] text-[#AAA] mt-1">{n}</div>
          </div>
        ))}
      </div>

      {!filtered.length
        ? <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">No materials match</div>
        : <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 flex items-start gap-4 hover:shadow-[0_4px_18px_rgba(0,0,0,.11)] hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-[8px] bg-[#F8F8F8] flex items-center justify-center text-[22px] flex-shrink-0">{m.thumb}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <div className="text-[13.5px] font-bold text-[#111] flex-1">{m.title}</div>
                  <Badge variant={TYPE_VARIANT[m.type]||'grey'}>{m.type}</Badge>
                </div>
                <div className="text-[11.5px] text-[#AAA] mb-1">{m.grade} · {m.topic} · {m.dur} · By: {m.by}</div>
                <div className="text-[12.5px] text-[#555] leading-relaxed">{m.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-[13px] text-amber-400">{'★'.repeat(Math.round(m.rating))}{'☆'.repeat(5-Math.round(m.rating))}</div>
                {m.url
                  ? <a href={m.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-[#C8202E] text-white text-[11.5px] font-semibold rounded-[6px] no-underline hover:bg-[#9A1822]">Open →</a>
                  : <button className="px-3 py-1.5 bg-white border border-[#E4E4E4] text-[#555] text-[11.5px] font-semibold rounded-[6px] cursor-pointer hover:bg-[#F8F8F8]">Preview</button>}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

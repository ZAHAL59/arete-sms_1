import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/Layout';
import { JOURNEY_STAGES, STAGE_VARIANT, ID_STAGE } from './constants';
import ApplicationDetailModal from './modals/ApplicationDetailModal';

const PIPELINE_STAGES = [...JOURNEY_STAGES.map(s=>s.label), 'Waitlisted'];

export default function Pipeline({ A, onNavigate, hideNew = false }) {
  const admissions = A.admissions;
  const [sel, setSel] = useState(null);
  const active   = admissions.filter(a => !['Enrolled'].includes(a.stage));
  const enrolled = admissions.filter(a => a.stage==='Enrolled').length;

  return (
    <div className="p-6">
      <PageHeader title="Admissions Pipeline" subtitle={`AY 2026–27 · ${admissions.length} total applications`}
        actions={!hideNew && <Button onClick={() => onNavigate('new')}>+ New Application</Button>}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {label:'Total', value:admissions.length, color:'#C8202E'},
          {label:'Active Pipeline', value:active.length, color:'#1A5FB4'},
          {label:'Enrolled', value:enrolled, color:'#166534'},
          {label:'Waitlisted', value:admissions.filter(a=>a.stage==='Waitlisted').length, color:'#DC2626'},
        ].map(k => (
          <div key={k.label} className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 shadow-[0_1px_4px_rgba(0,0,0,.07)]"
            style={{borderLeft:`3px solid ${k.color}`}}>
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.label}</div>
            <div className="text-[26px] font-extrabold" style={{color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Stage pipeline */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[...JOURNEY_STAGES, { id:'waitlisted', label:'Waitlisted', icon:'⏳' }].map(stage => {
          const matched = admissions.filter(a => a.stage === (ID_STAGE[stage.id] || stage.label));
          return (
            <div key={stage.id} onClick={() => onNavigate('list')}
              className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 shadow-[0_1px_4px_rgba(0,0,0,.07)] cursor-pointer hover:shadow-[0_4px_18px_rgba(0,0,0,.11)] hover:-translate-y-0.5 transition-all">
              <div className="text-[22px] mb-1.5">{stage.icon}</div>
              <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{ID_STAGE[stage.id] || stage.label}</div>
              <div className="text-[28px] font-extrabold text-[#111] leading-none mb-2">{matched.length}</div>
              {matched.slice(0,2).map(a => (
                <div key={a.id} className="text-[11px] text-[#555] truncate">· {a.name}</div>
              ))}
              {matched.length>2 && <div className="text-[11px] text-[#C8202E] font-semibold">+{matched.length-2} more</div>}
            </div>
          );
        })}
      </div>

      {/* Recent applications table */}
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex items-center justify-between">
          <div className="text-[13.5px] font-bold text-[#111]">Recent Applications</div>
          <button onClick={() => onNavigate('list')} className="text-[12px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">View all →</button>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>{['Applicant','Grade','Stage','Assigned','Docs','Applied'].map(h =>
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {admissions.slice(0,6).map(a => {
              const dc = Object.values(a.docs).filter(Boolean).length;
              const dt = Object.keys(a.docs).length;
              return (
                <tr key={a.id} onClick={() => setSel(a)}
                  className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8] cursor-pointer">
                  <td className="px-4 py-2.5 font-semibold text-[#111]">{a.name}</td>
                  <td className="px-4 py-2.5 text-[#555]">{a.grade}</td>
                  <td className="px-4 py-2.5"><Badge variant={STAGE_VARIANT[a.stage]||'grey'}>{a.stage}</Badge></td>
                  <td className="px-4 py-2.5 text-[#555]">{a.assigned}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 bg-[#E4E4E4] rounded-full w-14 overflow-hidden">
                        <div className="h-full bg-[#C8202E] rounded-full" style={{width:`${dc/dt*100}%`}}/>
                      </div>
                      <span className="text-[11px] text-[#AAA]">{dc}/{dt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[#AAA]">{a.applied}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sel && <ApplicationDetailModal app={sel} A={A} onClose={() => setSel(null)} />}
    </div>
  );
}

import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Collapsible from '../../components/ui/Collapsible';
import { COLORS } from '../teacher/constants';

export default function GrowthTracker({ hr }) {
  const db = useStore(s => s.db);

  return (
    <div className="p-6">
      <PageHeader title="Staff Growth Tracker" subtitle="Performance, training completion and development overview" />

      {db.staff.map((s, i) => {
        // Training attendance
        const sessionsDone = hr.training.filter(t => t.status==='Completed');
        const attended = sessionsDone.filter(t => t.attendance[s.id]==='present').length;
        const attPct = sessionsDone.length ? Math.round(attended/sessionsDone.length*100) : 100;

        // Staff att this month
        const now = new Date();
        const monthKey = s.id + '-' + now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
        const monthLog = hr.staffAtt[monthKey] || {};
        const p = Object.values(monthLog).filter(v=>v==='P').length;
        const a = Object.values(monthLog).filter(v=>v==='A').length;
        const total = p+a;
        const monthPct = total ? Math.round(p/total*100) : 100;

        const leaveCount = hr.leaveRequests.filter(l=>l.staffId===s.id).length;
        const init = s.name.split(' ').filter(w=>w.match(/[A-Z]/)).map(w=>w[0]).join('').slice(0,2)||'??';

        return (
          <Collapsible key={s.id} className="mb-2"
            header={
              <div className="flex items-center gap-3 flex-1">
                <div style={{background:COLORS[i%COLORS.length]}} className="w-9 h-9 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{init}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111]">{s.name}</div>
                  <div className="text-[11.5px] text-[#777]">{s.subj} · Joined {s.joined}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  <div className="text-center">
                    <div className="text-[16px] font-extrabold text-[#C8202E]">{attPct}%</div>
                    <div className="text-[9px] text-[#AAA] uppercase tracking-wider">Training</div>
                  </div>
                  <div className="w-px h-8 bg-[#E4E4E4]"/>
                  <div className="text-center">
                    <div className="text-[16px] font-extrabold text-[#1A5FB4]">{monthPct}%</div>
                    <div className="text-[9px] text-[#AAA] uppercase tracking-wider">Attendance</div>
                  </div>
                </div>
              </div>
            }
          >
            <div className="border-t border-[#E4E4E4] p-4">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  {label:'Sessions Attended', value:`${attended}/${sessionsDone.length}`, color:'#6D28D9'},
                  {label:'Training %',         value:`${attPct}%`, color:'#C8202E'},
                  {label:'Monthly Att.',        value:`${monthPct}%`, color:'#1A5FB4'},
                  {label:'Leave Requests',      value:leaveCount, color:'#B45309'},
                ].map(k=>(
                  <div key={k.label} className="bg-[#F8F8F8] p-2.5 rounded-[8px]">
                    <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{k.label}</div>
                    <div className="text-[18px] font-extrabold" style={{color:k.color}}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Training sessions breakdown */}
              <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-2">Training Sessions</div>
              <div className="space-y-1">
                {hr.training.filter(t=>t.status==='Completed').map(t=>{
                  const att = t.attendance[s.id];
                  return (
                    <div key={t.id} className="flex items-center gap-2 text-[12.5px]">
                      <span className={att==='present'?'text-[#166534]':'text-[#DC2626]'}>{att==='present'?'✓':'✗'}</span>
                      <span className="text-[#555] flex-1 truncate">{t.title}</span>
                      <span className="text-[#AAA] flex-shrink-0">{t.date}</span>
                    </div>
                  );
                })}
                {hr.training.filter(t=>t.status==='Completed').length===0&&(
                  <div className="text-[#AAA] text-[12.5px]">No completed sessions yet</div>
                )}
              </div>

              {/* Classes */}
              <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mt-3 mb-2">Classes Assigned</div>
              <div className="flex gap-1.5 flex-wrap">
                {(s.classes||[]).map(c=><Badge key={c} variant="grey">{c}</Badge>)}
                {!(s.classes||[]).length && <span className="text-[#AAA] text-[12px]">No classes assigned</span>}
              </div>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}

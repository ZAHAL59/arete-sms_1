import { useState } from 'react';
import useStore from '../../store/useStore';
import Collapsible from '../../components/ui/Collapsible';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { TEACHER, PERIODS, TT, getNotices, getMyTraining, TODAY, getCurrentPeriod } from './constants';
import { loadPrincipal } from '../principal/constants';

export default function Today({ onNavigate }) {
  const DEMO_ANN = getNotices();
  // classes the Principal has asked this teacher to cover today
  const coverDuty = (loadPrincipal().substitutions || []).filter(x => x.date === TODAY && x.sub === TEACHER.name).sort((a, b) => a.row - b.row);
  const db     = useStore(s => s.db);
  const attLog = useStore(s => s.attLog);
  const cur    = getCurrentPeriod();
  const dow    = new Date().getDay() - 1;
  const isWeekday = dow >= 0 && dow <= 4;
  const dateStr = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  // Today's classes for Ms. Latha
  const todayClasses = isWeekday
    ? TT[dow]?.filter(c => c && !c.brk && !c.free && !c.staff) || []
    : [];

  const marked = todayClasses.filter(p => {
    const key = p.cls?.replace(/\s+/g,'') + '-' + TODAY;
    return attLog[key] && Object.keys(attLog[key]).length > 0;
  }).length;

  const stuCount = db.students.filter(s =>
    TEACHER.classes.includes(`${s.cls} ${s.section}`.trim())
  ).length;

  const upcomingTraining = getMyTraining().filter(t => t.date >= TODAY);

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-[22px] font-extrabold text-[#111] tracking-tight">Good morning, Ms. Latha 👋</h1>
        <p className="text-[13px] text-[#AAA] mt-0.5">{dateStr}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {label:"Today's Classes", value:isWeekday?todayClasses.length:'—', note:'Mathematics', color:'#C8202E'},
          {label:'Students',        value:stuCount, note:'Across all classes', color:'#1A5FB4'},
          {label:'Pending',         value:isWeekday?Math.max(0,todayClasses.length-marked):'—', note:'Not yet marked', color:'#B45309'},
          {label:'New Alerts',      value:DEMO_ANN.length, note:'From Principal / HR', color:'#6D28D9'},
        ].map(k => (
          <div key={k.label} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]"
            style={{borderLeft:`3px solid ${k.color}`}}>
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.label}</div>
            <div className="text-[24px] font-extrabold leading-none" style={{color:k.color}}>{k.value}</div>
            <div className="text-[11.5px] text-[#AAA] mt-1">{k.note}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <Collapsible defaultOpen header={
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[13.5px] font-bold text-[#111]">📅 Today's Schedule</span>
          <Button size="sm" variant="outline" onClick={e=>{e.stopPropagation();onNavigate('timetable');}}>Full Timetable →</Button>
        </div>
      } className="mb-3">
        <div className="divide-y divide-[#E4E4E4]">
          {!isWeekday
            ? <div className="p-4 text-[13px] text-[#AAA]">It's the weekend — enjoy your break! 🎉</div>
            : !todayClasses.length
            ? <div className="p-4 text-[13px] text-[#AAA]">No classes scheduled today</div>
            : todayClasses.map((p, i) => {
                const pIdx = TT[dow]?.indexOf(p);
                const timeLabel = pIdx >= 0 ? PERIODS[pIdx] : '';
                const key = p.cls?.replace(/\s+/g,'') + '-' + TODAY;
                const isMarked = attLog[key] && Object.keys(attLog[key]).length > 0;
                const isNow = pIdx === cur.period && dow === cur.day;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 ${isNow?'bg-[#EFF6FF]':''}`}>
                    <span className="bg-[#FEF4F4] text-[#C8202E] text-[10px] font-bold px-2 py-1 rounded-[4px] whitespace-nowrap">{timeLabel}</span>
                    {isNow && <span className="text-[10px] font-bold text-[#1A5FB4]">● Now</span>}
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold">{p.cls}</div>
                      <div className="text-[11px] text-[#AAA]">Mathematics</div>
                    </div>
                    {isMarked
                      ? <Badge variant="green">✓ Marked</Badge>
                      : <Button size="sm" onClick={() => onNavigate('timetable')}>Mark Now →</Button>}
                  </div>
                );
              })
          }
        </div>
      </Collapsible>

      {coverDuty.length > 0 && (
        <Collapsible defaultOpen className="mb-3" header={<div className="flex items-center gap-2 flex-1"><span className="text-[13.5px] font-bold text-[#111]">↻ Cover duty today</span><Badge variant="amber">{coverDuty.length} period{coverDuty.length > 1 ? 's' : ''}</Badge></div>}>
          <div className="divide-y divide-[#E4E4E4]">{coverDuty.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3"><span className="bg-[#FFF1E0] text-[#B45309] text-[10px] font-bold px-2 py-1 rounded-[4px]">{c.time}</span>
              <div className="flex-1"><div className="text-[13px] font-semibold">{c.cls} — {c.subject}</div><div className="text-[11px] text-[#AAA]">Covering for {c.absent}</div></div>
              <Button size="sm" onClick={() => onNavigate('timetable')}>Mark attendance →</Button></div>))}</div>
        </Collapsible>
      )}

      {/* Latest Notice */}
      <Collapsible header={
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[13.5px] font-bold text-[#111]">🔔 Latest Notice</span>
          <Badge variant="red2">{DEMO_ANN.length}</Badge>
          <Button size="sm" variant="outline" className="ml-auto" onClick={e=>{e.stopPropagation();onNavigate('alerts');}}>All →</Button>
        </div>
      } className="mb-3">
        <div className="p-4">
          <div className="border-l-[3px] border-[#C8202E] bg-[#FEF4F4] rounded-r-[8px] p-3">
            <div className="text-[13.5px] font-bold text-[#111]">{DEMO_ANN[0].title}</div>
            <div className="text-[12.5px] text-[#555] mt-1 leading-relaxed">{DEMO_ANN[0].msg}</div>
            <div className="text-[11px] text-[#AAA] mt-2">{DEMO_ANN[0].sent} · To: {DEMO_ANN[0].to}</div>
          </div>
        </div>
      </Collapsible>

      {/* Upcoming Training */}
      {upcomingTraining.length > 0 && (
        <Collapsible header={
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[13.5px] font-bold text-[#111]">🎓 Upcoming Training</span>
            <Button size="sm" variant="outline" className="ml-auto" onClick={e=>{e.stopPropagation();onNavigate('training');}}>All →</Button>
          </div>
        }>
          <div className="p-4">
            <div className="text-[13px] font-semibold">{upcomingTraining[0].title}</div>
            <div className="text-[12px] text-[#AAA] mt-1">{upcomingTraining[0].date} · {upcomingTraining[0].duration} · {upcomingTraining[0].trainer || '—'}</div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {upcomingTraining[0].topics.map(t => <Badge key={t} variant="purple">{t}</Badge>)}
            </div>
          </div>
        </Collapsible>
      )}
    </div>
  );
}

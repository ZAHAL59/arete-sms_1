import { useState } from 'react';
import useStore from '../../store/useStore';
import AttendancePanel from './AttendancePanel';
import { DAYS, PERIODS, TT, getWeekDates, getCurrentPeriod, TODAY } from './constants';

export default function Timetable() {
  const attLog = useStore(s => s.attLog);
  const [attCls, setAttCls] = useState(null);
  const wkDates = getWeekDates();
  const cur = getCurrentPeriod();
  const wkLabel = wkDates[0].toLocaleDateString('en-IN',{day:'numeric',month:'short'})
    + ' – ' + wkDates[4].toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-[3px] h-[18px] bg-[#C8202E] rounded-full inline-block"/>
          <h1 className="text-[20px] font-extrabold text-[#111]">Timetable</h1>
        </div>
        <p className="text-[12.5px] text-[#777] ml-3">Your classes are highlighted — tap any class to mark attendance</p>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-[#E0E0E0] shadow-[0_4px_24px_rgba(0,0,0,.07)]">
        <div style={{display:'grid',gridTemplateColumns:'72px repeat(5,1fr)'}}>

          {/* Corner */}
          <div className="p-3 flex items-end text-[9px] font-bold text-white/60 uppercase tracking-wider border-b border-r border-white/10"
            style={{background:'linear-gradient(135deg,#C8202E,#9A1822)'}}>
            {wkLabel}
          </div>

          {/* Day headers */}
          {DAYS.map((_, di) => {
            const dt = wkDates[di];
            const isToday = di === cur.day, isPast = di < cur.day;
            return (
              <div key={di} className="p-3 text-center border-b border-r border-white/10"
                style={{background: isToday ? '#9A1822' : 'linear-gradient(135deg,#C8202E,#9A1822)', opacity: isPast ? 0.55 : 1}}>
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/65">
                  {dt.toLocaleDateString('en-IN',{weekday:'short'})}
                </div>
                <div className="text-[13px] font-extrabold text-white mt-0.5 flex items-center justify-center gap-1">
                  {dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block"/>}
                </div>
              </div>
            );
          })}

          {/* Period rows */}
          {PERIODS.map((per, pi) => {
            const isBreak = per==='Break'||per==='Lunch';
            return (
              <div key={pi} style={{display:'contents'}}>
                {/* Time label */}
                <div className="flex items-center justify-center p-2 text-center text-[9.5px] font-bold border-b border-r border-[#EBEBEB]"
                  style={{background:'#FEF4F4',color:'#C8202E'}}>
                  {per}
                </div>
                {/* Day cells */}
                {DAYS.map((_, di) => {
                  const cell = TT[di]?.[pi];
                  if (isBreak || cell?.brk) {
                    return <div key={di} className="border-b border-r border-[#EBEBEB]" style={{background:'#FEF9F9'}}/>;
                  }
                  if (!cell || cell.free) {
                    return (
                      <div key={di} className="flex items-center justify-center border-b border-r border-[#EBEBEB] min-h-[64px]"
                        style={{background:'#FFF5F5'}}>
                        <span className="text-[11px] font-semibold" style={{color:'#C8202E',opacity:.35}}>Free</span>
                      </div>
                    );
                  }
                  const isNow = di===cur.day && pi===cur.period;
                  const isToday = di===cur.day;
                  const isPast = di<cur.day;
                  const isStaff = cell.staff;
                  const attKey = cell.cls?.replace(/\s+/g,'') + '-' + TODAY;
                  const marked = attLog[attKey] && Object.keys(attLog[attKey]).length > 0;
                  return (
                    <div key={di}
                      onClick={() => !isStaff && isToday && setAttCls(cell.cls)}
                      className="min-h-[64px] p-3 border-b border-r border-[#EBEBEB] transition-colors"
                      style={{
                        background: isNow ? '#EFF6FF' : isStaff ? '#FFFBEB' : '#FFF5F5',
                        borderBottom: isNow ? '2px solid #1A5FB4' : undefined,
                        cursor: !isStaff && isToday ? 'pointer' : 'default',
                      }}
                      onMouseEnter={e => { if(!isStaff&&isToday) e.currentTarget.style.background='#FEE8E8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isNow?'#EFF6FF':isStaff?'#FFFBEB':'#FFF5F5'; }}
                    >
                      <div className="text-[12.5px] font-bold"
                        style={{color: isNow?'#1A5FB4' : isStaff?'#92400E' : '#111'}}>
                        {cell.cls}
                      </div>
                      {isToday && !isStaff && (
                        marked
                          ? <div className="text-[10px] font-bold text-[#166534] mt-1">✓ Marked</div>
                          : <div className="text-[10px] font-bold text-[#C8202E] mt-1 underline">Mark now</div>
                      )}
                      {isPast && !isStaff && <div className="text-[10px] font-bold text-[#166534] mt-1">✓ Done</div>}
                      {!isToday && !isPast && !isStaff && <div className="text-[10px] text-[#CCC] mt-1">Upcoming</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {attCls && (
        <AttendancePanel cls={attCls} date={TODAY} onClose={() => setAttCls(null)} onSaved={() => setAttCls(null)} />
      )}
    </div>
  );
}

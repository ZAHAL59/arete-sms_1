import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Field, inputCls } from '../../components/ui/Kit';
import { snapshot, staffAttOn, onLeaveOn } from './bridge';
import { periodsFor, allTeachers, teachingAt, colOf } from './cover';
import { prettyDate } from './constants';

// Assign a substitute teacher to each of an absent teacher's periods on one date.
export default function SubstituteModal({ absent, date: startDate, p, api, onClose }) {
  const staff = useStore(s => s.db.staff);
  const hr = useMemo(() => snapshot().hr, []);
  const [date, setDate] = useState(startDate); const [draft, setDraft] = useState({}); const [saved, setSaved] = useState(false);
  const periods = periodsFor(p.timetable, absent, date);
  const teachers = allTeachers(p.timetable, staff);
  const key = per => `${per.cls}|${per.row}`;
  const savedSub = per => (p.substitutions || []).find(x => x.date === date && x.absent === absent && x.cls === per.cls && x.row === per.row)?.sub || '';
  const val = per => draft[key(per)] ?? savedSub(per);

  // who can't cover on this date: absent / on leave
  const away = new Set([absent, ...staff.filter(s => staffAttOn(hr, s.id, date) === 'A' || onLeaveOn(hr, s.id, date)).map(s => s.name)]);
  const optionsFor = per => {
    const busy = teachingAt(p.timetable, per.row, date);
    // already covering another class in the same slot (saved for other teachers, or chosen in this draft)
    const taken = new Set([
      ...(p.substitutions || []).filter(x => x.date === date && x.row === per.row && x.absent !== absent).map(x => x.sub),
      ...periods.filter(o => o.row === per.row && o.cls !== per.cls).map(o => val(o)).filter(Boolean),
    ]);
    return teachers.filter(t => !away.has(t) && !busy.has(t) && !taken.has(t));
  };
  const changeDate = d => { setDate(d); setDraft({}); setSaved(false); };
  const covered = periods.filter(per => val(per)).length;
  function save() { api.saveCover(date, absent, periods.map(per => ({ ...per, sub: val(per) }))); setDraft({}); setSaved(true); }

  return (
    <Modal open onClose={onClose} size="lg" title={`Substitute cover — ${absent}`} subtitle="Choose a free teacher for each period. Only teachers who are not teaching, absent or on leave in that period are offered."
      footer={<><span className="mr-auto text-[12px] font-semibold" style={{ color: saved ? '#166534' : '#777' }}>{saved ? '✓ Saved' : `${covered} of ${periods.length} period(s) covered`}</span><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={save} disabled={!periods.length}>💾 Save cover</Button></>}>
      <div className="flex items-end gap-3 mb-4">
        <Field label="Date"><input type="date" value={date} onChange={e => changeDate(e.target.value)} className={inputCls} /></Field>
        <div className="text-[12.5px] text-[#555] pb-2">{colOf(date) < 0 ? 'Weekend — no classes.' : `${periods.length} period(s) taught by ${absent}`}</div>
      </div>
      {!periods.length ? <div className="text-center py-8 text-[#AAA] text-[13px]">{colOf(date) < 0 ? 'No classes on weekends.' : `${absent} has no scheduled periods on ${prettyDate(date)}, so no cover is needed.`}</div> :
        <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4]">{periods.map(per => { const opts = optionsFor(per), v = val(per); return (
          <div key={key(per)} className="flex items-center gap-3 px-3 py-2.5">
            <span className="font-mono text-[11.5px] bg-[#FEF4F4] text-[#C8202E] font-bold rounded px-2 py-1 w-14 text-center">{per.time}</span>
            <div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{per.cls}</div><div className="text-[11.5px] text-[#777]">{per.subject}</div></div>
            {!opts.length && !v && <Badge variant="red">No teacher free</Badge>}
            <select value={v} onChange={e => setDraft(d => ({ ...d, [key(per)]: e.target.value }))} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] min-w-[190px]">
              <option value="">— No substitute —</option>{v && !opts.includes(v) && <option value={v}>{v}</option>}{opts.map(t => <option key={t} value={t}>{t} (free)</option>)}
            </select></div>); })}</div>}
    </Modal>
  );
}

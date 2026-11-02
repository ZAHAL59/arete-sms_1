import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import useExpand from '../../components/ui/useExpand';
import ExpandControls from '../../components/ui/ExpandControls';
import { Field, inputCls } from '../../components/ui/Kit';
import { EVENT_TYPES, VENUES, TODAY } from './constants';

export default function Events({ c, addEvent, allocateSeats }) {
  const [open, setOpen] = useState(false);
  const [seatEv, setSeatEv] = useState(null);
  const [count, setCount] = useState('');
  const [to, setTo] = useState('');
  const [f, setF] = useState({ title:'', type:EVENT_TYPES[0], venue:VENUES[0], date:'', time:'10:00', seats:'' });

  const upcoming = c.events.filter(e => e.date >= TODAY);
  const past = c.events.filter(e => e.date < TODAY).reverse();

  function save() {
    if (!f.title.trim() || !f.date) return;
    addEvent({ ...f, title:f.title.trim(), seats:+f.seats || 50 });
    setOpen(false); setF({ title:'', type:EVENT_TYPES[0], venue:VENUES[0], date:'', time:'10:00', seats:'' });
  }
  function openSeats(e) { setSeatEv(e); setCount(e.alloc ? String(e.alloc) : ''); setTo(e.allocTo || ''); }
  function saveSeats() { allocateSeats(seatEv.id, +count || 0, to); setSeatEv(null); }

  // Group upcoming events by month; past events sit in one collapsed group
  const monthOf = d => d.slice(0, 7);
  const monthLabel = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const months = [...new Set(upcoming.map(e => monthOf(e.date)))].sort();
  const ex = useExpand(months.slice(0, 1).map(m => 'm:' + m));       // nearest month open; every event row collapsed
  const allIds = [...months.map(m => 'm:' + m), 'past', ...c.events.map(e => e.id)];

  const row = (e, isPast) => {
    const d = new Date(e.date + 'T00:00:00');
    const pct = e.seats ? Math.round(e.alloc / e.seats * 100) : 0;
    return (
      <Collapsible key={e.id} className={`mb-1.5 ${isPast ? 'opacity-75' : ''}`} open={ex.isOpen(e.id)} onToggle={() => ex.toggle(e.id)}
        header={
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 flex-shrink-0 text-center rounded-[7px] py-1" style={{ background: isPast ? '#F2F2F2' : '#FEF4F4' }}>
              <div className="text-[16px] font-extrabold leading-none" style={{ color: isPast ? '#777' : '#C8202E' }}>{d.getDate()}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#AAA] mt-0.5">{d.toLocaleString('en-IN', { month: 'short' })}</div></div>
            <div className="flex-1 min-w-0"><div className="text-[13.5px] font-bold text-[#111] truncate">{e.title}</div><div className="text-[11.5px] text-[#777]">{e.time} · {e.venue}</div></div>
            <Badge variant="grey">{e.type}</Badge>
            <Badge variant={e.alloc === 0 ? 'amber' : 'green'}>{e.alloc === 0 ? 'Seats not allocated' : `${e.alloc}/${e.seats} seats`}</Badge>
            {!isPast && <Button size="sm" variant={e.alloc === 0 ? 'primary' : 'outline'} onClick={ev => { ev.stopPropagation(); openSeats(e); }}>{e.alloc === 0 ? 'Allocate Seats' : 'Edit Seats'}</Button>}
          </div>}>
        <div className="px-4 py-3 text-[12.5px] text-[#555] space-y-2">
          <div className="flex items-center gap-3"><span>{e.alloc === 0 ? <em className="text-[#AAA]">Seats not yet allocated</em> : <>Seats: <strong>{e.alloc}/{e.seats}</strong>{e.allocTo && <span className="text-[#AAA]"> · {e.allocTo}</span>}</>}</span>
            {e.alloc > 0 && <div className="w-40 h-1.5 bg-[#E4E4E4] rounded-full overflow-hidden"><div className="h-full bg-[#C8202E] rounded-full" style={{ width: `${pct}%` }} /></div>}</div>
          <div className="text-[#777]">Venue: <b className="text-[#333]">{e.venue}</b> · Capacity {e.seats}</div>
          {e.resources?.length > 0 ? <div className="text-[#777]">Resources: {e.resources.join(', ')}</div> : <div className="text-[#BBB]">No resources listed</div>}
        </div>
      </Collapsible>);
  };
  const group = (id, title, count, rows, badge = 'blue') => (
    <Collapsible key={id} className="mb-3" open={ex.isOpen(id)} onToggle={() => ex.toggle(id)}
      header={<div className="flex items-center gap-2"><span className="text-[13.5px] font-bold text-[#111]">{title}</span><Badge variant={badge}>{count} event{count === 1 ? '' : 's'}</Badge></div>}>
      <div className="p-3 border-t border-[#E4E4E4]">{rows}</div>
    </Collapsible>);

  return (
    <div className="p-6">
      <PageHeader title="Meetings & Events" subtitle={`${upcoming.length} upcoming · ${past.length} past`} actions={<><ExpandControls ex={ex} ids={allIds} /><Button onClick={() => setOpen(true)}>+ Schedule Event</Button></>} />
      {!upcoming.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-8 text-center text-[#AAA] mb-3">Nothing scheduled</div>}
      {months.map(m => group('m:' + m, monthLabel(m), upcoming.filter(e => monthOf(e.date) === m).length, upcoming.filter(e => monthOf(e.date) === m).map(e => row(e, false))))}
      {past.length > 0 && group('past', 'Past events', past.length, past.map(e => row(e, true)), 'grey')}

      <Modal open={open} onClose={() => setOpen(false)} title="Schedule Event"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Schedule</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Event Title *" className="col-span-2"><input value={f.title} onChange={e => setF(x => ({ ...x, title:e.target.value }))} placeholder="e.g. Parent-Teacher Meeting Grade 8" className={inputCls} /></Field>
          <Field label="Type"><select value={f.type} onChange={e => setF(x => ({ ...x, type:e.target.value }))} className={inputCls}>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Venue"><select value={f.venue} onChange={e => setF(x => ({ ...x, venue:e.target.value }))} className={inputCls}>{VENUES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Date *"><input type="date" value={f.date} onChange={e => setF(x => ({ ...x, date:e.target.value }))} className={inputCls} /></Field>
          <Field label="Time"><input type="time" value={f.time} onChange={e => setF(x => ({ ...x, time:e.target.value }))} className={inputCls} /></Field>
          <Field label="Total Seats" className="col-span-2"><input type="number" min={1} value={f.seats} onChange={e => setF(x => ({ ...x, seats:e.target.value }))} placeholder="e.g. 120" className={inputCls} /></Field>
        </div>
      </Modal>

      <Modal open={!!seatEv} onClose={() => setSeatEv(null)} title="Allocate Seats" subtitle={seatEv ? `${seatEv.title} · capacity ${seatEv.seats}` : ''}
        footer={<><Button variant="outline" onClick={() => setSeatEv(null)}>Cancel</Button><Button onClick={saveSeats}>Confirm</Button></>}>
        <div className="space-y-3">
          <Field label="Seats to Allocate"><input type="number" min={0} max={seatEv?.seats} value={count} onChange={e => setCount(e.target.value)} placeholder="Number of confirmed attendees" className={inputCls} /></Field>
          <Field label="Allocated To"><input value={to} onChange={e => setTo(e.target.value)} placeholder="e.g. Grade 10 parents, Staff members..." className={inputCls} /></Field>
          {seatEv && +count > seatEv.seats && <div className="text-[12px] text-[#B45309] bg-[#FFFBEB] rounded-[6px] p-2.5">Over capacity — will be capped at {seatEv.seats}.</div>}
        </div>
      </Modal>
    </div>
  );
}

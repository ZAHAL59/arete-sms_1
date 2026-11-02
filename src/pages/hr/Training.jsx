import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls } from '../../components/ui/Kit';
import useStore from '../../store/useStore';
import { TODAY } from './constants';

const DURATIONS = ['1 hour', '2 hours', 'Half day (3 hrs)', 'Full day', 'Multi-day'];
const PLATFORMS = ['Zoom', 'Google Meet', 'Microsoft Teams', 'Other'];
const blank = () => ({ title: '', date: '', time: '10:00', duration: DURATIONS[3], mode: 'In-person', venue: '', platform: PLATFORMS[0], link: '', meetingId: '', passcode: '', trainer: '', topics: '', resources: '' });

export const inviteText = t => `You are invited: ${t.title} — ${t.date}${t.time ? ' ' + t.time : ''} (${t.duration}). ` +
  (t.mode === 'In-person' ? `Venue: ${t.venue || 'TBC'}.` : `Join via ${t.platform}: ${t.link}${t.meetingId ? ' · ID ' + t.meetingId : ''}${t.passcode ? ' · Passcode ' + t.passcode : ''}.`) + (t.trainer ? ` Trainer: ${t.trainer}.` : '');

export default function Training({ hr, addTraining, markTrainingAtt }) {
  const db = useStore(s => s.db);
  const [attOpen, setAttOpen] = useState(null); const [newOpen, setNewOpen] = useState(false); const [step, setStep] = useState(1);
  const [f, setF] = useState(blank()); const [invited, setInvited] = useState([]); const [err, setErr] = useState(''); const [copied, setCopied] = useState('');
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const online = f.mode !== 'In-person', inPerson = f.mode !== 'Online (Zoom / Meet)' && f.mode !== 'Online';
  const invitees = t => t.invited || (Object.keys(t.attendance || {}).length ? Object.keys(t.attendance) : db.staff.map(s => s.id));

  function next() { if (!f.title.trim() || !f.date) return setErr('Add a title and date.'); if (f.mode !== 'In-person' && !f.link.trim()) return setErr('Add the meeting link for online / hybrid sessions.'); setErr(''); setStep(2); }
  function save() { if (!invited.length) return setErr('Invite at least one staff member.'); addTraining({ ...f, title: f.title.trim(), topics: f.topics.split('\n').map(x => x.trim()).filter(Boolean), invited }); close(); }
  const close = () => { setNewOpen(false); setStep(1); setF(blank()); setInvited([]); setErr(''); };

  return (
    <div className="p-6">
      <PageHeader title="Training & Development" subtitle={`${hr.training.length} sessions total`} actions={<Button onClick={() => setNewOpen(true)}>+ Schedule Session</Button>} />
      <div className="space-y-2">{hr.training.slice().sort((a, b) => b.date.localeCompare(a.date)).map(t => {
        const isPast = t.date < TODAY; const inv = invitees(t); const att = inv.filter(id => t.attendance[id] === 'present').length;
        return (
          <Collapsible key={t.id} header={
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-[16px] flex-shrink-0 ${isPast ? 'bg-[#F0FDF4]' : 'bg-[#FEF4F4]'}`}>{isPast ? '✅' : '📅'}</div>
              <div className="flex-1 min-w-0"><div className="text-[13.5px] font-bold text-[#111]">{t.title}</div><div className="text-[11.5px] text-[#777] mt-0.5">{t.date}{t.time ? ' · ' + t.time : ''} · {t.duration} · {t.trainer || '—'} · {t.mode && t.mode !== 'In-person' ? t.platform || t.mode : t.venue || 'In-person'}</div></div>
              <div className="flex gap-2 items-center flex-shrink-0">{isPast && <span className="text-[11.5px] text-[#555]">{att}/{inv.length} attended</span>}<Badge variant="grey">{inv.length} invited</Badge><Badge variant={isPast ? 'green' : 'blue'}>{isPast ? 'Completed' : 'Upcoming'}</Badge>
                <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setAttOpen(t.id); }}>{isPast ? 'View Attendance' : 'Mark Attendance'}</Button></div>
            </div>}>
            <div className="px-4 py-3 border-t border-[#E4E4E4] space-y-3">
              {(t.topics || []).length > 0 && <div><div className="text-[10.5px] font-bold text-[#AAA] uppercase tracking-wider mb-2">Topics</div><div className="flex gap-2 flex-wrap">{t.topics.map(tp => <Badge key={tp} variant="purple">{tp}</Badge>)}</div></div>}
              {t.resources && <div className="text-[12.5px] text-[#555]"><b>Resources:</b> {t.resources}</div>}
              {!isPast && <div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(inviteText(t)); setCopied(t.id); }}>📋 Copy invite message</Button><span className="text-[11.5px] text-[#AAA]">{copied === t.id ? 'Copied — paste into WhatsApp / email (automatic sending is not connected).' : ''}</span></div>}
            </div>
          </Collapsible>);
      })}</div>

      {attOpen && (() => { const t = hr.training.find(x => x.id === attOpen); if (!t) return null; const inv = db.staff.filter(s => invitees(t).includes(s.id));
        return <Modal open onClose={() => setAttOpen(null)} size="lg" title={t.date < TODAY ? 'Training Attendance' : 'Mark Attendance'} subtitle={`${t.title} · ${t.date}`} footer={<Button variant="outline" onClick={() => setAttOpen(null)}>Close</Button>}>
          <div className="divide-y divide-[#E4E4E4] border border-[#E4E4E4] rounded-[8px] overflow-hidden">{inv.map(s => { const st = t.attendance[s.id] || ''; return (
            <div key={s.id} className={`flex items-center gap-3 px-4 py-2.5 ${st === 'present' ? 'bg-[#F6FEF9]' : st === 'absent' ? 'bg-[#FFF5F5]' : 'bg-white'}`}><div className="flex-1"><div className="font-semibold text-[13px] text-[#111]">{s.name}</div><div className="text-[11px] text-[#AAA]">{s.subj}</div></div>
              <div className="flex gap-1">{[['present', '#166534', '#F0FDF4', '#BBF7D0', 'P'], ['absent', '#DC2626', '#FEF2F2', '#FECACA', 'A']].map(([v, col, bg, bdr, l]) => <button key={v} onClick={() => markTrainingAtt(t.id, s.id, v)} className="w-8 h-7 rounded-[5px] text-[11px] font-bold border-[1.5px] cursor-pointer" style={{ background: st === v ? col : bg, color: st === v ? '#fff' : col, borderColor: st === v ? col : bdr }}>{l}</button>)}</div></div>); })}</div></Modal>; })()}

      {newOpen && <Modal open onClose={close} size="lg" title="Schedule Training Session" subtitle={step === 1 ? 'Step 1 of 2 · Session details' : 'Step 2 of 2 · Choose who to invite'}
        footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{err}</span><Button variant="outline" onClick={step === 1 ? close : () => { setStep(1); setErr(''); }}>{step === 1 ? 'Cancel' : '← Back'}</Button>{step === 1 ? <Button onClick={next}>Next: invite staff →</Button> : <Button onClick={save}>Schedule & invite {invited.length}</Button>}</>}>
        {step === 1 ? <div className="grid grid-cols-2 gap-3">
          <Field label="Session title *" className="col-span-2"><input value={f.title} onChange={e => set('title', e.target.value)} className={inputCls} /></Field>
          <Field label="Date *"><input type="date" value={f.date} onChange={e => set('date', e.target.value)} className={inputCls} /></Field>
          <Field label="Start time"><input type="time" value={f.time} onChange={e => set('time', e.target.value)} className={inputCls} /></Field>
          <Field label="Duration"><select value={f.duration} onChange={e => set('duration', e.target.value)} className={inputCls}>{DURATIONS.map(d => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Mode"><select value={f.mode} onChange={e => set('mode', e.target.value)} className={inputCls}>{['In-person', 'Online', 'Hybrid'].map(d => <option key={d}>{d}</option>)}</select></Field>
          {f.mode !== 'Online' && <Field label="Venue"><input value={f.venue} onChange={e => set('venue', e.target.value)} className={inputCls} /></Field>}
          {online && <><Field label="Meeting platform"><select value={f.platform} onChange={e => set('platform', e.target.value)} className={inputCls}>{PLATFORMS.map(d => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Meeting link *" className="col-span-2"><input value={f.link} onChange={e => set('link', e.target.value)} placeholder="https://…" className={inputCls} /></Field>
            <Field label="Meeting ID"><input value={f.meetingId} onChange={e => set('meetingId', e.target.value)} className={inputCls} /></Field><Field label="Passcode"><input value={f.passcode} onChange={e => set('passcode', e.target.value)} className={inputCls} /></Field></>}
          <Field label="Conductor / trainer" className="col-span-2"><input value={f.trainer} onChange={e => set('trainer', e.target.value)} className={inputCls} /></Field>
          <Field label="Topics (one per line)" className="col-span-2"><textarea rows={3} value={f.topics} onChange={e => set('topics', e.target.value)} className={inputCls + ' resize-y'} /></Field>
          <Field label="Pre-reading / resources (optional)" className="col-span-2"><input value={f.resources} onChange={e => set('resources', e.target.value)} className={inputCls} /></Field>
        </div> : <div>
          <div className="flex gap-2 mb-3"><Button size="sm" variant="outline" onClick={() => setInvited(db.staff.map(s => s.id))}>Select all</Button><Button size="sm" variant="outline" onClick={() => setInvited([])}>Clear</Button><span className="ml-auto text-[12.5px] font-bold">{invited.length} of {db.staff.length} selected</span></div>
          <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4]">{db.staff.map(s => <label key={s.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#F8F8F8]"><input type="checkbox" checked={invited.includes(s.id)} onChange={() => setInvited(l => l.includes(s.id) ? l.filter(x => x !== s.id) : [...l, s.id])} className="accent-[#C8202E]" /><span className="flex-1 text-[13px] font-semibold">{s.name}</span><span className="text-[11.5px] text-[#AAA]">{s.subj}</span></label>)}</div>
          <p className="text-[11.5px] text-[#AAA] mt-2">Invites are not sent automatically — after scheduling, use "Copy invite message" to share it.</p></div>}
      </Modal>}
    </div>
  );
}

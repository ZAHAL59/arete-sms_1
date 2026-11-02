import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Collapsible from '../../../components/ui/Collapsible';
import { Field, inputCls } from '../../../components/ui/Kit';
import useStore from '../../../store/useStore';
import { getFeeStructure, termOf, PAY_MODES, fmt } from '../../finance/constants';
import { JOURNEY_STAGES, STAGE_ID, DOC_KEYS, GRADES, STAFF_NAMES, CATEGORIES, LEARNING_STYLES, DIETS, SOURCES, SECTION_CAPACITY, FEE_TYPES, STAGE_VARIANT } from '../constants';

const TODAY = new Date().toISOString().slice(0, 10);

function Section({ n, icon, title, state, defaultOpen, children }) {
  const badge = state === 'done' ? <Badge variant="green">✓ Done</Badge> : state === 'current' ? <Badge variant="blue">In progress</Badge> : <Badge variant="grey">Pending</Badge>;
  return (
    <Collapsible defaultOpen={defaultOpen ?? state === 'current'} className="mb-2"
      header={<div className="flex items-center gap-3 flex-1"><div className="w-7 h-7 rounded-full text-white text-[12px] font-extrabold flex items-center justify-center flex-shrink-0" style={{ background: state === 'done' ? '#166534' : state === 'current' ? '#C8202E' : '#BBB' }}>{state === 'done' ? '✓' : n}</div><span className="text-[13.5px] font-bold text-[#111] flex-1">{icon} {title}</span>{badge}</div>}>
      <div className="p-4 border-t border-[#E4E4E4]">{children}</div>
    </Collapsible>
  );
}

export default function ApplicationDetailModal({ app, A, onClose }) {
  const db = useStore(s => s.db); const updateDB = useStore(s => s.updateDB);
  const a = A.admissions.find(x => x.id === app.id) || app;     // always show the live record
  const pos = JOURNEY_STAGES.findIndex(s => s.id === (STAGE_ID[a.stage] || 'enquiry'));
  const enrolled = a.stage === 'Enrolled', waitlisted = a.stage === 'Waitlisted';
  const st = (min, exact) => pos > (exact ?? min) ? 'done' : pos >= min ? 'current' : 'upcoming';
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const [f, setF] = useState({ ...a });
  const [dev, setDev] = useState({ ...a.dev });
  const [note, setNote] = useState(''); const [err, setErr] = useState(''); const [confirmEnrol, setConfirmEnrol] = useState(false);
  const fs = getFeeStructure()[a.grade] || {};
  const suggest = { 'Admission Fee': fs.admission, 'Term 1 Fee': fs.t1, 'Term 2 Fee': fs.t2, 'Term 3 Fee': fs.t3, 'Transport Fee': fs.transport, 'Activity Fee': fs.activity, 'Hostel Fee': fs.hostel };
  const [pay, setPay] = useState({ type: 'Admission Fee', invoice: String(suggest['Admission Fee'] || ''), paid: '', mode: PAY_MODES[0], ref: '' });
  const docs = Object.values(a.docs).filter(Boolean).length, docTotal = Object.keys(a.docs).length;
  const invoiced = a.feeLines.reduce((s, l) => s + l.invoice, 0), paid = a.feeLines.reduce((s, l) => s + l.paid, 0);
  const sectionFree = sec => SECTION_CAPACITY - db.students.filter(s => s.cls === a.grade && s.section === sec).length;
  const ready = a.stage === 'Seat Allocated';

  const save = (fields, msg) => { A.updateAdmission(a.id, fields, msg); setErr(''); };
  function saveApplication() { if (!f.name.trim() || !f.parent.trim() || !f.phone.trim()) return setErr('Child name, parent and phone are required.'); save({ name: f.name.trim(), grade: f.grade, dob: f.dob, gender: f.gender, parent: f.parent.trim(), phone: f.phone.trim(), email: f.email, address: f.address, assigned: f.assigned, source: f.source, notes: f.notes, boarding: f.boarding, busRoute: f.busRoute, diet: f.diet }, 'Application details saved'); }
  function recordPay() {
    if (!+pay.invoice && !+pay.paid) return setErr('Enter the invoice amount or the amount paid.');
    if (+pay.paid > (+pay.invoice || Infinity)) return setErr('Paid amount is more than the invoice.');
    A.recordFee(a.id, { type: pay.type, invoice: +pay.invoice || 0, paid: +pay.paid || 0, mode: pay.mode, ref: pay.ref, date: TODAY }); setPay(p => ({ ...p, paid: '', ref: '' })); setErr('');
  }
  function enrol() {
    if (!a.feeLines.length) return setErr('Record at least the admission fee before enrolling.');
    if (paid < invoiced && !confirmEnrol) return setConfirmEnrol(true);
    A.enrol(a.id, updateDB); onClose();
  }

  return (
    <Modal open onClose={onClose} size="lg" title={a.name} subtitle={`${a.grade} · ${a.id} · applied ${a.applied}${a.studentId ? ' · student ' + a.studentId : ''}`}
      footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{err}</span><Button variant="outline" onClick={onClose}>Close</Button>
        {!enrolled && !waitlisted && pos < JOURNEY_STAGES.length - 1 && <Button variant="outline" onClick={() => A.advanceStage(a.id)}>Advance stage →</Button>}</>}>
      {/* stage banner */}
      <div className="rounded-[10px] px-4 py-3 mb-4 text-white flex items-center gap-3" style={{ background: enrolled ? '#166534' : waitlisted ? '#DC2626' : '#C8202E' }}>
        <div className="flex-1"><div className="text-[10.5px] opacity-75">Current stage</div><div className="text-[16px] font-extrabold">{a.stage}</div></div>
        {enrolled && <span className="bg-white/25 rounded-[6px] px-3 py-1.5 font-semibold text-[13px]">✓ Enrolled</span>}
        {waitlisted && <Button size="sm" variant="outline" onClick={() => A.setWaitlist(a.id, false)}>↩ Restore</Button>}
        {!enrolled && !waitlisted && <Button size="sm" variant="outline" className="!bg-white/20 !text-white !border-white/30" onClick={() => A.setWaitlist(a.id, true)}>⏳ Move to waitlist</Button>}
      </div>

      <Section n={1} icon="📝" title="Application" state={a.name && a.parent && a.phone ? 'done' : 'current'} defaultOpen={pos <= 1 && !enrolled}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Child name *"><input value={f.name} onChange={e => set('name', e.target.value)} className={inputCls} /></Field>
          <Field label="Grade *"><select value={f.grade} onChange={e => set('grade', e.target.value)} className={inputCls}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></Field>
          <Field label="Date of birth"><input type="date" value={f.dob || ''} onChange={e => set('dob', e.target.value)} className={inputCls} /></Field>
          <Field label="Gender"><select value={f.gender} onChange={e => set('gender', e.target.value)} className={inputCls}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
          <Field label="Parent / guardian *"><input value={f.parent} onChange={e => set('parent', e.target.value)} className={inputCls} /></Field>
          <Field label="Phone *"><input value={f.phone} onChange={e => set('phone', e.target.value)} className={inputCls} /></Field>
          <Field label="Email"><input value={f.email || ''} onChange={e => set('email', e.target.value)} className={inputCls} /></Field>
          <Field label="Address"><input value={f.address || ''} onChange={e => set('address', e.target.value)} className={inputCls} /></Field>
          <Field label="Officer"><select value={f.assigned} onChange={e => set('assigned', e.target.value)} className={inputCls}>{STAFF_NAMES.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Source"><select value={f.source} onChange={e => set('source', e.target.value)} className={inputCls}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Bus route"><select value={f.busRoute || ''} onChange={e => set('busRoute', e.target.value)} className={inputCls}><option value="">None — own transport</option>{db.routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          <label className="flex items-center gap-2 text-[13px] cursor-pointer self-end pb-2"><input type="checkbox" checked={!!f.boarding} onChange={e => set('boarding', e.target.checked)} className="accent-[#C8202E]" /> Boarding student</label>
          <Field label="Notes" className="col-span-2"><textarea rows={2} value={f.notes || ''} onChange={e => set('notes', e.target.value)} className={inputCls + ' resize-none'} /></Field>
        </div><Button size="sm" className="mt-3" onClick={saveApplication}>✓ Save section</Button>
      </Section>

      <Section n={2} icon="📄" title={`Documents (${docs}/${docTotal})`} state={docs === docTotal ? 'done' : pos >= 2 ? 'current' : 'upcoming'} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">{Object.entries(DOC_KEYS).map(([k, l]) => (
          <div key={k} onClick={() => A.toggleDoc(a.id, k)} className={`flex items-center gap-2.5 p-2.5 rounded-[6px] cursor-pointer ${a.docs[k] ? 'bg-[#F0FDF4]' : 'bg-[#FFF5F5]'}`}><span className="text-[16px]">{a.docs[k] ? '✅' : '📄'}</span><div><div className="text-[12px] font-semibold text-[#111]">{l}</div><div className={`text-[10.5px] font-medium ${a.docs[k] ? 'text-[#166534]' : 'text-[#C8202E]'}`}>{a.docs[k] ? 'Received' : 'Pending — click to mark'}</div></div></div>))}</div>
      </Section>

      <Section n={3} icon="🗓" title="Interview / assessment" state={a.interviewDate && a.interviewTime ? 'done' : pos >= 3 ? 'current' : 'upcoming'}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Interview date"><input type="date" value={f.interviewDate} onChange={e => set('interviewDate', e.target.value)} className={inputCls} /></Field>
          <Field label="Interview time"><input type="time" value={f.interviewTime} onChange={e => set('interviewTime', e.target.value)} className={inputCls} /></Field>
          <Field label="Panel / interviewer" className="col-span-2"><input value={f.panel} onChange={e => set('panel', e.target.value)} className={inputCls} /></Field>
          <Field label="Notes / outcome" className="col-span-2"><textarea rows={2} value={f.interviewNotes} onChange={e => set('interviewNotes', e.target.value)} className={inputCls + ' resize-none'} /></Field>
        </div><Button size="sm" className="mt-3" onClick={() => save({ interviewDate: f.interviewDate, interviewTime: f.interviewTime, panel: f.panel, interviewNotes: f.interviewNotes }, 'Interview details saved')}>✓ Save section</Button>
        {docs < docTotal && <div className="text-[11.5px] text-[#B45309] mt-2">The stage moves to "Interview Scheduled" once all documents are in.</div>}
      </Section>

      <Section n={4} icon="🪑" title="Seat allocation" state={a.seat ? 'done' : pos >= 4 ? 'current' : 'upcoming'}>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Assign to section"><select value={f.section} onChange={e => set('section', e.target.value)} className={inputCls}><option value="">— Select —</option>{['A', 'B', 'C'].map(s => <option key={s} value={s} disabled={sectionFree(s) <= 0}>Section {s} ({Math.max(0, sectionFree(s))} seats free)</option>)}</select></Field>
          <Field label="Roll / seat number"><input value={f.seat} onChange={e => set('seat', e.target.value)} className={inputCls} /></Field>
          <Field label="Admission category"><select value={f.category} onChange={e => set('category', e.target.value)} className={inputCls}>{CATEGORIES.map(s => <option key={s}>{s}</option>)}</select></Field>
        </div><Button size="sm" className="mt-3" onClick={() => save({ section: f.section, seat: f.seat, category: f.category }, `Seat allocated: ${f.grade} ${f.section || ''} #${f.seat || '—'}`)}>✓ Save section</Button>
      </Section>

      <Section n={5} icon="₹" title={`Fees (${fmt(paid)} of ${fmt(invoiced)} paid)`} state={a.feeLines.length && paid >= invoiced ? 'done' : a.feeLines.length ? 'current' : 'upcoming'}>
        {a.feeLines.length > 0 && <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4] mb-3">{a.feeLines.map(l => (
          <div key={l.id} className="flex items-center gap-3 px-3 py-2 text-[12.5px]"><span className="flex-1 font-semibold">{l.type}</span><span className="text-[#777]">{fmt(l.invoice)}</span><span className="font-bold text-[#166534] w-24 text-right">{fmt(l.paid)} paid</span><Badge variant={l.paid >= l.invoice ? 'green' : l.paid ? 'amber' : 'red'}>{l.paid >= l.invoice ? 'Paid' : l.paid ? 'Partial' : 'Unpaid'}</Badge></div>))}</div>}
        <div className="grid grid-cols-5 gap-2 items-end">
          <Field label="Fee type" className="col-span-2"><select value={pay.type} onChange={e => setPay(p => ({ ...p, type: e.target.value, invoice: String(suggest[e.target.value] || '') }))} className={inputCls}>{FEE_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Invoice ₹"><input type="number" value={pay.invoice} onChange={e => setPay(p => ({ ...p, invoice: e.target.value }))} className={inputCls} /></Field>
          <Field label="Paid now ₹"><input type="number" value={pay.paid} onChange={e => setPay(p => ({ ...p, paid: e.target.value }))} className={inputCls} /></Field>
          <Field label="Mode"><select value={pay.mode} onChange={e => setPay(p => ({ ...p, mode: e.target.value }))} className={inputCls}>{PAY_MODES.map(m => <option key={m}>{m}</option>)}</select></Field>
        </div><Button size="sm" className="mt-3" onClick={recordPay}>+ Record / add payment</Button>
        <div className="text-[11.5px] text-[#AAA] mt-2">Amounts default from the fee structure for {a.grade}. Paid amounts move into Finance when the student is enrolled.</div>
      </Section>

      <Section n={6} icon="🎓" title="Enrolment" state={enrolled ? 'done' : ready ? 'current' : 'upcoming'} defaultOpen={ready}>
        {enrolled ? <div className="text-[13px] text-[#166534]">Enrolled as <b>{a.studentId}</b> in {a.grade} {a.section}. Fees paid at admission are in Finance.</div> : <>
          <div className="space-y-1 text-[12.5px] mb-3">{[[docs === docTotal, 'All documents received'], [!!(a.interviewDate && a.interviewTime), 'Interview scheduled'], [!!a.seat, 'Seat allocated'], [a.feeLines.length > 0, 'Admission fee recorded'], [a.feeLines.length > 0 && paid >= invoiced, 'Fees fully paid (optional — can enrol with a balance)']].map(([ok, l]) => <div key={l} className={ok ? 'text-[#166534]' : 'text-[#AAA]'}>{ok ? '✓' : '○'} {l}</div>)}</div>
          {confirmEnrol && <div className="bg-[#FFFBEB] border border-[#FEF08A] rounded-[6px] p-2.5 text-[12.5px] text-[#B45309] mb-3">{a.name} has an outstanding balance of <b>{fmt(invoiced - paid)}</b>. Click again to enrol anyway.</div>}
          <Button disabled={!ready || waitlisted} onClick={enrol}>{confirmEnrol ? '✓ Enrol anyway' : '✓ Confirm enrolment'}</Button>
          {!ready && <span className="text-[11.5px] text-[#AAA] ml-3">Available once the stage reaches Seat Allocated.</span>}</>}
      </Section>

      <Section n={7} icon="🧠" title="Development profile" state={a.dev.hobbies || a.dev.behav ? 'done' : 'upcoming'} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Learning style"><select value={dev.learningStyle} onChange={e => setDev(d => ({ ...d, learningStyle: e.target.value }))} className={inputCls}>{LEARNING_STYLES.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Diet preference"><select value={dev.diet} onChange={e => setDev(d => ({ ...d, diet: e.target.value }))} className={inputCls}>{DIETS.map(s => <option key={s}>{s}</option>)}</select></Field>
          {[['Hobbies & interests', 'hobbies'], ['Health / medical notes', 'health'], ['Special educational needs', 'needs'], ['Behavioural profile', 'behav'], ['Preferred learning environment', 'expPref']].map(([l, k]) => <Field key={k} label={l} className={k === 'expPref' ? 'col-span-2' : ''}><input value={dev[k]} onChange={e => setDev(d => ({ ...d, [k]: e.target.value }))} className={inputCls} /></Field>)}
        </div><Button size="sm" className="mt-3" onClick={() => A.updateDev(a.id, dev)}>Save profile</Button>
        <div className="text-[11.5px] text-[#AAA] mt-2">Carried over to the student record on enrolment.</div>
      </Section>

      <Collapsible header={<span className="text-[13px] font-bold text-[#111]">Activity log ({a.log.length})</span>}>
        <div className="border-t border-[#E4E4E4]"><div className="flex gap-2 p-3"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" onKeyDown={e => { if (e.key === 'Enter') { A.addNote(a.id, note); setNote(''); } }} className={inputCls + ' flex-1'} /><Button size="sm" onClick={() => { A.addNote(a.id, note); setNote(''); }}>Add</Button></div>
          <div className="divide-y divide-[#E4E4E4]">{[...a.log].reverse().map((l, i) => <div key={i} className="flex gap-3 px-4 py-2 text-[12.5px]"><span className="font-mono text-[11px] text-[#AAA] flex-shrink-0 mt-0.5">{new Date(l.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><span className="flex-1 text-[#555]">{l.msg}</span><span className="text-[10.5px] text-[#AAA]">{l.by}</span></div>)}</div></div>
      </Collapsible>
    </Modal>
  );
}

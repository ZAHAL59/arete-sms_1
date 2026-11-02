import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { totalScore, maxScore, DECISIONS, numToWords, TODAY } from './constants';

const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
const panelText = p => Array.isArray(p) ? p.join(', ') : (p || '');

export function offerLetterHtml(ol, vac) {
  const words = numToWords(ol.salary) + ' Only';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Offer Letter — ${ol.name}</title>
<style>body{font-family:Georgia,serif;color:#111;max-width:720px;margin:40px auto;padding:0 30px;line-height:1.7;font-size:14px}
.hd{border-bottom:3px solid #C8202E;padding-bottom:12px;margin-bottom:24px}.hd h1{margin:0;color:#C8202E;font-size:22px;font-family:Arial,sans-serif}.hd div{color:#666;font-size:12px;font-family:Arial,sans-serif}
.meta{display:flex;justify-content:space-between;font-size:13px;margin-bottom:18px}table{border-collapse:collapse;margin:14px 0;width:100%}td{padding:7px 10px;border:1px solid #ddd;font-size:13px}td:first-child{background:#f8f8f8;width:36%;font-weight:bold}
.sig{margin-top:50px;display:flex;justify-content:space-between}.sig div{width:40%;border-top:1px solid #333;padding-top:6px;font-size:12px}@media print{button{display:none}}</style></head><body>
<div class="hd"><h1>Arete Model School</h1><div>Kozhikode, Kerala · hr@aretemodel.edu</div></div>
<div class="meta"><div><b>Ref:</b> ${ol.refNo}</div><div><b>Date:</b> ${fmtDate(ol.issuedDate)}</div></div>
<p>To,<br><b>${ol.name}</b>${ol.phone ? '<br>' + ol.phone : ''}${ol.email ? '<br>' + ol.email : ''}</p>
<p><b>Subject: Offer of appointment — ${ol.post} Teacher</b></p>
<p>Dear ${ol.name.split(' ')[0]},</p>
<p>Following your application and interview, we are pleased to offer you the position of <b>${ol.post} Teacher</b> in the ${ol.dept || 'Secondary'} Department of Arete Model School, on the terms below.</p>
<table><tr><td>Position</td><td>${ol.post} Teacher</td></tr><tr><td>Department</td><td>${ol.dept || 'Secondary'}</td></tr>
<tr><td>Date of joining</td><td>${fmtDate(ol.joinDate)}</td></tr>
<tr><td>Monthly salary</td><td>₹${ol.salary.toLocaleString('en-IN')} (Rupees ${words})</td></tr>
<tr><td>Annual amount</td><td>₹${(ol.salary * 12).toLocaleString('en-IN')}</td></tr></table>
<p>Please confirm your acceptance by signing and returning a copy of this letter. The school's staff policies will apply to your employment.</p>
<p>We look forward to welcoming you to the Arete team.</p>
<p>Yours sincerely,</p><div class="sig"><div>HR Manager<br>Arete Model School</div><div>Accepted by (signature & date)</div></div>
<p style="text-align:center;margin-top:30px"><button onclick="window.print()" style="padding:8px 22px;background:#C8202E;color:#fff;border:0;border-radius:6px;cursor:pointer">Print</button></p></body></html>`;
}

export default function Interviews({ hr, scheduleInterview, setChecklist, saveInterviewResult, hireCandidate }) {
  const db = useStore(s => s.db);
  const [score, setScore] = useState(null);      // { id|null, cand }
  const [sched, setSched] = useState(null);      // { cand|null } — null cand = pick from a list
  const [picker, setPicker] = useState(false);
  const [cl, setCl] = useState(null); const [hire, setHire] = useState(null); const [letter, setLetter] = useState(null);
  const [form, setForm] = useState({ candId: '', date: '', time: '', venue: '', mode: 'In-person' }); const [pick, setPick] = useState('');

  const cands = hr.candidates; const cand = id => cands.find(c => c.id === id);
  const vac = id => hr.vacancies.find(v => v.id === id);
  const MAX = maxScore(hr.checklist);
  const done = hr.interviews.filter(i => i.status === 'Completed');

  // One row per person: invited (invite sent) or scheduled, and not yet scored
  const upcoming = cands.filter(c => !c.hired && c.status !== 'Rejected' && (c.status === 'Interview Scheduled' || hr.interviews.some(i => i.candId === c.id && i.status === 'Scheduled')) && !done.some(i => i.candId === c.id && ['Recommended', 'Rejected'].includes(c.status)))
    .map(c => ({ c, iv: hr.interviews.find(i => i.candId === c.id && i.status === 'Scheduled'), app: (hr.applications || []).find(a => a.id === c.appId) }));
  const selectable = cands.filter(c => !['Rejected', 'Hired'].includes(c.status));

  function openSched(c) { const iv = hr.interviews.find(i => i.candId === c?.id && i.status === 'Scheduled'); setForm({ candId: c?.id || '', date: iv?.date || '', time: iv?.time || '', venue: iv?.venue || '', mode: iv?.mode || 'In-person' }); setSched({ cand: c || null }); }
  function saveSched() { if (!form.candId || !form.date) return; scheduleInterview({ ...form, vacId: cand(form.candId)?.vacId }); setSched(null); }

  return (
    <div className="p-6">
      <PageHeader title="Interviews" subtitle={`${upcoming.length} upcoming · ${done.length} completed · scored out of ${MAX}`}
        actions={<><Button variant="outline" onClick={() => setCl(hr.checklist.map(c => ({ ...c })))}>⚙ Checklist</Button><Button variant="outline" onClick={() => setPicker(true)}>▶ Start Interview</Button><Button onClick={() => openSched(null)}>+ Schedule</Button></>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Upcoming" value={upcoming.length} note="Invited / scheduled" color="#1A5FB4" /><Kpi label="Completed" value={done.length} note="Scored" />
        <Kpi label="Recommended" value={done.filter(i => i.decision === 'Recommended' && !cand(i.candId)?.hired).length} note="Ready to hire" color="#166534" /><Kpi label="Hired" value={cands.filter(c => c.hired).length} note="Became staff" color="#6D28D9" />
      </div>

      <div className="text-[12px] font-bold text-[#AAA] uppercase tracking-wider mb-2">Upcoming</div>
      {!upcoming.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-8 text-center text-[#AAA] mb-4">No upcoming interviews. Shortlist an applicant and send the interview invite from <b>Applications</b> — they will appear here.</div>}
      {upcoming.map(({ c, iv, app }) => (
        <div key={c.id} className="bg-white border border-[#C8202E] rounded-[10px] p-4 mb-2 flex items-center gap-3 shadow-[0_1px_4px_rgba(0,0,0,.07)]">
          <div className="w-10 h-10 rounded-[8px] bg-[#FEF4F4] flex items-center justify-center text-[18px] flex-shrink-0">🗓</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-bold text-[#111]">{c.name} <span className="font-normal text-[#AAA] text-[12px]">· CV score {c.score}</span></div>
            <div className="text-[11.5px] text-[#777]">{vac(c.vacId)?.subj} Teacher · {iv ? <b className="text-[#111]">📅 {iv.date}{iv.time ? ' ' + iv.time : ''}{iv.venue ? ' · ' + iv.venue : ''} ({iv.mode})</b> : <span className="text-[#B45309] font-semibold">interview date not set yet</span>}</div>
            {app?.inviteSent && <div className="text-[11px] text-[#C8202E] font-semibold mt-0.5">✓ Invite sent {new Date(app.inviteSentAt).toLocaleDateString('en-IN')}</div>}
          </div>
          <Badge variant="blue">{iv ? 'Scheduled' : 'Invited'}</Badge>
          <Button size="sm" variant="outline" onClick={() => openSched(c)}>{iv ? '↻ Reschedule' : '📅 Set date & time'}</Button>
          <Button size="sm" onClick={() => setScore({ id: iv?.id || null, cand: c })}>Score Interview →</Button>
        </div>))}

      {done.length > 0 && <div className="mt-5"><div className="text-[12px] font-bold text-[#AAA] uppercase tracking-wider mb-2">Completed</div>
        <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]"><table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Candidate</Th><Th>Position</Th><Th>Date</Th><Th>Score</Th><Th>Decision</Th><Th>Remarks</Th><Th /></tr></thead>
          <tbody>{done.map(i => { const c = cand(i.candId); const t = totalScore(i.scores, hr.checklist); return (
            <tr key={i.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
              <td className="px-4 py-2.5 font-semibold text-[#111]">{c?.name || i.candId}</td><td className="px-4 py-2.5 text-[#555]">{vac(i.vacId)?.subj} Teacher</td><td className="px-4 py-2.5 text-[#555]">{i.date}</td>
              <td className="px-4 py-2.5 font-bold">{t}<span className="text-[#AAA] font-normal">/{MAX}</span></td>
              <td className="px-4 py-2.5"><Badge variant={i.decision === 'Recommended' ? 'green' : i.decision === 'Rejected' ? 'red' : 'amber'}>{i.decision || '—'}</Badge></td>
              <td className="px-4 py-2.5 text-[#555] max-w-[200px] truncate">{i.remarks || i.feedback}</td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                {c?.hired ? <><Badge variant="green">✓ Hired</Badge> <Button size="sm" variant="outline" onClick={() => setLetter(c)}>📄 Offer Letter</Button></>
                  : i.decision === 'Recommended' && c ? <Button size="sm" onClick={() => setHire(c)}>✓ Hire</Button>
                  : <button onClick={() => setScore({ id: i.id, cand: c })} className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">View / edit</button>}
              </td></tr>); })}</tbody></table></div></div>}

      {score && <ScoreModal hr={hr} iv={hr.interviews.find(i => i.id === score.id)} cand={score.cand} onClose={() => setScore(null)} onSave={(id, data) => { saveInterviewResult(id, score.cand.id, data); setScore(null); }} />}
      {cl && <ChecklistModal list={cl} setList={setCl} onClose={() => setCl(null)} onSave={() => { setChecklist(cl.filter(c => c.crit.trim()).map(c => ({ ...c, crit: c.crit.trim(), max: Math.max(1, +c.max || 1) }))); setCl(null); }} />}
      {hire && <HireModal cand={hire} vac={vac(hire.vacId)} iv={done.find(i => i.candId === hire.id)} hr={hr} onClose={() => setHire(null)} onSave={h => { hireCandidate(hire.id, h); setLetter({ ...hire, offerLetter: { name: hire.name, ...h, vacId: hire.vacId, refNo: 'AMS/HR/OL/' + new Date().getFullYear() + '/' + String(Date.now()).slice(-4), issuedDate: TODAY } }); setHire(null); }} />}
      {letter && <Modal open onClose={() => setLetter(null)} title="Offer Letter" subtitle={`${letter.name} · ${letter.offerLetter?.refNo || ''}`}
        footer={<><Button variant="outline" onClick={() => setLetter(null)}>Close</Button><Button onClick={() => { const w = window.open('', '_blank', 'width=820,height=900'); if (w) { w.document.write(offerLetterHtml(letter.offerLetter, vac(letter.vacId))); w.document.close(); } }}>🖨 Open & Print</Button></>}>
        <iframe title="Offer letter" srcDoc={offerLetterHtml(letter.offerLetter, vac(letter.vacId))} className="w-full h-[420px] border border-[#E4E4E4] rounded-[8px]" />
        <p className="text-[11.5px] text-[#AAA] mt-2">The letter wording is a general template — please review it before issuing.</p></Modal>}

      {sched && <Modal open onClose={() => setSched(null)} title={sched.cand ? `Interview date — ${sched.cand.name}` : 'Schedule Interview'} subtitle={sched.cand ? 'Updates the existing interview — no duplicate is created' : 'Pick a shortlisted candidate'}
        footer={<><Button variant="outline" onClick={() => setSched(null)}>Cancel</Button><Button onClick={saveSched}>Save</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Candidate *" className="col-span-2"><select value={form.candId} disabled={!!sched.cand} onChange={e => setForm(f => ({ ...f, candId: e.target.value }))} className={inputCls}><option value="">— Select —</option>{selectable.map(c => <option key={c.id} value={c.id}>{c.name} ({vac(c.vacId)?.subj})</option>)}</select></Field>
          <Field label="Date *"><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></Field>
          <Field label="Time"><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className={inputCls} /></Field>
          <Field label="Venue"><input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className={inputCls} /></Field>
          <Field label="Mode"><select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))} className={inputCls}><option>In-person</option><option>Online</option></select></Field>
        </div></Modal>}
      <Modal open={picker} onClose={() => setPicker(false)} title="Start Interview" subtitle="Interview a candidate now (no scheduling needed)" footer={<><Button variant="outline" onClick={() => setPicker(false)}>Cancel</Button><Button onClick={() => { if (pick) { const c = cand(pick); setScore({ id: hr.interviews.find(i => i.candId === pick && i.status === 'Scheduled')?.id || null, cand: c }); setPicker(false); } }}>Start →</Button></>}>
        <Field label="Candidate"><select value={pick} onChange={e => setPick(e.target.value)} className={inputCls}><option value="">— Select —</option>{cands.filter(c => !c.hired).map(c => <option key={c.id} value={c.id}>{c.name} — {vac(c.vacId)?.subj} ({c.status})</option>)}</select></Field>
        {pick && <div className="mt-3 bg-[#F8F8F8] rounded-[8px] p-3 text-[12.5px] text-[#555]">{cand(pick)?.qual} · {cand(pick)?.exp} · CV score {cand(pick)?.score}</div>}</Modal>
    </div>
  );
}

function ScoreModal({ hr, iv, cand, onClose, onSave }) {
  const [scores, setScores] = useState({ ...(iv?.scores || {}) });
  const [remarks, setRemarks] = useState(iv?.remarks || iv?.feedback || ''); const [decision, setDecision] = useState(iv?.decision || 'Recommended');
  const [panel, setPanel] = useState(panelText(iv?.panel)); const [date, setDate] = useState(iv?.date || TODAY); const [err, setErr] = useState('');
  const total = totalScore(scores, hr.checklist), max = maxScore(hr.checklist);
  function save() { if (!remarks.trim()) return setErr('Add interview observations / remarks.'); onSave(iv?.id || null, { scores, remarks: remarks.trim(), decision, panel, date }); }
  return (
    <Modal open onClose={onClose} size="lg" title={`Interview — ${cand?.name}`} subtitle={`${hr.vacancies.find(v => v.id === cand?.vacId)?.subj} Teacher`}
      footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{err}</span><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save Interview</Button></>}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></Field>
        <Field label="Panel"><input value={panel} onChange={e => setPanel(e.target.value)} placeholder="e.g. Mr. Paul T., Ms. Latha R." className={inputCls} /></Field>
      </div>
      <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4] mb-3">{hr.checklist.map(c => (
        <div key={c.id} className="flex items-center gap-3 px-3 py-2.5"><span className="flex-1 text-[13px] font-semibold text-[#111]">{c.crit}</span><span className="text-[12px] text-[#AAA]">/ {c.max}</span>
          <input type="number" min={0} max={c.max} value={scores[c.id] ?? 0} onChange={e => setScores(s => ({ ...s, [c.id]: Math.min(c.max, Math.max(0, +e.target.value || 0)) }))} className="w-16 px-2 py-1.5 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-center font-mono font-bold outline-none focus:border-[#C8202E]" /></div>))}</div>
      <div className="bg-[#FEF4F4] border border-[#FECACA] rounded-[8px] px-3 py-2 mb-4 flex justify-between"><span className="font-bold">Total</span><span className="text-[18px] font-extrabold text-[#C8202E]">{total}/{max}</span></div>
      <div className="grid grid-cols-3 gap-3"><Field label="Decision"><select value={decision} onChange={e => setDecision(e.target.value)} className={inputCls}>{DECISIONS.map(d => <option key={d}>{d}</option>)}</select></Field>
        <Field label="Observations / remarks *" className="col-span-3"><textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} className={inputCls + ' resize-y'} /></Field></div>
    </Modal>
  );
}

function ChecklistModal({ list, setList, onClose, onSave }) {
  const total = list.reduce((a, c) => a + (+c.max || 0), 0);
  const set = (i, k, v) => setList(l => l.map((c, j) => j === i ? { ...c, [k]: v } : c));
  return (
    <Modal open onClose={onClose} title="Interview Checklist" subtitle="Criteria and marks used to score every interview" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={onSave}>Save Checklist</Button></>}>
      <div className="space-y-2">{list.map((c, i) => <div key={c.id} className="flex gap-2"><input value={c.crit} onChange={e => set(i, 'crit', e.target.value)} className={inputCls + ' flex-1'} /><input type="number" min={1} max={100} value={c.max} onChange={e => set(i, 'max', e.target.value)} className={inputCls + ' w-20'} /><button onClick={() => setList(l => l.filter((_, j) => j !== i))} className="text-[#DC2626] px-2 cursor-pointer bg-none border-none">✕</button></div>)}</div>
      <div className="flex items-center mt-3"><Button size="sm" variant="outline" onClick={() => setList(l => [...l, { id: 'CL' + Date.now().toString().slice(-5), crit: '', max: 10 }])}>+ Add criterion</Button><span className="ml-auto text-[13px] font-bold">{list.length} criteria · {total} marks</span></div>
      <p className="text-[11.5px] text-[#AAA] mt-2">Changing marks affects how past interviews display against the new total.</p>
    </Modal>
  );
}

function HireModal({ cand, vac, iv, hr, onClose, onSave }) {
  const [f, setF] = useState({ post: vac?.subj || '', dept: vac?.dept || 'Secondary', joinDate: TODAY, salary: '', phone: cand.contact || '', email: '' }); const [err, setErr] = useState('');
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  function save() { if (!+f.salary) return setErr('Enter the offered salary.'); if (!f.post.trim()) return setErr('Enter the post / subject.'); onSave({ ...f, name: cand.name, salary: +f.salary }); }
  return (
    <Modal open onClose={onClose} title={`Hire — ${cand.name}`} subtitle={iv ? `Interview score ${totalScore(iv.scores, hr.checklist)}/${maxScore(hr.checklist)} · ${iv.decision}` : ''}
      footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{err}</span><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Hire & create staff record</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Post / Subject *"><input value={f.post} onChange={e => set('post', e.target.value)} className={inputCls} /></Field>
        <Field label="Department"><input value={f.dept} onChange={e => set('dept', e.target.value)} className={inputCls} /></Field>
        <Field label="Date of joining"><input type="date" value={f.joinDate} onChange={e => set('joinDate', e.target.value)} className={inputCls} /></Field>
        <Field label="Monthly salary (₹) *"><input type="number" value={f.salary} onChange={e => set('salary', e.target.value)} className={inputCls} /></Field>
        <Field label="Phone"><input value={f.phone} onChange={e => set('phone', e.target.value)} className={inputCls} /></Field>
        <Field label="Email"><input value={f.email} onChange={e => set('email', e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="mt-3 text-[12px] text-[#555] bg-[#F0FDF4] rounded-[6px] p-2.5">This adds them to the staff list, so they appear in Payroll, the Principal's staff view and the timetable teacher list. The vacancy is marked Filled once all its positions are hired.</div>
    </Modal>
  );
}

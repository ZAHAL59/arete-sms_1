import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Collapsible from '../../components/ui/Collapsible';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Field, inputCls } from '../../components/ui/Kit';
import { COLORS } from '../teacher/constants';
import { LEARNING_STYLES } from './constants';

const FIELDS = [['Hobbies & interests', 'hobbies'], ['Languages known', 'langs'], ['Special educational needs', 'needs'], ['Health & medical notes', 'health']];

export default function DevProfiles() {
  const db = useStore(s => s.db); const updateDB = useStore(s => s.updateDB);
  const [q, setQ] = useState(''); const [grade, setGrade] = useState(''); const [section, setSection] = useState('');
  const [editing, setEditing] = useState(null); const [form, setForm] = useState({}); const [ms, setMs] = useState([]); const [cf, setCf] = useState([]);
  const grades = [...new Set(db.students.map(s => s.cls))].sort();
  const students = db.students.filter(s => (!grade || s.cls === grade) && (!section || s.section === section) && (!q || s.name.toLowerCase().includes(q.toLowerCase())));
  const sc = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]';

  function open(s) {
    setEditing(s); setForm({ hobbies: s.hobbies || '', langs: s.langs || 'Malayalam, English', learningStyle: s.learningStyle || '', needs: s.needs || '', health: s.health || '', behav: s.behav || '', expPref: s.expPref || '', notes: s.notes || '', busRoute: s.busRoute || '', boarding: !!s.boarding });
    setMs((s.milestones || []).map(m => ({ ...m }))); setCf((s.customFields || []).map(c => ({ ...c })));
  }
  function save() {
    updateDB(d => { const i = d.students.findIndex(x => x.id === editing.id); if (i >= 0) d.students[i] = { ...d.students[i], ...form, travel: form.busRoute ? 'Bus' : 'Own', milestones: ms.filter(m => m.text.trim()), customFields: cf.filter(c => c.label.trim()) }; return d; });
    setEditing(null);
  }
  const setM = (i, k, v) => setMs(l => l.map((m, j) => j === i ? { ...m, [k]: v } : m));
  const setC = (i, k, v) => setCf(l => l.map((m, j) => j === i ? { ...m, [k]: v } : m));

  return (
    <div className="p-6">
      <PageHeader title="Development Profiles" subtitle="Learning styles, needs, custom fields and progress milestones"
        actions={<><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className={sc + ' w-36'} />
          <select value={grade} onChange={e => setGrade(e.target.value)} className={sc}><option value="">All grades</option>{grades.map(g => <option key={g}>{g}</option>)}</select>
          <select value={section} onChange={e => setSection(e.target.value)} className={sc}><option value="">All sections</option>{['A', 'B', 'C'].map(s => <option key={s}>{s}</option>)}</select></>} />
      {!students.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">{db.students.length ? 'No profiles match the filter.' : 'No students enrolled yet.'}</div>}
      {students.map((s, i) => (
        <Collapsible key={s.id} className="mb-2" header={
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div style={{ background: COLORS[i % COLORS.length] }} className="w-9 h-9 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
            <div className="flex-1 min-w-0"><div className="text-[13.5px] font-bold text-[#111]">{s.name}</div><div className="text-[11.5px] text-[#777]">{s.cls} {s.section} · Roll {s.roll || '—'} · {s.adm}</div></div>
            <div className="flex gap-1.5 flex-wrap items-center">{s.learningStyle && <Badge variant="grey">{s.learningStyle}</Badge>}{s.diet && <Badge variant="blue">{s.diet}</Badge>}{s.boarding && <Badge variant="green">Boarding</Badge>}{s.needs && s.needs !== 'None' && <Badge variant="amber">SEN</Badge>}
              <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); open(s); }}>✎ Edit</Button></div></div>}>
          <div className="p-4 border-t border-[#E4E4E4]">
            <div className="grid grid-cols-3 gap-2 mb-3">{[['Hobbies', s.hobbies], ['Languages', s.langs], ['Preferred learning', s.expPref], ['Health', s.health || 'None'], ['Behavioural', s.behav], ['Parent', s.parentName], ...(s.customFields || []).map(c => [c.label, c.value])].map(([l, v]) => (
              <div key={l} className="bg-[#F8F8F8] p-2.5 rounded-[6px]"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{l}</div><div className="text-[12.5px] text-[#333]">{v || '—'}</div></div>))}</div>
            <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1.5">Progress milestones</div>
            {(s.milestones || []).length ? s.milestones.map((m, j) => <div key={j} className="flex gap-3 text-[12px] text-[#555] mb-1"><span className="font-mono text-[#AAA] flex-shrink-0">{m.date}</span>{m.text}</div>) : <div className="text-[12px] text-[#AAA]">No milestones yet</div>}
          </div>
        </Collapsible>))}

      {editing && <Modal open onClose={() => setEditing(null)} size="lg" title={`Development profile — ${editing.name}`} subtitle={`${editing.cls} ${editing.section} · Roll ${editing.roll || '—'} · Admitted ${editing.adm || '—'}`}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save profile</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(([l, k]) => <Field key={k} label={l}><input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className={inputCls} /></Field>)}
          <Field label="Preferred learning style"><select value={form.learningStyle} onChange={e => setForm(f => ({ ...f, learningStyle: e.target.value }))} className={inputCls}><option value="">— Select —</option>{LEARNING_STYLES.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Preferred learning environment"><input value={form.expPref} onChange={e => setForm(f => ({ ...f, expPref: e.target.value }))} className={inputCls} /></Field>
          <Field label="Behavioural notes" className="col-span-2"><textarea rows={2} value={form.behav} onChange={e => setForm(f => ({ ...f, behav: e.target.value }))} className={inputCls + ' resize-none'} /></Field>
          <Field label="Bus route"><select value={form.busRoute} onChange={e => setForm(f => ({ ...f, busRoute: e.target.value }))} className={inputCls}><option value="">None — own transport</option>{db.routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          <Field label="Boarding / hostel"><select value={form.boarding ? '1' : '0'} onChange={e => setForm(f => ({ ...f, boarding: e.target.value === '1' }))} className={inputCls}><option value="0">Day scholar</option><option value="1">Boarder (hostel)</option></select></Field>
        </div>
        <div className="mt-4"><div className="text-[11px] font-bold text-[#C8202E] uppercase tracking-wider mb-2">Custom fields</div>
          {cf.map((c, i) => <div key={i} className="flex gap-2 mb-2"><input value={c.label} onChange={e => setC(i, 'label', e.target.value)} placeholder="Field name (e.g. Sport, Instrument)" className={inputCls + ' w-48'} /><input value={c.value} onChange={e => setC(i, 'value', e.target.value)} placeholder="Value" className={inputCls + ' flex-1'} /><button onClick={() => setCf(l => l.filter((_, j) => j !== i))} className="text-[#999] px-2 cursor-pointer bg-none border-none">×</button></div>)}
          <Button size="sm" variant="outline" onClick={() => setCf(l => [...l, { label: '', value: '' }])}>+ Add custom field</Button></div>
        <div className="mt-4"><div className="text-[11px] font-bold text-[#C8202E] uppercase tracking-wider mb-2">Progress milestones</div>
          {ms.length === 0 && <div className="text-[12.5px] text-[#AAA] mb-2">No milestones yet. Add the first one below.</div>}
          {ms.map((m, i) => <div key={i} className="flex gap-2 mb-2"><input type="date" value={m.date || ''} onChange={e => setM(i, 'date', e.target.value)} className={inputCls + ' w-36'} /><input value={m.text} onChange={e => setM(i, 'text', e.target.value)} placeholder="What happened / was achieved…" className={inputCls + ' flex-1'} /><button onClick={() => setMs(l => l.filter((_, j) => j !== i))} className="text-[#999] px-2 cursor-pointer bg-none border-none">×</button></div>)}
          <Button size="sm" variant="outline" onClick={() => setMs(l => [...l, { date: new Date().toISOString().slice(0, 10), text: '' }])}>+ Add milestone</Button></div>
        <Field label="General notes" className="mt-3"><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} /></Field>
      </Modal>}
    </div>
  );
}

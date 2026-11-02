import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls, Th } from '../../components/ui/Kit';
import { LMS_TYPES, LMS_SUBJECTS, LMS_GRADES, prettyDate, TODAY } from './constants';

const TABS = [
  ['library', '📹 Video & Animation', ['Video', 'Animation']], ['resources', '🔗 Curated Resources', ['Curated Link', 'PDF / Document', 'Simulation']],
  ['activities', '🎮 Interactive Activities', ['Interactive Activity', 'Quiz']], ['tracking', '📊 Assignments & Progress'], ['arvr', '🥽 AR / VR', ['AR Experience', 'VR Experience', '3D Model']], ['tools', '✏ Educator Tools'],
];
const TYPE_COL = { Video: '#2E5CE6', Animation: '#7C3AED', 'Curated Link': '#0EA47A', 'Interactive Activity': '#D97706', Simulation: '#D97706', Quiz: '#E05252', 'AR Experience': '#0891B2', 'VR Experience': '#0891B2', '3D Model': '#0891B2', 'PDF / Document': '#64748B' };
const TOOLS = [
  ['📹', 'Upload Video / Animation', 'Upload a video or animation mapped to a curriculum topic.', 'Video', '#2E5CE6'], ['📄', 'Create PDF / Worksheet', 'Add a worksheet, revision guide or reading pack.', 'PDF / Document', '#7C3AED'],
  ['❓', 'Add a Quiz', 'Register a quiz resource and assign it to a grade.', 'Quiz', '#E05252'], ['🔗', 'Submit a Curated Link', 'Add a vetted external resource with subject and grade tags.', 'Curated Link', '#0EA47A'],
  ['🎮', 'Add an Interactive Activity', 'Register an interactive manipulative or simulation.', 'Interactive Activity', '#D97706'], ['🥽', 'Add AR / VR Content', 'Register an AR overlay or VR experience.', 'VR Experience', '#0891B2'],
];
const stars = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

// "Grade 8", "Grade 4–6", "All Grades" → does it cover grade n?
export function coversGrade(label, n) {
  if (!n || /all/i.test(label)) return true;
  const nums = (label.match(/\d+/g) || []).map(Number);
  return nums.length === 2 ? n >= nums[0] && n <= nums[1] : nums[0] === n;
}

export default function Learning({ p, api }) {
  const lib = p.lms.library;
  const [tab, setTab] = useState('library'); const [grade, setGrade] = useState(''); const [subj, setSubj] = useState(''); const [type, setType] = useState(''); const [q, setQ] = useState('');
  const [up, setUp] = useState(null); const [asg, setAsg] = useState(null);
  const blank = t => ({ title: '', type: t || 'Video', subj: LMS_SUBJECTS[0], grade: 'Grade 8', dur: '', topic: '', url: '', desc: '', by: 'Principal' });
  const tabTypes = TABS.find(t => t[0] === tab)?.[2];
  const items = lib.filter(r => (!tabTypes || tabTypes.includes(r.type)) && coversGrade(r.grade, +grade.replace(/\D/g, '')) && (!subj || r.subj === subj) && (!type || r.type === type) && (!q || (r.title + r.topic).toLowerCase().includes(q.toLowerCase())));
  const stat = [['📹', 'Video & Animation', lib.filter(r => ['Video', 'Animation'].includes(r.type)).length, 'In library'], ['🎮', 'Activities & Simulations', lib.filter(r => ['Interactive Activity', 'Simulation', 'Quiz'].includes(r.type)).length, 'Interactive'],
    ['🥽', 'AR / VR Experiences', lib.filter(r => /AR|VR/.test(r.type)).length, 'Immersive'], ['👁', 'Total Engagements', lib.reduce((a, r) => a + (r.views || 0), 0), 'Across all content']];

  function saveUp() { if (!up.title.trim()) return; api.addResource({ ...up, title: up.title.trim(), thumb: { Video: '📹', Animation: '🎞', 'Curated Link': '🔗', 'PDF / Document': '📄', Quiz: '❓', 'AR Experience': '🥽', 'VR Experience': '🥽' }[up.type] || '🎮' }); setUp(null); setTab('library'); }
  function saveAsg() { if (!asg.resId || !asg.to) return; api.addAssignment({ ...asg, teacher: 'Principal', total: asg.total || 0 }); setAsg(null); setTab('tracking'); }
  const sel = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]';

  return (
    <div className="p-6">
      <PageHeader title="Digital Learning" subtitle="Videos, activities, AR/VR and assignments"
        actions={<><Button variant="outline" onClick={() => setTab('tools')}>✏ Create Content</Button><Button variant="outline" onClick={() => setAsg({ resId: lib[0]?.id || '', to: 'Grade 8 — All', due: TODAY })}>+ Assign Resource</Button><Button onClick={() => setUp(blank())}>⬆ Upload Material</Button></>} />
      <div className="grid grid-cols-4 gap-3 mb-4">{stat.map(([i, l, v, n]) => <div key={l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 flex items-center gap-3"><div className="text-[24px]">{i}</div><div><div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider">{l}</div><div className="text-[20px] font-extrabold text-[#C8202E] leading-tight">{v}</div><div className="text-[11px] text-[#AAA]">{n}</div></div></div>)}</div>

      <div className="flex gap-1 mb-3 border-b border-[#E4E4E4] overflow-x-auto">{TABS.map(([id, l]) => <button key={id} onClick={() => setTab(id)} className={`px-3.5 py-2 text-[12.5px] font-semibold border-b-2 -mb-px cursor-pointer bg-none whitespace-nowrap ${tab === id ? 'border-[#C8202E] text-[#C8202E]' : 'border-transparent text-[#777]'}`}>{l}</button>)}</div>

      {tabTypes && <div className="flex gap-2 flex-wrap mb-3 items-center">
        <select value={grade} onChange={e => setGrade(e.target.value)} className={sel}><option value="">All grades</option>{Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => <option key={g}>{g}</option>)}</select>
        <select value={subj} onChange={e => setSubj(e.target.value)} className={sel}><option value="">All subjects</option>{LMS_SUBJECTS.map(s => <option key={s}>{s}</option>)}</select>
        <select value={type} onChange={e => setType(e.target.value)} className={sel}><option value="">All types</option>{tabTypes.map(t => <option key={t}>{t}</option>)}</select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className={sel + ' w-40'} /><span className="text-[12px] text-[#AAA] ml-auto">Showing {items.length} resources</span></div>}

      {tabTypes && (!items.length ? <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-10 text-center text-[#AAA]">No resources found <Button size="sm" className="ml-3" onClick={() => setUp(blank(tabTypes[0]))}>+ Add Resource</Button></div> :
        <div className="grid grid-cols-3 gap-3">{items.map(r => { const c = TYPE_COL[r.type] || '#64748B'; return (
          <div key={r.id} className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 flex flex-col gap-2 hover:shadow-[0_4px_18px_rgba(0,0,0,.1)] transition-shadow">
            <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[20px] flex-shrink-0" style={{ background: c + '22', border: `1.5px solid ${c}44` }}>{r.thumb}</div><div className="flex-1 min-w-0"><div className="text-[13px] font-bold text-[#111] leading-snug">{r.title}</div><div className="text-[11px] text-[#AAA] mt-0.5">{r.grade} · {r.topic}{r.dur ? ` · ${r.dur}` : ''}</div></div></div>
            <div className="text-[12px] text-[#666] leading-relaxed flex-1">{r.desc}</div>
            <div className="flex items-center gap-2 text-[11px]"><Badge variant="grey">{r.type}</Badge><span className="text-[#F59E0B]">{stars(r.rating)}</span><span className="text-[#AAA] ml-auto">👁 {r.views} · {r.by}</span></div>
            <div className="flex gap-2">{r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="flex-1 text-center py-1.5 bg-[#C8202E] text-white text-[12px] font-semibold rounded-[6px] no-underline hover:bg-[#9A1822]">▶ Open</a> : <span className="flex-1 text-center py-1.5 bg-[#F2F2F2] text-[#AAA] text-[12px] font-semibold rounded-[6px]">No link yet</span>}<Button size="sm" variant="outline" onClick={() => setAsg({ resId: r.id, to: 'Grade 8 — All', due: TODAY })}>Assign</Button></div>
          </div>); })}</div>)}

      {tab === 'tracking' && <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden"><table className="w-full border-collapse text-[13px]"><thead><tr><Th>Assignment</Th><Th>Assigned to</Th><Th>Teacher</Th><Th>Due</Th><Th>Engaged</Th><Th>Done</Th></tr></thead>
        <tbody>{p.lms.assignments.map(a => { const pct = a.total ? Math.round(a.completed / a.total * 100) : 0; return <tr key={a.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]"><td className="px-4 py-2.5 font-semibold text-[#111]">{a.title}</td><td className="px-4 py-2.5 text-[#555]">{a.to}</td><td className="px-4 py-2.5 text-[#555]">{a.teacher}</td><td className="px-4 py-2.5 text-[#555]">{prettyDate(a.due)}</td><td className="px-4 py-2.5 text-[#555]">{a.engaged}/{a.total}</td><td className="px-4 py-2.5"><Badge variant={pct >= 80 ? 'green' : pct >= 50 ? 'blue' : 'amber'}>{pct}% done</Badge></td></tr>; })}</tbody></table></div>}

      {tab === 'tools' && <div className="grid grid-cols-2 gap-3">{TOOLS.map(([i, t, d, ty, c]) => <div key={t} className="bg-white border border-[#E4E4E4] rounded-[10px] p-5"><div className="text-[26px] mb-2">{i}</div><div className="text-[14px] font-bold mb-1">{t}</div><div className="text-[12px] text-[#777] leading-relaxed mb-3">{d}</div><button onClick={() => setUp(blank(ty))} className="px-3 py-1.5 text-white text-[12px] font-semibold rounded-[6px] cursor-pointer border-none" style={{ background: c }}>Start →</button></div>)}</div>}

      <Collapsible className="mt-4" header={<span className="text-[13.5px] font-bold text-[#111]">Recent Activity</span>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{!p.lms.log.length ? <div className="p-4 text-[12.5px] text-[#AAA]">Uploads and assignments you make here will appear in this feed.</div> : p.lms.log.slice(0, 8).map((l, i) => <div key={i} className="flex gap-2 px-4 py-2.5"><span>{l.ic}</span><div><div className="text-[12.5px]" dangerouslySetInnerHTML={{ __html: l.txt }} /><div className="text-[10.5px] text-[#AAA]">{new Date(l.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div></div>)}</div>
      </Collapsible>

      {up && <Modal open onClose={() => setUp(null)} size="lg" title="Add Learning Resource" subtitle="Videos, PDFs, links, activities or AR/VR content" footer={<><Button variant="outline" onClick={() => setUp(null)}>Cancel</Button><Button onClick={saveUp}>Save Resource</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title *" className="col-span-2"><input value={up.title} onChange={e => setUp(x => ({ ...x, title: e.target.value }))} className={inputCls} /></Field>
          <Field label="Type"><select value={up.type} onChange={e => setUp(x => ({ ...x, type: e.target.value }))} className={inputCls}>{LMS_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Subject"><select value={up.subj} onChange={e => setUp(x => ({ ...x, subj: e.target.value }))} className={inputCls}>{LMS_SUBJECTS.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Grade level"><select value={up.grade} onChange={e => setUp(x => ({ ...x, grade: e.target.value }))} className={inputCls}>{LMS_GRADES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Duration"><input value={up.dur} onChange={e => setUp(x => ({ ...x, dur: e.target.value }))} placeholder="e.g. 9 min" className={inputCls} /></Field>
          <Field label="Topic / Chapter"><input value={up.topic} onChange={e => setUp(x => ({ ...x, topic: e.target.value }))} className={inputCls} /></Field>
          <Field label="URL / Link"><input value={up.url} onChange={e => setUp(x => ({ ...x, url: e.target.value }))} placeholder="https://…" className={inputCls} /></Field>
          <Field label="Description" className="col-span-2"><textarea rows={2} value={up.desc} onChange={e => setUp(x => ({ ...x, desc: e.target.value }))} className={inputCls + ' resize-y'} /></Field>
        </div><div className="text-[11.5px] text-[#AAA] mt-2">Files can't be uploaded yet (needs storage) — add a link to where the material lives.</div></Modal>}
      {asg && <Modal open onClose={() => setAsg(null)} title="Assign Resource" footer={<><Button variant="outline" onClick={() => setAsg(null)}>Cancel</Button><Button onClick={saveAsg}>Assign →</Button></>}>
        <div className="space-y-3"><Field label="Resource"><select value={asg.resId} onChange={e => setAsg(x => ({ ...x, resId: e.target.value }))} className={inputCls}>{lib.map(r => <option key={r.id} value={r.id}>{r.thumb} {r.title}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Assign to"><select value={asg.to} onChange={e => setAsg(x => ({ ...x, to: e.target.value }))} className={inputCls}>{Array.from({ length: 10 }, (_, i) => `Grade ${i + 1} — All`).map(g => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Due date"><input type="date" min={TODAY} value={asg.due} onChange={e => setAsg(x => ({ ...x, due: e.target.value }))} className={inputCls} /></Field></div></div></Modal>}
    </div>
  );
}

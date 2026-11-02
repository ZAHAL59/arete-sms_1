import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls } from '../../components/ui/Kit';
import { DEPARTMENTS, EXP_OPTIONS } from './constants';

const blankVac = () => ({ subj: '', dept: DEPARTMENTS[1], qual: '', exp: EXP_OPTIONS[0], skills: '', count: 1, deadline: '', priority: 'Normal', status: 'Active' });

export default function Vacancies({ hr, addVacancy, updateVacancy, go }) {
  const [vf, setVf] = useState(null);                 // null = closed, {id?,...} = open
  const [err, setErr] = useState('');
  const set = (k, v) => setVf(f => ({ ...f, [k]: v }));

  const apps = hr.applications || [];
  const strip = [
    ['Vacancies Posted', hr.vacancies.filter(v => v.status === 'Active').length], ['Applications', apps.length], ['Shortlisted', hr.candidates.filter(c => c.status === 'Shortlisted').length],
    ['Interviewed', hr.interviews.length], ['Recommended', hr.candidates.filter(c => c.status === 'Recommended').length],
  ];

  function saveVac() {
    if (!vf.subj.trim()) return setErr('Enter the subject / role.');
    if (!vf.qual.trim()) return setErr('Enter the minimum qualification.');
    const data = { subj: vf.subj.trim(), dept: vf.dept, qual: vf.qual.trim(), exp: vf.exp, skills: vf.skills, count: Math.max(1, parseInt(vf.count) || 1), deadline: vf.deadline, priority: vf.priority };
    if (vf.id) updateVacancy(vf.id, { ...data, status: vf.status }); else addVacancy(data);
    setVf(null); setErr('');
  }
  return (
    <div className="p-6">
      <PageHeader title="Vacancies & Recruitment" subtitle="Post a vacancy → CVs are filed against it → shortlist → interview → hire"
        actions={<Button onClick={() => { setVf(blankVac()); setErr(''); }}>+ Post Vacancy</Button>} />

      {/* recruitment funnel */}
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] px-4 py-4 mb-5 flex items-center justify-around overflow-x-auto shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        {strip.map(([l, n], i) => (
          <div key={l} className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center px-3"><div className="text-[26px] font-extrabold text-[#C8202E] font-mono leading-none">{n}</div><div className="text-[11.5px] text-[#777] mt-1 whitespace-nowrap">{l}</div></div>
            {i < strip.length - 1 && <span className="text-[20px] text-[#CCC]">›</span>}
          </div>))}
      </div>

      {!hr.vacancies.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">No vacancies posted yet. Click "+ Post Vacancy" to start.</div>}
      {hr.vacancies.map(v => {
        const cands = hr.candidates.filter(c => c.vacId === v.id);
        const shortlisted = cands.filter(c => c.status === 'Shortlisted').length;
        const interviewed = hr.interviews.filter(i => i.vacId === v.id).length;
        const hired = cands.filter(c => c.hired).length;
        return (
          <Collapsible key={v.id} defaultOpen className={`mb-3 !border-l-[4px] ${v.priority === 'Urgent' ? '!border-l-[#9A1822]' : '!border-l-[#C8202E]'}`}
            header={
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[14px] font-bold text-[#111]">{v.subj} Teacher</span><Badge variant={v.priority === 'Urgent' ? 'red' : 'grey'}>{v.priority}</Badge><Badge variant={v.status === 'Active' ? 'green' : 'grey'}>{v.status}</Badge></div>
                  <div className="text-[11.5px] text-[#777] mt-0.5">{v.dept} · Posted {v.posted} · Deadline {v.deadline || '—'} · {hired}/{v.count || 1} position{(v.count || 1) > 1 ? 's' : ''} filled</div></div>
                <div className="ml-auto flex gap-2"><Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setVf({ ...blankVac(), ...v }); setErr(''); }}>✎ Edit</Button>
                  <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); go('applications', v.id); }}>📥 Applications →</Button></div>
              </div>}>
            <div className="border-t border-[#E4E4E4] grid grid-cols-3 gap-5 p-4">
              <div><div className="text-[10.5px] text-[#AAA] mb-1">Requirements</div><div className="text-[13px] leading-relaxed text-[#333]">{v.qual} · {v.exp}<div className="text-[12px] text-[#777]">{v.skills || '—'}</div></div></div>
              <div className="col-span-2 flex items-center gap-6">
                {[['CVs Filed', cands.length, '#111'], ['Shortlisted', shortlisted, '#C8202E'], ['Interviewed', interviewed, '#9A1822']].map(([l, n, c]) => <div key={l} className="text-center"><div className="text-[22px] font-extrabold" style={{ color: c }}>{n}</div><div className="text-[11px] text-[#AAA]">{l}</div></div>)}
                <div className="ml-auto"><Button size="sm" variant="outline" onClick={() => go('applications', v.id)}>View CVs →</Button></div>
              </div>
            </div>
          </Collapsible>
        );
      })}

      {/* Post / Edit vacancy */}
      {vf && <Modal open onClose={() => setVf(null)} title={vf.id ? 'Edit Vacancy' : 'Post New Vacancy'} subtitle={vf.id ? vf.id : 'Candidates can apply on the Careers page once this is posted'}
        footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{err}</span><Button variant="outline" onClick={() => setVf(null)}>Cancel</Button><Button onClick={saveVac}>{vf.id ? 'Save Changes' : 'Post Vacancy'}</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Subject / Role *"><input value={vf.subj} onChange={e => set('subj', e.target.value)} placeholder="e.g. Mathematics" className={inputCls} /></Field>
          <Field label="Department"><select value={vf.dept} onChange={e => set('dept', e.target.value)} className={inputCls}>{[...new Set([...DEPARTMENTS, vf.dept])].map(d => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Minimum Qualification *"><input value={vf.qual} onChange={e => set('qual', e.target.value)} placeholder="e.g. M.Sc Maths + B.Ed" className={inputCls} /></Field>
          <Field label="Experience Required"><select value={vf.exp} onChange={e => set('exp', e.target.value)} className={inputCls}>{[...new Set([...EXP_OPTIONS, vf.exp])].map(d => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Key Skills / Requirements" className="col-span-2"><input value={vf.skills} onChange={e => set('skills', e.target.value)} placeholder="e.g. CBSE, digital tools" className={inputCls} /></Field>
          <Field label="No. of Positions"><input type="number" min={1} value={vf.count} onChange={e => set('count', e.target.value)} className={inputCls} /></Field>
          <Field label="Application Deadline"><input type="date" value={vf.deadline} onChange={e => set('deadline', e.target.value)} className={inputCls} /></Field>
          <Field label="Priority"><select value={vf.priority} onChange={e => set('priority', e.target.value)} className={inputCls}><option>Normal</option><option>Urgent</option></select></Field>
          {vf.id && <Field label="Status"><select value={vf.status} onChange={e => set('status', e.target.value)} className={inputCls}><option>Active</option><option>Filled</option><option>Closed</option></select></Field>}
        </div>
        {vf.id && vf.status !== 'Active' && <div className="mt-3 text-[12px] text-[#B45309] bg-[#FFFBEB] rounded-[6px] p-2.5">Only Active vacancies are shown on the public Careers page.</div>}
      </Modal>}

    </div>
  );
}

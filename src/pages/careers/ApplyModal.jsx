import { useState, useRef } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { QUALIFICATIONS, EXPERIENCE, MAX_CV_BYTES, CV_EXT, scoreApplication } from './constants';
import { submitApplication } from '../hr/constants';

const inp = 'w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4] bg-white font-[inherit]';
const Field = ({ label, children, className = '' }) => <div className={className}><label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{label}</label>{children}</div>;
const Section = ({ title, children }) => <div className="mb-4"><div className="text-[10.5px] font-bold text-[#C8202E] uppercase tracking-wider mb-2.5 pb-1.5 border-b border-[#FEE2E2]">{title}</div>{children}</div>;

export default function ApplyModal({ vac, onClose }) {
  const [f, setF] = useState({ name:'', dob:'', phone:'', email:'', address:'', qual:'', spec:'', exp:'', employer:'', skills:'', cover:'' });
  const [file, setFile] = useState(null); const [drag, setDrag] = useState(false);
  const [error, setError] = useState(''); const [ref, setRef] = useState(null);
  const input = useRef(null);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  function pick(fl) {
    if (!fl) return;
    const ext = '.' + fl.name.split('.').pop().toLowerCase();
    if (!CV_EXT.includes(ext)) return setError('CV must be a PDF, DOC or DOCX file.');
    if (fl.size > MAX_CV_BYTES) return setError('CV is larger than 5 MB.');
    setError(''); setFile(fl);
  }

  function submit() {
    if (!f.name.trim()) return setError('Enter your full name.');
    if (!f.phone.trim() && !f.email.trim()) return setError('Enter your phone number or email.');
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('That email address does not look right.');
    if (!f.qual) return setError('Select your qualification.');
    if (!f.exp) return setError('Select your experience level.');
    const id = 'APP-' + Date.now().toString().slice(-8);
    const score = scoreApplication(f, vac);
    submitApplication({
      id, vacId: vac.id, name: f.name.trim(), dob: f.dob, phone: f.phone.trim(), email: f.email.trim(), address: f.address.trim(),
      qual: f.qual, spec: f.spec.trim(), exp: f.exp === 'fresher' ? 'Fresher' : f.exp + ' years', employer: f.employer.trim(),
      skills: f.skills.trim(), cover: f.cover.trim(), cvFileName: file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : 'Not uploaded',
      score, hrStatus: 'Pending Review', appliedAt: new Date().toISOString(),
    });
    setRef(id); setError('');
  }

  if (ref) return (
    <Modal open onClose={onClose} title="Application Submitted!" footer={<Button onClick={onClose}>Close</Button>}>
      <div className="text-center py-4">
        <div className="text-[44px] mb-2">🎉</div>
        <p className="text-[13.5px] text-[#555] leading-relaxed mb-4">Thank you for applying to Arete Model School. Your application has been received and will be reviewed by our HR team within 5–7 working days. Shortlisted candidates will be contacted directly.</p>
        <div className="inline-block bg-[#FEF4F4] border border-[#FECACA] rounded-[8px] px-5 py-3"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">Reference number</div><div className="font-mono text-[18px] font-extrabold text-[#C8202E]">{ref}</div></div>
        <p className="text-[12px] text-[#AAA] mt-3">Please save your reference number.</p>
      </div>
    </Modal>);

  return (
    <Modal open onClose={onClose} size="lg" title={`Apply — ${vac.subj} Teacher`} subtitle={`${vac.dept} Department · ${vac.qual} required · ${vac.exp} experience`}
      footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{error}</span><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit}>Submit Application</Button></>}>
      <div className="bg-[#FEF4F4] rounded-[6px] px-3 py-2 text-[12.5px] text-[#9A1822] font-semibold mb-4">📋 {vac.subj} Teacher · {vac.dept} · {vac.qual}</div>
      <Section title="Personal Details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *"><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="As per certificates" className={inp} /></Field>
          <Field label="Date of Birth"><input type="date" value={f.dob} onChange={e => set('dob', e.target.value)} className={inp} /></Field>
          <Field label="Phone Number *"><input type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9447…" className={inp} /></Field>
          <Field label="Email Address *"><input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" className={inp} /></Field>
          <Field label="Current Address" className="col-span-2"><input value={f.address} onChange={e => set('address', e.target.value)} placeholder="City, District, State" className={inp} /></Field>
        </div>
      </Section>
      <Section title="Qualifications & Experience">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Highest Qualification *"><select value={f.qual} onChange={e => set('qual', e.target.value)} className={inp}><option value="">Select…</option>{QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}</select></Field>
          <Field label="Specialisation / Subject"><input value={f.spec} onChange={e => set('spec', e.target.value)} placeholder="e.g. Mathematics, English Literature" className={inp} /></Field>
          <Field label="Years of Teaching Experience *"><select value={f.exp} onChange={e => set('exp', e.target.value)} className={inp}><option value="">Select…</option>{EXPERIENCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Current / Last Employer"><input value={f.employer} onChange={e => set('employer', e.target.value)} placeholder="School / Institution name" className={inp} /></Field>
          <Field label="Key Skills" className="col-span-2"><input value={f.skills} onChange={e => set('skills', e.target.value)} placeholder="e.g. Digital tools, Malayalam medium, special education, sports coaching…" className={inp} /></Field>
        </div>
      </Section>
      <Section title="Upload CV / Résumé">
        <div onClick={() => input.current.click()} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`cursor-pointer text-center rounded-[8px] border-2 border-dashed py-5 transition-colors ${drag ? 'border-[#C8202E] bg-[#FEF4F4]' : 'border-[#E4E4E4] hover:border-[#C8202E] hover:bg-[#FEF4F4]'}`}>
          <input ref={input} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => pick(e.target.files[0])} />
          <div className="text-[22px]">📎</div><div className="text-[13px] font-semibold text-[#333]">Click to upload or drag & drop your CV</div><div className="text-[11.5px] text-[#AAA]">PDF, DOC or DOCX · Max 5 MB</div>
        </div>
        {file && <div className="mt-2 text-[12.5px] text-[#166534] font-semibold">✓ File selected: {file.name} ({Math.round(file.size / 1024)} KB)</div>}
      </Section>
      <Section title="Cover Note (optional but recommended)">
        <textarea rows={3} value={f.cover} onChange={e => set('cover', e.target.value)} className={inp + ' resize-y'} placeholder="Tell us briefly why you want to join Arete Model School and what makes you suitable for this position…" />
      </Section>
    </Modal>
  );
}

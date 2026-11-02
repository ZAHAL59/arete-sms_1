import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { SESSION_TYPES, getMaterials, TODAY } from '../constants';
import useStore from '../../../store/useStore';

export default function SessionLogModal({ student, onClose }) {
  const addSessionLog = useStore(s => s.addSessionLog);
  const [type, setType] = useState('');
  const [date, setDate] = useState(TODAY);
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [obs, setObs] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [engagement, setEngagement] = useState(0);

  function save() {
    if (!type || !topic.trim() || !obs.trim()) return;
    addSessionLog({ id:'SL'+Date.now(), stuId:student.id, stuName:student.name, date, type,
      topic:topic.trim(), material, observation:obs.trim(), followUp:followUp.trim(), engagement, teacher:'Ms. Latha R.' });
    onClose();
  }

  return (
    <Modal open onClose={onClose} size="lg" title="Log Session"
      subtitle={student.name + ' · ' + student.cls + ' ' + student.section}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>✓ Save Session Log</Button></>}
    >
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Session Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4]"/>
        </div>
        <Select label="Session Type *" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">— Select type —</option>
          {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Topic / Chapter *</label>
          <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Algebra Ch.2"
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4]"/>
        </div>
        <Select label="Material Used" value={material} onChange={e=>setMaterial(e.target.value)}>
          <option value="">— None —</option>
          {getMaterials().map(m => <option key={m.id} value={m.title}>{m.title}</option>)}
        </Select>
      </div>
      <div className="mb-3">
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Observation *</label>
        <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={3}
          placeholder="How did this student engage? Any breakthrough or concern?"
          className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] resize-y font-[inherit]"/>
      </div>
      <div className="mb-3">
        <label className="block text-[11.5px] font-semibold text-[#333] mb-2">Engagement</label>
        <div className="flex gap-1 items-center">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setEngagement(n)}
              className="text-[24px] bg-none border-none cursor-pointer p-0.5 hover:scale-110 transition-transform"
              style={{color: n <= engagement ? '#F59E0B' : '#DDD'}}>{n <= engagement ? '★' : '☆'}</button>
          ))}
          <span className="text-[11px] text-[#AAA] ml-2">Click to rate 1–5</span>
        </div>
      </div>
      <div>
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Follow-up Action</label>
        <input value={followUp} onChange={e=>setFollowUp(e.target.value)}
          placeholder="e.g. Needs more practice, Excelled — extend with bonus problems"
          className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
      </div>
    </Modal>
  );
}

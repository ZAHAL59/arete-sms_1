import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { useState } from 'react';

const REASONS = ['Sick / Unwell','Family function','Transport issue','Left early with parent','Unknown / No information','Other'];

export default function AbsenceNoteModal({ studentName, status, onSave, onSkip }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [extra, setExtra] = useState('');
  return (
    <Modal open onClose={onSkip}
      title={`Note for ${studentName} (${status === 'A' ? 'Absent' : 'Late'})`}
      subtitle="Optional — logged with the attendance record"
      footer={<><Button variant="outline" onClick={onSkip}>Skip</Button><Button onClick={() => onSave(reason, extra)}>Save Note</Button></>}
    >
      <Select label="Reason" value={reason} onChange={e=>setReason(e.target.value)}>
        {REASONS.map(r => <option key={r}>{r}</option>)}
      </Select>
      <div>
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Additional note</label>
        <input value={extra} onChange={e=>setExtra(e.target.value)} placeholder="Optional details..."
          className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
      </div>
    </Modal>
  );
}

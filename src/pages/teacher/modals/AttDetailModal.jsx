import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import useStore from '../../../store/useStore';
import { COLORS } from '../constants';

const REASONS = ['Marking error — corrected','Student arrived late (initially marked absent)','Medical certificate received','Parent confirmed absence','On-duty / school activity','Other'];

export default function AttDetailModal({ attKey, onClose }) {
  const db = useStore(s => s.db);
  const attLog = useStore(s => s.attLog);
  const absNotes = useStore(s => s.absNotes);
  const editAttendance = useStore(s => s.editAttendance);

  const [editStu, setEditStu] = useState(null);
  const [newStatus, setNewStatus] = useState('P');
  const [reason, setReason] = useState('');
  const [extra, setExtra] = useState('');

  const dateStr = attKey.slice(-10);
  const clsRaw  = attKey.slice(0,-11);
  const clsLabel = clsRaw.replace(/Grade(\d)/,'Grade $1').replace(/([0-9])([A-Z])$/,'$1 $2').trim();
  const log = attLog[attKey] || {};

  const students = db.students.filter(s =>
    (s.cls.replace(/\s+/g,'') + (s.section||'')) === clsRaw
  );

  let p=0,a=0,l=0;
  Object.values(log).forEach(v => { if(v==='P')p++;else if(v==='A')a++;else if(v==='L')l++; });

  function confirmEdit() {
    if (!reason) return;
    editAttendance(attKey, editStu.id, newStatus, reason, extra);
    setEditStu(null); setReason(''); setExtra('');
  }

  if (editStu) return (
    <Modal open onClose={() => setEditStu(null)} title={`Edit — ${editStu.name}`}
      subtitle="Change status and give a reason"
      footer={<><Button variant="outline" onClick={() => setEditStu(null)}>Cancel</Button><Button onClick={confirmEdit}>Save Change</Button></>}
    >
      <div className="mb-4">
        <label className="block text-[11.5px] font-semibold text-[#333] mb-2">New Status</label>
        <div className="flex gap-3">
          {[['P','#166534','#F0FDF4','#BBF7D0'],['L','#B45309','#FFFBEB','#FEF08A'],['A','#DC2626','#FEF2F2','#FECACA']].map(([s,col,bg,border]) => (
            <button key={s} onClick={() => setNewStatus(s)}
              className="w-16 h-10 rounded-[6px] text-[14px] font-bold border-2 cursor-pointer transition-all"
              style={{ background: newStatus===s ? col : bg, color: newStatus===s ? '#fff' : col, borderColor: newStatus===s ? col : border }}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Reason *</label>
        <select value={reason} onChange={e=>setReason(e.target.value)}
          className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]">
          <option value="">— Select reason —</option>
          {REASONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Note</label>
        <input value={extra} onChange={e=>setExtra(e.target.value)} placeholder="Optional details..."
          className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
      </div>
    </Modal>
  );

  return (
    <Modal open onClose={onClose} size="lg"
      title={clsLabel + ' Attendance'}
      subtitle={new Date(dateStr+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="flex gap-3 mb-4">
        {[['#166534','#F0FDF4','#BBF7D0',p,'Present'],['#DC2626','#FEF2F2','#FECACA',a,'Absent'],['#B45309','#FFFBEB','#FEF08A',l,'Late'],
          ['#AAA','#F8F8F8','#E4E4E4',students.length-p-a-l,'Unmarked']].map(([col,bg,border,val,label]) => (
          <div key={label} className="flex-1 text-center p-3 rounded-[8px]" style={{background:bg,border:`1px solid ${border}`}}>
            <div className="text-[20px] font-extrabold" style={{color:col}}>{val}</div>
            <div className="text-[11px] font-semibold" style={{color:col}}>{label}</div>
          </div>
        ))}
      </div>
      <div className="border border-[#E4E4E4] rounded-[8px] overflow-hidden">
        {students.map((s,i) => {
          const status = log[s.id] || 'x';
          const noteKey = attKey + '-' + s.id;
          const note = absNotes[noteKey];
          const init = s.name.split(' ').map(w=>w[0]).join('').slice(0,2);
          return (
            <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
              <div style={{background:COLORS[i%COLORS.length]}} className="w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{init}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[#111]">{s.name}</div>
                {note && <div className="text-[11px] text-[#B45309]">{note.reason}{note.extra?' — '+note.extra:''}</div>}
              </div>
              <Badge variant={status==='P'?'green':status==='A'?'red':status==='L'?'amber':'grey'}>
                {status==='P'?'Present':status==='A'?'Absent':status==='L'?'Late':'Unmarked'}
              </Badge>
              <button onClick={() => { setEditStu(s); setNewStatus(status==='x'?'P':status); }}
                className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none ml-1">✎ Edit</button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { NOTE_CATS } from './constants';

const CAT_VARIANT = {
  'Academic observation':'grey','Behavioural note':'amber','Health concern':'red',
  'Parent communication':'green','Achievement / Milestone':'green','Attendance concern':'red','Other':'grey'
};

export default function MyNotes() {
  const db = useStore(s => s.db);
  const myNotes = useStore(s => s.myNotes);
  const addNote = useStore(s => s.addNote);
  const deleteNote = useStore(s => s.deleteNote);

  const [open, setOpen] = useState(false);
  const [stuId, setStuId] = useState('');
  const [cat,   setCat]   = useState(NOTE_CATS[0]);
  const [text,  setText]  = useState('');

  function save() {
    if (!stuId || !text.trim()) return;
    const s = db.students.find(x => x.id === stuId);
    addNote({ id:'N'+Date.now(), stuId, stuName:s?.name||stuId, cls:s?.cls||'', cat,
      text:text.trim(), date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) });
    setOpen(false); setStuId(''); setText(''); setCat(NOTE_CATS[0]);
  }

  return (
    <div className="p-6">
      <PageHeader title="My Notes" subtitle="Private — only visible to you"
        actions={<Button onClick={() => setOpen(true)}>+ Add Note</Button>}
      />

      {!myNotes.length
        ? <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">No notes yet — click Add Note</div>
        : <div className="space-y-2">
            {myNotes.map((n,i) => (
              <div key={n.id} className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8]">
                  <Badge variant={CAT_VARIANT[n.cat]||'grey'}>{n.cat}</Badge>
                  <span className="font-bold text-[13px] text-[#111]">{n.stuName}</span>
                  <span className="text-[12px] text-[#AAA]">{n.cls}</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-[11.5px] text-[#AAA]">{n.date}</span>
                    <button onClick={() => deleteNote(n.id)}
                      className="text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 rounded cursor-pointer hover:bg-[#FEE2E2]">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="px-4 py-3 text-[13.5px] text-[#333] leading-relaxed">{n.text}</div>
              </div>
            ))}
          </div>
      }

      <Modal open={open} onClose={() => setOpen(false)} title="Add Student Note" subtitle="Private — only visible to you"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <Select label="Student" value={stuId} onChange={e=>setStuId(e.target.value)}>
          <option value="">— Select student —</option>
          {db.students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cls})</option>)}
        </Select>
        <Select label="Category" value={cat} onChange={e=>setCat(e.target.value)}>
          {NOTE_CATS.map(c => <option key={c}>{c}</option>)}
        </Select>
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Note</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write your note..." rows={4}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] font-[inherit] outline-none focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4] resize-y"/>
        </div>
      </Modal>
    </div>
  );
}

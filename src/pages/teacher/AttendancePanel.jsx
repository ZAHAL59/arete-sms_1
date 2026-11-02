import { useState } from 'react';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import AbsenceNoteModal from './modals/AbsenceNoteModal';
import { COLORS, TODAY } from './constants';

export default function AttendancePanel({ cls, date, onClose, onSaved }) {
  const db       = useStore(s => s.db);
  const attLog   = useStore(s => s.attLog);
  const absNotes = useStore(s => s.absNotes);
  const markStudent    = useStore(s => s.markStudent);
  const setAbsNote     = useStore(s => s.setAbsNote);
  const saveAttendance = useStore(s => s.saveAttendance);

  const [absModal, setAbsModal] = useState(null); // { stuId, name, status }

  const students = db.students.filter(s => `${s.cls} ${s.section}`.trim() === cls);
  const key = cls.replace(/\s+/g,'') + '-' + date;
  const log = attLog[key] || {};

  let p=0,a=0,l=0;
  Object.values(log).forEach(v => { if(v==='P')p++;else if(v==='A')a++;else if(v==='L')l++; });

  function mark(stuId, stuName, status) {
    markStudent(cls, date, stuId, status);
    if (status === 'A' || status === 'L') setAbsModal({ stuId, name:stuName, status });
  }

  function markAll(status) {
    students.forEach(s => markStudent(cls, date, s.id, status));
  }

  function save() {
    saveAttendance(cls, date);
    onSaved?.();
    onClose();
  }

  const dateLabel = new Date(date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  return (
    <>
      <div className="mt-5 bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_4px_18px_rgba(0,0,0,.11)]">
        {/* Header */}
        <div className="bg-[#C8202E] px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[14px] font-bold text-white">Attendance — {cls}</div>
            <div className="text-[12px] text-white/70">{dateLabel} · {students.length} students</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-3 text-[12.5px]">
              <span className="text-[#A7F3D0] font-semibold">{p} P</span>
              <span className="text-[#FECACA] font-semibold">{a} A</span>
              <span className="text-[#FDE68A] font-semibold">{l} L</span>
            </div>
            <button onClick={save} className="px-3 py-1.5 bg-white/20 text-white text-[12px] font-semibold rounded-[6px] border border-white/30 cursor-pointer hover:bg-white/30">💾 Save</button>
            <button onClick={onClose} className="text-white/60 hover:text-white text-[20px] bg-none border-none cursor-pointer leading-none">×</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2 px-5 py-2.5 border-b border-[#E4E4E4] bg-[#F8F8F8] flex-wrap items-center">
          <Button size="sm" variant="outline" onClick={() => markAll('P')}>✓ All Present</Button>
          <Button size="sm" variant="outline" onClick={() => markAll('A')}>✗ All Absent</Button>
          <span className="text-[11.5px] text-[#AAA] ml-1">P = Present · A = Absent · L = Late</span>
        </div>

        {/* Student rows */}
        {students.map((s, i) => {
          const status = log[s.id] || '';
          const noteKey = key + '-' + s.id;
          const note = absNotes[noteKey];
          const init = s.name.split(' ').map(w=>w[0]).join('').slice(0,2);
          const rowBg = status==='P' ? 'bg-[#F6FEF9]' : status==='A' ? 'bg-[#FFF5F5]' : status==='L' ? 'bg-[#FFFDF0]' : 'bg-white';
          return (
            <div key={s.id} className={`flex items-center gap-3 px-5 py-2.5 border-b border-[#E4E4E4] last:border-b-0 ${rowBg}`}>
              <div style={{background:COLORS[i%COLORS.length]}} className="w-9 h-9 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{init}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#111] truncate">{s.name}</div>
                <div className="text-[11px] text-[#AAA] truncate">
                  Roll {s.roll} · {s.parentPhone}
                  {note && <span className="text-[#B45309] ml-2">📝 {note.reason}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {[['P','#166534','#F0FDF4','#BBF7D0'],['L','#B45309','#FFFBEB','#FEF08A'],['A','#DC2626','#FEF2F2','#FECACA']].map(([st,col,bg,bdr]) => (
                  <button key={st} onClick={() => mark(s.id, s.name, st)}
                    className="w-9 h-8 rounded-[6px] text-[12px] font-bold border-[1.5px] cursor-pointer transition-all"
                    style={{
                      background: status===st ? col : bg,
                      color: status===st ? '#fff' : col,
                      borderColor: status===st ? col : bdr,
                      boxShadow: status===st ? `0 2px 6px ${col}55` : 'none'
                    }}>{st}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {absModal && (
        <AbsenceNoteModal
          studentName={absModal.name}
          status={absModal.status}
          onSave={(reason, extra) => { setAbsNote(cls, date, absModal.stuId, reason, extra); setAbsModal(null); }}
          onSkip={() => setAbsModal(null)}
        />
      )}
    </>
  );
}

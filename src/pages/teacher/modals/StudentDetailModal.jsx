import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Collapsible from '../../../components/ui/Collapsible';
import { TYPE_VARIANT } from '../constants';
import useStore from '../../../store/useStore';
import SessionLogModal from './SessionLogModal';

const FIELDS = s => [
  ['Date of Birth', s.dob||'—'], ['Parent', s.parentName||'—'],
  ['Parent Phone', s.parentPhone||'—'], ['Learning Style', s.learningStyle||'—'],
  ['Diet', s.diet||'—'], ['Languages', s.langs||'—'],
  ['Hobbies', s.hobbies||'—'], ['Health', s.health||'None'],
  ['Behavioural', s.behav||'—'], ['Special Needs', s.needs&&s.needs!=='None'?s.needs:'None'],
  ['Bus Route', s.busRoute||'Day Scholar'], ['Boarding', s.boarding?'Yes':'No'],
];

export default function StudentDetailModal({ student, onClose, onMarkAtt }) {
  const sessionLogs = useStore(s => s.sessionLogs);
  const [logOpen, setLogOpen] = useState(false);

  const myLogs = sessionLogs.filter(l => l.stuId === student.id);
  const milestones = student.milestones || [];

  return (
    <>
      <Modal open onClose={onClose} size="lg"
        title={student.name}
        subtitle={`${student.cls} ${student.section} · Roll ${student.roll||'—'} · Admitted ${student.adm}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="outline" onClick={() => setLogOpen(true)} className="!bg-[#F5F3FF] !text-[#6D28D9] !border-[#DDD6FE]">+ Log Session</Button>
            {onMarkAtt && <Button onClick={onMarkAtt}>Mark Attendance →</Button>}
          </div>
        }
      >
        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {FIELDS(student).map(([l,v]) => (
            <div key={l} className="bg-[#F8F8F8] p-2.5 rounded-[6px]">
              <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{l}</div>
              <div className="text-[13px] text-[#333]">{v}</div>
            </div>
          ))}
        </div>

        {student.notes && (
          <div className="bg-[#FFFBEB] border border-[#FEF08A] rounded-[6px] p-3 mb-4 text-[13px] text-[#B45309]">
            📝 {student.notes}
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <Collapsible defaultOpen header={<span className="text-[13px] font-bold text-[#111]">Progress Milestones ({milestones.length})</span>} className="mb-3">
            <div className="p-3 border-t border-[#E4E4E4] space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-3 text-[12.5px]">
                  <span className="font-mono text-[#AAA] flex-shrink-0">{m.date}</span>
                  <span className="text-[#555]">{m.text}</span>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {/* Session logs */}
        <Collapsible defaultOpen={myLogs.length > 0}
          header={<span className="text-[13px] font-bold text-[#111]">Session Logs ({myLogs.length})</span>}>
          <div className="border-t border-[#E4E4E4]">
            {!myLogs.length
              ? <div className="p-4 text-[12.5px] text-[#AAA] text-center">No sessions logged yet</div>
              : myLogs.slice().reverse().map(l => {
                  const stars = '★'.repeat(l.engagement||0) + '☆'.repeat(5-(l.engagement||0));
                  return (
                    <div key={l.id} className="px-4 py-3 border-b border-[#E4E4E4] last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={TYPE_VARIANT[l.type]||'grey'}>{l.type}</Badge>
                        <span className="font-semibold text-[13px] text-[#111]">{l.topic}</span>
                        <span className="ml-auto font-mono text-[11px] text-[#AAA]">{l.date}</span>
                      </div>
                      <div className="text-[12.5px] text-[#555] mb-1">{l.observation}</div>
                      <div className="flex items-center gap-3 text-[11.5px]">
                        <span style={{color:'#F59E0B'}}>{stars}</span>
                        {l.followUp && <span className="text-[#B45309]">Follow-up: {l.followUp}</span>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </Collapsible>
      </Modal>

      {logOpen && <SessionLogModal student={student} onClose={() => setLogOpen(false)} />}
    </>
  );
}

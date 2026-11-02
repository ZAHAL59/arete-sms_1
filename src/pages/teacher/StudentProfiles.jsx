import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Collapsible from '../../components/ui/Collapsible';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StudentDetailModal from './modals/StudentDetailModal';
import SessionLogModal from './modals/SessionLogModal';
import { COLORS, TEACHER } from './constants';

export default function StudentProfiles() {
  const db = useStore(s => s.db);
  const [q, setQ]     = useState('');
  const [cls, setCls] = useState('');
  const [detail, setDetail] = useState(null);
  const [logStu, setLogStu] = useState(null);

  const students = db.students.filter(s => {
    const cm = !cls || `${s.cls} ${s.section}`.trim() === cls;
    const qm = !q   || s.name.toLowerCase().includes(q.toLowerCase());
    return cm && qm;
  });

  return (
    <div className="p-6">
      <PageHeader title="Student Profiles"
        subtitle="Health, learning style, development info and parent contacts"
        actions={
          <div className="flex gap-2 flex-wrap">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search student..."
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] w-44"/>
            <select value={cls} onChange={e=>setCls(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
              <option value="">All Classes</option>
              {TEACHER.classes.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        }
      />

      {!students.length
        ? <div className="text-center py-16 text-[#AAA]">No students found</div>
        : students.map((s, i) => {
            const init = s.name.split(' ').map(w=>w[0]).join('').slice(0,2);
            return (
              <Collapsible key={s.id} className="mb-2"
                header={
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div style={{background:COLORS[i%COLORS.length]}} className="w-9 h-9 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{init}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold text-[#111]">{s.name}</div>
                      <div className="text-[11.5px] text-[#777] mt-0.5">{s.cls} {s.section} · {s.parentName}</div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap flex-shrink-0 items-center">
                      {s.learningStyle && <Badge variant="grey">{s.learningStyle}</Badge>}
                      {s.boarding      && <Badge variant="green">Boarding</Badge>}
                      {s.needs && s.needs!=='None' && <Badge variant="amber">SEN</Badge>}
                      <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setLogStu(s);}}>+ Log</Button>
                      <Button size="sm" variant="outline" onClick={e=>{e.stopPropagation();setDetail(s);}}>View</Button>
                    </div>
                  </div>
                }
              >
                <div className="border-t border-[#E4E4E4]">
                  <div className="grid grid-cols-3 gap-2 p-4">
                    {[['Hobbies',s.hobbies||'—'],['Languages',s.langs||'—'],['Health',s.health||'None'],
                      ['Behavioural',s.behav||'—'],['Parent Phone',s.parentPhone||'—'],['Diet',s.diet||'—']
                    ].map(([l,v]) => (
                      <div key={l} className="bg-[#F8F8F8] p-2.5 rounded-[6px]">
                        <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{l}</div>
                        <div className="text-[12.5px] text-[#333]">{v}</div>
                      </div>
                    ))}
                  </div>
                  {(s.milestones||[]).length > 0 && (
                    <div className="px-4 pb-4 border-t border-[#E4E4E4] pt-3">
                      <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-2">Milestones</div>
                      {s.milestones.map((m,j) => (
                        <div key={j} className="text-[12px] text-[#555] mb-1.5 flex gap-2">
                          <span className="font-mono text-[#AAA] flex-shrink-0">{m.date}</span>
                          <span>{m.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Collapsible>
            );
          })
      }

      {detail && <StudentDetailModal student={detail} onClose={() => setDetail(null)} />}
      {logStu && <SessionLogModal student={logStu} onClose={() => setLogStu(null)} />}
    </div>
  );
}

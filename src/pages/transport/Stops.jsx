import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Collapsible from '../../components/ui/Collapsible';
import { Kpi } from '../../components/ui/Kit';
import { TODAY } from './constants';

export default function Stops({ t, setBoarding }) {
  const db = useStore(s => s.db);
  const log = t.boarding[TODAY] || {};
  const busStudents = db.students.filter(s => s.busRoute);
  const absent = busStudents.filter(s => log[s.id] === 'absent').length;

  return (
    <div className="p-6">
      <PageHeader title="Stop Tracking" subtitle="Tap a student's badge to mark them absent from the bus today" />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Students on Buses" value={busStudents.length} note={`Across ${db.routes.length} routes`} />
        <Kpi label="Boarded Today" value={busStudents.length - absent} note="Confirmed" color="#166534" />
        <Kpi label="Not Boarded" value={absent} note="Requires attention" color={absent ? '#DC2626' : '#166534'} />
        <Kpi label="Routes" value={db.routes.length} note="Active" color="#1A5FB4" />
      </div>

      {db.routes.map(r => {
        const students = busStudents.filter(s => s.busRoute === r.id);
        const missing = students.filter(s => log[s.id] === 'absent').length;
        return (
          <Collapsible key={r.id} defaultOpen={students.length > 0} className="mb-2"
            header={
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1"><div className="text-[13.5px] font-bold text-[#111]">{r.name}</div><div className="text-[11.5px] text-[#777]">{r.driver} · {students.length} students</div></div>
                <Badge variant={missing ? 'red' : 'green'}>{missing ? `${missing} not boarded` : '✓ All clear'}</Badge>
              </div>
            }>
            {!students.length
              ? <div className="p-4 text-[13px] text-[#AAA] border-t border-[#E4E4E4]">No students assigned to this route yet</div>
              : students.map(s => {
                  const out = log[s.id] === 'absent';
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-[#E4E4E4] hover:bg-[#F8F8F8]">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: out ? '#DC2626' : '#166534' }} />
                      <div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{s.name}</div><div className="text-[11.5px] text-[#777]">{s.cls} {s.section} · Parent: {s.parentPhone}</div></div>
                      <button onClick={() => setBoarding(s.id, out ? 'boarded' : 'absent')} className="bg-none border-none cursor-pointer">
                        <Badge variant={out ? 'red' : 'green'}>{out ? '✗ Not boarded' : '✓ Boarded'}</Badge>
                      </button>
                    </div>
                  );
                })}
          </Collapsible>
        );
      })}
    </div>
  );
}

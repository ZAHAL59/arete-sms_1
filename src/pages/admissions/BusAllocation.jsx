import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Collapsible from '../../components/ui/Collapsible';
import Badge from '../../components/ui/Badge';

export default function BusAllocation() {
  const db = useStore(s => s.db);
  return (
    <div className="p-6">
      <PageHeader title="Bus Allocation" subtitle="Students assigned per route" />
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {label:'Total Bus Students', value:db.students.filter(s=>s.travel==='Bus').length, color:'#C8202E'},
          {label:'Active Routes',      value:db.routes.length, color:'#1A5FB4'},
          {label:'Day Scholars',       value:db.students.filter(s=>s.travel!=='Bus'&&!s.boarding).length, color:'#166534'},
        ].map(k=>(
          <div key={k.label} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]"
            style={{borderLeft:`3px solid ${k.color}`}}>
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.label}</div>
            <div className="text-[22px] font-extrabold" style={{color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {db.routes.map(r => {
        const students = db.students.filter(s=>s.busRoute===r.id&&s.status==='Active');
        const classes  = [...new Set(students.map(s=>s.cls))].sort().join(', ') || 'No students';
        return (
          <Collapsible key={r.id} className="mb-2"
            header={
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[16px] flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#C8202E,#9A1822)'}}>🚌</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111]">{r.name}</div>
                  <div className="text-[11.5px] text-[#777] mt-0.5">{r.driver} · Dep: {r.dept} · {classes}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge variant="grey">{students.length} student{students.length!==1?'s':''}</Badge>
                  <Badge variant="green">{r.status}</Badge>
                </div>
              </div>
            }
          >
            {!students.length
              ? <div className="p-4 text-center text-[#AAA] border-t border-[#E4E4E4]">No students on this route</div>
              : <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
                  <thead><tr>{['Student','Class','Parent','Phone'].map(h=>
                    <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
                  )}</tr></thead>
                  <tbody>
                    {students.map(s=>(
                      <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                        <td className="px-4 py-2.5 font-semibold text-[#111]">{s.name}</td>
                        <td className="px-4 py-2.5 text-[#555]">{s.cls} {s.section}</td>
                        <td className="px-4 py-2.5 text-[#555]">{s.parentName}</td>
                        <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#555]">{s.parentPhone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </Collapsible>
        );
      })}
    </div>
  );
}

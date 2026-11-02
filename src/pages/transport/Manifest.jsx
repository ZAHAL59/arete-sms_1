import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Button from '../../components/ui/Button';
import Collapsible from '../../components/ui/Collapsible';
import { Th } from '../../components/ui/Kit';

export default function Manifest() {
  const db = useStore(s => s.db);
  return (
    <div className="p-6">
      <PageHeader title="Daily Manifest" subtitle={new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        actions={<Button variant="outline" onClick={() => window.print()}>🖨 Print Manifest</Button>} />
      {db.routes.map(r => {
        const students = db.students.filter(s => s.busRoute === r.id && s.status === 'Active');
        return (
          <Collapsible key={r.id} defaultOpen className="mb-3"
            header={<div className="flex-1"><div className="text-[13.5px] font-bold text-[#111]">{r.name}</div>
              <div className="text-[11.5px] text-[#777]">Driver: {r.driver} · {r.phone} · Dept: {r.dept}</div></div>}>
            <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
              <thead><tr><Th>#</Th><Th>Student</Th><Th>Class</Th><Th>Parent</Th><Th>Parent Phone</Th></tr></thead>
              <tbody>
                {!students.length
                  ? <tr><td colSpan={5} className="text-center py-6 text-[#AAA]">No students on this route</td></tr>
                  : students.map((s, i) => (
                    <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-4 py-2.5 text-[#AAA]">{i + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-[#111]">{s.name}</td>
                      <td className="px-4 py-2.5 text-[#555]">{s.cls} {s.section}</td>
                      <td className="px-4 py-2.5 text-[#555]">{s.parentName}</td>
                      <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#555]">{s.parentPhone}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Collapsible>
        );
      })}
    </div>
  );
}

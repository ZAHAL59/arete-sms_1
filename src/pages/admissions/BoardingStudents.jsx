import { useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import { Kpi, Th } from '../../components/ui/Kit';
import { loadHostel } from '../hostel/constants';
import { getFeeStructure, fmt } from '../finance/constants';

export default function BoardingStudents() {
  const db = useStore(s => s.db);
  const h = useMemo(loadHostel, []);
  const boarders = db.students.filter(s => s.boarding);
  const roomOf = n => h.rooms.find(r => r.inmates.includes(n))?.id;
  const monthly = s => Math.round((getFeeStructure()[s.cls]?.hostel || 0) / 12);
  const unplaced = boarders.filter(s => !roomOf(s.name)).length;
  return (
    <div className="p-6">
      <PageHeader title="Boarding Students" subtitle="Room allocation and meals are managed in the Hostel portal" />
      <div className="grid grid-cols-3 gap-3 mb-5"><Kpi label="Boarders" value={boarders.length} note="In hostel" /><Kpi label="Room allotted" value={boarders.length - unplaced} note="Placed" color="#166534" /><Kpi label="Awaiting a room" value={unplaced} note="Allocate in Hostel" color={unplaced ? '#DC2626' : '#166534'} /></div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]"><table className="w-full border-collapse text-[13px]">
        <thead><tr><Th>Student</Th><Th>Class</Th><Th>Admitted</Th><Th>Room</Th><Th>Hostel fee</Th><Th>Status</Th></tr></thead>
        <tbody>{!boarders.length ? <tr><td colSpan={6} className="text-center py-10 text-[#AAA]">No boarding students</td></tr> : boarders.map(s => (
          <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]"><td className="px-4 py-2.5 font-semibold text-[#111]">{s.name}</td><td className="px-4 py-2.5 text-[#555]">{s.cls} {s.section}</td><td className="px-4 py-2.5 text-[#555]">{s.adm}</td>
            <td className="px-4 py-2.5">{roomOf(s.name) ? <Badge variant="blue">{roomOf(s.name)}</Badge> : <Badge variant="amber">Not allotted</Badge>}</td><td className="px-4 py-2.5 font-semibold text-[#166534]">{fmt(monthly(s))}/mo</td><td className="px-4 py-2.5"><Badge variant="green">{s.status || 'Active'}</Badge></td></tr>))}</tbody></table></div>
    </div>
  );
}

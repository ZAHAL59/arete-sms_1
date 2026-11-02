import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Collapsible from '../../components/ui/Collapsible';
import { Kpi } from './ui';

export default function Rooms({ h, removeInmate, go }) {
  const db = useStore(s => s.db);
  const rooms = h.rooms.filter(r => r.type !== 'Staff');
  const cap = rooms.reduce((a, r) => a + r.capacity, 0);
  const occ = rooms.reduce((a, r) => a + r.inmates.length, 0);
  const full = rooms.filter(r => r.inmates.length >= r.capacity).length;

  // Boarders in the student records who are not in any room yet
  const placed = new Set(h.rooms.flatMap(r => r.inmates));
  const unplaced = db.students.filter(s => s.boarding && !placed.has(s.name));

  return (
    <div className="p-6">
      <PageHeader title="Room Allocation" subtitle="Beds, occupancy and who is in which room — new admissions and room allocation are done together"
        actions={<Button onClick={() => go('admit')}>+ Admit Student to Hostel</Button>} />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Beds" value={cap} note={`Across ${rooms.length} rooms`} />
        <Kpi label="Occupied" value={occ} note={`${cap ? Math.round(occ / cap * 100) : 0}% occupancy`} color="#1A5FB4" />
        <Kpi label="Available" value={cap - occ} note="Beds free" color="#166534" />
        <Kpi label="Full Rooms" value={full} note="No vacancies" color="#DC2626" />
      </div>

      {unplaced.length > 0 && (
        <div className="flex items-center gap-3 bg-[#FFFBEB] border border-[#FEF08A] rounded-[8px] px-4 py-3 mb-4 text-[12.5px] text-[#B45309]">
          <span className="flex-1">⚠️ {unplaced.length} boarder{unplaced.length > 1 ? 's' : ''} without a room: <strong>{unplaced.map(s => s.name).join(', ')}</strong></span>
          <Button size="sm" onClick={() => go('admit')}>Complete admission →</Button>
        </div>)}

      {h.rooms.map(r => {
        const inmates = r.inmates;
        const isStaff = r.type === 'Staff';
        const pct = Math.round(inmates.length / r.capacity * 100);
        return (
          <Collapsible key={r.id} className="mb-2"
            header={
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-[8px] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#C8202E,#9A1822)' }}>{r.id}</div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-bold text-[#111]">Room {r.id}</div>
                  <div className="text-[11.5px] text-[#777]">{r.type} · {inmates.length}/{r.capacity} beds</div>
                </div>
                {!isStaff && (
                  <div className="h-1.5 bg-[#E4E4E4] rounded-full w-16 overflow-hidden">
                    <div className="h-full bg-[#C8202E] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                )}
                <Badge variant={isStaff ? 'grey' : inmates.length >= r.capacity ? 'red' : inmates.length === 0 ? 'grey' : 'green'}>
                  {isStaff ? 'Staff' : inmates.length >= r.capacity ? 'Full' : inmates.length === 0 ? 'Empty' : 'Available'}
                </Badge>
              </div>
            }>
            <div className="border-t border-[#E4E4E4]">
              {!inmates.length
                ? <div className="p-4 text-center text-[#AAA] text-[13px]">No inmates in this room</div>
                : inmates.map(n => (
                    <div key={n} className="flex items-center px-4 py-2.5 border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <span className="flex-1 text-[13px] font-semibold text-[#111]">{n}</span>
                      {!isStaff && <button onClick={() => removeInmate(r.id, n)} className="text-[11px] font-semibold text-[#DC2626] underline cursor-pointer bg-none border-none" title="Frees the bed; re-admit from Hostel Admission">Remove</button>}
                    </div>
                  ))}
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}

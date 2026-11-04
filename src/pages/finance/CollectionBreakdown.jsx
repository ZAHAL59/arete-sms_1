import { useState, useId } from 'react';
import useStore from '../../store/useStore';
import { Th } from '../../components/ui/Kit';
import { fmt, getStudentDue, countsTowardDue } from './constants';

// One "Collection" section with a dropdown: break the fees collected down by grade or by category.
export default function CollectionBreakdown({ allPayments }) {
  const db = useStore(s => s.db); const id = useId();
  const [by, setBy] = useState('grade');

  const grades = [...new Set(db.students.map(s => s.cls))].sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
  const gradeRows = grades.map(g => {
    const sts = db.students.filter(s => s.cls === g), billed = sts.reduce((a, s) => a + getStudentDue(s), 0);
    const col = allPayments.filter(p => countsTowardDue(p) && sts.some(s => s.id === p.studentId)).reduce((a, p) => a + p.amount, 0);
    return { g, billed, col, pct: billed ? Math.round(col / billed * 100) : 0 };
  });

  const totalCollected = allPayments.filter(p => p.studentId && countsTowardDue(p)).reduce((a, p) => a + p.amount, 0);
  const byCategory = {};
  allPayments.filter(p => p.studentId).forEach(p => { const c = byCategory[p.category] || (byCategory[p.category] = { count: 0, total: 0 }); c.count++; c.total += p.amount; });

  return (
    <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)] mb-4">
      <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex items-center justify-between flex-wrap gap-2">
        <div className="text-[13.5px] font-bold text-[#111]">Collection</div>
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="text-[11.5px] font-semibold text-[#666666]">View</label>
          <select id={id} value={by} onChange={e => setBy(e.target.value)} className="px-2.5 py-1.5 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[12.5px] font-semibold outline-none focus:border-[#71717A] bg-white font-[inherit] cursor-pointer">
            <option value="grade">By grade</option>
            <option value="category">By category</option>
          </select>
        </div>
      </div>

      {by === 'grade' ? (
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Grade</Th><Th>Billed</Th><Th>Collected</Th><Th>Progress</Th></tr></thead>
          <tbody>
            {gradeRows.map(r => (
              <tr key={r.g} className="border-b border-[#E4E4E4] last:border-b-0">
                <td className="px-4 py-2.5 font-semibold">{r.g}</td>
                <td className="px-4 py-2.5 font-mono text-[12px]">{fmt(r.billed)}</td>
                <td className="px-4 py-2.5 font-mono text-[12px] font-bold text-[#166534]">{fmt(r.col)}</td>
                <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="h-1.5 bg-[#E4E4E4] rounded-full w-28 overflow-hidden"><div className="h-full bg-[#18181B] rounded-full" style={{ width: `${Math.min(100, r.pct)}%` }} /></div><span className="text-[11.5px] font-semibold">{r.pct}%</span></div></td>
              </tr>))}
            {!gradeRows.length && <tr><td colSpan={4} className="text-center py-8 text-[#666666]">No students yet</td></tr>}
          </tbody>
        </table>
      ) : (
        <div className="p-4 space-y-3">
          {Object.entries(byCategory).map(([cat, { count, total }]) => (
            <div key={cat} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <span className="text-[13px] text-[#333] font-medium sm:min-w-[160px]">{cat}</span>
              <div className="flex-1 min-w-[80px] h-1.5 bg-[#E4E4E4] rounded-full overflow-hidden"><div className="h-full bg-[#18181B] rounded-full" style={{ width: `${Math.min(100, totalCollected ? total / totalCollected * 100 : 0)}%` }} /></div>
              <span className="text-[12.5px] font-bold text-[#111] font-mono min-w-[80px] text-right">{fmt(total)}</span>
              <span className="text-[11px] text-[#666666] min-w-[60px]">{count} payment{count === 1 ? '' : 's'}</span>
            </div>))}
          {!Object.keys(byCategory).length && <div className="text-center py-4 text-[#666666]">No payments recorded yet</div>}
        </div>
      )}
    </div>
  );
}

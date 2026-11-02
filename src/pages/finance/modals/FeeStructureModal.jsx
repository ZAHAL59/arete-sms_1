import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { FEE_GRADES, getFeeStructure, saveFeeStructure, DEFAULT_FEE_STRUCTURE, termOf, fmt } from '../constants';

const COLS = [['admission', 'Admission'], ['t1', 'Term 1'], ['t2', 'Term 2'], ['t3', 'Term 3'], ['transport', 'Transport'], ['hostel', 'Hostel'], ['activity', 'Activity']];

export default function FeeStructureModal({ onClose, onSaved }) {
  const [fs, setFs] = useState(() => JSON.parse(JSON.stringify(getFeeStructure())));
  const set = (g, k, v) => setFs(x => ({ ...x, [g]: { ...x[g], [k]: Math.max(0, parseInt(v) || 0) } }));
  function save() { saveFeeStructure(fs); onSaved?.(); onClose(); }
  return (
    <Modal open onClose={onClose} size="lg" title="Fee Structure" subtitle="Annual fees per grade — used for every student's amount due"
      footer={<><Button variant="outline" onClick={() => setFs(JSON.parse(JSON.stringify(DEFAULT_FEE_STRUCTURE)))}>Reset to defaults</Button><span className="flex-1" /><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save Fee Structure</Button></>}>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-[12px]">
        <thead><tr><th className="px-2 py-2 text-left text-[10px] font-bold text-[#AAA] uppercase">Grade</th>{COLS.map(([, l]) => <th key={l} className="px-1 py-2 text-right text-[10px] font-bold text-[#AAA] uppercase">{l}</th>)}<th className="px-2 py-2 text-right text-[10px] font-bold text-[#AAA] uppercase">Day-scholar / yr</th></tr></thead>
        <tbody>{FEE_GRADES.map(g => (
          <tr key={g} className="border-t border-[#E4E4E4]"><td className="px-2 py-1.5 font-bold whitespace-nowrap">{g}</td>
            {COLS.map(([k]) => <td key={k} className="px-1 py-1"><input value={fs[g][k]} onChange={e => set(g, k, e.target.value)} className="w-[72px] text-right font-mono text-[12px] px-1.5 py-1 border border-[#E4E4E4] rounded-[5px] outline-none focus:border-[#C8202E]" /></td>)}
            <td className="px-2 py-1.5 text-right font-mono font-bold text-[#C8202E]">{fmt(termOf(fs[g]) + fs[g].activity)}</td></tr>))}</tbody>
      </table></div>
      <p className="text-[11.5px] text-[#AAA] mt-3">Annual due = Term 1–3 + Activity, plus Transport for bus riders and Hostel for boarders. Admission is a one-time fee and is not counted in the annual due.</p>
    </Modal>
  );
}

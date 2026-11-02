import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { FEE_CATEGORIES, PAY_MODES, getFeeStructure, TODAY, fmt } from '../constants';
import useStore from '../../../store/useStore';

export default function PaymentModal({ onClose, onSave, prefillStudent }) {
  const db = useStore(s => s.db);
  const [stuId, setStuId] = useState(prefillStudent||'');
  const [cat,   setCat]   = useState(FEE_CATEGORIES[0]);
  const [amt,   setAmt]   = useState('');
  const [mode,  setMode]  = useState(PAY_MODES[0]);
  const [date,  setDate]  = useState(TODAY);
  const [ref,   setRef]   = useState('');
  const [hint,  setHint]  = useState('');

  useEffect(() => {
    const stu = db.students.find(s=>s.id===stuId);
    if (!stu) { setHint(''); return; }
    const fees = getFeeStructure()[stu.cls] || {};
    const catMap = {
      'Term 1 Fee': fees.t1 || 0, 'Term 2 Fee': fees.t2 || 0, 'Term 3 Fee': fees.t3 || 0, 'Transport Fee': fees.transport || 0,
      'Hostel Fee': fees.hostel || 0, 'Hostel Monthly': Math.round((fees.hostel || 0) / 12), 'Activity Fee': fees.activity || 0, 'Admission Fee': fees.admission || 0,
    };
    const suggested = catMap[cat];
    if (suggested) { setAmt(String(suggested)); setHint(`Suggested: ${fmt(suggested)} for ${stu.cls}`); }
    else setHint('');
  }, [stuId, cat]);

  function save() {
    if (!stuId||!amt) return;
    onSave({ studentId:stuId, category:cat, amount:parseInt(amt), mode, date, ref });
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Record Fee Payment" subtitle="Payment saved instantly to student ledger"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Record & Generate Receipt</Button></>}
    >
      <div className="mb-3">
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Student *</label>
        <select value={stuId} onChange={e=>setStuId(e.target.value)}
          className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]">
          <option value="">Select student...</option>
          {db.students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.cls}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Category</label>
          <select value={cat} onChange={e=>setCat(e.target.value)}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]">
            {FEE_CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Amount (₹) *</label>
          <input type="number" value={amt} onChange={e=>setAmt(e.target.value)}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
          {hint && <div className="text-[11px] text-[#C8202E] mt-1">{hint}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Payment Mode</label>
          <select value={mode} onChange={e=>setMode(e.target.value)}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]">
            {PAY_MODES.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
        </div>
      </div>
      <div>
        <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Reference / Transaction ID</label>
        <input value={ref} onChange={e=>setRef(e.target.value)} placeholder="UPI ref, cheque number..."
          className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
      </div>
    </Modal>
  );
}

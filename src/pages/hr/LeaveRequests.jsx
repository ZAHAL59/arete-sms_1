import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { LEAVE_TYPES } from './constants';

export default function LeaveRequests({ hr, updateLeave, addLeave }) {
  const db = useStore(s => s.db);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({staffId:'',type:'Casual',from:'',to:'',days:1,reason:''});

  const pending  = hr.leaveRequests.filter(l=>l.status==='Pending');
  const approved = hr.leaveRequests.filter(l=>l.status==='Approved');
  const rejected = hr.leaveRequests.filter(l=>l.status==='Rejected');

  function saveLeave() {
    if (!form.staffId||!form.from) return;
    addLeave(form);
    setNewOpen(false);
    setForm({staffId:'',type:'Casual',from:'',to:'',days:1,reason:''});
  }

  const tbl = (rows, showActions) => (
    <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
      <table className="w-full border-collapse text-[13px]">
        <thead><tr>{['Staff','Type','From','To','Days','Reason','Status',showActions?'Actions':''].map(h=>
          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
        )}</tr></thead>
        <tbody>
          {!rows.length
            ? <tr><td colSpan={8} className="text-center py-8 text-[#AAA]">No records</td></tr>
            : rows.map(l=>{
                const s = db.staff.find(x=>x.id===l.staffId);
                return (
                  <tr key={l.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                    <td className="px-4 py-2.5 font-semibold text-[#111]">{s?.name||l.staffId}</td>
                    <td className="px-4 py-2.5"><Badge variant="grey">{l.type}</Badge></td>
                    <td className="px-4 py-2.5 text-[#555]">{l.from}</td>
                    <td className="px-4 py-2.5 text-[#555]">{l.to||l.from}</td>
                    <td className="px-4 py-2.5 font-bold text-[#111]">{l.days}</td>
                    <td className="px-4 py-2.5 text-[#555]">{l.reason}</td>
                    <td className="px-4 py-2.5"><Badge variant={l.status==='Approved'?'green':l.status==='Rejected'?'red':'amber'}>{l.status}</Badge></td>
                    <td className="px-4 py-2.5">
                      {showActions && (
                        <div className="flex gap-2">
                          <button onClick={()=>updateLeave(l.id,'Approved')} className="text-[11px] font-semibold text-[#166534] underline cursor-pointer bg-none border-none">Approve</button>
                          <button onClick={()=>updateLeave(l.id,'Rejected')} className="text-[11px] font-semibold text-[#DC2626] underline cursor-pointer bg-none border-none">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader title="Leave Requests" subtitle={`${pending.length} pending approval`}
        actions={<Button onClick={()=>setNewOpen(true)}>+ New Request</Button>}
      />

      {pending.length>0&&<><div className="text-[12px] font-bold text-[#AAA] uppercase tracking-wider mb-2">⚠️ Pending Approval ({pending.length})</div>{tbl(pending,true)}<div className="mb-5"/></>}
      <div className="text-[12px] font-bold text-[#AAA] uppercase tracking-wider mb-2">All Requests</div>
      {tbl(hr.leaveRequests, false)}

      <Modal open={newOpen} onClose={()=>setNewOpen(false)} title="New Leave Request"
        footer={<><Button variant="outline" onClick={()=>setNewOpen(false)}>Cancel</Button><Button onClick={saveLeave}>Submit</Button></>}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Staff Member *</label>
            <select value={form.staffId} onChange={e=>setForm(f=>({...f,staffId:e.target.value}))}
              className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]">
              <option value="">— Select staff —</option>
              {db.staff.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Select label="Leave Type" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
            {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
          </Select>
          <div>
            <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Days</label>
            <input type="number" min={1} value={form.days} onChange={e=>setForm(f=>({...f,days:parseInt(e.target.value)||1}))}
              className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">From</label>
            <input type="date" value={form.from} onChange={e=>setForm(f=>({...f,from:e.target.value}))}
              className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">To</label>
            <input type="date" value={form.to} onChange={e=>setForm(f=>({...f,to:e.target.value}))}
              className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
          </div>
          <div className="col-span-2">
            <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Reason</label>
            <input value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}
              className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
          </div>
        </div>
      </Modal>
    </div>
  );
}

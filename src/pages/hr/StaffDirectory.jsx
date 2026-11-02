import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { COLORS } from '../teacher/constants';

export default function StaffDirectory() {
  const db       = useStore(s => s.db);
  const updateDB = useStore(s => s.updateDB);
  const [sel, setSel] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  function openEdit(s) { setEditing(true); setForm({name:s.name,subj:s.subj,phone:s.phone,joined:s.joined,salary:s.salary}); }
  function saveEdit() {
    updateDB(ddb => {
      const idx = ddb.staff.findIndex(x=>x.id===sel.id);
      if(idx>=0) ddb.staff[idx]={...ddb.staff[idx],...form,salary:parseInt(form.salary)||ddb.staff[idx].salary};
      return ddb;
    });
    setEditing(false); setSel(db.staff.find(x=>x.id===sel.id));
  }

  const total = db.staff.reduce((a,s)=>a+s.salary,0);

  return (
    <div className="p-6">
      <PageHeader title="Staff Directory" subtitle={`${db.staff.length} active staff`} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {label:'Total Staff',    value:db.staff.length,  color:'#C8202E'},
          {label:'Teaching',       value:db.staff.length,  color:'#1A5FB4'},
          {label:'Monthly Payroll',value:'₹'+total.toLocaleString('en-IN'), color:'#166534'},
          {label:'Avg Salary',     value:'₹'+Math.round(total/db.staff.length).toLocaleString('en-IN'), color:'#6D28D9'},
        ].map(k=>(
          <div key={k.label} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]"
            style={{borderLeft:`3px solid ${k.color}`}}>
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.label}</div>
            <div className="text-[20px] font-extrabold" style={{color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr>{['Staff Member','Subject / Role','Phone','Joined','Salary','Status',''].map(h=>
            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{h}</th>
          )}</tr></thead>
          <tbody>
            {db.staff.map((s,i)=>{
              const init = s.name.split(' ').filter(w=>w.match(/[A-Z]/)).map(w=>w[0]).join('').slice(0,2)||'??';
              return (
                <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div style={{background:COLORS[i%COLORS.length]}} className="w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{init}</div>
                      <button onClick={()=>{setSel(s);setEditing(false);}} className="font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none text-[13px]">{s.name}</button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[#555]">{s.subj}</td>
                  <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#555]">{s.phone}</td>
                  <td className="px-4 py-2.5 text-[#555]">{s.joined}</td>
                  <td className="px-4 py-2.5 font-semibold text-[#111]">₹{s.salary.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5"><Badge variant="green">{s.status}</Badge></td>
                  <td className="px-4 py-2.5"><button onClick={()=>{setSel(s);setEditing(false);}} className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">View</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sel && (
        <Modal open onClose={()=>{setSel(null);setEditing(false);}} size="lg"
          title={sel.name}
          subtitle={`${sel.subj} · ${sel.id} · Joined ${sel.joined}`}
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>{setSel(null);setEditing(false);}}>Close</Button>
              {!editing && <Button variant="outline" onClick={()=>openEdit(sel)}>✎ Edit</Button>}
              {editing && <><Button variant="outline" onClick={()=>setEditing(false)}>Cancel</Button><Button onClick={saveEdit}>Save Changes</Button></>}
            </div>
          }
        >
          {editing ? (
            <div className="grid grid-cols-2 gap-3">
              {[['Full Name','name'],['Subject / Role','subj'],['Phone','phone'],['Date Joined','joined']].map(([l,k])=>(
                <div key={k}>
                  <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{l}</label>
                  <input value={form[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
                </div>
              ))}
              <div>
                <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Monthly Salary (₹)</label>
                <input type="number" value={form.salary||''} onChange={e=>setForm(f=>({...f,salary:e.target.value}))}
                  className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[['Staff ID',sel.id],['Subject',sel.subj],['Phone',sel.phone],['Joined',sel.joined],
                ['Salary','₹'+sel.salary?.toLocaleString('en-IN')],['Status',sel.status],
                ['Classes',(sel.classes||[]).join(', ')||'—']
              ].map(([l,v])=>(
                <div key={l} className={`bg-[#F8F8F8] p-2.5 rounded-[6px] ${l==='Classes'?'col-span-2':''}`}>
                  <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-[13px] text-[#333]">{v}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { fmt, fmtL, BUDGET_DEPTS } from './constants';

export default function Budget({ fin, allPayments, addBudgetLine, updateBudgetLine, deleteBudgetLine, setActualsFrom }) {
  const db = useStore(s => s.db);
  const [period, setPeriod] = useState('ay');
  const [editOpen, setEditOpen] = useState(null);
  const [addOpen, setAddOpen] = useState(false); const [confirmReset, setConfirmReset] = useState(false);
  const [form, setForm] = useState({cat:'',dept:'HR',budgeted:''});

  // Compute actuals from payments by category
  function getActual(cat) {
    const now = new Date();
    const catLower = cat.toLowerCase();
    return allPayments.filter(p => {
      if (fin.actualsFrom && (p.date || '') < fin.actualsFrom) return false;
      if (period==='month') {
        const d=new Date(p.date||'');
        if(d.getMonth()!==now.getMonth()||d.getFullYear()!==now.getFullYear()) return false;
      }
      return (p.category||'').toLowerCase().includes(catLower.split(' ')[0].toLowerCase()) ||
        (cat==='Teacher Salaries'&&p.category==='Staff Salary');
    }).reduce((a,p)=>a+p.amount,0);
  }

  const lines = fin.budget.map(b => ({ ...b, actual: getActual(b.cat) }));
  const totBud = lines.reduce((a,b)=>a+b.budgeted,0);
  const totAct = lines.reduce((a,b)=>a+b.actual,0);
  const totalCollected = allPayments.filter(p=>p.studentId).reduce((a,p)=>a+p.amount,0);

  const PERIOD_LABELS = {ay:'Academic Year 2026–27',t1:'Term 1 (Jun–Sep)',t2:'Term 2 (Oct–Jan)',t3:'Term 3 (Feb–May)',month:'This Month'};

  function saveEdit() {
    updateBudgetLine(editOpen.id, {budgeted:parseInt(form.budgeted)||editOpen.budgeted, cat:form.cat||editOpen.cat, dept:form.dept||editOpen.dept});
    setEditOpen(null);
  }
  function saveAdd() {
    if (!form.cat||!form.budgeted) return;
    addBudgetLine({cat:form.cat,dept:form.dept,budgeted:parseInt(form.budgeted)});
    setAddOpen(false); setForm({cat:'',dept:'HR',budgeted:''});
  }

  return (
    <div className="p-6">
      <PageHeader title="Budget vs Actual" subtitle="Set annual planned budget · actuals auto-fill from payments"
        actions={
          <div className="flex gap-2">
            <select value={period} onChange={e=>setPeriod(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
              <option value="ay">Full Academic Year</option>
              <option value="t1">Term 1 (Jun–Sep)</option>
              <option value="t2">Term 2 (Oct–Jan)</option>
              <option value="t3">Term 3 (Feb–May)</option>
              <option value="month">This Month</option>
            </select>
            <Button variant="outline" onClick={()=>{ if (confirmReset) { setActualsFrom(new Date().toISOString().slice(0,10)); setConfirmReset(false); } else setConfirmReset(true); }}>{confirmReset ? 'Click again to confirm reset' : '↻ Reset Actuals'}</Button>
            <Button variant="outline" onClick={()=>setAddOpen(true)}>+ Add Entry</Button>
          </div>
        }
      />

      <div className="bg-[#FEF4F4] border border-[#FECACA] rounded-[8px] p-3 mb-5 text-[12.5px] text-[#555] leading-relaxed">
        ℹ️ <strong className="text-[#111]">Budget</strong> — your planned annual spend. <strong className="text-[#111]">Actual</strong> — auto-calculated from payments. Change period above to filter by term. <strong className="text-[#111]">Reset Actuals</strong> starts a fresh count from today; budgets and payment records are untouched.{fin.actualsFrom && <> Counting from <b>{fin.actualsFrom}</b> <button onClick={()=>setActualsFrom(null)} className="underline text-[#C8202E] cursor-pointer bg-none border-none">(clear)</button>.</>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {l:'Total Budget',   v:fmtL(totBud),   c:'#C8202E'},
          {l:'Total Actual',   v:fmtL(totAct),   c:'#DC2626'},
          {l:'Fee Income',     v:fmtL(totalCollected), c:'#166534'},
          {l:'Surplus/Deficit',v:fmtL(totalCollected-totAct), c:totalCollected>=totAct?'#166534':'#DC2626'},
        ].map(k=>(
          <div key={k.l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]"
            style={{borderLeft:`3px solid ${k.c}`}}>
            <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{k.l}</div>
            <div className="text-[20px] font-extrabold font-mono" style={{color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex justify-between items-center">
          <div className="text-[13.5px] font-bold text-[#111]">Budget Line Items</div>
          <div className="text-[12px] text-[#AAA] font-semibold">{PERIOD_LABELS[period]}</div>
        </div>
        <div className="divide-y divide-[#E4E4E4]">
          {lines.map(b=>{
            const pct  = b.budgeted>0?Math.round(b.actual/b.budgeted*100):0;
            const over = pct>100;
            const warn = pct>80;
            return (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8F8F8]">
                <div className="min-w-[180px]">
                  <div className="text-[13px] font-semibold text-[#333]">{b.cat}</div>
                  <div className="text-[10.5px] text-[#AAA]">{b.dept}</div>
                </div>
                <div className="flex-1 h-1.5 bg-[#E4E4E4] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width:`${Math.min(pct,100)}%`,background:over?'#DC2626':warn?'#B45309':'#C8202E'}}/>
                </div>
                <div className="text-right min-w-[140px]">
                  <div className="text-[11.5px] font-mono text-[#555]">{fmtL(b.actual)} <span className="text-[#AAA]">/ {fmtL(b.budgeted)}</span></div>
                </div>
                <div className="min-w-[70px]">
                  <Badge variant={over?'red':warn?'amber':'green'} className="text-[10px]">{pct}% {over?'OVER':''}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>{setEditOpen(b);setForm({cat:b.cat,dept:b.dept,budgeted:String(b.budgeted)});}}
                    className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">✎</button>
                  <button onClick={()=>deleteBudgetLine(b.id)}
                    className="text-[11px] font-semibold text-[#DC2626] underline cursor-pointer bg-none border-none ml-1">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <Modal open onClose={()=>setEditOpen(null)} title="Edit Budget Line"
          footer={<><Button variant="outline" onClick={()=>setEditOpen(null)}>Cancel</Button><Button onClick={saveEdit}>Save</Button></>}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Category</label>
              <input value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}
                className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Department</label>
              <select value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}
                className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]">
                {BUDGET_DEPTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Budgeted Amount (₹)</label>
              <input type="number" value={form.budgeted} onChange={e=>setForm(f=>({...f,budgeted:e.target.value}))}
                className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
            </div>
          </div>
        </Modal>
      )}

      {/* Add modal */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add Budget Entry"
        footer={<><Button variant="outline" onClick={()=>setAddOpen(false)}>Cancel</Button><Button onClick={saveAdd}>Add Entry</Button></>}
      >
        <div className="space-y-3">
          {[['Category *','cat'],['Budgeted Amount (₹) *','budgeted']].map(([l,k])=>(
            <div key={k}>
              <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{l}</label>
              <input value={form[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} type={k==='budgeted'?'number':'text'}
                className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]"/>
            </div>
          ))}
          <div>
            <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">Department</label>
            <select value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}
              className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E]">
              {BUDGET_DEPTS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import useFinance from '../finance/useFinance';
import FinancePayroll from '../finance/Payroll';
import Button from '../../components/ui/Button';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls, Th } from '../../components/ui/Kit';
import { fmt, TODAY, prettyDate } from './constants';

const CATS = ['Infrastructure', 'Utilities', 'Supplies', 'Maintenance', 'Events', 'Other'];

export default function Payroll({ p, api }) {
  const { allPayments, processPayroll, payStaff, updateSalary } = useFinance();
  const [e, setE] = useState({ cat: CATS[0], desc: '', amount: '', date: TODAY });
  const [stat, setStat] = useState(p.statutory.map(s => ({ ...s, amount: String(s.amount) })));
  const total = p.expenses.reduce((a, x) => a + x.amount, 0);

  function add() { if (!e.desc.trim() || !+e.amount) return; api.addExpense({ ...e, desc: e.desc.trim(), amount: +e.amount }); setE({ cat: CATS[0], desc: '', amount: '', date: TODAY }); }
  const saveStat = () => api.setStatutory(stat.filter(s => s.name.trim()).map(s => ({ name: s.name.trim(), amount: +s.amount || 0 })));

  return (
    <div>
      <FinancePayroll allPayments={allPayments} processPayroll={processPayroll} payStaff={payStaff} updateSalary={updateSalary} />
      <div className="px-6 pb-6 -mt-2 space-y-3">
        <Collapsible defaultOpen header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Expense Tracking</span><span className="ml-auto text-[12px] text-[#777]">Total <b className="text-[#C8202E]">{fmt(total)}</b></span></div>}>
          <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]"><thead><tr><Th>Category</Th><Th>Description</Th><Th>Amount</Th><Th>Date</Th><Th /></tr></thead>
            <tbody>{p.expenses.map(x => <tr key={x.id} className="border-b border-[#E4E4E4] hover:bg-[#F8F8F8]"><td className="px-4 py-2.5 text-[#555]">{x.cat}</td><td className="px-4 py-2.5 text-[#111]">{x.desc}</td><td className="px-4 py-2.5 font-mono font-bold">{fmt(x.amount)}</td><td className="px-4 py-2.5 text-[#777]">{prettyDate(x.date)}</td><td className="px-4 py-2.5"><button onClick={() => api.deleteExpense(x.id)} className="text-[11px] text-[#DC2626] font-semibold cursor-pointer bg-none border-none underline">Remove</button></td></tr>)}</tbody></table>
          <div className="flex gap-2 p-3 items-end border-t border-[#E4E4E4]">
            <Field label="Category"><select value={e.cat} onChange={ev => setE(x => ({ ...x, cat: ev.target.value }))} className={inputCls}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Description" className="flex-1"><input value={e.desc} onChange={ev => setE(x => ({ ...x, desc: ev.target.value }))} className={inputCls} /></Field>
            <Field label="Amount (₹)"><input type="number" value={e.amount} onChange={ev => setE(x => ({ ...x, amount: ev.target.value }))} className={inputCls + ' w-28'} /></Field>
            <Field label="Date"><input type="date" value={e.date} onChange={ev => setE(x => ({ ...x, date: ev.target.value }))} className={inputCls} /></Field>
            <Button onClick={add}>+ Add</Button></div>
        </Collapsible>
        <Collapsible header={<div className="flex items-center gap-2"><span className="text-[13.5px] font-bold text-[#111]">Statutory Deductions</span><span className="text-[11px] text-[#AAA]">manual entries — not calculated</span></div>}>
          <div className="p-4 border-t border-[#E4E4E4] space-y-2">{stat.map((s, i) => <div key={i} className="flex gap-2"><input value={s.name} onChange={ev => setStat(l => l.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))} className={inputCls + ' flex-1'} /><input type="number" value={s.amount} onChange={ev => setStat(l => l.map((x, j) => j === i ? { ...x, amount: ev.target.value } : x))} className={inputCls + ' w-36'} /><button onClick={() => setStat(l => l.filter((_, j) => j !== i))} className="text-[#DC2626] cursor-pointer bg-none border-none px-2">✕</button></div>)}
            <div className="flex gap-2 pt-1"><Button size="sm" variant="outline" onClick={() => setStat(l => [...l, { name: '', amount: '' }])}>+ Add line</Button><Button size="sm" onClick={saveStat}>Save</Button></div></div>
        </Collapsible>
      </div>
    </div>
  );
}

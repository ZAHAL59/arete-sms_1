import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls, Th } from '../../components/ui/Kit';
import { snapshot } from './bridge';
import { STANDARD, MODULES } from './reportBuilders';
import { downloadCsv, TODAY } from './constants';

const monthStart = TODAY.slice(0, 8) + '01';

export default function Reports({ p }) {
  const db = useStore(s => s.db); const attLog = useStore(s => s.attLog);
  const [res, setRes] = useState(null); const [ran, setRan] = useState({});
  const [b, setB] = useState({ module: 'Attendance', from: monthStart, to: TODAY, grade: '' });
  const ctx = useMemo(() => ({ db, attLog, payments: db.payments, principal: p, campus: snapshot().campus }), [db, attLog, p, res]);
  const grades = [...new Set(db.students.map(s => s.cls))].sort();

  function run(id, label, fn, filters) {
    const r = fn(ctx, filters || {}); setRes({ ...r, id }); setRan(x => ({ ...x, [id]: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }));
  }
  const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const num = v => typeof v === 'number' ? v.toLocaleString('en-IN') : v;

  return (
    <div className="p-6">
      <PageHeader title="Reports" subtitle="Generated live from your data — download as CSV (opens in Excel) or print / save as PDF" />
      <Collapsible defaultOpen className="mb-3" header={<span className="text-[13.5px] font-bold text-[#111]">Available Reports</span>}>
        <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]"><thead><tr><Th>Report</Th><Th>Module</Th><Th>Last run</Th><Th /></tr></thead>
          <tbody>{STANDARD.map(([id, label, mod, fn]) => <tr key={id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]"><td className="px-4 py-2.5 font-semibold text-[#111]">{label}</td><td className="px-4 py-2.5"><Badge variant="grey">{mod}</Badge></td><td className="px-4 py-2.5 text-[#777] text-[12px]">{ran[id] || '—'}</td><td className="px-4 py-2.5"><Button size="sm" onClick={() => run(id, label, fn)}>Run</Button></td></tr>)}</tbody></table>
      </Collapsible>

      <Collapsible defaultOpen className="mb-3" header={<span className="text-[13.5px] font-bold text-[#111]">Custom Report Builder</span>}>
        <div className="p-4 border-t border-[#E4E4E4] grid grid-cols-5 gap-3 items-end">
          <Field label="Module"><select value={b.module} onChange={e => setB(x => ({ ...x, module: e.target.value }))} className={inputCls}>{Object.keys(MODULES).map(m => <option key={m}>{m}</option>)}</select></Field>
          <Field label="From"><input type="date" value={b.from} onChange={e => setB(x => ({ ...x, from: e.target.value }))} className={inputCls} /></Field>
          <Field label="To"><input type="date" value={b.to} onChange={e => setB(x => ({ ...x, to: e.target.value }))} className={inputCls} /></Field>
          <Field label="Grade"><select value={b.grade} onChange={e => setB(x => ({ ...x, grade: e.target.value }))} className={inputCls}><option value="">All grades</option>{grades.map(g => <option key={g}>{g}</option>)}</select></Field>
          <Button onClick={() => run('custom-' + b.module, b.module, MODULES[b.module], b)}>Generate</Button>
        </div>
        <div className="px-4 pb-3 text-[11.5px] text-[#AAA]">Date range applies to Attendance and Fees. Grade applies to Attendance, Students and Fees.</div>
      </Collapsible>

      {res && <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)] print-area">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex items-center gap-3"><div className="flex-1"><div className="text-[14px] font-bold text-[#111]">{res.title}</div><div className="text-[11.5px] text-[#777]">{res.rows.length} row(s) · generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
          <Button size="sm" variant="outline" onClick={() => window.print()}>🖨 Print / PDF</Button><Button size="sm" onClick={() => downloadCsv(`${slug(res.title)}-${TODAY}.csv`, res.columns, res.rows)}>⬇ Download CSV</Button></div>
        {res.note && <div className="px-4 py-2 text-[12px] text-[#B45309] bg-[#FFFBEB] border-b border-[#FEF08A]">{res.note}</div>}
        <div className="overflow-x-auto"><table className="w-full border-collapse text-[13px]"><thead><tr>{res.columns.map(c => <Th key={c}>{c}</Th>)}</tr></thead>
          <tbody>{!res.rows.length ? <tr><td colSpan={res.columns.length} className="text-center py-8 text-[#AAA]">No data for these filters</td></tr> : res.rows.map((r, i) => <tr key={i} className={`border-b border-[#E4E4E4] last:border-b-0 ${String(r[1]).includes('TOTAL') || r[0] === 'TOTAL' ? 'bg-[#F8F8F8] font-bold' : 'hover:bg-[#F8F8F8]'}`}>{r.map((c, j) => <td key={j} className="px-4 py-2 text-[#333]">{num(c)}</td>)}</tr>)}</tbody></table></div>
      </div>}
    </div>
  );
}

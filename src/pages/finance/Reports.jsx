import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Button from '../../components/ui/Button';
import { Field, inputCls } from '../../components/ui/Kit';
import { fmt, getStudentDue, countsTowardDue, FEE_GRADES, FEE_CATEGORIES, PAY_MODES } from './constants';
import { csvText } from '../principal/constants';

const iso = d => d.toISOString().slice(0, 10);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const fmtDate = s => s ? new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// ── Period presets (school year runs June → May; Term 1 Jun–Sep, Term 2 Oct–Jan, Term 3 Feb–May) ──
export const PERIODS = [
  ['month', 'This month'], ['last', 'Last month'], ['3m', 'Last 3 months'], ['term', 'This term'], ['ay', 'This academic year'], ['custom', 'Custom dates'], ['all', 'All time'],
];
export function periodRange(key, custom = {}, today = iso(new Date())) {
  const t = new Date(today + 'T00:00:00'), y = t.getFullYear(), m = t.getMonth() + 1;
  const last = d => iso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  if (key === 'month') return { from: iso(new Date(y, m - 1, 1)), to: last(t), label: t.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) };
  if (key === 'last') { const p = addMonths(t, -1); return { from: iso(p), to: last(p), label: p.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) }; }
  if (key === '3m') { const s = addMonths(t, -2); return { from: iso(s), to: last(t), label: 'Last 3 months' }; }
  if (key === 'ay') { const sy = m >= 6 ? y : y - 1; return { from: `${sy}-06-01`, to: `${sy + 1}-05-31`, label: `Academic year ${sy}–${String(sy + 1).slice(2)}` }; }
  if (key === 'term') {
    const sy = m >= 6 ? y : y - 1;
    if (m >= 6 && m <= 9) return { from: `${y}-06-01`, to: `${y}-09-30`, label: `Term 1 (Jun–Sep ${y})` };
    if (m >= 10 || m === 1) { const oy = m === 1 ? y - 1 : y; return { from: `${oy}-10-01`, to: `${oy + 1}-01-31`, label: `Term 2 (Oct ${oy}–Jan ${oy + 1})` }; }
    return { from: `${sy + 1}-02-01`, to: `${sy + 1}-05-31`, label: `Term 3 (Feb–May ${sy + 1})` };
  }
  if (key === 'custom') return { from: custom.from || '', to: custom.to || '', label: custom.from && custom.to ? `${fmtDate(custom.from)} – ${fmtDate(custom.to)}` : 'Custom dates' };
  return { from: '', to: '', label: 'All time' };
}
const inRange = (d, r) => (!r.from || (d || '') >= r.from) && (!r.to || (d || '') <= r.to);

// ── The reports. `uses` says which of the options each report actually applies. ──
export const REPORTS = [
  { id: 'collection',  icon: '💳', label: 'Fee Collection Summary', desc: 'Amount received, grouped by fee category.', uses: ['period', 'grade', 'mode'] },
  { id: 'monthly',     icon: '📆', label: 'Month-wise Collection',  desc: 'Amount received in each month of the period.',            uses: ['period', 'grade', 'mode', 'category'] },
  { id: 'register',    icon: '🧾', label: 'Receipt Register',       desc: 'Every payment received, one line each, with receipt numbers.',              uses: ['period', 'grade', 'mode', 'category'] },
  { id: 'grade',       icon: '📚', label: 'Grade-wise Collection',  desc: 'Per grade: annual fees billed, collected in the period and to date.', uses: ['period', 'grade'] },
  { id: 'mode',        icon: '📊', label: 'Payment Mode Analysis',  desc: 'Payments grouped by mode: Online, Cash, Cheque, DD.',                              uses: ['period', 'grade', 'category'] },
  { id: 'outstanding', icon: '⚠️', label: 'Outstanding Fees',       desc: 'Students with a pending balance, as of today.',                          uses: ['grade'], asOfToday: true },
  { id: 'ledger',      icon: '📒', label: 'Full Fee Ledger',        desc: 'Per student: annual fee, paid in period, paid to date, balance.',     uses: ['period', 'grade'] },
  { id: 'payroll',     icon: '💰', label: 'Payroll Paid',           desc: 'Staff salaries paid in the period.',                                        uses: ['period'] },
];

export function buildFeeReport(id, db, allPayments, o = {}) {
  const range = o.range || { from: '', to: '' };
  const stu = sid => db.students.find(s => s.id === sid);
  const gradeOk = p => !o.grade || stu(p.studentId)?.cls === o.grade;
  const pays = allPayments.filter(p => p.studentId && inRange(p.date, range) && gradeOk(p) && (!o.mode || p.mode === o.mode) && (!o.category || p.category === o.category));
  const toDate = allPayments.filter(p => p.studentId && countsTowardDue(p));
  const sum = l => l.reduce((a, p) => a + p.amount, 0);
  const total = sum(pays);
  const pct = n => total ? Math.round(n / total * 100) + '%' : '—';
  const group = (key, label) => { const m = {}; pays.forEach(p => { const k = p[key] || 'Unknown'; (m[k] ||= { n: 0, t: 0 }); m[k].n++; m[k].t += p.amount; });
    const rows = Object.entries(m).sort((a, b) => b[1].t - a[1].t).map(([k, v]) => [k, v.n, v.t, pct(v.t)]); rows.push(['TOTAL', pays.length, total, rows.length ? '100%' : '—']);
    return { columns: [label, 'Payments', 'Amount (₹)', 'Share'], rows, summary: { total, count: pays.length } }; };

  if (id === 'collection') return { title: 'Fee Collection Summary', ...group('category', 'Category') };
  if (id === 'mode')       return { title: 'Payment Mode Analysis', ...group('mode', 'Mode') };
  if (id === 'register') {
    const rows = pays.slice().sort((a, b) => a.date.localeCompare(b.date)).map(p => [p.date, p.id, stu(p.studentId)?.name || p.studentId, stu(p.studentId)?.cls || '', p.category, p.mode, p.amount]); rows.push(['', '', 'TOTAL', '', '', '', total]);
    return { title: 'Receipt Register', columns: ['Date', 'Receipt', 'Student', 'Class', 'Category', 'Mode', 'Amount (₹)'], rows, summary: { total, count: pays.length } };
  }
  if (id === 'monthly') {
    const m = {}; pays.forEach(p => { const k = p.date.slice(0, 7); (m[k] ||= { n: 0, t: 0 }); m[k].n++; m[k].t += p.amount; });
    const rows = Object.keys(m).sort().map(k => [new Date(k + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), m[k].n, m[k].t]); rows.push(['TOTAL', pays.length, total]);
    return { title: 'Month-wise Collection', columns: ['Month', 'Payments', 'Amount (₹)'], rows, summary: { total, count: pays.length } };
  }
  if (id === 'grade') {
    const rows = FEE_GRADES.filter(g => !o.grade || g === o.grade).map(g => { const sts = db.students.filter(s => s.cls === g); if (!sts.length) return null;
      const billed = sts.reduce((a, s) => a + getStudentDue(s), 0), inP = sum(allPayments.filter(p => p.studentId && countsTowardDue(p) && inRange(p.date, range) && sts.some(s => s.id === p.studentId))), upTo = sum(toDate.filter(p => sts.some(s => s.id === p.studentId)));
      return [g, sts.length, billed, inP, upTo, Math.max(0, billed - upTo), billed ? Math.round(upTo / billed * 100) + '%' : '—']; }).filter(Boolean);
    return { title: 'Grade-wise Collection', columns: ['Grade', 'Students', 'Annual billed (₹)', 'Collected in period (₹)', 'Collected to date (₹)', 'Balance today (₹)', 'Collected %'], rows, summary: { total: rows.reduce((a, r) => a + r[3], 0), count: rows.length } };
  }
  if (id === 'outstanding') {
    const rows = db.students.filter(s => !o.grade || s.cls === o.grade).map(s => { const due = getStudentDue(s), paid = sum(toDate.filter(p => p.studentId === s.id)); return [s.name, `${s.cls} ${s.section}`, due, paid, due - paid]; }).filter(r => r[4] > 0).sort((a, b) => b[4] - a[4]);
    const owed = rows.reduce((a, r) => a + r[4], 0); rows.push(['TOTAL', '', '', '', owed]);
    return { title: 'Outstanding Fees', columns: ['Student', 'Class', 'Annual due (₹)', 'Paid to date (₹)', 'Balance (₹)'], rows, summary: { total: owed, count: rows.length - 1, owed: true } };
  }
  if (id === 'ledger') {
    const rows = db.students.filter(s => !o.grade || s.cls === o.grade).map(s => { const due = getStudentDue(s), inP = sum(allPayments.filter(p => p.studentId === s.id && countsTowardDue(p) && inRange(p.date, range))), upTo = sum(toDate.filter(p => p.studentId === s.id));
      return [s.id, s.name, `${s.cls} ${s.section}`, due, inP, upTo, Math.max(0, due - upTo), due - upTo <= 0 ? 'Clear' : upTo ? 'Partial' : 'Pending']; });
    return { title: 'Full Fee Ledger', columns: ['ID', 'Student', 'Class', 'Annual due (₹)', 'Paid in period (₹)', 'Paid to date (₹)', 'Balance (₹)', 'Status'], rows, summary: { total: rows.reduce((a, r) => a + r[4], 0), count: rows.length } };
  }
  // payroll
  const sp = allPayments.filter(p => p.staffId && p.category === 'Staff Salary' && inRange(p.date, range));
  const by = {}; sp.forEach(p => { const k = p.staffId; (by[k] ||= { n: 0, t: 0 }); by[k].n++; by[k].t += p.amount; });
  const rows = Object.entries(by).map(([k, v]) => { const s = db.staff.find(x => x.id === k); return [s?.name || k, s?.subj || '', v.n, v.t]; }).sort((a, b) => b[3] - a[3]); const pt = sum(sp); rows.push(['TOTAL', '', sp.length, pt]);
  return { title: 'Payroll Paid', columns: ['Staff', 'Subject', 'Salary payments', 'Amount paid (₹)'], rows, summary: { total: pt, count: sp.length } };
}

// CSV with the report name, period and filters on top, so the file explains itself
export function reportCsv(res) {
  return [['Report', res.title], ['Period', res.meta.period], ['Filters', res.meta.filters], ['Generated', res.meta.at], []].map(r => r.join(',')).join('\n') + '\n' + csvText(res.columns, res.rows);
}
function downloadReport(res) {
  try { const url = URL.createObjectURL(new Blob(['\ufeff' + reportCsv(res)], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url;
    a.download = `${res.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${res.meta.from || res.meta.to ? `_${res.meta.from || 'start'}_to_${res.meta.to || 'today'}` : '_all-time'}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch {}
}

const Label = ({ children, note }) => <div className="flex items-baseline gap-2 mb-2"><span className="text-[10.5px] font-bold uppercase tracking-[1.4px] text-[#777]">{children}</span>{note && <span className="text-[11px] text-[#AAA]">{note}</span>}</div>;

export default function Reports({ allPayments }) {
  const db = useStore(s => s.db);
  const [type, setType] = useState('collection'); const [period, setPeriod] = useState('month'); const [custom, setCustom] = useState({ from: '', to: '' });
  const [grade, setGrade] = useState(''); const [mode, setMode] = useState(''); const [category, setCategory] = useState('');
  const [res, setRes] = useState(null); const [err, setErr] = useState('');
  const rep = REPORTS.find(r => r.id === type); const uses = k => rep.uses.includes(k);
  const range = periodRange(period, custom); const opts = JSON.stringify([type, period, custom, grade, mode, category]);
  const days = range.from && range.to ? Math.round((new Date(range.to) - new Date(range.from)) / 86400000) + 1 : null;

  function generate() {
    if (uses('period') && period === 'custom') { if (!custom.from || !custom.to) return setErr('Select a start and end date.'); if (custom.from > custom.to) return setErr('Start date is after the end date.'); }
    setErr('');
    const o = { range: uses('period') ? range : { from: '', to: '' }, grade: uses('grade') ? grade : '', mode: uses('mode') ? mode : '', category: uses('category') ? category : '' };
    const r = buildFeeReport(type, db, allPayments, o);
    const filters = [o.grade && `Grade: ${o.grade}`, o.mode && `Mode: ${o.mode}`, o.category && `Category: ${o.category}`].filter(Boolean).join(' · ') || 'None';
    setRes({ ...r, opts, id: type, meta: { period: rep.asOfToday ? `As of ${fmtDate(iso(new Date()))}` : uses('period') ? `${range.label}${range.from && period !== 'custom' ? ` (${fmtDate(range.from)} to ${fmtDate(range.to)})` : ''}` : 'Annual', filters, from: o.range.from, to: o.range.to, at: new Date().toLocaleString('en-IN') } });
  }
  const stale = res && res.opts !== opts;
  const sel = 'w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] bg-white';
  const off = k => uses(k) ? '' : ' opacity-50 cursor-not-allowed';

  return (
    <div className="p-6">
      <PageHeader title="Reports" subtitle="Fee collection, outstanding balances and payroll — by period, grade, mode and category" />

      <div className="bg-white border border-[#E4E4E4] rounded-[12px] p-5 mb-5 shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <Label>Report</Label>
        <div className="grid grid-cols-4 gap-2 mb-5">{REPORTS.map(r => (
          <div key={r.id} onClick={() => setType(r.id)} title={r.desc} className={`px-3 py-2.5 rounded-[8px] border-[1.5px] cursor-pointer transition-all ${type === r.id ? 'border-[#C8202E] bg-[#FEF4F4]' : 'border-[#E4E4E4] hover:border-[#C8202E]'}`}>
            <div className="flex items-center gap-2"><span className="text-[15px]">{r.icon}</span><span className={`text-[12.5px] font-bold ${type === r.id ? 'text-[#C8202E]' : 'text-[#111]'}`}>{r.label}</span></div></div>))}</div>
        <div className="text-[12px] text-[#777] -mt-3 mb-5">{rep.desc}</div>

        <div className="grid grid-cols-[1.2fr_1fr] gap-8 pt-4 border-t border-[#EEE]">
          <div>
            <Label note={rep.asOfToday ? 'Not applicable' : !uses('period') ? 'Annual' : ''}>Period</Label>
            {rep.asOfToday ? <div className="text-[12.5px] text-[#555] bg-[#F8F8F8] rounded-[8px] px-3 py-2.5">As of today — {fmtDate(iso(new Date()))}</div> : !uses('period') ? <div className="text-[12.5px] text-[#555] bg-[#F8F8F8] rounded-[8px] px-3 py-2.5">Current academic year</div> : <>
              <div className="flex flex-wrap gap-1.5 mb-2">{PERIODS.map(([k, l]) => <button key={k} onClick={() => setPeriod(k)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer border ${period === k ? 'bg-[#C8202E] text-white border-[#C8202E]' : 'bg-white text-[#555] border-[#E4E4E4] hover:border-[#C8202E]'}`}>{l}</button>)}</div>
              {period === 'custom' && <div className="flex items-end gap-3 mb-2"><Field label="From"><input type="date" value={custom.from} onChange={e => setCustom(c => ({ ...c, from: e.target.value }))} className={inputCls} /></Field><Field label="To"><input type="date" value={custom.to} min={custom.from} onChange={e => setCustom(c => ({ ...c, to: e.target.value }))} className={inputCls} /></Field></div>}
              <div className="text-[12px] text-[#777]">{range.label}{range.from && range.to && <>{period === 'custom' ? '' : ` · ${fmtDate(range.from)} to ${fmtDate(range.to)}`}{days ? ` · ${days} day${days > 1 ? 's' : ''}` : ''}</>}</div></>}
          </div>
          <div>
            <Label>Filters</Label>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Grade"><select disabled={!uses('grade')} value={uses('grade') ? grade : ''} onChange={e => setGrade(e.target.value)} className={sel + off('grade')}><option value="">All</option>{FEE_GRADES.map(g => <option key={g}>{g}</option>)}</select></Field>
              <Field label="Payment mode"><select disabled={!uses('mode')} value={uses('mode') ? mode : ''} onChange={e => setMode(e.target.value)} className={sel + off('mode')}><option value="">All</option>{PAY_MODES.map(g => <option key={g}>{g}</option>)}</select></Field>
              <Field label="Fee category"><select disabled={!uses('category')} value={uses('category') ? category : ''} onChange={e => setCategory(e.target.value)} className={sel + off('category')}><option value="">All</option>{FEE_CATEGORIES.map(g => <option key={g}>{g}</option>)}</select></Field>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#EEE]"><span className="text-[12px] text-[#DC2626] font-semibold">{err}</span><Button className="ml-auto" onClick={generate}>Generate</Button></div>
      </div>

      {!res && <div className="bg-white border border-dashed border-[#E4E4E4] rounded-[10px] py-12 text-center text-[#BBB] text-[13px]">No report generated</div>}
      {res && <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8]">
          <div className="flex items-center gap-2"><div className="flex-1"><div className="text-[15px] font-extrabold text-[#111]">{res.title}</div>
            <div className="text-[12px] text-[#555] mt-0.5"><b>Period:</b> {res.meta.period} &nbsp;·&nbsp; <b>Filters:</b> {res.meta.filters}</div><div className="text-[11px] text-[#AAA]">Generated {res.meta.at}</div></div>
            <Button size="sm" variant="outline" onClick={() => window.print()}>🖨 Print / PDF</Button><Button size="sm" onClick={() => downloadReport(res)}>⬇ Export CSV</Button></div>
          {stale && <div className="mt-2 text-[12px] text-[#B45309] bg-[#FFFBEB] border border-[#FEF08A] rounded-[6px] px-2.5 py-1.5">Options changed. Select Generate to refresh.</div>}
        </div>
        {res.summary && <div className="px-4 py-2.5 border-b border-[#E4E4E4] flex gap-6 text-[12.5px]"><span><span className="text-[#AAA]">{res.summary.owed ? 'Total outstanding' : 'Total'}</span> <b className="font-mono text-[#C8202E] text-[15px]">{fmt(res.summary.total)}</b></span><span><span className="text-[#AAA]">{res.id === 'grade' ? 'Grades' : res.id === 'ledger' || res.id === 'outstanding' ? 'Students' : 'Payments'}</span> <b className="text-[#111]">{res.summary.count}</b></span></div>}
        <div className="overflow-x-auto"><table className="w-full border-collapse text-[13px]"><thead><tr>{res.columns.map(c => <th key={c} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8] whitespace-nowrap">{c}</th>)}</tr></thead>
          <tbody>{res.rows.length <= 1 && res.rows[0]?.[0] === 'TOTAL' || !res.rows.length ? <tr><td colSpan={res.columns.length} className="text-center py-10 text-[#AAA]">No records for {res.meta.period}{res.meta.filters === 'None' ? '' : ' with the selected filters'}.</td></tr> :
            res.rows.map((r, i) => <tr key={i} className={`border-b border-[#E4E4E4] last:border-b-0 ${r[0] === 'TOTAL' || r[2] === 'TOTAL' ? 'bg-[#F8F8F8] font-bold' : 'hover:bg-[#F8F8F8]'}`}>{r.map((c, j) => <td key={j} className="px-4 py-2.5 text-[#333] whitespace-nowrap">{typeof c === 'number' ? c.toLocaleString('en-IN') : c}</td>)}</tr>)}</tbody></table></div>
      </div>}
    </div>
  );
}

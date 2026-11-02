import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import useExpand from '../../components/ui/useExpand';
import ExpandControls from '../../components/ui/ExpandControls';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { COLORS } from '../teacher/constants';
import { BOOK_CATS, TODAY, loanStatus, prettyDate } from './constants';

const STATUS_VARIANT = { Available:'grey', Issued:'green', 'Due soon':'amber', Overdue:'red' };
const BAR = ['#C8202E', '#9A1822', '#166534', '#1A5FB4', '#B45309', '#6D28D9', '#0B5A6B', '#777'];
const RECS = {
  Fiction:['The Giver','A Wrinkle in Time','Chronicles of Narnia'], Science:['The Gene: An Intimate History','Astrophysics for People in a Hurry','The Hidden Life of Trees'],
  Biography:['Long Walk to Freedom','Steve Jobs by Isaacson','Shoe Dog'], Textbook:['Conceptual Physics','Mathematics: Its Content','The Art of Problem Solving'],
  History:['Guns Germs and Steel','The Story of Civilizations','India After Gandhi'], Sports:['Open by Andre Agassi','The Test of My Life','Playing It My Way'],
};

export default function Library({ c, addBook, issueBook, returnBook }) {
  const db = useStore(s => s.db);
  const [tab, setTab] = useState('catalogue');
  const stu = id => db.students.find(s => s.id === id);

  // Every loan, current or past — the single source for all analytics
  const loans = useMemo(() => [
    ...c.books.filter(b => b.issuedTo).map(b => ({ title:b.title, cat:b.cat, studentId:b.issuedTo, due:b.due, status:loanStatus(b) })),
    ...c.readHistory.map(r => ({ title:r.title, cat:r.cat, studentId:r.studentId, due:r.date, status:'Returned' })),
  ], [c.books, c.readHistory]);

  return (
    <div className="p-6">
      <PageHeader title="Library Management" subtitle={`${c.books.length} books · ${c.books.filter(b => b.issuedTo).length} on loan`} />
      <div className="flex gap-1 mb-5 border-b border-[#E4E4E4]">
        {[['catalogue', '📚 Catalogue'], ['analytics', '📊 Reading Analytics']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-none ${tab === id ? 'border-[#C8202E] text-[#C8202E]' : 'border-transparent text-[#777] hover:text-[#111]'}`}>{label}</button>
        ))}
      </div>
      {tab === 'catalogue' ? <Catalogue c={c} stu={stu} addBook={addBook} issueBook={issueBook} returnBook={returnBook} db={db} /> : <Analytics c={c} loans={loans} stu={stu} db={db} />}
    </div>
  );
}

function Catalogue({ c, stu, addBook, issueBook, returnBook, db }) {
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [st, setSt] = useState('');
  const [bookOpen, setBookOpen] = useState(false); const [issueOpen, setIssueOpen] = useState(false);
  const [bf, setBf] = useState({ title:'', author:'', cat:BOOK_CATS[0] });
  const due14 = () => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10); };
  const [inf, setInf] = useState({ bookId:'', studentId:'', due:due14() });

  const rows = c.books.filter(b => (!q || b.title.toLowerCase().includes(q.toLowerCase()) || b.cat.toLowerCase().includes(q.toLowerCase())) && (!cat || b.cat === cat) && (!st || loanStatus(b) === st));
  const available = c.books.filter(b => !b.issuedTo);
  const overdue = c.books.filter(b => loanStatus(b) === 'Overdue').length;
  const cats = [...new Set(c.books.map(b => b.cat))].sort();
  const ex = useExpand([]);                                   // categories start collapsed
  const filtering = !!(q || cat || st);                       // while filtering, show the matches
  const shownCats = [...new Set(rows.map(b => b.cat))].sort();

  function saveBook() { if (!bf.title.trim()) return; addBook({ title:bf.title.trim(), author:bf.author.trim(), cat:bf.cat }); setBookOpen(false); setBf({ title:'', author:'', cat:BOOK_CATS[0] }); }
  function saveIssue() { if (!inf.bookId || !inf.studentId || !inf.due) return; issueBook(inf.bookId, inf.studentId, inf.due); setIssueOpen(false); }

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Books" value={c.books.length} note={`${cats.length} categories`} />
        <Kpi label="Available" value={available.length} note="On the shelf" color="#166534" />
        <Kpi label="On Loan" value={c.books.length - available.length} note="Issued to students" color="#1A5FB4" />
        <Kpi label="Overdue" value={overdue} note="Past due date" color={overdue ? '#DC2626' : '#166534'} />
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search title or category..." className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] w-56" />
        <select value={cat} onChange={e => setCat(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]"><option value="">All categories</option>{cats.map(x => <option key={x}>{x}</option>)}</select>
        <select value={st} onChange={e => setSt(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]"><option value="">All statuses</option>{Object.keys(STATUS_VARIANT).map(x => <option key={x}>{x}</option>)}</select>
        <div className="ml-auto flex gap-2"><ExpandControls ex={ex} ids={shownCats.map(x => 'b:' + x)} /><Button variant="outline" onClick={() => setBookOpen(true)}>+ Add Book</Button><Button onClick={() => { setInf({ bookId:available[0]?.id || '', studentId:'', due:due14() }); setIssueOpen(true); }}>Issue Book</Button></div>
      </div>
      {!rows.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-10 text-center text-[#AAA]">No books match</div>}
      {shownCats.map(cn => {
        const items = rows.filter(b => b.cat === cn), all = c.books.filter(b => b.cat === cn);
        const onLoan = all.filter(b => b.issuedTo).length, late = all.filter(b => loanStatus(b) === 'Overdue').length;
        return (
          <Collapsible key={cn} className="mb-3" open={filtering ? true : ex.isOpen('b:' + cn)} onToggle={() => ex.toggle('b:' + cn)}
            header={<div className="flex items-center gap-2.5"><span className="text-[13.5px] font-bold text-[#111]">{cn}</span><Badge variant="grey">{filtering ? `${items.length} of ${all.length}` : all.length} book{all.length === 1 ? '' : 's'}</Badge><span className="text-[12px] text-[#777]">{all.length - onLoan} available · {onLoan} on loan</span>{late > 0 && <Badge variant="red">{late} overdue</Badge>}</div>}>
            <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
              <thead><tr><Th>Title</Th><Th>Issued To</Th><Th>Class</Th><Th>Due</Th><Th>Status</Th><Th /></tr></thead>
              <tbody>{items.map(b => {
                const s = stu(b.issuedTo); const status = loanStatus(b);
                return (
                  <tr key={b.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                    <td className="px-4 py-2.5 font-semibold text-[#111]">{b.title}{b.author && <div className="text-[11px] text-[#AAA] font-normal">{b.author}</div>}</td>
                    <td className="px-4 py-2.5 text-[#555]">{s?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-[#555]">{s ? `${s.cls} ${s.section}` : '—'}</td>
                    <td className="px-4 py-2.5 text-[#555]">{b.due ? prettyDate(b.due) : '—'}</td>
                    <td className="px-4 py-2.5"><Badge variant={STATUS_VARIANT[status]}>{status}</Badge></td>
                    <td className="px-4 py-2.5">{b.issuedTo && <Button size="sm" variant="outline" onClick={() => returnBook(b.id)}>Return</Button>}</td>
                  </tr>);
              })}</tbody>
            </table>
          </Collapsible>);
      })}

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Add Book" footer={<><Button variant="outline" onClick={() => setBookOpen(false)}>Cancel</Button><Button onClick={saveBook}>Save Book</Button></>}>
        <div className="space-y-3">
          <Field label="Book Title *"><input value={bf.title} onChange={e => setBf(x => ({ ...x, title:e.target.value }))} className={inputCls} /></Field>
          <Field label="Author"><input value={bf.author} onChange={e => setBf(x => ({ ...x, author:e.target.value }))} className={inputCls} /></Field>
          <Field label="Category"><select value={bf.cat} onChange={e => setBf(x => ({ ...x, cat:e.target.value }))} className={inputCls}>{BOOK_CATS.map(x => <option key={x}>{x}</option>)}</select></Field>
        </div>
      </Modal>

      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="Issue Book" subtitle="Only available books are listed" footer={<><Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button><Button onClick={saveIssue}>Issue</Button></>}>
        <div className="space-y-3">
          <Field label="Book"><select value={inf.bookId} onChange={e => setInf(x => ({ ...x, bookId:e.target.value }))} className={inputCls}>{available.map(b => <option key={b.id} value={b.id}>{b.title} ({b.cat})</option>)}</select></Field>
          <Field label="Student"><select value={inf.studentId} onChange={e => setInf(x => ({ ...x, studentId:e.target.value }))} className={inputCls}><option value="">— Select student —</option>{db.students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.cls}</option>)}</select></Field>
          <Field label="Due Date"><input type="date" value={inf.due} min={TODAY} onChange={e => setInf(x => ({ ...x, due:e.target.value }))} className={inputCls} /></Field>
        </div>
      </Modal>
    </>
  );
}

function Analytics({ c, loans, stu, db }) {
  const [catF, setCatF] = useState('all'); const [sel, setSel] = useState('');
  const cats = [...new Set(loans.map(l => l.cat))].sort();
  const count = list => Object.entries(list.reduce((a, l) => ({ ...a, [l.cat]: (a[l.cat] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const byCat = count(catF === 'all' ? loans : loans.filter(l => l.cat === catF));
  const current = loans.filter(l => l.status !== 'Returned'); const curByCat = count(current);
  const overdue = loans.filter(l => l.status === 'Overdue');

  const readers = Object.values(loans.reduce((a, l) => { const r = a[l.studentId] ||= { id:l.studentId, n:0, cats:new Set() }; r.n++; r.cats.add(l.cat); return a; }, {})).sort((a, b) => b.n - a.n).slice(0, 5);

  const mine = loans.filter(l => l.studentId === sel); const s = stu(sel);
  const top = count(mine)[0]?.[0]; const level = mine.length >= 5 ? ['Avid Reader', '#166534'] : mine.length >= 3 ? ['Regular Reader', '#1A5FB4'] : mine.length ? ['Occasional Reader', '#B45309'] : ['No records', '#AAA'];
  const tags = [...new Set([...count(mine).map(e => e[0]), ...(s?.hobbies || '').split(',').map(x => x.trim()).filter(Boolean)])].slice(0, 6);

  return (
    <div className="space-y-3">
      <Collapsible defaultOpen header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Issues by Category</span>
        <select value={catF} onClick={e => e.stopPropagation()} onChange={e => setCatF(e.target.value)} className="ml-auto px-2 py-1 border border-[#E4E4E4] rounded-[6px] text-[12px] outline-none"><option value="all">All categories</option>{cats.map(x => <option key={x}>{x}</option>)}</select></div>}>
        <div className="p-4 border-t border-[#E4E4E4] space-y-3">
          {byCat.map(([k, n], i) => (<div key={k}><div className="flex justify-between text-[13px] mb-1"><span className="font-semibold text-[#333]">{k}</span><span className="font-bold" style={{ color:BAR[i % BAR.length] }}>{n} issues</span></div>
            <div className="h-2.5 bg-[#E4E4E4] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${n / byCat[0][1] * 100}%`, background:BAR[i % BAR.length] }} /></div></div>))}
        </div>
      </Collapsible>

      <Collapsible header={<span className="text-[13.5px] font-bold text-[#111]">Currently Issued ({current.length})</span>}>
        <div className="p-4 border-t border-[#E4E4E4]">
          {!curByCat.length ? <div className="text-[#AAA] text-[13px]">No books currently issued</div> : <>
            <div className="flex gap-1 mb-3">{curByCat.map(([k, n], i) => <div key={k} title={`${k}: ${n}`} style={{ flex:n, background:BAR[i % BAR.length] }} className="h-5 rounded-[3px] min-w-[20px]" />)}</div>
            {curByCat.map(([k, n], i) => <div key={k} className="flex items-center gap-2 text-[12.5px] py-0.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background:BAR[i % BAR.length] }} /><span className="flex-1 text-[#333]">{k}</span><b>{n}</b><span className="text-[#AAA] w-10 text-right">{Math.round(n / current.length * 100)}%</span></div>)}</>}
        </div>
      </Collapsible>

      <Collapsible defaultOpen={overdue.length > 0} header={<div className="flex items-center gap-2"><span className="text-[13.5px] font-bold text-[#111]">⚠ Overdue</span><Badge variant={overdue.length ? 'red' : 'green'}>{overdue.length}</Badge></div>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">
          {!overdue.length ? <div className="p-4 text-[13px] text-[#AAA]">No overdue books</div> : overdue.map((l, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5"><div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{l.title}</div><div className="text-[11.5px] text-[#777]">{stu(l.studentId)?.name} · {stu(l.studentId)?.cls}</div></div><span className="text-[12px] font-bold text-[#DC2626]">Due {prettyDate(l.due)}</span></div>))}
        </div>
      </Collapsible>

      <Collapsible header={<span className="text-[13.5px] font-bold text-[#111]">🏆 Top Readers</span>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">
          {readers.map((r, i) => <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-6 h-6 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center" style={{ background:['#D4A017', '#9CA3AF', '#B87333', '#166534', '#9A1822'][i] }}>{i + 1}</div>
            <div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{stu(r.id)?.name || r.id}</div><div className="text-[11.5px] text-[#777]">{[...r.cats].slice(0, 3).join(', ')}</div></div><span className="text-[15px] font-extrabold text-[#166534]">{r.n}</span></div>)}
        </div>
      </Collapsible>

      <Collapsible defaultOpen header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Student Reading Profile</span>
        <select value={sel} onClick={e => e.stopPropagation()} onChange={e => setSel(e.target.value)} className="ml-auto px-2 py-1 border border-[#E4E4E4] rounded-[6px] text-[12px] outline-none"><option value="">Select student…</option>{db.students.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>}>
        <div className="p-4 border-t border-[#E4E4E4]">
          {!s ? <div className="text-center py-6 text-[#AAA] text-[13px]">Select a student to see their reading profile</div> : (
            <div className="grid grid-cols-[260px_1fr] gap-5">
              <div className="bg-[#F8F8F8] rounded-[10px] p-4">
                <div className="flex items-center gap-3 mb-4"><div className="w-11 h-11 rounded-full text-white font-extrabold flex items-center justify-center" style={{ background:COLORS[db.students.indexOf(s) % COLORS.length] }}>{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div><div><div className="text-[14px] font-extrabold text-[#111]">{s.name}</div><div className="text-[12px] text-[#777]">{s.cls} {s.section}</div></div></div>
                <div className="bg-white rounded-[8px] p-3 text-center mb-3"><div className="text-[24px] font-extrabold" style={{ color:level[1] }}>{mine.length}</div><div className="text-[11px] text-[#777]">Books read / in progress</div><div className="text-[12px] font-semibold mt-1" style={{ color:level[1] }}>{level[0]}</div></div>
                <div className="text-[10.5px] font-bold text-[#777] uppercase tracking-wider mb-1.5">Interests</div>
                <div className="flex flex-wrap gap-1.5 mb-3">{tags.map(t => <span key={t} className="px-2.5 py-0.5 bg-[#FEF4F4] text-[#C8202E] border border-[#FECACA] rounded-full text-[11.5px] font-semibold">{t}</span>)}{!tags.length && <span className="text-[12px] text-[#AAA]">—</span>}</div>
                <div className="text-[10.5px] font-bold text-[#777] uppercase tracking-wider mb-1.5">Recommended next</div>
                {(RECS[top] || RECS.Fiction).map(r => <div key={r} className="text-[12.5px] text-[#333] py-1 border-b border-[#E4E4E4] last:border-b-0">📖 {r}</div>)}
              </div>
              <div>
                <div className="text-[10.5px] font-bold text-[#777] uppercase tracking-wider mb-2">Reading history ({mine.length})</div>
                {!mine.length ? <div className="text-center py-8 text-[#AAA]">No reading records for this student</div> : mine.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-[#E4E4E4] last:border-b-0"><div className="flex-1"><div className="text-[13px] text-[#111]">{l.title}</div><div className="text-[11.5px] text-[#AAA]">{l.cat}</div></div>
                    <Badge variant={l.status === 'Returned' ? 'grey' : l.status === 'Overdue' ? 'red' : 'green'}>{l.status}</Badge><span className="text-[11px] text-[#AAA] w-14 text-right">{prettyDate(l.due)}</span></div>))}
              </div>
            </div>)}
        </div>
      </Collapsible>
    </div>
  );
}

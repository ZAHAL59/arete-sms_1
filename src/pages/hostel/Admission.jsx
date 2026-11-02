import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ReceiptModal from '../finance/modals/ReceiptModal';
import { Field, inputCls } from './ui';
import { MONTHLY_FEE, fmt, TODAY, DEFAULT_FEE_HEADS } from './constants';
import { headStatus, headCategory } from './hostelFees';
import { getFeeStructure, PAY_MODES } from '../finance/constants';

const DIETS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No preference'];
const HOSTEL_CATS = ['Hostel Monthly', 'Hostel Fee'];
const monthName = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
function ayMonths() {
  const y = +TODAY.slice(0, 4), m = +TODAY.slice(5, 7), sy = m >= 6 ? y : y - 1;
  return Array.from({ length: 12 }, (_, i) => { const mm = ((5 + i) % 12) + 1, yy = mm >= 6 ? sy : sy + 1; return `${yy}-${String(mm).padStart(2, '0')}`; });
}
const classOf = s => `${s.cls} ${s.section}`.trim();
const Card = ({ title, note, children }) => (
  <div className="bg-white border border-[#E4E4E4] rounded-[12px] mb-4 shadow-[0_1px_4px_rgba(0,0,0,.07)]">
    <div className="px-5 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] rounded-t-[12px] flex items-baseline gap-2"><span className="text-[13.5px] font-bold text-[#111]">{title}</span>{note && <span className="text-[11.5px] text-[#AAA]">{note}</span>}</div>
    <div className="p-5">{children}</div>
  </div>
);
const Info = ({ l, v }) => <div className="bg-[#F8F8F8] rounded-[6px] p-2.5"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-0.5">{l}</div><div className="text-[12.5px] text-[#333] font-semibold break-words">{v || '—'}</div></div>;

export default function Admission({ h, admitStudent, go }) {
  const db = useStore(s => s.db); const updateDB = useStore(s => s.updateDB);
  const months = ayMonths();
  const blank = { date: TODAY, gender: '', emergencyName: '', emergencyPhone: '', localName: '', localPhone: '', diet: 'Vegetarian', health: '', medication: '', needs: '', notes: '' };
  const [cls, setCls] = useState(''); const [stuId, setStuId] = useState(''); const [f, setF] = useState(blank); const [roomId, setRoomId] = useState('');
  const [payN, setPayN] = useState(1); const [from, setFrom] = useState(months.includes(TODAY.slice(0, 7)) ? TODAY.slice(0, 7) : months[0]);
  const [mode, setMode] = useState(PAY_MODES[0]); const [payDate, setPayDate] = useState(TODAY); const [ref, setRef] = useState('');
  const [errs, setErrs] = useState([]); const [done, setDone] = useState(null); const [receipt, setReceipt] = useState(null);
  const heads = h.feeHeads || DEFAULT_FEE_HEADS;
  const [hv, setHv] = useState({});     // headId -> { on, amount }
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  // Only students who have already taken school admission and are not currently in a hostel room
  const placed = useMemo(() => new Set(h.rooms.flatMap(r => r.inmates)), [h.rooms]);
  const eligible = db.students.filter(s => (s.status || 'Active') === 'Active' && !placed.has(s.name));
  const classes = [...new Set(eligible.map(classOf))].sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')) || a.localeCompare(b));
  const inClass = eligible.filter(s => classOf(s) === cls);
  const stu = db.students.find(s => s.id === stuId);
  const prior = stu && (h.admissions || []).find(a => a.studentId === stu.id);

  function pickClass(c) { setCls(c); setStuId(''); setRoomId(''); setF(blank); setErrs([]); }
  const initHeads = sid => setHv(Object.fromEntries(heads.map(x => { const st = headStatus(db.payments, sid, x); return [x.id, { on: st.balance > 0, amount: String(st.balance) }]; })));
  function pickStudent(id) {
    setStuId(id); setRoomId(''); setErrs([]); initHeads(id); const s = db.students.find(x => x.id === id); if (!s) return setF(blank);
    const r = (h.admissions || []).find(a => a.studentId === id);
    setF({ ...blank, gender: s.gender || '', emergencyName: r?.emergencyName ?? s.parentName ?? '', emergencyPhone: r?.emergencyPhone ?? s.parentPhone ?? '', localName: r?.localName || '', localPhone: r?.localPhone || '',
      diet: s.diet || 'Vegetarian', health: s.health && s.health !== 'None' ? s.health : '', medication: s.medication || '', needs: s.needs && s.needs !== 'None' ? s.needs : '', notes: r?.notes || '' });
  }

  // Rooms: not staff, a free bed, and matching the student's gender when it is known
  const roomType = f.gender === 'Female' ? 'Girls' : f.gender === 'Male' ? 'Boys' : '';
  const rooms = h.rooms.filter(r => r.type !== 'Staff');
  const roomOk = r => r.inmates.length < r.capacity && (!roomType || r.type === roomType);

  // Fee
  const fee = stu ? Math.round((getFeeStructure()[stu.cls]?.hostel || MONTHLY_FEE * 12) / 12) : MONTHLY_FEE;
  const paidFor = (sid, m) => db.payments.filter(p => p.studentId === sid && HOSTEL_CATS.includes(p.category) && (p.period ? p.period === m : (p.date || '').startsWith(m))).reduce((a, p) => a + p.amount, 0);
  const fromIdx = months.indexOf(from), maxN = Math.max(0, Math.min(3, months.length - fromIdx));
  const lines = stu && payN > 0 ? months.slice(fromIdx, fromIdx + Math.min(payN, maxN)).map(m => ({ month: m, amount: Math.max(0, fee - paidFor(stu.id, m)) })).filter(l => l.amount > 0) : [];
  const headLines = stu ? heads.map(x => ({ head: x, status: headStatus(db.payments, stu.id, x), ...(hv[x.id] || { on: false, amount: '0' }) })).filter(l => l.on && Math.round(+l.amount) > 0).map(l => ({ head: l.head, amount: Math.min(Math.round(+l.amount), l.status.balance) })).filter(l => l.amount > 0) : [];
  const headTotal = headLines.reduce((a, l) => a + l.amount, 0), monthTotal = lines.reduce((a, l) => a + l.amount, 0);
  const payTotal = headTotal + monthTotal;

  const missing = [!stu && 'Select a student', stu && !f.gender && 'Select gender', stu && !f.emergencyPhone.trim() && 'Emergency contact number', stu && !roomId && 'Choose a room'].filter(Boolean);

  function complete() {
    if (missing.length) return setErrs(missing);
    const room = rooms.find(r => r.id === roomId);
    if (!room || !roomOk(room)) return setErrs(['The chosen room is no longer available — choose another.']);
    const mk = (extra, i) => ({ id: 'RC-' + Date.now().toString().slice(-8) + String(i) + Math.floor(Math.random() * 9), studentId: stu.id, amount: 0, date: payDate, mode, ref: ref.trim(), ...extra });
    const pays = [...headLines.map((l, i) => mk({ category: headCategory(l.head), head: l.head.id, amount: l.amount }, i)), ...lines.map((l, i) => mk({ category: 'Hostel Monthly', period: l.month, amount: l.amount }, i + 20))];
    updateDB(d => {
      const s = d.students.find(x => x.id === stu.id);
      if (s) Object.assign(s, { boarding: true, gender: f.gender, diet: f.diet, health: f.health.trim() || 'None', needs: f.needs.trim() || 'None', medication: f.medication.trim(), emergencyName: f.emergencyName.trim(), emergencyPhone: f.emergencyPhone.trim() });
      pays.forEach(p => d.payments.unshift(p)); return d;
    });
    admitStudent({ studentId: stu.id, name: stu.name, cls: stu.cls, section: stu.section, date: f.date, gender: f.gender, emergencyName: f.emergencyName.trim(), emergencyPhone: f.emergencyPhone.trim(), localName: f.localName.trim(), localPhone: f.localPhone.trim(), diet: f.diet, health: f.health.trim(), medication: f.medication.trim(), needs: f.needs.trim(), notes: f.notes.trim(), payIds: pays.map(p => p.id) }, roomId);
    setDone({ stu, room, pays, f });
  }
  function reset() { setDone(null); setCls(''); setStuId(''); setRoomId(''); setF(blank); setErrs([]); setRef(''); setPayN(1); setHv({}); }

  /* ───── completed ───── */
  if (done) return (
    <div className="p-6">
      <PageHeader title="Hostel Admission" subtitle="Details, room and first fee payment — completed" />
      <div className="bg-white border border-[#BBF7D0] rounded-[12px] p-6 max-w-[760px]">
        <div className="flex items-center gap-3 mb-4"><div className="w-11 h-11 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[22px]">✓</div><div><div className="text-[17px] font-extrabold text-[#111]">{done.stu.name} is admitted to the hostel</div><div className="text-[12.5px] text-[#777]">{done.stu.cls} {done.stu.section} · admission date {done.f.date}</div></div></div>
        <div className="grid grid-cols-3 gap-2.5 mb-4"><Info l="Room" v={`${done.room.id} (${done.room.type})`} /><Info l="Monthly fee" v={fmt(fee)} /><Info l="Paid now" v={done.pays.length ? fmt(done.pays.reduce((a, p) => a + p.amount, 0)) : 'Nothing — pay later'} /></div>
        {done.pays.length > 0 && <div className="mb-4"><div className="text-[10.5px] font-bold text-[#AAA] uppercase tracking-wider mb-1.5">Receipts</div><div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4]">{done.pays.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-3 py-2 text-[12.5px]"><span className="font-mono text-[11.5px] text-[#C8202E] font-bold">{p.id}</span><span className="flex-1 text-[#555]">{p.period ? `Hostel fee — ${monthName(p.period)}` : p.category}</span><b className="font-mono">{fmt(p.amount)}</b><Button size="sm" variant="outline" onClick={() => setReceipt(p)}>View receipt</Button></div>))}</div></div>}
        <div className="text-[12px] text-[#777] mb-4">The payment is also recorded in Finance. Collect the remaining months from <b>Hostel Fees</b>.</div>
        <div className="flex gap-2"><Button onClick={reset}>+ Admit another student</Button><Button variant="outline" onClick={() => go('rooms')}>View room allocation</Button><Button variant="outline" onClick={() => go('fees')}>Hostel fees</Button></div>
      </div>
      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );

  /* ───── the single flow ───── */
  return (
    <div className="p-6">
      <PageHeader title="Hostel Admission" subtitle="Admit an enrolled student to the hostel — details, room and first fee payment in one step" />
      {!classes.length ? <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center max-w-[620px]"><div className="text-[32px] mb-2">🏠</div><div className="text-[15px] font-bold text-[#111] mb-1">No students to admit</div><div className="text-[13px] text-[#AAA]">Every enrolled student already has a hostel room. New students appear here once they are enrolled in the school (Admissions).</div></div> :
      <div className="grid grid-cols-[1fr_300px] gap-5 items-start">
        <div>
          <Card title="Student" note="Only students already enrolled in the school are listed">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Class"><select value={cls} onChange={e => pickClass(e.target.value)} className={inputCls}><option value="">Select class</option>{classes.map(c => <option key={c} value={c}>{c} ({eligible.filter(s => classOf(s) === c).length})</option>)}</select></Field>
              <Field label="Student"><select value={stuId} disabled={!cls} onChange={e => pickStudent(e.target.value)} className={inputCls + (cls ? '' : ' opacity-50')}><option value="">{cls ? `Select student (${inClass.length})` : 'Select a class first'}</option>{inClass.map(s => <option key={s.id} value={s.id}>{s.name} — Roll {s.roll || '—'}</option>)}</select></Field>
            </div>
            {stu && <div className="grid grid-cols-4 gap-2"><Info l="Admission no." v={stu.id} /><Info l="Date of birth" v={stu.dob} /><Info l="Parent / guardian" v={stu.parentName} /><Info l="Parent phone" v={stu.parentPhone} /></div>}
            {prior && <div className="mt-3 text-[12px] text-[#B45309] bg-[#FFFBEB] rounded-[6px] px-3 py-2">Already has a hostel admission record from {prior.date} — details are filled in; completing this updates the record and room.</div>}
          </Card>

          {stu && <>
            <Card title="Admission details">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Hostel admission date"><input type="date" value={f.date} onChange={e => set('date', e.target.value)} className={inputCls} /></Field>
                <Field label="Gender *"><select value={f.gender} onChange={e => { set('gender', e.target.value); setRoomId(''); }} className={inputCls}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
                <Field label="Diet"><select value={f.diet} onChange={e => set('diet', e.target.value)} className={inputCls}>{DIETS.map(d => <option key={d}>{d}</option>)}</select></Field>
                <Field label="Emergency contact name"><input value={f.emergencyName} onChange={e => set('emergencyName', e.target.value)} className={inputCls} /></Field>
                <Field label="Emergency contact number *"><input value={f.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} className={inputCls} /></Field>
                <div />
                <Field label="Local guardian (optional)"><input value={f.localName} onChange={e => set('localName', e.target.value)} className={inputCls} /></Field>
                <Field label="Local guardian number"><input value={f.localPhone} onChange={e => set('localPhone', e.target.value)} className={inputCls} /></Field>
                <div />
                <Field label="Medical conditions / allergies"><input value={f.health} onChange={e => set('health', e.target.value)} placeholder="None" className={inputCls} /></Field>
                <Field label="Regular medication"><input value={f.medication} onChange={e => set('medication', e.target.value)} placeholder="None" className={inputCls} /></Field>
                <Field label="Special needs"><input value={f.needs} onChange={e => set('needs', e.target.value)} placeholder="None" className={inputCls} /></Field>
                <Field label="Notes" className="col-span-3"><input value={f.notes} onChange={e => set('notes', e.target.value)} className={inputCls} /></Field>
              </div>
            </Card>

            <Card title="Room" note={roomType ? `Showing ${roomType.toLowerCase()} rooms with a free bed` : 'Select gender to filter rooms'}>
              <div className="grid grid-cols-4 gap-2.5">{rooms.map(r => { const ok = roomOk(r), sel = roomId === r.id, free = r.capacity - r.inmates.length;
                return <button key={r.id} disabled={!ok} onClick={() => setRoomId(r.id)} className={`text-left rounded-[10px] border-[1.5px] p-3 transition-all ${sel ? 'border-[#C8202E] bg-[#FEF4F4]' : ok ? 'border-[#E4E4E4] bg-white hover:border-[#C8202E] cursor-pointer' : 'border-[#EEE] bg-[#FAFAFA] opacity-50 cursor-not-allowed'}`}>
                  <div className="flex items-center justify-between"><span className="text-[14px] font-extrabold text-[#111]">{r.id}</span><Badge variant={r.type === 'Girls' ? 'purple' : 'blue'}>{r.type}</Badge></div>
                  <div className="text-[11.5px] mt-1" style={{ color: free ? '#166534' : '#DC2626' }}>{free ? `${free} of ${r.capacity} beds free` : 'Full'}</div></button>; })}</div>
            </Card>

            <Card title="Fee payment" note={`Recorded in Finance · monthly hostel fee ${fmt(fee)}`}>
              <div className="flex items-center mb-1.5"><span className="text-[10.5px] font-bold text-[#AAA] uppercase tracking-wider">Admission fee & deposits</span><span className="ml-auto text-[11.5px] text-[#AAA]">Amounts are set in Hostel Fees → Fee structure</span></div>
              <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4] mb-4">{heads.map(x => { const st = headStatus(db.payments, stu.id, x), v = hv[x.id] || { on: false, amount: '0' };
                return (
                  <label key={x.id} className={`flex items-center gap-3 px-3 py-2.5 ${st.balance ? 'cursor-pointer hover:bg-[#F8F8F8]' : 'bg-[#FAFAFA]'}`}>
                    <input type="checkbox" disabled={!st.balance} checked={st.balance > 0 && !!v.on} onChange={e => setHv(o => ({ ...o, [x.id]: { ...v, on: e.target.checked } }))} className="accent-[#C8202E] w-4 h-4" />
                    <div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{x.name}</div><div className="text-[11px] text-[#AAA]">{x.kind}{x.kind !== 'One-time fee' ? ' · held, not income' : ''}</div></div>
                    {st.balance ? <><span className="text-[11.5px] text-[#AAA]">{st.paid ? `${fmt(st.paid)} paid · balance ${fmt(st.balance)}` : fmt(x.amount)}</span><input type="number" min={0} max={st.balance} disabled={!v.on} value={v.amount} onChange={e => setHv(o => ({ ...o, [x.id]: { ...v, amount: e.target.value } }))} className="w-24 px-2 py-1 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[12.5px] text-right outline-none focus:border-[#C8202E] disabled:opacity-40" /></> : <span className="text-[12px] font-semibold text-[#166534]">✓ Paid {fmt(st.paid)}</span>}
                  </label>); })}</div>

              <div className="text-[10.5px] font-bold text-[#AAA] uppercase tracking-wider mb-1.5">Monthly hostel fee</div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <Field label="Pay now"><select value={payN} onChange={e => setPayN(+e.target.value)} className={inputCls}><option value={0}>Pay later</option>{[1, 2, 3].filter(n => n <= maxN).map(n => <option key={n} value={n}>{n} month{n > 1 ? 's' : ''}</option>)}</select></Field>
                <Field label="Starting from"><select value={from} disabled={!payN} onChange={e => setFrom(e.target.value)} className={inputCls + (payN ? '' : ' opacity-50')}>{months.map(m => <option key={m} value={m}>{monthName(m)}</option>)}</select></Field>
              </div>
              {payN > 0 && <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4] text-[12.5px] mb-4">{lines.length ? lines.map(l => <div key={l.month} className="flex justify-between px-3 py-2"><span>{monthName(l.month)}</span><b className="font-mono">{fmt(l.amount)}</b></div>) : <div className="px-3 py-2 text-[#166534]">The selected month(s) are already paid — nothing to collect.</div>}</div>}
              <div className="text-[11.5px] text-[#AAA] mb-4">From the next month onwards the monthly fee is billed automatically (due by the 10th) under <b>Hostel Fees</b>.</div>

              <div className="text-[10.5px] font-bold text-[#AAA] uppercase tracking-wider mb-1.5">Payment details</div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Payment mode"><select value={mode} disabled={!payTotal} onChange={e => setMode(e.target.value)} className={inputCls + (payTotal ? '' : ' opacity-50')}>{PAY_MODES.map(m => <option key={m}>{m}</option>)}</select></Field>
                <Field label="Payment date"><input type="date" value={payDate} disabled={!payTotal} onChange={e => setPayDate(e.target.value)} className={inputCls + (payTotal ? '' : ' opacity-50')} /></Field>
                <Field label="Reference / transaction ID"><input value={ref} disabled={!payTotal} onChange={e => setRef(e.target.value)} placeholder="UPI ref, cheque no…" className={inputCls + (payTotal ? '' : ' opacity-50')} /></Field>
              </div>
            </Card>
          </>}
        </div>

        <div className="sticky top-4">
          <div className="bg-white border border-[#E4E4E4] rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,.07)] overflow-hidden">
            <div className="px-4 py-3 bg-[#F8F8F8] border-b border-[#E4E4E4] text-[13px] font-bold text-[#111]">Admission summary</div>
            <div className="p-4 space-y-2.5 text-[12.5px]">
              {[['Student', stu ? `${stu.name} (${classOf(stu)})` : '—'], ['Room', roomId || '—'], ['Admission date', stu ? f.date : '—'], ['Monthly fee', stu ? fmt(fee) : '—']].map(([l, v]) => <div key={l} className="flex justify-between gap-3"><span className="text-[#AAA]">{l}</span><b className="text-[#111] text-right">{v}</b></div>)}
              {stu && <><div className="flex justify-between"><span className="text-[#AAA]">Admission fee & deposits</span><b className="font-mono text-[#111]">{fmt(headTotal)}</b></div><div className="flex justify-between"><span className="text-[#AAA]">Monthly fee</span><b className="font-mono text-[#111]">{fmt(monthTotal)}</b></div></>}
              <div className="flex justify-between pt-2.5 border-t border-[#E4E4E4]"><span className="text-[#AAA]">Paying now</span><b className="font-mono text-[15px] text-[#C8202E]">{stu ? fmt(payTotal) : '—'}</b></div>
            </div>
            <div className="px-4 pb-4">
              {(errs.length > 0 || (stu && missing.length > 0)) && <ul className="text-[11.5px] text-[#B45309] bg-[#FFFBEB] rounded-[6px] px-3 py-2 mb-3 list-disc list-inside">{(errs.length ? errs : missing).map(m => <li key={m}>{m}</li>)}</ul>}
              <Button className="w-full justify-center" disabled={!stu} onClick={complete}>Complete hostel admission</Button>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

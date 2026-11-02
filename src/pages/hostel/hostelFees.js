// Hostel fee rules in one place: monthly dues, arrears and the one-time heads (admission fee, deposits, advances).
import { TODAY, HOSTEL_DUE_DAY } from './constants';

export const MONTHLY_CATS = ['Hostel Monthly', 'Hostel Fee'];
export const monthName = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
export const monthShort = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

// Academic-year months, June → May
export function ayMonths(today = TODAY) {
  const y = +today.slice(0, 4), m = +today.slice(5, 7), sy = m >= 6 ? y : y - 1;
  return Array.from({ length: 12 }, (_, i) => { const mm = ((5 + i) % 12) + 1, yy = mm >= 6 ? sy : sy + 1; return `${yy}-${String(mm).padStart(2, '0')}`; });
}

export const headCategory = h => h.id === 'adm' ? 'Hostel Admission Fee' : h.id === 'caution' ? 'Hostel Caution Deposit' : h.id === 'mess' ? 'Hostel Mess Advance' : 'Hostel — ' + h.name;
export const isHostelPay = p => (p.category || '').startsWith('Hostel') && !!p.studentId;
export const isMonthlyPay = p => MONTHLY_CATS.includes(p.category);

// Paid towards one month's fee (older payments without a period count by their date)
export const paidForMonth = (payments, sid, m) => payments.filter(p => p.studentId === sid && isMonthlyPay(p) && (p.period ? p.period === m : (p.date || '').startsWith(m))).reduce((a, p) => a + p.amount, 0);

// The month a student's hostel fees start from: admission record → first hostel payment → this month
export function joinMonth(sid, record, payments, today = TODAY) {
  if (record?.date) return record.date.slice(0, 7);
  const first = payments.filter(p => p.studentId === sid && isMonthlyPay(p)).map(p => p.period || (p.date || '').slice(0, 7)).filter(Boolean).sort()[0];
  return first || today.slice(0, 7);
}

export const dueDate = m => `${m}-${String(HOSTEL_DUE_DAY).padStart(2, '0')}`;
export const isOverdue = (m, today = TODAY) => today > dueDate(m);

// Months from the join month up to `upTo` (inside the academic year) that still have a balance, oldest first
export function pendingMonths({ sid, record, payments, fee, upTo, today = TODAY }) {
  const months = ayMonths(today), start = Math.max(0, months.indexOf(joinMonth(sid, record, payments, today) < months[0] ? months[0] : joinMonth(sid, record, payments, today)));
  const end = months.indexOf(upTo); if (end < 0) return [];
  return months.slice(start, end + 1).map(month => { const paid = paidForMonth(payments, sid, month); return { month, fee, paid, balance: Math.max(0, fee - paid) }; }).filter(x => x.balance > 0);
}

// Spread an amount over months, oldest first
export function allocate(amount, months) {
  let left = amount; const out = [];
  for (const m of months) { if (left <= 0) break; const a = Math.min(left, m.balance); out.push({ month: m.month, amount: a }); left -= a; }
  return out;
}

// One-time head status for a student
export function headStatus(payments, sid, head) {
  const cat = headCategory(head);
  const paid = payments.filter(p => p.studentId === sid && (p.head === head.id || p.category === cat)).reduce((a, p) => a + p.amount, 0);
  return { paid, balance: Math.max(0, head.amount - paid) };
}

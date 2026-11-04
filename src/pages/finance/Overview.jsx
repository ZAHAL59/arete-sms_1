import { useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import { plural } from '../../components/shell/Page';
import { prettyDate } from '../principal/constants';
import { getStudentDue, countsTowardDue, paidTowardDue, fmt, fmtL, TODAY } from './constants';

export const APPS = [
  { id: 'fees', name: 'Fees', icon: '💳', desc: 'Collection, student ledger, receipts and reports', pages: [['feeoverview', 'Fee Overview', '💳'], ['students', 'Student Ledger', '👤'], ['payments', 'Payment History', '📋'], ['reports', 'Reports', '📄']] },
  { id: 'payroll', name: 'Payroll & Budget', icon: '💰', desc: 'Staff salaries and budget against actuals', pages: [['payroll', 'Staff Payroll', '💰'], ['budget', 'Budget vs Actual', '📊']] },
];

export function useFinanceSummary(allPayments, go) {
  const db = useStore(s => s.db);
  return useMemo(() => {
    const month = TODAY.slice(0, 7);
    const totalDue = db.students.reduce((a, s) => a + getStudentDue(s), 0);
    const collected = allPayments.filter(p => p.studentId && countsTowardDue(p)).reduce((a, p) => a + p.amount, 0);
    const pct = totalDue ? Math.round(collected / totalDue * 1000) / 10 : 0;
    const thisMonth = allPayments.filter(p => p.studentId && countsTowardDue(p) && (p.date || '').startsWith(month)).reduce((a, p) => a + p.amount, 0);
    const today = allPayments.filter(p => p.studentId && p.date === TODAY);
    const owing = db.students.map(s => ({ s, bal: Math.max(0, getStudentDue(s) - paidTowardDue(allPayments, s.id)) })).filter(x => x.bal > 0).sort((a, b) => b.bal - a.bal);
    const paidStaff = new Set(allPayments.filter(p => p.staffId && p.category === 'Staff Salary' && (p.date || '').startsWith(month)).map(p => p.staffId));
    const unpaidStaff = db.staff.filter(s => !paidStaff.has(s.id));
    const recent = allPayments.filter(p => p.studentId).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
    const noPayment = db.students.filter(s => !allPayments.some(p => p.studentId === s.id && countsTowardDue(p)));
    const attention = [
      ...(unpaidStaff.length ? [{ id: 'pay', letter: '₹', color: '#B45309', title: `Payroll pending for ${plural(unpaidStaff.length, 'staff member')}`, sub: `${fmtL(unpaidStaff.reduce((a, s) => a + (s.salary || 0), 0))} for this month`, actions: [{ label: 'Open payroll', run: () => go('payroll') }] }] : []),
      ...(noPayment.length ? [{ id: 'np', letter: '!', color: '#B91C1C', title: `${plural(noPayment.length, 'student')} with no fee paid yet`, sub: 'Follow up with parents', actions: [{ label: 'Open ledger', variant: 'outline', run: () => go('students') }] }] : []),
    ];
    return { db, totalDue, collected, pct, outstanding: Math.max(0, totalDue - collected), thisMonth, today, owing, unpaidStaff, paidCount: paidStaff.size, recent, noPayment, attention };
  }, [allPayments, db]);   // eslint-disable-line react-hooks/exhaustive-deps
}

export function financeHub(S, go) {
  const payrollTotal = S.db.staff.reduce((a, s) => a + (s.salary || 0), 0);
  const pulse = [
    { label: 'Collected', value: fmtL(S.collected), note: `${S.pct}% of ${fmtL(S.totalDue)}`, color: '#166534', run: () => go('feeoverview') },
    { label: 'Outstanding', value: fmtL(S.outstanding), note: `${S.owing.length} students owe`, color: '#B91C1C', run: () => go('students') },
    { label: 'Receipts today', value: S.today.length, note: S.today.length ? fmt(S.today.reduce((a, p) => a + p.amount, 0)) : 'None yet', color: '#1A5FB4', run: () => go('payments') },
    { label: 'Payroll paid', value: `${S.paidCount}/${S.db.staff.length}`, note: 'This month', color: S.unpaidStaff.length ? '#B45309' : '#166534', run: () => go('payroll') },
  ];
  const today = S.today.map(p => ({ id: p.id, title: `${S.db.students.find(s => s.id === p.studentId)?.name || '—'} · ${p.category}`, time: p.mode, tag: fmt(p.amount) }));
  const cfg = {
    fees: { kicker: 'FEES · THIS ACADEMIC YEAR', title: `${fmtL(S.collected)} collected`, sub: `${S.pct}% of ${fmtL(S.totalDue)} billed · ${fmt(S.outstanding)} still to collect`, progress: S.pct,
      actions: [{ label: 'Record a payment', primary: true, page: 'students' }, { label: 'Payment history', page: 'payments' }],
      tiles: [{ label: 'This month', value: fmtL(S.thisMonth), note: 'Fee payments', color: '#166534', page: 'payments' }, { label: 'Outstanding', value: fmtL(S.outstanding), note: `${S.owing.length} students`, color: '#B91C1C', page: 'students' }, { label: 'Receipts today', value: S.today.length, note: 'Issued today', color: '#1A5FB4', page: 'payments' }, { label: 'No payment yet', value: S.noPayment.length, note: 'Students', color: S.noPayment.length ? '#B45309' : '#166534', page: 'students' }],
      panels: [{ title: 'Recent payments', meta: plural(S.recent.length, 'receipt'), action: { label: 'All payments', page: 'payments' }, rows: S.recent.map(p => ({ key: p.id, icon: '🧾', title: `${S.db.students.find(s => s.id === p.studentId)?.name || '—'} · ${p.category}`, sub: `${p.id} · ${prettyDate(p.date)} · ${p.mode}`, right: <b className="font-mono text-[13px] text-[#166534]">{fmt(p.amount)}</b>, page: 'payments' })), empty: { icon: '🧾', title: 'No payments yet' } },
        { title: 'Highest outstanding', meta: plural(S.owing.length, 'student'), rows: S.owing.slice(0, 5).map(({ s, bal }) => ({ key: s.id, icon: '👤', title: s.name, sub: `${s.cls} ${s.section}`, right: <b className="font-mono text-[13px] text-[#B91C1C]">{fmt(bal)}</b>, page: 'students' })), empty: { icon: '✓', title: 'Everyone is paid up' } }] },
    payroll: { kicker: 'PAYROLL · THIS MONTH', title: `${S.paidCount} of ${S.db.staff.length} staff paid`, sub: `${fmtL(payrollTotal)} monthly payroll · ${S.unpaidStaff.length ? `${S.unpaidStaff.length} still to pay` : 'all salaries paid ✓'}`, progress: S.db.staff.length ? Math.round(S.paidCount / S.db.staff.length * 100) : 0,
      actions: [{ label: 'Open payroll', primary: true, page: 'payroll' }, { label: 'Budget vs actual', page: 'budget' }],
      tiles: [{ label: 'Monthly payroll', value: fmtL(payrollTotal), note: 'All staff', color: '#6D28D9', page: 'payroll' }, { label: 'Paid', value: S.paidCount, note: `of ${S.db.staff.length} staff this month`, color: '#166534', bar: S.db.staff.length ? S.paidCount / S.db.staff.length * 100 : 0, page: 'payroll' }, { label: 'Pending', value: S.unpaidStaff.length, note: 'Staff to pay', color: S.unpaidStaff.length ? '#B45309' : '#166534', page: 'payroll' }, { label: 'Pending amount', value: fmtL(S.unpaidStaff.reduce((a, s) => a + (s.salary || 0), 0)), note: 'To be paid', color: '#B91C1C', page: 'payroll' }],
      panels: [{ title: 'Payroll this month', meta: S.unpaidStaff.length ? `${S.unpaidStaff.length} pending` : 'All paid ✓', action: { label: 'Open payroll', page: 'payroll' }, rows: S.unpaidStaff.map(s => ({ key: s.id, icon: '💰', title: s.name, sub: s.subj, right: <Badge variant="amber">{fmt(s.salary)}</Badge>, page: 'payroll' })), empty: { icon: '✓', title: 'Salaries are paid for this month' } }] },
  };
  return { pulse, today, upcoming: [], cfg };
}

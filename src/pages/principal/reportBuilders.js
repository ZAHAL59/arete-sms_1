// Pure report builders: (context, filters) -> { title, columns, rows, note }
import { getStudentDue, paidTowardDue } from '../finance/constants';
import { classLabel, TODAY } from './constants';
import { loanStatus } from '../campus/constants';

const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to);
const stuOf = (ctx, id) => ctx.db.students.find(s => s.id === id);

export function attendanceReport(ctx, { from = '', to = '', grade = '' } = {}) {
  const rows = ctx.db.students.filter(s => !grade || s.cls === grade).map(s => {
    let P = 0, A = 0, L = 0;
    Object.entries(ctx.attLog).forEach(([k, log]) => { if (log[s.id] && inRange(k.slice(-10), from, to)) { const v = log[s.id]; if (v === 'P') P++; else if (v === 'A') A++; else if (v === 'L') L++; } });
    const t = P + A + L; return [s.name, classLabel(s), t, P, A, L, t ? Math.round(P / t * 100) + '%' : '—'];
  });
  return { title: 'Attendance Summary', columns: ['Student', 'Class', 'Days recorded', 'Present', 'Absent', 'Late', 'Attendance %'], rows };
}
export function feeReport(ctx, { from = '', to = '', grade = '' } = {}) {
  const pays = ctx.payments.filter(p => p.studentId && inRange(p.date, from, to) && (!grade || stuOf(ctx, p.studentId)?.cls === grade));
  const rows = pays.map(p => [p.date, p.id, stuOf(ctx, p.studentId)?.name || p.studentId, stuOf(ctx, p.studentId)?.cls || '', p.category, p.mode, p.amount]);
  rows.push(['', '', 'TOTAL', '', '', '', pays.reduce((a, p) => a + p.amount, 0)]);
  return { title: 'Fee Collection Statement', columns: ['Date', 'Receipt', 'Student', 'Class', 'Category', 'Mode', 'Amount (₹)'], rows };
}
export function studentReport(ctx, { grade = '' } = {}) {
  const rows = ctx.db.students.filter(s => !grade || s.cls === grade).map(s => { const paid = paidTowardDue(ctx.payments, s.id);
    return [s.id, s.name, classLabel(s), s.parentName, s.parentPhone, s.boarding ? 'Boarding' : s.busRoute ? 'Bus' : 'Own', Math.max(0, getStudentDue(s) - paid)]; });
  return { title: 'Student Register', columns: ['ID', 'Name', 'Class', 'Guardian', 'Phone', 'Travel', 'Fee balance (₹)'], rows };
}
export function strengthReport(ctx) {
  const by = {}; ctx.db.students.forEach(s => { const k = classLabel(s); (by[k] ||= []).push(s); });
  const rows = Object.entries(by).sort().map(([k, l]) => [k, l.length, l.filter(s => s.boarding).length, l.filter(s => !s.boarding && s.busRoute).length, l.filter(s => !s.boarding && !s.busRoute).length]);
  rows.push(['TOTAL', ctx.db.students.length, ctx.db.students.filter(s => s.boarding).length, ctx.db.students.filter(s => !s.boarding && s.busRoute).length, ctx.db.students.filter(s => !s.boarding && !s.busRoute).length]);
  return { title: 'Student Strength Register', columns: ['Class', 'Students', 'Boarders', 'Bus', 'Own transport'], rows };
}
export function staffReport(ctx) {
  const ym = TODAY.slice(0, 7);
  const rows = ctx.db.staff.map(s => { const paid = ctx.payments.filter(p => p.staffId === s.id && p.category === 'Staff Salary');
    return [s.id, s.name, s.subj, s.joined, s.salary, paid.some(p => p.date.startsWith(ym)) ? 'Paid' : 'Pending', paid.reduce((a, p) => a + p.amount, 0)]; });
  rows.push(['', 'TOTAL', '', '', ctx.db.staff.reduce((a, s) => a + s.salary, 0), '', rows.reduce((a, r) => a + r[6], 0)]);
  return { title: 'Staff Payroll Statement', columns: ['ID', 'Name', 'Subject', 'Joined', 'Monthly salary (₹)', 'This month', 'Paid to date (₹)'], rows };
}
export function complianceReport(ctx) {
  const st = ctx.db.students.length, sf = ctx.db.staff.length;
  const rows = [['Total students', st], ['Total teaching staff', sf], ['Student : teacher ratio', sf ? (st / sf).toFixed(1) + ' : 1' : '—'], ['Classes / sections', new Set(ctx.db.students.map(classLabel)).size],
    ['Boarders', ctx.db.students.filter(s => s.boarding).length], ['Students using school transport', ctx.db.students.filter(s => s.busRoute).length], ['Vehicles', ctx.db.routes.length], ['Open complaints', (ctx.db.complaints || []).filter(c => c.status === 'Open').length], ['Health incidents logged', ctx.principal.incidents.length]];
  return { title: 'School Data Summary', columns: ['Item', 'Value'], rows, note: 'A data summary to help prepare compliance filings. It is not an official CBSE form.' };
}
export function healthReport(ctx) {
  return { title: 'Health Incident Log', columns: ['Date', 'Student', 'Class', 'Type', 'Incident', 'Action taken', 'Parent notified'], rows: ctx.principal.incidents.map(i => [i.date, i.stu, i.cls, i.type, i.issue, i.action, i.parent]) };
}
export function libraryReport(ctx) {
  return { title: 'Library Status', columns: ['Title', 'Category', 'Status', 'Issued to', 'Due'], rows: ctx.campus.books.map(b => [b.title, b.cat, loanStatus(b), stuOf(ctx, b.issuedTo)?.name || '', b.due || '']) };
}
export const MODULES = { Attendance: attendanceReport, Students: studentReport, Fees: feeReport, Staff: staffReport, Library: libraryReport };
export const STANDARD = [
  ['attendance', 'Monthly Attendance Summary', 'Attendance', attendanceReport], ['fees', 'Fee Collection Statement', 'Finance', feeReport], ['strength', 'Student Strength Register', 'Students', strengthReport],
  ['payroll', 'Staff Payroll Statement', 'HR', staffReport], ['compliance', 'School Data Summary (compliance)', 'Statutory', complianceReport], ['health', 'Health Incident Log', 'Health', healthReport],
];

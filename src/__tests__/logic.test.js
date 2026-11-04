import { describe, it, expect } from 'vitest';
import { countsTowardDue, paidTowardDue, getStudentDue, getFeeStructure, termOf } from '../pages/finance/constants';
import { colOf, periodsFor, uncovered, teachingAt } from '../pages/principal/cover';
import { isOverdue, allocate, pendingMonths, paidForMonth, joinMonth } from '../pages/hostel/hostelFees';
import { scoreApplication } from '../pages/careers/constants';
import { PORTAL_LIST } from '../components/shell/registry';

describe('fees — what counts toward the annual fee', () => {
  it('counts tuition-type payments', () => {
    for (const c of ['Term 1 Fee', 'Term 2 Fee', 'Transport Fee', 'Activity Fee', 'Hostel Monthly', 'Hostel Fee']) expect(countsTowardDue({ category: c }), c).toBe(true);
  });
  it('never counts admission fees, deposits or advances', () => {
    for (const c of ['Admission Fee', 'Hostel Admission Fee', 'Hostel Caution Deposit', 'Hostel Mess Advance', 'Hostel — Uniform']) expect(countsTowardDue({ category: c }), c).toBe(false);
  });
  it('sums only this student’s countable payments', () => {
    const pay = [{ studentId: 'S1', category: 'Term 1 Fee', amount: 8000 }, { studentId: 'S1', category: 'Hostel Caution Deposit', amount: 10000 }, { studentId: 'S2', category: 'Term 1 Fee', amount: 5000 }];
    expect(paidTowardDue(pay, 'S1')).toBe(8000);
    expect(paidTowardDue(pay, 'S3')).toBe(0);
  });
  it('annual due = terms + activity, plus transport for bus riders and hostel for boarders', () => {
    const f = getFeeStructure()['Grade 8'];
    expect(getStudentDue({ cls: 'Grade 8' })).toBe(termOf(f) + f.activity);
    expect(getStudentDue({ cls: 'Grade 8', travel: 'Bus' })).toBe(termOf(f) + f.activity + f.transport);
    expect(getStudentDue({ cls: 'Grade 8', boarding: true })).toBe(termOf(f) + f.activity + f.hostel);
  });
});

describe('substitute cover — timetable helpers', () => {
  // cells are "Subject|Teacher", columns Monday–Friday
  const tt = { 'Grade 8 A': { slots: [{ time: '8:00', cells: ['Maths|Ms. A', 'Eng|Mr. B', 'Sci|Ms. A', 'Soc|Mr. B', 'Maths|Ms. A'] }, { time: '9:30', cells: ['BREAK', 'BREAK', 'BREAK', 'BREAK', 'BREAK'] }, { time: '10:00', cells: ['Eng|Mr. B', 'Maths|Ms. A', 'Eng|Mr. B', 'Sci|Ms. A', 'Eng|Mr. B'] }] } };
  const MON = '2026-11-02', TUE = '2026-11-03', SAT = '2026-11-07', SUN = '2026-11-08';
  it('maps dates to Monday–Friday columns, weekends to none', () => { expect(colOf(MON)).toBe(0); expect(colOf('2026-11-06')).toBe(4); expect(colOf(SAT)).toBe(-1); expect(colOf(SUN)).toBe(-1); });
  it('lists a teacher’s periods for the day, skipping breaks', () => {
    expect(periodsFor(tt, 'Ms. A', MON).map(p => `${p.cls}:${p.row}`)).toEqual(['Grade 8 A:0']);
    expect(periodsFor(tt, 'Ms. A', TUE).map(p => p.row)).toEqual([2]);
    expect(periodsFor(tt, 'Ms. A', SAT)).toEqual([]);
  });
  it('an absent teacher’s periods stay "uncovered" until a substitute is assigned', () => {
    expect(uncovered(tt, [], 'Ms. A', MON)).toHaveLength(1);
    const subs = [{ date: MON, absent: 'Ms. A', cls: 'Grade 8 A', row: 0, sub: 'Mr. B' }];
    expect(uncovered(tt, subs, 'Ms. A', MON)).toHaveLength(0);
    expect(uncovered(tt, subs, 'Ms. A', TUE)).toHaveLength(1);                                   // cover is per date
  });
  it('knows who is teaching in a slot (so they cannot also cover it)', () => { expect([...teachingAt(tt, 0, MON)]).toEqual(['Ms. A']); expect(teachingAt(tt, 1, MON).size).toBe(0); });
});

describe('hostel fees — months, dues and allocation', () => {
  it('a month is overdue after the 10th', () => { expect(isOverdue('2026-10', '2026-10-10')).toBe(false); expect(isOverdue('2026-10', '2026-10-11')).toBe(true); });
  it('spreads a payment over the oldest months first', () => {
    const months = [{ month: '2026-08', balance: 3500 }, { month: '2026-09', balance: 3500 }, { month: '2026-10', balance: 3500 }];
    expect(allocate(8000, months)).toEqual([{ month: '2026-08', amount: 3500 }, { month: '2026-09', amount: 3500 }, { month: '2026-10', amount: 1000 }]);
    expect(allocate(1000, months)).toEqual([{ month: '2026-08', amount: 1000 }]);
    expect(allocate(0, months)).toEqual([]);
  });
  it('finds months that still have a balance, from the join month', () => {
    const payments = [{ studentId: 'S1', category: 'Hostel Monthly', period: '2026-08', amount: 3500 }];
    const pend = pendingMonths({ sid: 'S1', record: { date: '2026-08-05' }, payments, fee: 3500, upTo: '2026-10', today: '2026-10-20' });
    expect(pend.map(m => m.month)).toEqual(['2026-09', '2026-10']);
    expect(pend[0]).toMatchObject({ paid: 0, balance: 3500 });
  });
  it('reads a month’s paid amount and the join month', () => {
    const payments = [{ studentId: 'S1', category: 'Hostel Monthly', period: '2026-09', amount: 1200 }, { studentId: 'S1', category: 'Hostel Monthly', period: '2026-09', amount: 800 }, { studentId: 'S1', category: 'Hostel Caution Deposit', amount: 10000 }];
    expect(paidForMonth(payments, 'S1', '2026-09')).toBe(2000);
    expect(joinMonth('S1', { date: '2026-07-14' }, payments)).toBe('2026-07');
    expect(joinMonth('S1', null, payments, '2026-10-01')).toBe('2026-09');
  });
});

describe('recruitment — CV score guide', () => {
  const vac = { exp: '3+ years' };
  it('weighs qualification, experience against the post, and skills detail', () => {
    expect(scoreApplication({ qual: 'M.Sc + B.Ed', exp: '4 years', skills: 'x'.repeat(40) }, vac)).toBe(95);    // 40 + 30 + 25
    expect(scoreApplication({ qual: 'B.Ed', exp: 'fresher', skills: 'abc' }, vac)).toBe(33);                     // 28 + 0 + 5
    expect(scoreApplication({ qual: 'Ph.D', exp: '5 years', skills: 'x'.repeat(15) }, vac)).toBe(90);            // 40 + 35 + 15
  });
});

describe('portal registry', () => {
  it('has unique ids and addresses', () => {
    expect(new Set(PORTAL_LIST.map(p => p.id)).size).toBe(PORTAL_LIST.length);
    expect(new Set(PORTAL_LIST.map(p => p.to)).size).toBe(PORTAL_LIST.length);
    PORTAL_LIST.forEach(p => expect(p.to.startsWith('/')).toBe(true));
  });
});

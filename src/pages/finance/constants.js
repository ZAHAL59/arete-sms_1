export const FINANCE_KEY = 'ARETE_FINANCE_v1';

export const FEE_CATEGORIES = ['Term 1 Fee','Term 2 Fee','Term 3 Fee','Transport Fee','Hostel Fee','Hostel Monthly','Hostel Admission Fee','Hostel Caution Deposit','Hostel Mess Advance','Activity Fee','Admission Fee','Staff Salary','Other'];
export const PAY_MODES = ['Online / UPI','Cash','Cheque','DD'];
export const BUDGET_DEPTS = ['HR','Transport','Ops','Academic','Admin','Hostel'];

export const BUDGET_SEED = [
  {id:'B001',cat:'Teacher Salaries',      dept:'HR',       budgeted:18000000},
  {id:'B002',cat:'Non-Teaching Salaries', dept:'HR',       budgeted:6000000},
  {id:'B003',cat:'Transport — Total',     dept:'Transport',budgeted:4600000},
  {id:'B004',cat:'Infrastructure',        dept:'Ops',      budgeted:2500000},
  {id:'B005',cat:'Hostel & Mess',         dept:'Hostel',   budgeted:1600000},
  {id:'B006',cat:'Library & Materials',   dept:'Academic', budgeted:450000},
];

// Default fee schedule (from the school's fee structure). Editable in the app — overrides are saved separately.
const FS = (admission, t, transport, activity) => ({ admission, t1: t, t2: t, t3: t, transport, hostel: 42000, activity });
export const DEFAULT_FEE_STRUCTURE = {
  'Grade 1': FS(5000, 8000, 6000, 1800),  'Grade 2': FS(5000, 8000, 6000, 1800),  'Grade 3': FS(5000, 8500, 6000, 1800),  'Grade 4': FS(5000, 8500, 6000, 1800),
  'Grade 5': FS(5000, 9000, 6000, 2500),  'Grade 6': FS(6000, 10000, 6500, 3000), 'Grade 7': FS(6000, 10000, 6500, 3000), 'Grade 8': FS(6000, 11000, 6500, 3000),
  'Grade 9': FS(7000, 12000, 7000, 3500), 'Grade 10': FS(7000, 12000, 7000, 3500), 'Grade 11': FS(8000, 14000, 7000, 4000), 'Grade 12': FS(8000, 14000, 7000, 4000),
};
export const FEE_GRADES = Object.keys(DEFAULT_FEE_STRUCTURE);
const FS_KEY = 'ARETE_FEESTRUCT_v1';
let _fs = null;
export function getFeeStructure() {
  if (_fs) return _fs;
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(FS_KEY) || '{}'); } catch {}
  return (_fs = { ...DEFAULT_FEE_STRUCTURE, ...saved });
}
export function saveFeeStructure(fs) { try { localStorage.setItem(FS_KEY, JSON.stringify(fs)); } catch {} _fs = null; }
export const termOf = r => (r.t1 || 0) + (r.t2 || 0) + (r.t3 || 0);

// Money that is NOT part of the yearly fee: school admission fee, hostel admission fee, refundable deposits and advances.
// These are collected and receipted, but must never be counted as "paid" against the annual fees.
export function countsTowardDue(p) {
  const c = p.category || '';
  if (c === 'Admission Fee') return false;
  if (c.startsWith('Hostel') && !['Hostel Monthly', 'Hostel Fee'].includes(c)) return false;
  return true;
}
export const paidTowardDue = (payments, sid) => payments.filter(p => p.studentId === sid && countsTowardDue(p)).reduce((a, p) => a + p.amount, 0);

// Annual amount due for a student: terms + activity, plus transport (bus riders) and hostel (boarders)
export function getStudentDue(student) {
  const f = getFeeStructure()[student.cls] || getFeeStructure()['Grade 6'];
  return termOf(f) + (student.travel === 'Bus' ? f.transport : 0) + (student.boarding ? f.hostel : 0) + f.activity;
}

export const FINANCE_SEED = {
  budget: JSON.parse(JSON.stringify(BUDGET_SEED)),
  extraPayments: [], // beyond what's in the main db
};

export function loadFinance() {
  try { const r=localStorage.getItem(FINANCE_KEY); if(r) return {...FINANCE_SEED,...JSON.parse(r)}; } catch {}
  return JSON.parse(JSON.stringify(FINANCE_SEED));
}
export function saveFinance(data) {
  try { localStorage.setItem(FINANCE_KEY, JSON.stringify(data)); } catch {}
}

export const fmt  = n => '₹'+(n||0).toLocaleString('en-IN');
export const fmtL = n => '₹'+((n||0)/100000).toFixed(1)+'L';
export const TODAY = new Date().toISOString().slice(0,10);

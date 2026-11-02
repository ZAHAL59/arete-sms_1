export const JOURNEY_STAGES = [
  {id:'enquiry',     label:'Enquiry',               icon:'📞'},
  {id:'application', label:'Application Received',  icon:'📝'},
  {id:'docs',        label:'Document Verification', icon:'📄'},
  {id:'interview',   label:'Interview / Assessment',icon:'🗓'},
  {id:'seat',        label:'Seat Allocation',        icon:'✅'},
];

export const STAGE_LABELS = {
  enquiry:'Enquiry', application:'Application Received',
  docs:'Docs Pending', interview:'Interview Scheduled',
  seat:'Seat Allocated', waitlisted:'Waitlisted', enrolled:'Enrolled',
};

export const STAGE_ID = {
  'Enquiry':'enquiry','Application Received':'application',
  'Docs Pending':'docs','Interview Scheduled':'interview',
  'Seat Allocated':'seat','Waitlisted':'waitlisted','Enrolled':'enrolled',
};
export const ID_STAGE = Object.fromEntries(Object.entries(STAGE_ID).map(([k,v])=>[v,k]));

export const STAGE_VARIANT = {
  'Enquiry':'grey','Application Received':'blue','Docs Pending':'amber',
  'Interview Scheduled':'purple','Seat Allocated':'green',
  'Waitlisted':'red','Enrolled':'green',
};

export const DOC_KEYS = {
  birthCert:'Birth Certificate', tcCert:'Transfer Certificate (TC)',
  aadhaar:'Aadhaar Card / ID', photos:'Passport Photos (×4)',
  medCert:'Medical Fitness Certificate', addressProof:'Address Proof',
};

export const GRADES = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
  'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12',
];

export const SEED_ADMISSIONS = [
  {id:'ADM-001',name:'Lakshmi T.',     grade:'Grade 1', stage:'Interview Scheduled',applied:'18 Sep',assigned:'Ms. Nisha',parent:'Anand T.',    phone:'9400001111',email:'anand@email.com',  dob:'2017-04-12',address:'Koyilandy',  boarding:false,diet:'Vegetarian',    busRoute:'R001',notes:'Prefers morning session.',seat:'',docs:{birthCert:true, tcCert:false,aadhaar:true, photos:true, medCert:false,addressProof:true}, log:[]},
  {id:'ADM-002',name:'Krish Mohan',    grade:'Grade 4', stage:'Docs Pending',        applied:'17 Sep',assigned:'Mr. Rajan', parent:'Suresh Mohan',phone:'9400002222',email:'suresh@email.com', dob:'2014-07-22',address:'Vatakara',   boarding:false,diet:'Non-Vegetarian',busRoute:'',   notes:'TC from Kerala State.',seat:'',  docs:{birthCert:true, tcCert:false,aadhaar:false,photos:true, medCert:false,addressProof:false},log:[]},
  {id:'ADM-003',name:'Zara Ali',       grade:'Grade 7', stage:'Enquiry',             applied:'16 Sep',assigned:'Unassigned',parent:'Imran Ali',   phone:'9400003333',email:'imran@email.com',  dob:'2011-11-05',address:'Peringathur',boarding:false,diet:'Non-Vegetarian',busRoute:'',   notes:'',          seat:'',  docs:{birthCert:false,tcCert:false,aadhaar:false,photos:false,medCert:false,addressProof:false},log:[]},
  {id:'ADM-004',name:'Nikhil Pillai',  grade:'Grade 10',stage:'Seat Allocated',      applied:'14 Sep',assigned:'Ms. Nisha',parent:'Vijay Pillai', phone:'9400004444',email:'vijay@email.com',  dob:'2008-05-18',address:'Koyilandy',  boarding:true, diet:'Vegetarian',    busRoute:'',   notes:'All docs verified.',seat:'Seat 10B-04',docs:{birthCert:true,tcCert:true,aadhaar:true,photos:true,medCert:true,addressProof:true},log:[]},
  {id:'ADM-005',name:'Amina K.',       grade:'Grade 1', stage:'Waitlisted',          applied:'12 Sep',assigned:'Mr. Rajan', parent:'Khaleel K.',  phone:'9400005555',email:'khaleel@email.com',dob:'2017-02-28',address:'Vatakara',   boarding:false,diet:'Non-Vegetarian',busRoute:'R002',notes:'Waitlist #1',seat:'',  docs:{birthCert:true, tcCert:false,aadhaar:true, photos:true, medCert:false,addressProof:true}, log:[]},
  {id:'ADM-006',name:'Rohan Vijay',    grade:'Grade 6', stage:'Application Received',applied:'10 Sep',assigned:'Ms. Nisha',parent:'Vijay R.',    phone:'9400006666',email:'vijay2@email.com', dob:'2012-09-11',address:'Koyilandy',  boarding:false,diet:'Vegetarian',    busRoute:'R001',notes:'',          seat:'',  docs:{birthCert:true, tcCert:false,aadhaar:true, photos:false,medCert:false,addressProof:false},log:[]},
  {id:'ADM-007',name:'Dev Krishnan',   grade:'Grade 9', stage:'Enquiry',             applied:'08 Sep',assigned:'Unassigned',parent:'Krishnan D.', phone:'9400007777',email:'kd@email.com',     dob:'2009-03-06',address:'Peringathur',boarding:false,diet:'Vegetarian',    busRoute:'',   notes:'',          seat:'',  docs:{birthCert:false,tcCert:false,aadhaar:false,photos:false,medCert:false,addressProof:false},log:[]},
  {id:'ADM-008',name:'Siddharth Kumar',grade:'Grade 8', stage:'Interview Scheduled', applied:'05 Sep',assigned:'Mr. Rajan', parent:'Kumar R.',    phone:'9400008888',email:'kumar@email.com',  dob:'2010-07-22',address:'Vatakara',   boarding:true, diet:'Non-Vegetarian',busRoute:'',   notes:'Strong in maths.',seat:'', docs:{birthCert:true,tcCert:true,aadhaar:true,photos:true,medCert:true,addressProof:false},log:[]},
];

export const STAFF_NAMES = ['Ms. Nisha','Mr. Rajan','Ms. Divya','Unassigned'];

export const CATEGORIES = ['General','Management Quota','Scholarship','Staff Ward','RTE'];
export const LEARNING_STYLES = ['Visual','Auditory','Kinaesthetic','Reading/Writing','Mixed'];
export const DIETS = ['Vegetarian','Non-Vegetarian','Vegan','No preference'];
export const SOURCES = ['Website form','Walk-in','Referral','Phone call','Social media','Alumni family'];
export const SECTION_CAPACITY = 40;
export const FEE_TYPES = ['Admission Fee','Term 1 Fee','Term 2 Fee','Term 3 Fee','Transport Fee','Activity Fee','Hostel Fee'];
const ORDER = ['Enquiry','Application Received','Docs Pending','Interview Scheduled','Seat Allocated'];

// Fill in fields that older saved records don't have
export function normalize(a) {
  const dev = { learningStyle:'Visual', diet:a.diet || 'Vegetarian', hobbies:'', health:'None', needs:'None', behav:'', expPref:'', ...(a.dev || {}) };
  return { gender:'', source:'Website form', interviewDate:'', interviewTime:'', panel:'', interviewNotes:'', section:'', category:'General', ...a, seat:a.seat || '', dev, feeLines:a.feeLines || [], log:(a.log || []).map(l => ({ by:'System', ...l })) };
}

// Data-driven stage: the furthest stage the record justifies (never moves backwards)
export function autoStage(a) {
  if (a.stage === 'Enrolled' || a.stage === 'Waitlisted') return a.stage;
  const app = !!(a.name && a.parent && a.phone), docs = app && Object.values(a.docs).every(Boolean), intv = docs && !!(a.interviewDate && a.interviewTime), seat = intv && !!a.seat;
  const target = seat ? 'Seat Allocated' : intv ? 'Interview Scheduled' : docs ? 'Docs Pending' : app ? 'Application Received' : 'Enquiry';
  return ORDER.indexOf(target) > ORDER.indexOf(a.stage) ? target : a.stage;
}

// LocalStorage key for admissions state
export const ADM_KEY = 'ARETE_ADMISSIONS_v1';

export function loadAdmissions() {
  try {
    const raw = localStorage.getItem(ADM_KEY);
    if (raw) return JSON.parse(raw).map(normalize);
  } catch {}
  return JSON.parse(JSON.stringify(SEED_ADMISSIONS)).map(normalize);
}
export function saveAdmissions(list) {
  try { localStorage.setItem(ADM_KEY, JSON.stringify(list)); } catch {}
}

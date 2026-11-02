export const HR_KEY = 'ARETE_HR_v1';

export const SEED = {
  vacancies: [
    {id:'V001',subj:'Mathematics',dept:'Secondary',qual:'M.Sc Maths + B.Ed',exp:'3+ years',skills:'CBSE, digital tools',count:1,deadline:'2026-11-01',priority:'Urgent',posted:'2026-09-01',status:'Active'},
    {id:'V002',subj:'English',    dept:'Secondary',qual:'MA English + B.Ed', exp:'2+ years',skills:'Creative writing, drama',count:1,deadline:'2026-11-15',priority:'Normal',posted:'2026-09-10',status:'Active'},
    {id:'V003',subj:'Science',    dept:'Secondary',qual:'M.Sc Science + B.Ed',exp:'2+ years',skills:'Lab skills, STEM',count:1,deadline:'2026-12-01',priority:'Normal',posted:'2026-10-01',status:'Active'},
  ],
  candidates: [
    {id:'C001',vacId:'V001',name:'Priya Suresh', qual:'M.Sc Maths, B.Ed',    exp:'5 yrs',contact:'+91 94470 11201',score:88,status:'Interview Scheduled',  notes:'Strong conceptual clarity. Good demo lesson.'},
    {id:'C002',vacId:'V001',name:'Anoop Varma',  qual:'M.Sc Maths, B.Ed',    exp:'3 yrs',contact:'+91 94470 11202',score:76,status:'Shortlisted',  notes:'Adequate. Needs classroom presence work.'},
    {id:'C003',vacId:'V001',name:'Sijo Thomas',  qual:'B.Sc Maths',           exp:'1 yr', contact:'+91 94470 11203',score:48,status:'Rejected',     notes:'Under-qualified.'},
    {id:'C004',vacId:'V002',name:'Reshma K.',    qual:'MA English, B.Ed',     exp:'6 yrs',contact:'+91 94470 11204',score:91,status:'Recommended',  notes:'Excellent creative writing. Strong grammar.'},
    {id:'C005',vacId:'V002',name:'Bindu James',  qual:'MA English, B.Ed',     exp:'4 yrs',contact:'+91 94470 11205',score:74,status:'Shortlisted',  notes:'Good communication, average lesson plan.'},
    {id:'C006',vacId:'V003',name:'Arjun Pillai', qual:'M.Sc Physics, B.Ed',   exp:'3 yrs',contact:'+91 94470 11206',score:82,status:'Shortlisted',  notes:'Strong in Physics. Lab demonstrations good.'},
  ],
  interviews: [
    {id:'I001',candId:'C001',vacId:'V001',date:'2026-11-05',time:'10:00',venue:'Principal Office',panel:'Mr. Paul T., Ms. Latha R.',mode:'In-person',status:'Scheduled',scores:{},remarks:'',decision:''},
    {id:'I002',candId:'C004',vacId:'V002',date:'2026-10-28',time:'11:00',venue:'Staff Room',panel:'Mr. Paul T.',mode:'In-person',status:'Completed',scores:{CL1:22,CL2:21,CL3:24,CL4:20},remarks:'Excellent candidate. Highly recommended.',decision:'Recommended'},
  ],
  checklist: [
    {id:'CL1',crit:'Subject Knowledge & Depth',max:25},
    {id:'CL2',crit:'Classroom Management Ability',max:25},
    {id:'CL3',crit:'Communication & Language',max:25},
    {id:'CL4',crit:'Digital & Technology Integration',max:25},
  ],
  staffDocs: [
    {id:'SD001',staffId:'T001',type:'Appointment Letter',num:'AMS/APT/2019/001',issued:'2019-06-01',expiry:'',notes:''},
    {id:'SD002',staffId:'T001',type:'Aadhaar',num:'XXXX-XXXX-1234',issued:'2018-03-15',expiry:'',notes:''},
    {id:'SD003',staffId:'T002',type:'Degree Certificate',num:'MGU/BSC/2017/5678',issued:'2017-05-20',expiry:'',notes:''},
    {id:'SD004',staffId:'T002',type:'Medical Fitness',num:'MED-2026-001',issued:'2026-04-01',expiry:'2027-03-31',notes:''},
    {id:'SD005',staffId:'T003',type:'Contract',num:'AMS/CON/2018/002',issued:'2018-06-01',expiry:'2028-05-31',notes:''},
    {id:'SD006',staffId:'T004',type:'Police Clearance',num:'PCR/KL/2021/0045',issued:'2021-07-01',expiry:'2023-06-30',notes:''},
    {id:'SD007',staffId:'T005',type:'Appointment Letter',num:'AMS/APT/2022/003',issued:'2022-06-01',expiry:'',notes:''},
    {id:'SD008',staffId:'T005',type:'PAN Card',num:'ABCDE1234F',issued:'2020-01-10',expiry:'',notes:''},
  ],
  training: [
    {id:'TR001',title:'NEP 2020 — Competency Based Education',date:'2026-08-15',duration:'Full day',venue:'Staff Room',trainer:'Dr. Anitha Raj (NIET)',topics:['CBE Framework','Portfolio-based Learning','Outcome Mapping'],attendance:{T001:'present',T002:'present',T003:'present',T004:'present',T005:'present'},status:'Completed'},
    {id:'TR002',title:'SHAPE DLSS — Digital Classroom Tools',date:'2026-09-02',duration:'Half day',venue:'Computer Lab',trainer:'Muhd Zahal',topics:['DLSS Overview','Resource Library','Lesson Planning'],attendance:{T001:'present',T002:'present',T003:'present',T004:'absent'},status:'Completed'},
    {id:'TR003',title:'Classroom Differentiation Strategies',date:'2026-11-10',duration:'Full day',venue:'Conference Room',trainer:'Dr. Anitha Raj',topics:['Mixed-ability classes','Task scaffolding','Assessment variety'],attendance:{},status:'Upcoming'},
    {id:'TR004',title:'Google Classroom & Digital Tools',date:'2026-12-05',duration:'Half day',venue:'Computer Lab',trainer:'Muhd Zahal',topics:['Google Classroom setup','Forms for assessment','Drive organisation'],attendance:{},status:'Upcoming'},
  ],
  staffAtt: {}, // { 'T001-2026-10': { '1':'P','2':'P','3':'A'... } }
  leaveRequests: [
    {id:'LR001',staffId:'T002',type:'Medical',from:'2026-10-20',to:'2026-10-22',days:3,status:'Pending',reason:'Medical appointment'},
    {id:'LR002',staffId:'T004',type:'Casual', from:'2026-10-28',to:'2026-10-28',days:1,status:'Approved',reason:'Family function'},
    {id:'LR003',staffId:'T005',type:'Emergency',from:'2026-11-01',to:'2026-11-01',days:1,status:'Pending',reason:'Family emergency'},
  ],
  documents: {}, // staffId → [{id,name,type,date,url}]
  applications: [], // submitted from the public Careers page
  notifications: [], // invitation messages HR has marked as sent
};

// Three sample applications, as in the original system, so the inbox can be tried straight away
function demoApplications(vacId) {
  const day = n => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id:'APP-10000001', vacId, name:'Meera Nair', dob:'1995-04-12', phone:'+91 94470 88001', email:'meera@gmail.com', address:'Kozhikode, Kerala', qual:'M.Sc + B.Ed', spec:'Mathematics', exp:'4 years', employer:'St. Joseph School, Kozhikode', skills:'Digital classroom tools, Malayalam medium, NEP 2020 trained', cover:'I am passionate about making Mathematics accessible and enjoyable for secondary students. I have 4 years of experience in CBSE schools and have completed a NEP 2020 orientation programme.', cvFileName:'Meera_Nair_CV.pdf', score:85, hrStatus:'Pending Review', appliedAt:day(2) },
    { id:'APP-10000002', vacId, name:'Rajan Pillai', dob:'1990-11-20', phone:'+91 94471 88002', email:'rajan.p@gmail.com', address:'Thrissur, Kerala', qual:'M.Sc + B.Ed', spec:'Mathematics', exp:'7 years', employer:'DPS Thrissur', skills:'IIT Foundation coaching, competitive exam prep, digital tools', cover:'7 years teaching Maths at CBSE schools. Have coached students for IIT Foundation successfully.', cvFileName:'Rajan_Pillai_Resume.pdf', score:90, hrStatus:'Pending Review', appliedAt:day(1) },
    { id:'APP-10000003', vacId, name:'Divya Thomas', dob:'1998-08-05', phone:'+91 94472 88003', email:'divya.t@gmail.com', address:'Malappuram, Kerala', qual:'B.Ed', spec:'Mathematics', exp:'Fresher', employer:'', skills:'Enthusiastic fresher, completed B.Ed with distinction', cover:'Fresh graduate, keen to start my teaching career at a progressive school.', cvFileName:'Not uploaded', score:35, hrStatus:'Pending Review', appliedAt:day(0) },
  ];
}

export function loadHR() {
  let d;
  try { const r = localStorage.getItem(HR_KEY); d = r ? { ...SEED, ...JSON.parse(r) } : JSON.parse(JSON.stringify(SEED)); } catch { d = JSON.parse(JSON.stringify(SEED)); }
  if (!d.demoAppsSeeded) {            // one-time, only if nothing has been received yet
    d.demoAppsSeeded = true;
    if (!(d.applications || []).length && d.vacancies?.length) { d.applications = demoApplications(d.vacancies[0].id); saveHR(d); }
  }
  return d;
}
export function saveHR(data) {
  try { localStorage.setItem(HR_KEY, JSON.stringify(data)); } catch {}
}

export const CAND_STATUS_VARIANT = {Shortlisted:'amber',Recommended:'green',Rejected:'red',Hired:'green',Pending:'grey','Interview Done':'blue','Interview Scheduled':'blue'};
export const DEPARTMENTS = ['Primary','Secondary','Senior Secondary','Administration'];
export const EXP_OPTIONS = ['Fresher','1+ years','2+ years','3+ years','5+ years'];
export const DOC_TYPES = ['Appointment Letter','Aadhaar','PAN Card','Degree Certificate','B.Ed Certificate','Medical Fitness','Police Clearance','Contract','Other'];
export const DECISIONS = ['Recommended','Hold','Rejected'];
export const totalScore = (scores, checklist) => checklist.reduce((a, c) => a + Math.min(+((scores || {})[c.id]) || 0, c.max), 0);
export const maxScore = checklist => checklist.reduce((a, c) => a + c.max, 0);
export function docState(expiry) {
  if (!expiry) return { label: 'Verified', variant: 'green', days: Infinity };
  const days = Math.floor((new Date(expiry) - new Date(TODAY)) / 86400000);
  return days < 0 ? { label: 'Expired', variant: 'red', days } : days < 30 ? { label: 'Expiring', variant: 'amber', days } : { label: 'Verified', variant: 'green', days };
}
export function numToWords(n) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (n === 0) return 'Zero'; if (n < 20) return ones[n]; if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
  if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
  if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
  return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
}
export const LEAVE_TYPES = ['Casual','Medical','Emergency','Maternity','Paternity','Study'];
export const TODAY = new Date().toISOString().slice(0,10);

// Used by the public Careers page (no HR hook there): append an application and persist
export function submitApplication(app) {
  const d = loadHR();
  d.applications = [...(d.applications || []), app];
  saveHR(d);
}

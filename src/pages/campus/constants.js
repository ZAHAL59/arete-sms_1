export const CAMPUS_KEY = 'ARETE_CAMPUS_v1';
export const TODAY = new Date().toISOString().slice(0, 10);
export const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

export const COMPLAINT_TYPES = ['Academic','Facility','Transport','Behavioural','Administrative','General'];
export const EVENT_TYPES = ['Parent Meeting','Staff Meeting','School Event','Committee','Academic','Sports','Cultural'];
export const VENUES = ['Main Hall','Staff Room',"Principal's Office",'Classroom','Grounds','Library','Main Hall + Grounds'];
export const ASSET_CATS = ['IT Equipment','Furniture','Lab Equipment','Classroom','Safety','Sports','Other'];
export const VISIT_PURPOSES = ['Parent Meeting','Admission Enquiry','Staff Visit','Delivery','Official / Inspection','Maintenance','Other'];
export const ID_PROOFS = ['Aadhaar','Voter ID','Driving Licence','Passport','Other'];
export const BOOK_CATS = ['Fiction','Textbook','Science','Biography','History','Mathematics','Language','Reference','Sports'];
export const ASSET_ICONS = {'IT Equipment':'💻','Furniture':'🪑','Lab Equipment':'🔬','Classroom':'🖊','Safety':'🧯','Sports':'⚽','Other':'📦'};

// Books BK001–BK005 are issued to real students in the shared DB; due dates are relative
// to first load so the seed always shows 2 overdue + 3 on time (as the HTML intended).
const b = (id, title, cat, issuedTo = null, due = null) => ({ id, title, cat, issuedTo, due });

export const SEED = {
  events: [
    {id:'EV001',title:'Parent-Teacher Meeting - Grade 8',type:'Parent Meeting',date:'2026-10-20',time:'10:00',venue:'Main Hall',seats:120,alloc:98,allocTo:'Grade 8 parents',resources:['Projector','Microphone','250 chairs']},
    {id:'EV002',title:'Monthly Staff Meeting',type:'Staff Meeting',date:'2026-10-25',time:'16:00',venue:'Staff Room',seats:40,alloc:38,allocTo:'Teaching staff',resources:['Whiteboard','Attendance register']},
    {id:'EV003',title:'Annual Day Planning Committee',type:'Committee',date:'2026-11-01',time:'11:00',venue:"Principal's Office",seats:10,alloc:8,allocTo:'Committee members',resources:['Laptop','Projector']},
    {id:'EV004',title:'Science Fair - Grades 6-10',type:'School Event',date:'2026-11-08',time:'09:00',venue:'Main Hall + Grounds',seats:600,alloc:540,allocTo:'Students & parents',resources:['PA System','Tables','Projectors (3)','Judges seating']},
    {id:'EV005',title:'Parent-Teacher Meeting - Grade 10',type:'Parent Meeting',date:'2026-11-15',time:'10:00',venue:'Main Hall',seats:120,alloc:0,allocTo:'',resources:['Projector']},
  ],
  inventory: [
    {id:'A01',icon:'💻',name:'Laptops',cat:'IT Equipment',total:42,working:39,repair:3,value:2100000,note:''},
    {id:'A02',icon:'📽',name:'Projectors',cat:'IT Equipment',total:18,working:16,repair:2,value:540000,note:''},
    {id:'A03',icon:'🔬',name:'Science Lab Sets',cat:'Lab Equipment',total:12,working:12,repair:0,value:360000,note:''},
    {id:'A04',icon:'🪑',name:'Student Desks',cat:'Furniture',total:420,working:414,repair:6,value:840000,note:''},
    {id:'A05',icon:'🖊',name:'Whiteboards',cat:'Classroom',total:24,working:24,repair:0,value:120000,note:''},
    {id:'A06',icon:'🧯',name:'Fire Extinguishers',cat:'Safety',total:16,working:16,repair:0,value:30000,note:''},
  ],
  invLog: [
    {date:'14 Oct',asset:'Laptop',action:'Issued for classroom use',qty:2,by:'Ms. Latha R.'},
    {date:'12 Oct',asset:'Projector',action:'Sent for repair',qty:1,by:'Admin Office'},
    {date:'10 Oct',asset:'Student Desks',action:'Added - new purchase',qty:12,by:'Muhd Zahal'},
    {date:'08 Oct',asset:'Laptop',action:'Returned from repair',qty:1,by:'IT Dept'},
    {date:'05 Oct',asset:'Fire Extinguisher',action:'Annual inspection checked',qty:16,by:'Safety Officer'},
  ],
  visitors: [
    {id:'V001',name:'Priya Suresh',phone:'+91 94470 11201',purpose:'Parent Meeting',meeting:'Ms. Latha R.',date:TODAY,timeIn:'09:15',timeOut:'10:00',status:'Out',idProof:'Aadhaar'},
    {id:'V002',name:'Rajan K.',phone:'+91 98470 22301',purpose:'Admission Enquiry',meeting:'Principal',date:TODAY,timeIn:'10:30',timeOut:'',status:'In',idProof:'Voter ID'},
    {id:'V003',name:'Suresh Babu',phone:'+91 95670 44512',purpose:'Delivery',meeting:'Office',date:TODAY,timeIn:'11:05',timeOut:'11:20',status:'Out',idProof:'Other'},
  ],
  books: [
    b('BK001','Mathematics for Grade 8','Textbook','S001',addDays(5)),
    b('BK002','The Secret Garden','Fiction','S005',addDays(-12)),
    b('BK003','A Brief History of Time','Science','S004',addDays(9)),
    b('BK004','Wings of Fire (Kalam)','Biography','S003',addDays(12)),
    b('BK005','NCERT Science Grade 9','Textbook','S006',addDays(-14)),
    b('BK006','The Alchemist','Fiction'), b('BK007','Sapiens: A Brief History of Humankind','History'),
    b('BK008','NCERT Mathematics Grade 10','Textbook'), b('BK009','Harry Potter and the Philosopher Stone','Fiction'),
    b('BK010','Cosmos by Carl Sagan','Science'), b('BK011','My Experiments with Truth','Biography'),
    b('BK012','India After Gandhi','History'), b('BK013','The Jungle Book','Fiction'),
    b('BK014','NCERT Physics Grade 11','Textbook'), b('BK015','Astrophysics for People in a Hurry','Science'),
    b('BK016','Cricket Legends of India','Sports'), b('BK017','Tamil Nadu History','History'),
    b('BK018','The Gene: An Intimate History','Science'), b('BK019','Open by Andre Agassi','Sports'),
    b('BK020','NCERT Chemistry Grade 12','Textbook'),
  ],
  // Past loans (the HTML called these "simulated past reads"); returns are now recorded here too
  readHistory: [
    {title:"Harry Potter & Sorcerer's Stone",cat:'Fiction',studentId:'S001',date:'2026-09-10'},
    {title:'NCERT Mathematics Grade 8',cat:'Textbook',studentId:'S001',date:'2026-08-20'},
    {title:'My Experiments with Truth',cat:'Biography',studentId:'S001',date:'2026-07-15'},
    {title:'The Diary of a Young Girl',cat:'Biography',studentId:'S002',date:'2026-09-05'},
    {title:'Cricket Legends of India',cat:'Sports',studentId:'S002',date:'2026-08-12'},
    {title:'Cosmos by Carl Sagan',cat:'Science',studentId:'S004',date:'2026-09-20'},
    {title:'The Alchemist',cat:'Fiction',studentId:'S003',date:'2026-09-15'},
    {title:'Tamil Nadu History',cat:'History',studentId:'S003',date:'2026-08-28'},
    {title:'Wings of Fire (Kalam)',cat:'Biography',studentId:'S005',date:'2026-09-01'},
    {title:'The Jungle Book',cat:'Fiction',studentId:'S005',date:'2026-07-20'},
    {title:'NCERT Physics Grade 9',cat:'Textbook',studentId:'S006',date:'2026-09-25'},
    {title:'Sapiens: A Brief History',cat:'History',studentId:'S004',date:'2026-08-10'},
  ],
};

export function loadCampus() {
  try { const r = localStorage.getItem(CAMPUS_KEY); if (r) return { ...SEED, ...JSON.parse(r) }; } catch {}
  return JSON.parse(JSON.stringify(SEED));
}
export function saveCampus(d) { try { localStorage.setItem(CAMPUS_KEY, JSON.stringify(d)); } catch {} }

// Loan status is derived from the due date, never stored
export function loanStatus(book) {
  if (!book.issuedTo) return 'Available';
  const left = daysBetween(TODAY, book.due);
  return left < 0 ? 'Overdue' : left <= 3 ? 'Due soon' : 'Issued';
}
export const prettyDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—';

export const SEED = {
  students: [
    {id:'S001',name:'Ananya Krishnan',dob:'2012-03-14',cls:'Grade 8',section:'A',roll:1,adm:'2024-06-01',learningStyle:'Visual',diet:'Vegetarian',health:'Mild asthma — inhaler with teacher',needs:'None',hobbies:'Drawing, Chess',langs:'Malayalam, English, Hindi',travel:'Bus',busRoute:'R001',boarding:false,parentName:'Krishnan P.',parentPhone:'+91 94470 11111',behav:'Social, confident, leadership qualities',expPref:'Outdoor projects, visual demonstrations',status:'Active'},
    {id:'S002',name:'Mohammed Ashiq',dob:'2013-07-22',cls:'Grade 7',section:'B',roll:2,adm:'2024-06-01',learningStyle:'Auditory',diet:'Non-Vegetarian',health:'None',needs:'None',hobbies:'Cricket, Reading',langs:'Malayalam, English',travel:'Bus',busRoute:'R002',boarding:false,parentName:'Ashiq K.',parentPhone:'+91 94471 22222',behav:'Reserved, focused',expPref:'Group discussions',status:'Active'},
    {id:'S003',name:'Devika Nair',dob:'2010-11-05',cls:'Grade 10',section:'A',roll:3,adm:'2022-06-01',learningStyle:'Kinaesthetic',diet:'Vegetarian',health:'None',needs:'None',hobbies:'Dance, Art, Swimming',langs:'Malayalam, English, Tamil',travel:'Bus',busRoute:'R001',boarding:true,parentName:'Nair R.',parentPhone:'+91 94472 33333',behav:'Creative, independent',expPref:'Hands-on lab',status:'Active'},
    {id:'S004',name:'Rahul P.',dob:'2011-05-18',cls:'Grade 9',section:'C',roll:4,adm:'2023-06-01',learningStyle:'Reading/Writing',diet:'Non-Vegetarian',health:'Under specialist support for dyslexia',needs:'Mild dyslexia — support plan active',hobbies:'Football, Music, Coding',langs:'Malayalam, English',travel:'Bus',busRoute:'R003',boarding:false,parentName:'Pradeep K.',parentPhone:'+91 94473 44444',behav:'Determined',expPref:'Audio content, visual aids',status:'Active'},
    {id:'S005',name:'Sreelakshmi K.',dob:'2014-02-28',cls:'Grade 6',section:'B',roll:5,adm:'2025-06-01',learningStyle:'Visual',diet:'Vegetarian',health:'None',needs:'None',hobbies:'Drawing, Gardening',langs:'Malayalam, English',travel:'Bus',busRoute:'R002',boarding:false,parentName:'Krishnan V.',parentPhone:'+91 94474 55555',behav:'Shy at first',expPref:'Nature-based activities',status:'Active'},
    {id:'S006',name:'Arjun Menon',dob:'2011-09-12',cls:'Grade 9',section:'A',roll:6,adm:'2023-06-01',learningStyle:'Kinaesthetic',diet:'Non-Vegetarian',health:'None',needs:'None',hobbies:'Football, Gaming',langs:'Malayalam, English',travel:'Bus',busRoute:'R001',boarding:true,parentName:'Menon A.',parentPhone:'+91 94475 66666',behav:'High energy',expPref:'Active projects',status:'Active'},
  ],
  staff: [
    {id:'T001',name:'Ms. Latha R.',  subj:'Mathematics',  joined:'2019-06-01',phone:'+91 94470 91001',salary:55000,status:'Active',classes:['Grade 6 B','Grade 7 B','Grade 8 A','Grade 9 A','Grade 10 A']},
    {id:'T002',name:'Ms. Divya K.',  subj:'Science',      joined:'2020-08-01',phone:'+91 94470 91002',salary:50000,status:'Active',classes:['Grade 6 A','Grade 7 A','Grade 8 B']},
    {id:'T003',name:'Mr. Paul T.',   subj:'English',      joined:'2018-06-01',phone:'+91 94470 91003',salary:58000,status:'Active',classes:['Grade 8 A','Grade 9 A','Grade 10 A']},
    {id:'T004',name:'Mr. Arun P.',   subj:'Social Studies',joined:'2021-06-01',phone:'+91 94470 91004',salary:48000,status:'Active',classes:['Grade 6 B','Grade 7 B']},
    {id:'T005',name:'Ms. Rani S.',   subj:'Malayalam',    joined:'2022-06-01',phone:'+91 94470 91005',salary:46000,status:'Active',classes:['Grade 6 A','Grade 7 A','Grade 8 A']},
  ],
  routes: [
    {id:'R001',name:'Route 1 — KL Bus',     vehicle:'KL 11 AB 1234',type:'Bus (52 seats)',driver:'Rajan P.',    phone:'+91 94470 12345',dept:'07:05',arr:'07:45',status:'Active'},
    {id:'R002',name:'Route 2 — Koyilandy',  vehicle:'KL 11 CD 5678',type:'Bus (52 seats)',driver:'Suresh Kumar',phone:'+91 94471 56789',dept:'07:15',arr:'07:55',status:'Active'},
    {id:'R003',name:'Route 3 — Vatakara',   vehicle:'KL 11 EF 9012',type:'Van (15 seats)',driver:'Krishnan K.', phone:'+91 94472 98765',dept:'07:20',arr:'08:00',status:'Active'},
    {id:'R004',name:'Route 4 — Peringathur',vehicle:'KL 11 GH 3456',type:'Bus (52 seats)',driver:'Sunil M.',    phone:'+91 94473 11111',dept:'07:00',arr:'07:50',status:'Active'},
  ],

  payments: [
    {id:'RC-001',studentId:'S001',category:'Term Fee',  amount:24500,date:'2026-10-14',mode:'Online'},
    {id:'RC-002',studentId:'S002',category:'Term Fee',  amount:24500,date:'2026-10-13',mode:'Cash'},
    {id:'RC-003',studentId:'S003',category:'Hostel Fee',amount:3500, date:'2026-10-12',mode:'Online'},
    {id:'RC-004',studentId:'S004',category:'Term Fee',  amount:24500,date:'2026-10-11',mode:'Online'},
    {id:'RC-005',studentId:'S005',category:'Term Fee',  amount:22000,date:'2026-10-10',mode:'Cheque'},
  ],
  attendance: {},
  sessionLogs: [],
  notes: [],
  // Complaints are shared so the Principal dashboard sees campus complaints
  complaints: [
    {id:'CP001',date:'2026-10-10',who:'Parent - Mrs. Suma R.',type:'Academic', subj:'Assignment load too heavy for Grade 5 - children unable to complete independently',action:'Referred to HOD Primary - discussion scheduled 16 Oct',status:'Open'},
    {id:'CP002',date:'2026-10-12',who:'Staff - Mr. Arun P.',  type:'Facility', subj:'Projector in Room 12 not functioning for 5 days - affecting lessons',action:'IT team notified 12 Oct · awaiting part delivery',status:'Open'},
    {id:'CP003',date:'2026-10-14',who:'Parent - Mr. Suresh K.',type:'Transport',subj:'Morning pickup at Vatakara consistently 10 min late this week',action:'Driver Krishnan K. spoken to · Route timing under review',status:'Open'},
    {id:'CP-S01',date:'2026-10-06',who:'Parent',type:'Facility',subj:'Canteen menu - no vegetarian hot option',action:'Menu updated',status:'Resolved',resolvedOn:'2026-10-08'},
    {id:'CP-S02',date:'2026-10-08',who:'Staff', type:'Academic',subj:'Library noise levels during study periods',action:'Silent hours introduced',status:'Resolved',resolvedOn:'2026-10-09'},
    {id:'CP-S03',date:'2026-10-02',who:'Parent',type:'Transport',subj:'Bus air-conditioning not working',action:'Repaired',status:'Resolved',resolvedOn:'2026-10-05'},
    {id:'CP-S04',date:'2026-10-09',who:'Staff', type:'Facility',subj:'Washroom taps not working - Block B',action:'Plumber fixed',status:'Resolved',resolvedOn:'2026-10-10'},
  ],
};

const KEY = 'ARETE_DB_v1';
export const loadDB  = () => { try { const r=localStorage.getItem(KEY); if(r) return {...SEED,...JSON.parse(r)}; } catch{} return JSON.parse(JSON.stringify(SEED)); };
export const saveDB  = db => { try { localStorage.setItem(KEY,JSON.stringify(db)); } catch{} };
export const resetDB = () => { localStorage.removeItem(KEY); window.location.reload(); };

// ── Admissions seed data ────────────────────────────────────────
export const ADM_STAGES = ['Enquiry','Application','Assessment','Interview','Offer','Enrolled','Rejected'];

export const ADMISSIONS_SEED = [
  {id:'ADM001',name:'Aisha Rahman',     dob:'2013-04-12',grade:'Grade 7',section:'',parentName:'Rahman K.',parentPhone:'+91 94470 31001',email:'rahman@email.com',address:'Koyilandy',stage:'Enrolled',  assignedTo:'MZ',date:'2026-08-01',notes:'Strong in sciences',diet:'Non-Vegetarian',boarding:false,busRoute:'R001',docs:{birth:true,transfer:true,photo:true,medical:false}},
  {id:'ADM002',name:'Rohan Vijay',      dob:'2014-07-22',grade:'Grade 6',section:'',parentName:'Vijay R.',  parentPhone:'+91 94471 32002',email:'vijay@email.com', address:'Vatakara', stage:'Interview',  assignedTo:'MZ',date:'2026-09-15',notes:'Needs assessment for SEN',diet:'Vegetarian',  boarding:false,busRoute:'',   docs:{birth:true,transfer:false,photo:true,medical:false}},
  {id:'ADM003',name:'Meera Thomas',     dob:'2012-11-08',grade:'Grade 8',section:'',parentName:'Thomas C.', parentPhone:'+91 94472 33003',email:'thomas@email.com',address:'Peringathur',stage:'Offer',     assignedTo:'MZ',date:'2026-09-20',notes:'Excellent academics',diet:'Non-Vegetarian',boarding:true, busRoute:'',   docs:{birth:true,transfer:true, photo:true,medical:true}},
  {id:'ADM004',name:'Aryan Nair',       dob:'2015-02-14',grade:'Grade 5',section:'',parentName:'Nair S.',   parentPhone:'+91 94473 34004',email:'nair@email.com',  address:'Koyilandy',stage:'Assessment', assignedTo:'MZ',date:'2026-10-01',notes:'',                  diet:'Vegetarian',  boarding:false,busRoute:'R002',docs:{birth:true,transfer:false,photo:false,medical:false}},
  {id:'ADM005',name:'Fatima Zahra',     dob:'2013-08-30',grade:'Grade 7',section:'',parentName:'Zahra M.',  parentPhone:'+91 94474 35005',email:'zahra@email.com', address:'Vatakara', stage:'Application',assignedTo:'',  date:'2026-10-10',notes:'',                  diet:'Non-Vegetarian',boarding:false,busRoute:'',   docs:{birth:false,transfer:false,photo:true,medical:false}},
  {id:'ADM006',name:'Dev Krishnan',     dob:'2011-05-19',grade:'Grade 9',section:'',parentName:'Krishnan D.',parentPhone:'+91 94475 36006',email:'dev@email.com',  address:'Koyilandy',stage:'Enquiry',   assignedTo:'',  date:'2026-10-18',notes:'',                  diet:'Vegetarian',  boarding:false,busRoute:'',   docs:{birth:false,transfer:false,photo:false,medical:false}},
  {id:'ADM007',name:'Lina Mathew',      dob:'2014-03-25',grade:'Grade 6',section:'',parentName:'Mathew P.', parentPhone:'+91 94476 37007',email:'mathew@email.com',address:'Peringathur',stage:'Rejected', assignedTo:'MZ',date:'2026-09-05',notes:'Capacity full for grade',diet:'Non-Vegetarian',boarding:false,busRoute:'',   docs:{birth:true,transfer:true, photo:true,medical:false}},
  {id:'ADM008',name:'Siddharth Kumar',  dob:'2012-09-11',grade:'Grade 8',section:'',parentName:'Kumar R.',  parentPhone:'+91 94477 38008',email:'kumar@email.com', address:'Vatakara', stage:'Interview',  assignedTo:'MZ',date:'2026-10-05',notes:'Strong in maths',    diet:'Non-Vegetarian',boarding:true, busRoute:'',   docs:{birth:true,transfer:true, photo:true,medical:true}},
];

// ── HR / Staff seed ──────────────────────────────────────────
export const HR_SEED = {
  vacancies: [
    {id:'V001',subj:'Mathematics', qual:'M.Sc Maths + B.Ed',exp:'3+ years',posted:'2026-09-01',status:'Active'},
    {id:'V002',subj:'English',     qual:'MA English + B.Ed', exp:'2+ years',posted:'2026-09-10',status:'Active'},
  ],
  candidates: [
    {id:'C001',name:'Priya Suresh',vacId:'V001',qual:'M.Sc Maths, B.Ed',exp:'5 yrs',score:88,status:'Shortlisted', interview:'2026-10-05'},
    {id:'C002',name:'Anoop Varma', vacId:'V001',qual:'M.Sc Maths, B.Ed',exp:'3 yrs',score:76,status:'Shortlisted', interview:'2026-10-05'},
    {id:'C003',name:'Reshma K.',   vacId:'V002',qual:'MA English, B.Ed', exp:'6 yrs',score:91,status:'Recommended',interview:'2026-09-28'},
  ],
  training: [
    {id:'TR001',title:'NEP 2020 — Competency Based Education',date:'2026-08-15',trainer:'Dr. Anitha Raj',duration:'Full day',topics:['CBE Framework','Portfolio Learning','Outcome Mapping'],attendees:['T001','T002','T003','T004','T005']},
    {id:'TR002',title:'SHAPE DLSS — Digital Classroom Tools',  date:'2026-09-02',trainer:'Muhd Zahal',    duration:'Half day',topics:['DLSS Overview','Resource Library','Lesson Planning'],      attendees:['T001','T002','T003','T004']},
    {id:'TR003',title:'Classroom Differentiation Strategies',  date:'2026-11-10',trainer:'Dr. Anitha Raj',duration:'Full day',topics:['Mixed-ability classes','Task scaffolding'],               attendees:['T001','T002','T003']},
  ],
  leaveRequests: [
    {id:'LR001',staffId:'T002',staffName:'Ms. Divya K.',type:'Medical',from:'2026-10-20',to:'2026-10-22',days:3,status:'Pending',reason:'Medical appointment'},
    {id:'LR002',staffId:'T004',staffName:'Mr. Arun P.', type:'Casual', from:'2026-10-28',to:'2026-10-28',days:1,status:'Approved',reason:'Family function'},
  ],
};

// ── Finance seed ─────────────────────────────────────────────
export const FINANCE_SEED = {
  feeStructure: {
    'Grade 6':  {t1:10000,t2:10000,t3:10000,transport:6500,hostel:42000,activity:3000},
    'Grade 7':  {t1:10000,t2:10000,t3:10000,transport:6500,hostel:42000,activity:3000},
    'Grade 8':  {t1:11000,t2:11000,t3:11000,transport:6500,hostel:42000,activity:3000},
    'Grade 9':  {t1:12000,t2:12000,t3:12000,transport:7000,hostel:42000,activity:3500},
    'Grade 10': {t1:12000,t2:12000,t3:12000,transport:7000,hostel:42000,activity:3500},
  },
  expenses: [
    {id:'EX001',cat:'Salaries',      amount:2400000,date:'2026-10-01',desc:'October staff salaries'},
    {id:'EX002',cat:'Transport',     amount:180000, date:'2026-10-05',desc:'Bus fuel & maintenance'},
    {id:'EX003',cat:'Utilities',     amount:45000,  date:'2026-10-08',desc:'Electricity & water'},
    {id:'EX004',cat:'Maintenance',   amount:28000,  date:'2026-10-12',desc:'Building repairs'},
    {id:'EX005',cat:'Library',       amount:15000,  date:'2026-10-15',desc:'New books purchase'},
  ],
  budget: [
    {cat:'Teacher Salaries',     budgeted:18000000,actual:18000000},
    {cat:'Non-Teaching Salaries',budgeted:6000000, actual:5800000},
    {cat:'Transport',            budgeted:4600000, actual:4820000},
    {cat:'Infrastructure',       budgeted:2500000, actual:1900000},
    {cat:'Hostel & Mess',        budgeted:1600000, actual:1480000},
    {cat:'Library & Materials',  budgeted:450000,  actual:320000},
  ],
};

// ── Hostel seed ───────────────────────────────────────────────
export const HOSTEL_SEED = {
  rooms: [
    {id:'RM-A01',block:'A',num:1, cap:4,inmates:['S003','S006']},
    {id:'RM-A02',block:'A',num:2, cap:4,inmates:[]},
    {id:'RM-A03',block:'A',num:3, cap:4,inmates:[]},
    {id:'RM-B01',block:'B',num:1, cap:4,inmates:[]},
  ],
  messMenu: [
    {day:'Monday',   breakfast:'Idli + Sambar',lunch:'Rice + Dal + Sabzi',dinner:'Chapati + Curry'},
    {day:'Tuesday',  breakfast:'Dosa + Chutney',lunch:'Rice + Fish Curry',dinner:'Rice + Dal'},
    {day:'Wednesday',breakfast:'Puttu + Kadala',lunch:'Rice + Egg Curry', dinner:'Chapati + Paneer'},
    {day:'Thursday', breakfast:'Appam + Stew',  lunch:'Rice + Chicken',   dinner:'Rice + Sambar'},
    {day:'Friday',   breakfast:'Idiyappam',      lunch:'Rice + Dal',       dinner:'Chapati + Mixed Veg'},
    {day:'Saturday', breakfast:'Paratha + Pickle',lunch:'Biryani',         dinner:'Rice + Curry'},
    {day:'Sunday',   breakfast:'Poori + Bhaji',  lunch:'Special Rice',     dinner:'Chapati + Dal'},
  ],
  incidents: [
    {id:'INC001',date:'2026-10-12',student:'Arjun Menon',type:'Minor',desc:'Minor scuffle in corridor — resolved',action:'Counselled',status:'Closed'},
  ],
  stock: [
    {item:'Rice (Ponni)',  unit:'kg',qty:280,max:400,low:80},
    {item:'Cooking Oil',  unit:'L', qty:38, max:60, low:15},
    {item:'Dal (Mixed)',  unit:'kg',qty:45, max:80, low:15},
    {item:'Vegetables',   unit:'kg',qty:35, max:80, low:20},
    {item:'Eggs',         unit:'doz',qty:18,max:40, low:10},
  ],
};

// ── Events & Complaints (Campus) ─────────────────────────────
export const CAMPUS_SEED = {
  events: [
    {id:'EV001',title:'Parent-Teacher Meeting',type:'Parent Meeting',date:'2026-11-08',time:'10:00',venue:'Main Hall',seats:120,alloc:98},
    {id:'EV002',title:'Monthly Staff Meeting',  type:'Staff Meeting', date:'2026-10-25',time:'16:00',venue:'Staff Room',seats:40, alloc:38},
    {id:'EV003',title:'Annual Science Fair',    type:'School Event',  date:'2026-11-15',time:'09:00',venue:'Grounds',   seats:600,alloc:540},
  ],
  complaints: [
    {id:'CP001',date:'2026-10-10',from:'Parent',who:'Mrs. Suma R.',type:'Academic',  subj:'Assignment load too heavy',action:'Referred to HOD',status:'Open'},
    {id:'CP002',date:'2026-10-08',from:'Parent',who:'Mr. Rahul',   type:'Transport', subj:'Bus arriving late',         action:'Driver counselled',status:'Resolved'},
    {id:'CP003',date:'2026-10-14',from:'Staff', who:'Mr. Arun P.', type:'Facility',  subj:'Projector not working',     action:'IT notified',status:'Open'},
  ],
  inventory: [
    {id:'INV001',name:'Laptops',         cat:'IT',       total:42,working:39,repair:3},
    {id:'INV002',name:'Projectors',      cat:'IT',       total:18,working:16,repair:2},
    {id:'INV003',name:'Science Lab Sets',cat:'Lab',      total:12,working:12,repair:0},
    {id:'INV004',name:'Student Desks',   cat:'Furniture',total:420,working:414,repair:6},
  ],
};

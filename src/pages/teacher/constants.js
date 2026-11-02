export const TEACHER = {
  id: 'T001',
  name: 'Ms. Latha R.',
  initials: 'LR',
  subj: 'Mathematics',
  classes: ['Grade 6 B','Grade 7 B','Grade 8 A','Grade 9 A','Grade 10 A'],
};

export const COLORS = ['#A31060','#2B3BA6','#0B6B4A','#896B00','#0B5A6B','#6B2BA3','#0B6B6B','#6B3B0B'];

export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export const PERIODS = [
  '8:00–8:40','8:40–9:20','9:20–10:00',
  'Break',
  '10:20–11:00','11:00–11:40','11:40–12:20',
  'Lunch',
  '1:20–2:00','2:00–2:40'
];

// Teacher's own timetable — only their classes
export const TT = [
  // MON
  [{cls:'Grade 8 A'},{cls:'Grade 6 B'},{free:true},{brk:true},{cls:'Grade 9 A'},{free:true},{cls:'Grade 10 A'},{brk:true},{cls:'Grade 7 B'},{free:true}],
  // TUE
  [{cls:'Grade 10 A'},{cls:'Grade 9 A'},{free:true},{brk:true},{cls:'Grade 7 B'},{cls:'Grade 8 A'},{cls:'Grade 6 B'},{brk:true},{free:true},{free:true}],
  // WED
  [{cls:'Grade 6 B'},{cls:'Grade 8 A'},{free:true},{brk:true},{cls:'Grade 10 A'},{cls:'Grade 7 B'},{free:true},{brk:true},{cls:'Staff Meeting',staff:true},{cls:'Grade 9 A'}],
  // THU
  [{cls:'Grade 7 B'},{cls:'Grade 10 A'},{cls:'Grade 8 A'},{brk:true},{free:true},{cls:'Grade 9 A'},{cls:'Grade 7 B'},{brk:true},{free:true},{cls:'Grade 10 A'}],
  // FRI
  [{cls:'Grade 9 A'},{cls:'Grade 6 B'},{free:true},{brk:true},{cls:'Grade 8 A'},{free:true},{cls:'Grade 9 A'},{brk:true},{cls:'Grade 8 A'},{free:true}],
];

export const SESSION_TYPES = [
  'AR Experience','VR Experience','Interactive Activity','Simulation',
  'Hands-on Lab','Video','Discussion','Quiz / Assessment','Group Work','Field Visit','Other'
];

export const TYPE_VARIANT = {
  'AR Experience':'purple','VR Experience':'purple','Interactive Activity':'green',
  'Simulation':'green','Hands-on Lab':'amber','Video':'blue','Discussion':'grey',
  'Quiz / Assessment':'red','Group Work':'grey','Field Visit':'amber','Other':'grey'
};

export const NOTE_CATS = [
  'Academic observation','Behavioural note','Health concern',
  'Parent communication','Achievement / Milestone','Attendance concern','Other'
];

export const DEMO_ANN = [
  { title:'📋 Mid-term Progress Reports Due', msg:'All class teachers must submit mid-term progress remarks for their assigned classes by Friday 1 November 2026.', sent:'28 Oct', to:'All Teaching Staff', urgent:true },
  { title:'📅 Parent-Teacher Meeting — 8 Nov', msg:'PT Meeting scheduled for Saturday 8 November 2026, 9 AM – 1 PM. All teachers must be present for their classes.', sent:'25 Oct', to:'All Staff', urgent:false },
  { title:'🎓 NEP Training Follow-up Session', msg:'HR has scheduled a follow-up session on Competency Based Education. Date: 10 November 2026, Full day. Attendance mandatory.', sent:'22 Oct', to:'Teaching Staff', urgent:false },
  { title:'🏖 Diwali Holiday', msg:'School closed 31 Oct – 4 Nov 2026. Classes resume Monday 5 November. Teachers are requested to set holiday revision work before leaving.', sent:'20 Oct', to:'All families & Staff', urgent:false },
  { title:'📢 Science Fair Registration Open', msg:'Students from Grades 6–10 can register for the Annual Science Fair. Deadline: 15 November.', sent:'18 Oct', to:'Grades 6–10 Teachers', urgent:false },
];

import { staffAnnouncements, prettyDate, loadPrincipal } from '../principal/constants';
import { loadHR } from '../hr/constants';

// Principal announcements addressed to staff, followed by the standing HR notices
export function getNotices() {
  const fromPrincipal = staffAnnouncements().map(a => ({ title: '📢 ' + a.title, msg: a.msg, sent: prettyDate(a.sent), to: a.to, urgent: false }));
  return [...fromPrincipal, ...DEMO_ANN];
}

// Sessions HR has invited this teacher to (falls back to older sessions that only recorded attendance)
export function getMyTraining() {
  return loadHR().training.filter(t => (t.invited ? t.invited.includes(TEACHER.id) : Object.keys(t.attendance || {}).includes(TEACHER.id) || !Object.keys(t.attendance || {}).length))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => ({ ...t, myStatus: (t.attendance || {})[TEACHER.id] || '' }));
}

// Shared learning library (anything the Principal adds appears here) plus this teacher's own resources
export function getMaterials() {
  const shared = loadPrincipal().lms.library, seen = new Set(shared.map(m => m.id));
  return [...shared, ...LMS_LIB.filter(m => !seen.has(m.id))];
}

export const TRAINING_SESSIONS = [
  { id:'TR001', title:'NEP 2020 — Competency Based Education', date:'2026-08-15', trainer:'Dr. Anitha Raj', duration:'Full day', topics:['CBE Framework','Portfolio Learning','Outcome Mapping'] },
  { id:'TR002', title:'SHAPE DLSS — Digital Classroom Tools', date:'2026-09-02', trainer:'Muhd Zahal', duration:'Half day', topics:['DLSS Overview','Resource Library','Lesson Planning'] },
  { id:'TR003', title:'Classroom Differentiation Strategies', date:'2026-11-10', trainer:'Dr. Anitha Raj', duration:'Full day', topics:['Mixed-ability classes','Task scaffolding','Assessment variety'] },
  { id:'TR004', title:'Google Classroom & Digital Tools', date:'2026-12-05', trainer:'Muhd Zahal', duration:'Half day', topics:['Google Classroom setup','Forms for assessment','Drive organisation'] },
];

export const LMS_LIB = [
  {id:'L002',thumb:'📐',title:'Understanding Linear Equations',type:'Video',subj:'Mathematics',grade:'Grade 8',topic:'Algebra Ch.2',dur:'9 min',by:'Ms. Latha R.',rating:4.7,desc:'Visual explanation of forming and solving one-variable linear equations.'},
  {id:'V004',thumb:'📐',title:'Geometry in 3D — AR Shapes',type:'AR Experience',subj:'Mathematics',grade:'Grade 6',topic:'Geometry Ch.1',dur:'15 min',by:'Ms. Latha R.',rating:4.7,desc:'View and rotate 3D geometric solids, measuring faces, edges and vertices.'},
  {id:'A001',thumb:'🎮',title:'Fraction Explorer — Digital Manipulative',type:'Interactive Activity',subj:'Mathematics',grade:'Grade 5',topic:'Fractions',dur:'15 min',by:'Ms. Latha R.',rating:4.7,desc:'Drag and combine fraction tiles to visualise equivalence and operations.'},
  {id:'R001',thumb:'🔗',title:'Khan Academy — Algebra Basics',type:'Curated Link',subj:'Mathematics',grade:'Grade 7',topic:'Algebra Foundations',dur:'Self-paced',by:'Curated',rating:4.9,desc:'Vetted Khan Academy playlist.',url:'https://khanacademy.org'},
  {id:'R004',thumb:'⚗️',title:'PhET Simulations — Forces and Motion',type:'Simulation',subj:'Science',grade:'Grade 8',topic:'Physics Ch.4',dur:'Open-ended',by:'External',rating:5.0,desc:'University of Colorado interactive physics simulation.',url:'https://phet.colorado.edu'},
  {id:'E001',thumb:'📄',title:'Class 8 — Mid-term Revision Pack',type:'PDF / Document',subj:'Mathematics',grade:'Grade 8',topic:'Term 1 Revision',dur:'45 min',by:'Ms. Latha R.',rating:4.6,desc:'PDF with 30 practice problems and full answer key.'},
  {id:'M001',thumb:'📐',title:'Algebra Foundations — Grade 7 Notes',type:'PDF / Document',subj:'Mathematics',grade:'Grade 7',topic:'Algebra Foundations',dur:'—',by:'Ms. Latha R.',rating:4.8,desc:'Class notes covering expressions, variables and simple equations.'},
  {id:'M004',thumb:'🎮',title:'Coordinate Geometry — Interactive Grapher',type:'Interactive Activity',subj:'Mathematics',grade:'Grade 9',topic:'Coordinate Geometry',dur:'20 min',by:'External',rating:4.9,desc:'Plot points, lines and curves interactively.',url:'https://desmos.com'},
  {id:'V001',thumb:'🪐',title:'Solar System — VR Immersive Tour',type:'VR Experience',subj:'Science',grade:'Grade 8',topic:'Astronomy',dur:'20 min',by:'External',rating:5.0,desc:'Full 360 immersive tour of the solar system.'},
  {id:'M005',thumb:'🎮',title:'Probability Explorer',type:'Interactive Activity',subj:'Mathematics',grade:'Grade 10',topic:'Probability',dur:'15 min',by:'Ms. Latha R.',rating:4.6,desc:'Simulate coin tosses and dice rolls to see theoretical vs experimental probability.'},
  {id:'M006',thumb:'📐',title:'Statistics Worksheet — Mean, Median, Mode',type:'PDF / Document',subj:'Mathematics',grade:'Grade 8',topic:'Statistics Ch.5',dur:'35 min',by:'Ms. Latha R.',rating:4.5,desc:'Practice worksheet with 25 questions and answers.'},
];

export function getCurrentPeriod() {
  const d = new Date();
  const dow = d.getDay() - 1;
  if (dow < 0 || dow > 4) return { day: -1, period: -1 };
  const mins = d.getHours() * 60 + d.getMinutes();
  const starts  = [480,520,560,600,620,660,700,740,800,840];
  const lengths = [ 40, 40, 40, 20, 40, 40, 40, 20, 40, 40];
  const period  = starts.findIndex((s,i) => mins >= s && mins < s + lengths[i]);
  return { day: dow, period };
}

export function getWeekDates() {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  return DAYS.map((_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
}

export const TODAY = new Date().toISOString().slice(0, 10);

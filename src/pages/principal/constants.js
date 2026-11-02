export const PRINCIPAL_KEY = 'ARETE_PRINCIPAL_v1';
export const TODAY = new Date().toISOString().slice(0, 10);
export const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');
export const fmtL = n => '₹' + ((n || 0) / 100000).toFixed(1) + 'L';

export const AUDIENCES = [
  ['All families', false], ['All parents & students', false], ['Grade 8 parents', false], ['Grades 6–10', false],
  ['All staff', true], ['Teaching staff', true], ['All families & staff', true],
];
export const CHANNELS = ['App + SMS', 'App only', 'SMS only', 'Email'];
export const INCIDENT_TYPES = ['Injury', 'Illness / Fever', 'Allergy', 'Emotional Distress', 'Other'];
export const PARENT_NOTIFIED = ['Yes — SMS sent', 'Yes — Called', 'Not yet'];
export const LMS_TYPES = ['Video', 'Animation', 'Simulation', 'Interactive Activity', 'Curated Link', 'PDF / Document', 'AR Experience', 'VR Experience', '3D Model', 'Quiz'];
export const LMS_SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Art & Craft', 'Physical Education', 'Malayalam', 'Hindi'];
export const LMS_GRADES = ['Grade 1–3', 'Grade 4–6', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'All Grades'];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const TT_TIMES = ['8:00', '8:45', '9:30', '9:45', '10:30', '11:15'];
export const TT_SUBJECTS = ['Mathematics', 'Science', 'Science Lab', 'English', 'Social Studies', 'Art & Craft', 'Physical Education', 'Malayalam', 'Hindi', 'Computer Science'];

const row = (time, cells) => ({ time, cells });
const BRK = row('9:30', ['BREAK', 'BREAK', 'BREAK', 'BREAK', 'BREAK']);

export const blankTimetable = () => ({ students: 0, room: '', slots: TT_TIMES.map(t => t === '9:30' ? BRK : row(t, ['', '', '', '', ''])) });

export const SEED = {
  settings: { school: 'Arete Model School', year: '2026–27', board: 'CBSE', lowAtt: 75, feeOverdueDays: 30 },
  announcements: [
    { id:'AN001', title:'Parent-Teacher Meeting', msg:'25 Sep 2026 · 10 AM–1 PM · All grades. Please attend without fail.', sent:'2026-09-16', to:'All families', channel:'App + SMS', read:'91%' },
    { id:'AN002', title:'Onam Holiday', msg:'School closed 19–21 Sep 2026. Classes resume 22 Sep.', sent:'2026-09-14', to:'All families', channel:'App + SMS', read:'98%' },
    { id:'AN003', title:'Science Fair Registration', msg:'Open for Grades 6–10. Deadline 22 Sep.', sent:'2026-09-12', to:'Grades 6–10', channel:'App only', read:'84%' },
  ],
  slips: [{ id:'PS001', event:'Science Fair — Sep 22', responses:34, total:40, status:'Open' }],
  messages: [],
  substitutions: [],   // { id, date, absent, cls, row, time, subject, sub }
  incidents: [
    { id:'IN001', stu:'Aisha Thomas', cls:'Grade 8', date:'2026-09-18', type:'Illness / Fever', issue:'Headache', action:'Rest given, parent informed', parent:'Yes — SMS sent' },
    { id:'IN002', stu:'Rahul Nair', cls:'Grade 3', date:'2026-09-16', type:'Injury', issue:'Knee abrasion', action:'First aid applied', parent:'Yes — Called' },
    { id:'IN003', stu:'Fathima N.', cls:'Grade 5', date:'2026-09-15', type:'Illness / Fever', issue:'Fever 38.2°C', action:'Sent home, parent collected', parent:'Yes — Called' },
  ],
  immunisation: [
    { vaccine:'Hepatitis B', coverage:97, next:'Apr 2027' }, { vaccine:'MMR', coverage:94, next:'Jan 2027' }, { vaccine:'DPT Booster', coverage:81, next:'Oct 2026' },
  ],
  expenses: [
    { id:'EX001', cat:'Infrastructure', desc:'Classroom furniture — Block B', amount:124000, date:'2026-09-05' },
    { id:'EX002', cat:'Utilities', desc:'Electricity — KSEB', amount:18400, date:'2026-09-10' },
  ],
  statutory: [
    { name:'PF (Employee)', amount:41280 }, { name:'PF (Employer)', amount:41280 }, { name:'Professional Tax', amount:12400 }, { name:'TDS', amount:18600 },
  ],
  bookings: [
    { id:'BK1', room:'Science Lab 1', by:'Ms. Divya K.', when:'Mon Wed Fri' },
    { id:'BK2', room:'Computer Lab', by:'Mr. Vinod', when:'Tue Thu' },
  ],
  timetable: {
    'Grade 8 A': { students:38, room:'Room 204', slots:[
      row('8:00',['Mathematics|Ms. Latha R.','English|Mr. Paul T.','Science|Ms. Divya K.','Social Studies|Mr. Arun P.','Mathematics|Ms. Latha R.']),
      row('8:45',['Science|Ms. Divya K.','Mathematics|Ms. Latha R.','English|Mr. Paul T.','Art & Craft|Ms. Rekha V.','Science|Ms. Divya K.']), BRK,
      row('9:45',['Social Studies|Mr. Arun P.','Science Lab|Ms. Divya K.','Mathematics|Ms. Latha R.','English|Mr. Paul T.','Social Studies|Mr. Arun P.']),
      row('10:30',['English|Mr. Paul T.','Art & Craft|Ms. Rekha V.','Social Studies|Mr. Arun P.','Mathematics|Ms. Latha R.','Art & Craft|Ms. Rekha V.']),
      row('11:15',['Physical Education|Mr. Sasi K.','English|Mr. Paul T.','Physical Education|Mr. Sasi K.','Science|Ms. Divya K.','']) ] },
    'Grade 6 A': { students:32, room:'Room 101', slots:[
      row('8:00',['English|Mr. Paul T.','Mathematics|Ms. Latha R.','Science|Ms. Divya K.','Mathematics|Ms. Latha R.','English|Mr. Paul T.']),
      row('8:45',['Mathematics|Ms. Latha R.','English|Mr. Paul T.','Social Studies|Mr. Arun P.','Science|Ms. Divya K.','Mathematics|Ms. Latha R.']), BRK,
      row('9:45',['Science|Ms. Divya K.','Social Studies|Mr. Arun P.','English|Mr. Paul T.','Art & Craft|Ms. Rekha V.','Science|Ms. Divya K.']),
      row('10:30',['Social Studies|Mr. Arun P.','Science|Ms. Divya K.','Mathematics|Ms. Latha R.','English|Mr. Paul T.','Social Studies|Mr. Arun P.']),
      row('11:15',['Physical Education|Mr. Sasi K.','Physical Education|Mr. Sasi K.','Art & Craft|Ms. Rekha V.','','']) ] },
  },
  lms: {
    library: [
 {
  "id": "L001",
  "title": "Photosynthesis — How Plants Make Food",
  "type": "Animation",
  "subj": "Science",
  "grade": "Grade 7",
  "topic": "Living World Ch.3",
  "dur": "6 min",
  "by": "Ms. Divya K.",
  "views": 84,
  "rating": 4.8,
  "desc": "Step-by-step animated walkthrough of the light and dark reactions.",
  "url": "https://youtube.com",
  "thumb": "🌿"
 },
 {
  "id": "L002",
  "title": "Understanding Linear Equations",
  "type": "Video",
  "subj": "Mathematics",
  "grade": "Grade 8",
  "topic": "Algebra Ch.2",
  "dur": "9 min",
  "by": "Ms. Latha R.",
  "views": 102,
  "rating": 4.7,
  "desc": "Visual explanation of forming and solving one-variable linear equations.",
  "url": "",
  "thumb": "📐"
 },
 {
  "id": "L003",
  "title": "The Water Cycle — Animation",
  "type": "Animation",
  "subj": "Science",
  "grade": "Grade 6",
  "topic": "Earth Science Ch.1",
  "dur": "4 min",
  "by": "External",
  "views": 145,
  "rating": 4.9,
  "desc": "Rainfall, evaporation, condensation and transpiration animated.",
  "url": "https://youtube.com",
  "thumb": "💧"
 },
 {
  "id": "L004",
  "title": "Ancient Mesopotamia — Documentary Clip",
  "type": "Video",
  "subj": "Social Studies",
  "grade": "Grade 6",
  "topic": "Ancient Civ. Ch.1",
  "dur": "12 min",
  "by": "External",
  "views": 67,
  "rating": 4.5,
  "desc": "Primary source footage and narration of Mesopotamian civilisation.",
  "url": "",
  "thumb": "🏺"
 },
 {
  "id": "L005",
  "title": "Parts of Speech — Grammar Song",
  "type": "Video",
  "subj": "English",
  "grade": "Grade 5",
  "topic": "Grammar Unit 1",
  "dur": "3 min",
  "by": "Mr. Paul T.",
  "views": 211,
  "rating": 4.6,
  "desc": "Catchy animated grammar song covering nouns, verbs, adjectives.",
  "url": "",
  "thumb": "📝"
 },
 {
  "id": "L006",
  "title": "Biodiversity at Arete — Campus Walk",
  "type": "Video",
  "subj": "Science",
  "grade": "Grade 4",
  "topic": "Biodiversity Park",
  "dur": "7 min",
  "by": "Ms. Divya K.",
  "views": 58,
  "rating": 4.9,
  "desc": "Guided walk through the Arete campus park identifying 20 species.",
  "url": "",
  "thumb": "🌳"
 },
 {
  "id": "R001",
  "title": "Khan Academy — Algebra Basics",
  "type": "Curated Link",
  "subj": "Mathematics",
  "grade": "Grade 7",
  "topic": "Algebra Foundations",
  "dur": "Self-paced",
  "by": "Curated",
  "views": 0,
  "rating": 4.9,
  "desc": "Vetted Khan Academy playlist: expressions, equations and inequalities.",
  "url": "https://khanacademy.org",
  "thumb": "🔗"
 },
 {
  "id": "R002",
  "title": "BBC Bitesize — Ecosystems",
  "type": "Curated Link",
  "subj": "Science",
  "grade": "Grade 6",
  "topic": "Ecosystems",
  "dur": "Self-paced",
  "by": "Curated",
  "views": 0,
  "rating": 4.7,
  "desc": "Interactive pages, videos and revision quizzes on food chains and habitats.",
  "url": "https://bbc.co.uk/bitesize",
  "thumb": "🔗"
 },
 {
  "id": "R003",
  "title": "National Geographic — Ancient Egypt",
  "type": "Curated Link",
  "subj": "Social Studies",
  "grade": "Grade 6",
  "topic": "Ancient Civ. Ch.2",
  "dur": "15 min",
  "by": "Curated",
  "views": 0,
  "rating": 4.8,
  "desc": "Photo essays, maps and timelines from National Geographic Education.",
  "url": "https://education.nationalgeographic.org",
  "thumb": "🔗"
 },
 {
  "id": "R004",
  "title": "PhET Simulations — Forces and Motion",
  "type": "Simulation",
  "subj": "Science",
  "grade": "Grade 8",
  "topic": "Physics Ch.4",
  "dur": "Open-ended",
  "by": "External",
  "views": 43,
  "rating": 5.0,
  "desc": "University of Colorado interactive physics simulation, free and browser-based.",
  "url": "https://phet.colorado.edu",
  "thumb": "⚗️"
 },
 {
  "id": "A001",
  "title": "Fraction Explorer — Digital Manipulative",
  "type": "Interactive Activity",
  "subj": "Mathematics",
  "grade": "Grade 5",
  "topic": "Fractions",
  "dur": "15 min",
  "by": "Ms. Latha R.",
  "views": 89,
  "rating": 4.7,
  "desc": "Drag and combine fraction tiles to visualise equivalence and operations.",
  "url": "",
  "thumb": "🎮"
 },
 {
  "id": "A002",
  "title": "Cell Builder — Label and Identify",
  "type": "Interactive Activity",
  "subj": "Science",
  "grade": "Grade 7",
  "topic": "Cell Biology",
  "dur": "20 min",
  "by": "Ms. Divya K.",
  "views": 76,
  "rating": 4.8,
  "desc": "Drag organelles into correct positions inside a plant and animal cell.",
  "url": "",
  "thumb": "🔬"
 },
 {
  "id": "A003",
  "title": "Grammar Sorting Game",
  "type": "Interactive Activity",
  "subj": "English",
  "grade": "Grade 6",
  "topic": "Parts of Speech",
  "dur": "10 min",
  "by": "Mr. Paul T.",
  "views": 134,
  "rating": 4.6,
  "desc": "Categorise words by dragging into noun, verb, adjective, adverb buckets.",
  "url": "",
  "thumb": "📚"
 },
 {
  "id": "A004",
  "title": "River Valley Civilisation — Map Puzzle",
  "type": "Interactive Activity",
  "subj": "Social Studies",
  "grade": "Grade 6",
  "topic": "Ancient Civilisations",
  "dur": "15 min",
  "by": "Mr. Arun P.",
  "views": 52,
  "rating": 4.5,
  "desc": "Identify and label key features of Mesopotamia, Egypt and the Indus Valley.",
  "url": "",
  "thumb": "🗺️"
 },
 {
  "id": "V001",
  "title": "Solar System — VR Immersive Tour",
  "type": "VR Experience",
  "subj": "Science",
  "grade": "Grade 8",
  "topic": "Astronomy",
  "dur": "20 min",
  "by": "External",
  "views": 31,
  "rating": 5.0,
  "desc": "Full 360 immersive tour of the solar system with scale models of each planet.",
  "url": "",
  "thumb": "🪐"
 },
 {
  "id": "V002",
  "title": "Human Body Systems — AR Anatomy",
  "type": "AR Experience",
  "subj": "Science",
  "grade": "Grade 9",
  "topic": "Human Biology",
  "dur": "25 min",
  "by": "External",
  "views": 18,
  "rating": 4.9,
  "desc": "Point device at printed target to view 3D rotating organs with detailed labels.",
  "url": "",
  "thumb": "🫁"
 },
 {
  "id": "V003",
  "title": "Ancient Rome — VR Historical Walk",
  "type": "VR Experience",
  "subj": "Social Studies",
  "grade": "Grade 7",
  "topic": "Ancient Civilisations",
  "dur": "15 min",
  "by": "External",
  "views": 24,
  "rating": 4.8,
  "desc": "Walk through a reconstructed Roman forum as it appeared in 100 CE.",
  "url": "",
  "thumb": "🏛️"
 },
 {
  "id": "V004",
  "title": "Geometry in 3D — AR Shapes",
  "type": "AR Experience",
  "subj": "Mathematics",
  "grade": "Grade 6",
  "topic": "Geometry Ch.1",
  "dur": "15 min",
  "by": "Ms. Latha R.",
  "views": 42,
  "rating": 4.7,
  "desc": "View and rotate 3D geometric solids, measuring faces, edges and vertices.",
  "url": "",
  "thumb": "📐"
 },
 {
  "id": "V005",
  "title": "Arete Campus — AR Plant Identification",
  "type": "AR Experience",
  "subj": "Science",
  "grade": "Grade 4",
  "topic": "Biodiversity Park",
  "dur": "Field use",
  "by": "Ms. Divya K.",
  "views": 29,
  "rating": 5.0,
  "desc": "Point device at any plant in the Arete campus park to identify species and ecology. Designed for the Nadapuram biodiversity trail.",
  "url": "",
  "thumb": "🌿"
 },
 {
  "id": "E001",
  "title": "Class 8 — Mid-term Revision Pack",
  "type": "PDF / Document",
  "subj": "Mathematics",
  "grade": "Grade 8",
  "topic": "Term 1 Revision",
  "dur": "45 min",
  "by": "Ms. Latha R.",
  "views": 61,
  "rating": 4.6,
  "desc": "Educator-prepared PDF with 30 practice problems and full answer key.",
  "url": "",
  "thumb": "📄"
 },
 {
  "id": "E002",
  "title": "Science Quiz — Cells and Tissues",
  "type": "Quiz",
  "subj": "Science",
  "grade": "Grade 7",
  "topic": "Cell Biology",
  "dur": "20 min",
  "by": "Ms. Divya K.",
  "views": 74,
  "rating": 4.5,
  "desc": "10-question auto-graded quiz covering cell structure, organelles and functions.",
  "url": "",
  "thumb": "❓"
 }
],
    assignments: [
      { id:'LA001', resId:'L002', title:'Watch: Linear Equations Video', to:'Grade 8 — All', teacher:'Ms. Latha R.', due:'2026-09-25', assigned:'2026-09-18', engaged:28, total:38, completed:22 },
      { id:'LA002', resId:'A002', title:'Complete: Cell Builder Activity', to:'Grade 7 — All', teacher:'Ms. Divya K.', due:'2026-09-22', assigned:'2026-09-17', engaged:34, total:36, completed:30 },
      { id:'LA003', resId:'V001', title:'VR Session: Solar System Tour', to:'Grade 8 — All', teacher:'Ms. Divya K.', due:'2026-09-28', assigned:'2026-09-19', engaged:12, total:38, completed:10 },
      { id:'LA004', resId:'R001', title:'Khan Academy: Algebra Basics', to:'Grade 7 — All', teacher:'Ms. Latha R.', due:'2026-09-30', assigned:'2026-09-19', engaged:20, total:36, completed:12 },
    ],
    log: [],
  },
};

export function loadPrincipal() {
  try { const r = localStorage.getItem(PRINCIPAL_KEY); if (r) { const s = JSON.parse(r); return { ...SEED, ...s, settings: { ...SEED.settings, ...(s.settings || {}) } }; } } catch {}
  return JSON.parse(JSON.stringify(SEED));
}
export function savePrincipal(d) { try { localStorage.setItem(PRINCIPAL_KEY, JSON.stringify(d)); } catch {} }

// Announcements the Teacher portal should show (audience is staff-facing)
export function staffAnnouncements() {
  const staffAud = new Set(AUDIENCES.filter(a => a[1]).map(a => a[0]));
  return loadPrincipal().announcements.filter(a => staffAud.has(a.to));
}

export const prettyDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—';
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// ── Pure helpers shared by several views ──
export const classLabel = s => `${s.cls} ${s.section}`.trim();
export function attendanceOf(stuId, attLog) {
  let p = 0, t = 0;
  Object.values(attLog || {}).forEach(log => { if (log[stuId]) { t++; if (log[stuId] === 'P') p++; } });
  return t ? { pct: Math.round(p / t * 100), p, t } : null;
}
export function csvText(columns, rows) {
  const esc = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [columns, ...rows].map(r => r.map(esc).join(',')).join('\n');
}
export function downloadCsv(name, columns, rows) {
  try {
    const url = URL.createObjectURL(new Blob(['\ufeff' + csvText(columns, rows)], { type:'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch { return false; }
}

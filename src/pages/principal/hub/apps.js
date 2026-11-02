// The Principal's work, grouped into four apps. Each app keeps its sidebar short.
export const APPS = [
  { id: 'school', name: 'School', icon: '🎓', desc: 'Students, admissions, attendance, timetable and learning',
    pages: [['admissions', 'Admissions', '🎓'], ['students', 'Students', '👤'], ['attendance', 'Attendance', '✅'], ['timetable', 'Timetable', '📅'], ['learning', 'Digital Learning', '💡'], ['health', 'Health', '🩺']] },
  { id: 'money', name: 'Staff & Fees', icon: '💼', desc: 'Staff, leave, payroll and fee collection',
    pages: [['staff', 'Staff & HR', '👥'], ['payroll', 'Payroll', '💰'], ['fees', 'Fee Collection', '₹']] },
  { id: 'office', name: 'Office', icon: '📣', desc: 'Announcements, messages and reports',
    pages: [['communication', 'Communication', '📢'], ['reports', 'Reports', '📄']] },
  { id: 'portals', name: 'Portals', icon: '🧩', desc: 'HR, Finance, Hostel, Transport, Campus and more',
    pages: [] },
];

// Other portals (separate apps) — shown in the Portals app, the app switcher and search.
export const PORTALS = [
  ['/hr', 'HR & Recruitment', '👥', 'Vacancies, interviews, staff'], ['/finance', 'Finance', '₹', 'Fees, budget, payroll'],
  ['/hostel', 'Hostel', '🏠', 'Rooms, fees, mess'], ['/campus', 'Campus', '🏫', 'Complaints, library, visitors'],
  ['/transport', 'Transport', '🚌', 'Routes, drivers, fleet'], ['/teacher', 'Teacher Portal', '🍎', 'Classes and attendance'],
  ['/admissions', 'Admissions', '📝', 'Pipeline and students'], ['/careers', 'Careers page', '📋', 'Public job listings'],
];

export const findApp = id => APPS.find(a => a.id === id);
export const pageLabel = (appId, pageId) => findApp(appId)?.pages.find(p => p[0] === pageId)?.[1];
export const appOfPage = pageId => APPS.find(a => a.pages.some(p => p[0] === pageId && p[0] !== 'overview'));

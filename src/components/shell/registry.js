// Every portal in one list — used by the landing page, "All apps", the app switcher and search.
export const PORTAL_LIST = [
  { id: 'principal',  to: '/principal',  icon: '🏛', name: 'Principal',         group: 'Administration',      role: 'Principal',          desc: 'Students, staff, fees, attendance, communication and reports in one place.' },
  { id: 'admissions', to: '/admissions', icon: '🎓', name: 'Admissions',        group: 'Administration',      role: 'Admissions Officer', desc: 'Applications, student register, development profiles, boarding and buses.' },
  { id: 'finance',    to: '/finance',    icon: '₹',  name: 'Finance & Payroll', group: 'Administration',      role: 'Finance Admin',      desc: 'Fee collection, salaries, budget tracking and payment receipts.' },
  { id: 'hr',         to: '/hr',         icon: '👥', name: 'HR & Staff',        group: 'Administration',      role: 'HR Manager',         desc: 'Recruitment, interviews, training, staff attendance and leave.' },
  { id: 'teacher',    to: '/teacher',    icon: '🍎', name: 'Teacher Portal',    group: 'Teaching & Campus',      role: 'Teacher',            desc: 'Class attendance, student profiles, notes and timetable.' },
  { id: 'hostel',     to: '/hostel',     icon: '🏠', name: 'Hostel',            group: 'Teaching & Campus', role: 'Warden',             desc: 'Admission, rooms, fees, mess, outings and incidents.' },
  { id: 'transport',  to: '/transport',  icon: '🚌', name: 'Transport',         group: 'Teaching & Campus', role: 'Transport Manager',  desc: 'Bus routes, early departures, fleet, documents and fuel.' },
  { id: 'campus',     to: '/campus',     icon: '🏫', name: 'Campus',            group: 'Teaching & Campus', role: 'Campus Manager',     desc: 'Complaints, visitors, events, inventory and library.' },
  { id: 'careers',    to: '/careers',    icon: '📋', name: 'Careers Page',      group: 'Public',              role: 'Public',             desc: 'The public job application page — submissions go straight to HR.' },
];
export const findPortal = id => PORTAL_LIST.find(p => p.id === id);

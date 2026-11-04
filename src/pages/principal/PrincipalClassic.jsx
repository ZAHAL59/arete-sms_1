import { useState } from 'react';
import Logo from '../../components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import usePrincipal from './usePrincipal';
import useStore from '../../store/useStore';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, inputCls } from '../../components/ui/Kit';
import AdmissionsView from './AdmissionsView';
import Dashboard from './Dashboard';
import Students from './Students';
import Timetable from './Timetable';
import Attendance from './Attendance';
import Learning from './Learning';
import Staff from './Staff';
import Payroll from './Payroll';
import Fees from './Fees';
import Communication from './Communication';
import Health from './Health';
import Reports from './Reports';

const GROUPS = [
  { id: 'adm', title: 'Admissions & Students', items: [['admissions', 'Admissions', '🎓'], ['students', 'Student Records', '👤']] },
  { id: 'acad', title: 'Academic', items: [['timetable', 'Timetable', '📅'], ['attendance', 'Attendance', '✅'], ['learning', 'Digital Learning', '💡']] },
  { id: 'fin', title: 'Staff & Finance', items: [['staff', 'Staff & HR', '👥'], ['payroll', 'Payroll', '💰'], ['fees', 'Fee Collection', '₹']] },
  { id: 'ops', title: 'Operations', items: [['communication', 'Communication', '📢'], ['health', 'Health', '🩺'], ['reports', 'Reports', '📄']] },
];
const CONNECTED = [['/hr', 'HR & Recruitment', '👥'], ['/finance', 'Finance', '₹'], ['/hostel', 'Hostel', '🏠'], ['/campus', 'Campus', '🏫'], ['/transport', 'Transport', '🚌'], ['/teacher', 'Teacher Portal', '🍎'], ['/careers', 'Careers', '📋']];

export default function PrincipalClassic() {
  const navigate = useNavigate();
  const { p, ...api } = usePrincipal();
  const db = useStore(s => s.db);
  const [view, setView] = useState('dashboard');
  const [open, setOpen] = useState({ adm: false, acad: false, fin: false, ops: false, conn: false });   // all collapsed to start with
  const groupOf = id => GROUPS.find(g => g.items.some(([i]) => i === id))?.id;
  const goTo = v => { setView(v); const g = groupOf(v); if (g) setOpen(o => ({ ...o, [g]: true })); };       // opening a page opens its group
  const [settings, setSettings] = useState(null);
  const badge = { students: db.students.length, communication: p.announcements.length };

  const body = {
    dashboard: <Dashboard p={p} go={goTo} openRoute={navigate} />, admissions: <AdmissionsView />, students: <Students settings={p.settings} />,
    timetable: <Timetable p={p} api={api} />, attendance: <Attendance settings={p.settings} p={p} api={api} />, learning: <Learning p={p} api={api} />,
    staff: <Staff p={p} api={api} />, payroll: <Payroll p={p} api={api} />, fees: <Fees />, communication: <Communication p={p} api={api} />, health: <Health p={p} api={api} />, reports: <Reports p={p} />,
  }[view];

  const Item = ({ id, label, icon }) => (
    <div onClick={() => goTo(id)} className={`flex items-center gap-2.5 py-2 mx-2 rounded-[7px] text-[12.5px] cursor-pointer transition-all select-none ${view === id ? 'bg-[#F6F6F7] text-[#C8202E] font-semibold border-l-[3px] border-[#C8202E] rounded-l-none ml-0 pl-[11px] pr-3' : 'text-[#555] hover:bg-[#F6F6F7] hover:text-[#C8202E] px-3'}`}>
      <span className="text-[14px] w-5 text-center flex-shrink-0">{icon}</span><span className="flex-1">{label}</span>
      {badge[id] > 0 && <span className="text-[9px] font-bold bg-[#F6F6F7] text-[#C8202E] px-1.5 py-0.5 rounded-full">{badge[id]}</span>}
    </div>
  );
  const Group = ({ id, title, children }) => (
    <div><div onClick={() => setOpen(o => ({ ...o, [id]: !o[id] }))} className="flex items-center gap-1.5 px-4 pt-3 pb-1 cursor-pointer select-none text-[9.5px] font-bold tracking-[1.6px] uppercase text-[#AAA] hover:text-[#C8202E]"><span className={`transition-transform ${open[id] ? 'rotate-90' : ''}`}>›</span>{title}</div>{open[id] && children}</div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#E4E4E4] flex flex-col overflow-y-auto">
        <div className="px-4 py-3.5 border-b border-[#E4E4E4] flex items-center gap-2.5">
          <Logo />
          <div><div className="text-[14px] font-bold text-[#111] leading-tight">Arete</div><div className="text-[10px] text-[#AAA]">Principal Dashboard</div></div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          <Item id="dashboard" label="Dashboard" icon="⊞" />
          {GROUPS.map(g => <Group key={g.id} id={g.id} title={g.title}>{g.items.map(([id, l, i]) => <Item key={id} id={id} label={l} icon={i} />)}</Group>)}
          <Group id="conn" title="Connected Portals">{CONNECTED.map(([to, l, i]) => <Link key={to} to={to} className="flex items-center gap-2.5 py-2 mx-2 px-3 rounded-[7px] text-[12.5px] text-[#555] no-underline hover:bg-[#F6F6F7] hover:text-[#C8202E]"><span className="text-[14px] w-5 text-center">{i}</span><span className="flex-1">{l}</span><span className="text-[10px]">↗</span></Link>)}</Group>
        </nav>
        <div className="border-t border-[#E4E4E4] p-2">
          <Link to="/" className="block px-3 py-1.5 text-[11.5px] text-[#777] no-underline hover:text-[#C8202E]">← All portals</Link>
          <div onClick={() => setSettings({ ...p.settings })} className="flex items-center gap-2.5 px-2 py-2 rounded-[7px] cursor-pointer hover:bg-[#F6F6F7]" title="School settings">
            <div className="w-8 h-8 rounded-full bg-[#C8202E] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">MZ</div>
            <div className="flex-1 min-w-0"><div className="text-[12.5px] font-bold text-[#111]">Muhd Zahal</div><div className="text-[10.5px] text-[#AAA]">Principal · ⚙ Settings</div></div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#F8F8F8]">{body}</main>

      {settings && <Modal open onClose={() => setSettings(null)} title="School Settings" subtitle="Applies across the Principal dashboard" footer={<><Button variant="outline" onClick={() => setSettings(null)}>Cancel</Button><Button onClick={() => { api.setSettings({ ...settings, lowAtt: Math.min(100, Math.max(1, +settings.lowAtt || 75)) }); setSettings(null); }}>Save</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="School Name" className="col-span-2"><input value={settings.school} onChange={e => setSettings(s => ({ ...s, school: e.target.value }))} className={inputCls} /></Field>
          <Field label="Academic Year"><select value={settings.year} onChange={e => setSettings(s => ({ ...s, year: e.target.value }))} className={inputCls}>{['2026–27', '2025–26'].map(y => <option key={y}>{y}</option>)}</select></Field>
          <Field label="Board"><select value={settings.board} onChange={e => setSettings(s => ({ ...s, board: e.target.value }))} className={inputCls}>{['CBSE', 'ICSE', 'Kerala State'].map(y => <option key={y}>{y}</option>)}</select></Field>
          <Field label="Low Attendance Alert (%)" className="col-span-2"><input type="number" min={1} max={100} value={settings.lowAtt} onChange={e => setSettings(s => ({ ...s, lowAtt: e.target.value }))} className={inputCls} /><div className="text-[11px] text-[#AAA] mt-1">Students below this appear under "Attendance Risk" and on the dashboard.</div></Field>
        </div></Modal>}
    </div>
  );
}

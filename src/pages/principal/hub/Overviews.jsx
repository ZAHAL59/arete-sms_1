import Badge from '../../../components/ui/Badge';
import { fmt, fmtL, prettyDate } from '../constants';
import { MODULES } from '../reportBuilders';
import { PORTALS } from './apps';
import { Panel, CPanel, Tile, Hero, QuickActions, Row, DateChip, Empty } from '../../../components/shell/widgets';

const todayLabel = () => new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase().replace(',', ' ·');
const STATUS = { Approved: 'green', Rejected: 'red', Pending: 'amber' };

/* ───────────────────────── School ───────────────────────── */
export function SchoolOverview({ S, p, go }) {
  const a = S.attendance;
  return (
    <div className="max-w-[1240px] mx-auto px-8 pt-4 pb-14">
      <h1 className="text-[32px] font-extrabold tracking-tight text-[#111] mb-7">Overview</h1>
      <div className="grid grid-cols-[1.45fr_1fr] gap-6">
        <Hero kicker={`TODAY · ${todayLabel()}`} title={a.pct == null ? 'Attendance not marked yet' : `${a.pct}% present today`}
          sub={a.pct == null ? 'Open attendance to mark today’s register.' : `${a.marked} students marked · ${a.absent} absent`}
          actions={[{ label: 'Open attendance', primary: true, run: () => go('school', 'attendance') }, { label: 'Timetable', run: () => go('school', 'timetable') }]} />
        <div className="grid grid-cols-2 gap-5">
          <Tile label="Students" value={S.counts.students} note={`${S.counts.boarders} boarders`} onClick={() => go('school', 'students')} />
          <Tile label="Applications" value={S.counts.applications} note="In the admissions pipeline" color="#1A5FB4" onClick={() => go('school', 'admissions')} />
          <Tile label="Attendance risk" value={a.atRisk} note={`Below ${p.settings.lowAtt}%`} color={a.atRisk ? '#DC2626' : '#166534'} onClick={() => go('school', 'attendance')} />
          <Tile label="Open complaints" value={S.counts.openComplaints} note="Across the campus" color={S.counts.openComplaints ? '#B45309' : '#166534'} />
        </div>
      </div>
      <div className="grid grid-cols-[1.45fr_1fr] gap-6 mt-6 items-start">
        <CPanel title="Recently enrolled" meta={`${S.counts.students} student${S.counts.students === 1 ? '' : 's'}`} action={<button onClick={() => go('school', 'students')} className="text-[12px] font-semibold text-[#C8202E] cursor-pointer bg-none border-none">All students</button>}>
          {S.recentStudents.length ? S.recentStudents.map(s => <Row key={s.id} icon="👤" title={s.name} sub={`${s.cls} ${s.section} · admitted ${prettyDate(s.adm)}`} onClick={() => go('school', 'students')} right={s.boarding ? <Badge variant="blue">Boarder</Badge> : null} />) : <Empty icon="👤" title="No students yet" />}
        </CPanel>
        <QuickActions items={[['🎓', 'New application', () => go('school', 'admissions')], ['✅', 'Mark attendance', () => go('school', 'attendance')], ['👤', 'Student records', () => go('school', 'students')], ['📅', 'Timetable', () => go('school', 'timetable')], ['💡', 'Digital learning', () => go('school', 'learning')], ['🩺', 'Health', () => go('school', 'health')]]} />
      </div>
      <CPanel className="mt-6" title="Upcoming events" meta={`${S.upcomingEvents.length} upcoming`}>
        {S.upcomingEvents.length ? S.upcomingEvents.slice(0, 4).map(e => <Row key={e.id} icon={<DateChip iso={e.date} />} title={e.title} sub={`${e.time || ''} · ${e.venue || ''}`} right={<Badge variant="grey">{e.type}</Badge>} />) : <Empty icon="📅" title="No upcoming events" sub="Events are scheduled in the Campus portal" />}
      </CPanel>
    </div>
  );
}

/* ───────────────────────── Staff & Fees ───────────────────────── */
export function MoneyOverview({ S, go, route }) {
  const f = S.fees;
  return (
    <div className="max-w-[1240px] mx-auto px-8 pt-4 pb-14">
      <h1 className="text-[32px] font-extrabold tracking-tight text-[#111] mb-7">Overview</h1>
      <div className="grid grid-cols-[1.45fr_1fr] gap-6">
        <Hero kicker="FEES · THIS ACADEMIC YEAR" title={`${fmtL(f.collected)} collected`} sub={`${f.pct}% of ${fmtL(f.totalDue)} billed · ${fmt(f.outstanding)} still to collect`} progress={f.pct}
          actions={[{ label: 'Fee collection', primary: true, run: () => go('money', 'fees') }, { label: 'Payroll', run: () => go('money', 'payroll') }]} />
        <div className="grid grid-cols-2 gap-5">
          <Tile label="Staff" value={S.counts.staff} note="Active members" onClick={() => go('money', 'staff')} />
          <Tile label="Leave requests" value={S.counts.pendingLeaves} note="Waiting for approval" color={S.counts.pendingLeaves ? '#B45309' : '#166534'} onClick={() => go('money', 'staff')} />
          <Tile label="On leave today" value={S.onLeaveToday.length} note={S.onLeaveToday.map(s => s.name.split(' ')[0]).join(', ') || 'Everyone is in'} color="#1A5FB4" />
          <Tile label="Monthly payroll" value={fmtL(S.counts.payroll)} note="All staff salaries" color="#6D28D9" onClick={() => go('money', 'payroll')} />
        </div>
      </div>
      <div className="grid grid-cols-[1.45fr_1fr] gap-6 mt-6 items-start">
        <CPanel title="Recent leave requests" meta={S.counts.pendingLeaves ? `${S.counts.pendingLeaves} pending` : `${S.recentLeaves.length} recent`} action={<button onClick={() => go('money', 'staff')} className="text-[12px] font-semibold text-[#C8202E] cursor-pointer bg-none border-none">Staff & HR</button>}>
          {S.recentLeaves.length ? S.recentLeaves.map(l => <Row key={l.id} icon="🗓" title={`${S.db.staff.find(s => s.id === l.staffId)?.name || l.staffId} — ${l.type} leave`} sub={`${l.from} to ${l.to || l.from}`} right={<Badge variant={STATUS[l.status] || 'grey'}>{l.status}</Badge>} />) : <Empty icon="🗓" title="No leave requests" />}
        </CPanel>
        <QuickActions items={[['👥', 'Staff & HR', () => go('money', 'staff')], ['💰', 'Run payroll', () => go('money', 'payroll')], ['₹', 'Fee collection', () => go('money', 'fees')], ['📄', 'Fee report', () => go('office', 'reports')], ['👥', 'Open HR portal', () => route('/hr')], ['₹', 'Open Finance portal', () => route('/finance')]]} />
      </div>
      <CPanel className="mt-6" title="Coming up" meta={`${S.upcomingTraining.length + (S.docsExpiring ? 1 : 0)} item${S.upcomingTraining.length + (S.docsExpiring ? 1 : 0) === 1 ? '' : 's'}`}>
        {S.upcomingTraining.length || S.docsExpiring ? <>
          {S.upcomingTraining.slice(0, 3).map(t => <Row key={t.id} icon={<DateChip iso={t.date} />} title={t.title} sub={`Staff training · ${t.duration || ''}`} right={<Badge variant="blue">Training</Badge>} />)}
          {S.docsExpiring > 0 && <Row icon="🗂" title={`${S.docsExpiring} staff document${S.docsExpiring > 1 ? 's' : ''} expiring within 30 days`} sub="Review in the HR portal" onClick={() => route('/hr')} right={<Badge variant="amber">Review</Badge>} />}
        </> : <Empty icon="🎓" title="Nothing coming up" sub="Training sessions and document renewals appear here" />}
      </CPanel>
    </div>
  );
}

/* ───────────────────────── Office ───────────────────────── */
export function OfficeOverview({ S, p, go }) {
  const latest = p.announcements[0];
  return (
    <div className="max-w-[1240px] mx-auto px-8 pt-4 pb-14">
      <h1 className="text-[32px] font-extrabold tracking-tight text-[#111] mb-7">Overview</h1>
      <div className="grid grid-cols-[1.45fr_1fr] gap-6">
        <Hero kicker="COMMUNICATION" title={`${p.announcements.length} announcement${p.announcements.length === 1 ? '' : 's'} sent`} sub={latest ? `Latest: ${latest.title} · ${prettyDate(latest.sent)}` : 'Nothing sent yet — write your first announcement.'}
          actions={[{ label: 'New announcement', primary: true, run: () => go('office', 'communication') }, { label: 'Reports', run: () => go('office', 'reports') }]} />
        <div className="grid grid-cols-2 gap-5">
          <Tile label="Announcements" value={p.announcements.length} note="Sent to families & staff" onClick={() => go('office', 'communication')} />
          <Tile label="Messages queued" value={p.messages.length} note="Waiting to be delivered" color="#1A5FB4" onClick={() => go('office', 'communication')} />
          <Tile label="Report types" value={Object.keys(MODULES).length} note="Build your own or use a standard one" color="#6D28D9" onClick={() => go('office', 'reports')} />
          <Tile label="Open complaints" value={S.counts.openComplaints} note="From the campus log" color={S.counts.openComplaints ? '#B45309' : '#166534'} />
        </div>
      </div>
      <div className="grid grid-cols-[1.45fr_1fr] gap-6 mt-6 items-start">
        <CPanel title="Recent announcements" meta={`${p.announcements.length} sent`} action={<button onClick={() => go('office', 'communication')} className="text-[12px] font-semibold text-[#C8202E] cursor-pointer bg-none border-none">All announcements</button>}>
          {p.announcements.length ? p.announcements.slice(0, 5).map(a => <Row key={a.id} icon="📢" title={a.title} sub={`${prettyDate(a.sent)} · ${a.to}`} right={<Badge variant="grey">{a.channel}</Badge>} />) : <Empty icon="📢" title="No announcements yet" />}
        </CPanel>
        <QuickActions items={[['📢', 'New announcement', () => go('office', 'communication')], ['✉', 'Send a message', () => go('office', 'communication')], ['📄', 'Standard reports', () => go('office', 'reports')], ['🛠', 'Build a report', () => go('office', 'reports')]]} />
      </div>
      <CPanel className="mt-6" title="Today’s activity" meta={`${S.activity.length} update${S.activity.length === 1 ? '' : 's'}`}>
        {S.activity.length ? S.activity.map((a, i) => <Row key={i} icon={<span className="w-2.5 h-2.5 rounded-full" style={{ background: a.c }} />} title={a.msg} sub={prettyDate(a.at)} />) : <Empty icon="📋" title="No activity yet" />}
      </CPanel>
    </div>
  );
}

/* ───────────────────────── Portals ───────────────────────── */
export function PortalsOverview({ S, route }) {
  return (
    <div className="max-w-[1240px] mx-auto px-8 pt-4 pb-14">
      <h1 className="text-[32px] font-extrabold tracking-tight text-[#111] mb-1.5">Portals</h1>
      <p className="text-[14px] text-[#777] mb-7">A live look at the other portals. Click a tile to open that portal.</p>
      <div className="grid grid-cols-4 gap-5 mb-7">{S.indicators.map(([l, v, n, to]) => <Tile key={l} label={l} value={v} note={n} color={v ? '#C8202E' : '#166534'} onClick={() => route(to)} />)}</div>
      <Panel title="Open a portal">
        <div className="grid grid-cols-4 gap-4">{PORTALS.map(([to, name, icon, desc]) => (
          <div key={to} onClick={() => route(to)} className="border border-[#F0F0F0] rounded-[18px] p-5 cursor-pointer hover:border-[#C8202E]/60 hover:bg-[#F6F6F7] transition-colors">
            <div className="w-10 h-10 rounded-[11px] bg-[#F6F6F7] flex items-center justify-center text-[18px] mb-2.5">{icon}</div><div className="text-[13.5px] font-bold text-[#111]">{name}</div><div className="text-[11.5px] text-[#999]">{desc}</div></div>))}</div>
      </Panel>
    </div>
  );
}

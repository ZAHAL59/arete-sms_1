import { useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import { DateChip } from '../../components/shell/widgets';
import { plural } from '../../components/shell/Page';
import { prettyDate, daysBetween } from '../principal/constants';
import { loanStatus, TODAY } from './constants';

export const APPS = [
  { id: 'operations', name: 'Operations', icon: '📩', desc: 'Complaints, visitors and events', pages: [['complaints', 'Complaints', '📩'], ['visitors', 'Visitor Log', '👤'], ['events', 'Meetings & Events', '📅']] },
  { id: 'assets', name: 'Assets & Library', icon: '📦', desc: 'Inventory, library loans and the finance summary', pages: [['inventory', 'Inventory', '📦'], ['library', 'Library', '📚'], ['finance', 'Finance Summary', '₹']] },
];

export function useCampusSummary(c, go) {
  const db = useStore(s => s.db);
  return useMemo(() => {
    const complaints = (db.complaints || []).filter(x => x.status === 'Open').map(x => ({ ...x, age: daysBetween(x.date, TODAY) })).sort((a, b) => b.age - a.age);
    const inside = c.visitors.filter(v => v.status === 'In' && v.date === TODAY);
    const todayVisits = c.visitors.filter(v => v.date === TODAY);
    const overdue = c.books.filter(b => loanStatus(b) === 'Overdue');
    const onLoan = c.books.filter(b => b.issuedTo);
    const repairs = c.inventory.filter(i => i.repair > 0);
    const events = c.events.filter(e => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
    const attention = [
      ...complaints.map(x => ({ id: 'c' + x.id, letter: 'C', color: x.age > 7 ? '#B91C1C' : '#B45309', title: x.subj.slice(0, 80), sub: `${x.type} · open ${x.age} day${x.age === 1 ? '' : 's'}`, actions: [{ label: 'Open', variant: 'outline', run: () => go('complaints') }] })),
      ...(overdue.length ? [{ id: 'bk', letter: 'B', color: '#B45309', title: `${plural(overdue.length, 'library book')} overdue`, sub: overdue.slice(0, 3).map(b => b.title).join(', '), actions: [{ label: 'Open', variant: 'outline', run: () => go('library') }] }] : []),
      ...(repairs.length ? [{ id: 'inv', letter: 'I', color: '#6D28D9', title: `${repairs.reduce((a, i) => a + i.repair, 0)} assets under repair`, sub: repairs.map(i => i.name).join(', '), actions: [{ label: 'Open', variant: 'outline', run: () => go('inventory') }] }] : []),
    ];
    return { db, complaints, inside, todayVisits, overdue, onLoan, repairs, repairUnits: repairs.reduce((a, i) => a + i.repair, 0), events, attention };
  }, [c, db]);   // eslint-disable-line react-hooks/exhaustive-deps
}

export function campusHub(S, go, c) {
  const old = S.complaints.filter(x => x.age > 7).length;
  const pulse = [
    { label: 'Open complaints', value: S.complaints.length, note: old ? `${old} older than a week` : 'All recent', color: S.complaints.length ? '#B45309' : '#166534', run: () => go('complaints') },
    { label: 'Visitors inside', value: S.inside.length, note: `${S.todayVisits.length} today`, color: '#1A5FB4', run: () => go('visitors') },
    { label: 'Upcoming events', value: S.events.length, note: 'On the calendar', color: '#6D28D9', run: () => go('events') },
    { label: 'Overdue books', value: S.overdue.length, note: 'Library loans', color: S.overdue.length ? '#B91C1C' : '#166534', run: () => go('library') },
  ];
  const today = [...S.events.filter(e => e.date === TODAY).map(e => ({ id: 'e' + e.id, time: e.time, title: e.title, tag: e.type })), ...S.inside.map(v => ({ id: 'v' + v.id, time: `in ${v.timeIn}`, title: `${v.name} is on campus`, tag: 'Visitor' }))];
  const upcoming = S.events.filter(e => e.date > TODAY).slice(0, 3).map(e => ({ id: 'u' + e.id, date: e.date, title: e.title, sub: `${prettyDate(e.date)} · ${e.time}`, tag: e.type }));
  const cfg = {
    operations: { title: S.inside.length ? `${plural(S.inside.length, 'visitor')} inside now` : 'No visitors on campus', sub: `${plural(S.complaints.length, 'open complaint')} · ${plural(S.events.length, 'upcoming event')}`,
      actions: [{ label: 'Log a visitor', primary: true, page: 'visitors' }, { label: 'Complaints', page: 'complaints' }],
      tiles: [{ label: 'Open complaints', value: S.complaints.length, note: old ? `${old} older than a week` : 'All recent', color: S.complaints.length ? '#B45309' : '#166534', page: 'complaints' }, { label: 'Visitors today', value: S.todayVisits.length, note: `${S.inside.length} still inside`, color: '#1A5FB4', page: 'visitors' }, { label: 'Upcoming events', value: S.events.length, note: 'Meetings & events', color: '#6D28D9', page: 'events' }, { label: 'Older than a week', value: old, note: 'Complaints to chase', color: old ? '#B91C1C' : '#166534', page: 'complaints' }],
      panels: [{ title: 'Open complaints', meta: plural(S.complaints.length, 'complaint'), action: { label: 'All complaints', page: 'complaints' }, rows: S.complaints.slice(0, 5).map(x => ({ key: x.id, icon: '📩', title: x.subj.slice(0, 70), sub: `${x.type} · from ${x.who}`, right: <Badge variant={x.age > 7 ? 'red' : 'amber'}>{x.age}d</Badge>, page: 'complaints' })), empty: { icon: '🎉', title: 'No open complaints' } },
        { title: 'Upcoming events', meta: plural(S.events.length, 'event'), rows: S.events.slice(0, 4).map(e => ({ key: e.id, icon: <DateChip iso={e.date} />, title: e.title, sub: `${e.time} · ${e.venue}`, right: <Badge variant={e.alloc ? 'green' : 'amber'}>{e.alloc ? `${e.alloc}/${e.seats}` : 'Seats not set'}</Badge>, page: 'events' })), empty: { icon: '📅', title: 'No upcoming events' } },
        { title: 'Visitors today', meta: plural(S.todayVisits.length, 'visit'), rows: S.todayVisits.map(v => ({ key: v.id, icon: '👤', title: v.name, sub: `${v.purpose} · ${v.meeting} · in ${v.timeIn}`, right: <Badge variant={v.status === 'In' ? 'red' : 'green'}>{v.status === 'In' ? 'Inside' : 'Left'}</Badge>, page: 'visitors' })), empty: { icon: '👤', title: 'No visitors yet today' } }] },
    assets: { title: S.repairUnits ? `${S.repairUnits} assets under repair` : 'All assets are working', sub: `${plural(c.inventory.length, 'asset type')} · ${plural(S.onLoan.length, 'book')} on loan · ${S.overdue.length} overdue`,
      actions: [{ label: 'Inventory', primary: true, page: 'inventory' }, { label: 'Library', page: 'library' }],
      tiles: [{ label: 'Asset types', value: c.inventory.length, note: 'In the inventory', page: 'inventory' }, { label: 'Under repair', value: S.repairUnits, note: 'Units out of use', color: S.repairUnits ? '#6D28D9' : '#166534', page: 'inventory' }, { label: 'Books on loan', value: S.onLoan.length, note: 'Issued to students', color: '#1A5FB4', page: 'library' }, { label: 'Overdue books', value: S.overdue.length, note: 'Past due date', color: S.overdue.length ? '#B91C1C' : '#166534', page: 'library' }],
      panels: [{ title: 'Under repair', meta: plural(S.repairs.length, 'asset type'), action: { label: 'Inventory', page: 'inventory' }, rows: S.repairs.map(i => ({ key: i.id, icon: i.icon || '📦', title: i.name, sub: `${i.working} working of ${i.total}`, right: <Badge variant="amber">{i.repair} in repair</Badge>, page: 'inventory' })), empty: { icon: '✓', title: 'Nothing is under repair' } },
        { title: 'Overdue books', meta: plural(S.overdue.length, 'book'), rows: S.overdue.map(b => ({ key: b.id, icon: '📚', title: b.title, sub: `Issued to ${S.db.students.find(s => s.id === b.issuedTo)?.name || b.issuedTo} · due ${prettyDate(b.due)}`, right: <Badge variant="red">Overdue</Badge>, page: 'library' })), empty: { icon: '✓', title: 'No overdue books' } }] },
  };
  return { pulse, today, upcoming, cfg };
}

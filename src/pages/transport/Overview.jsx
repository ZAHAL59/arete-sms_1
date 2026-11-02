import { useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import { plural } from '../../components/shell/Page';
import { prettyDate } from '../principal/constants';
import { docStatus } from './constants';

const TODAY = new Date().toISOString().slice(0, 10);
export const APPS = [
  { id: 'daily', name: 'Daily Operations', icon: '🚌', desc: 'Early departures, stop tracking and the manifest', pages: [['departure', 'Early Departure', '🚪'], ['stops', 'Stop Tracking', '📍'], ['manifest', 'Daily Manifest', '📋']] },
  { id: 'fleet', name: 'Fleet', icon: '🔧', desc: 'Routes, maintenance, documents and fuel', pages: [['routes', 'Routes & Drivers', '🗺'], ['maintenance', 'Maintenance Log', '🔧'], ['docs', 'Vehicle Docs', '📄'], ['fuel', 'Fuel Log', '⛽']] },
];

export function useTransportSummary(t, go) {
  const db = useStore(s => s.db);
  return useMemo(() => {
    const todayDeps = t.departures.filter(d => d.date === TODAY);
    const docs = t.docs.map(d => ({ ...d, st: docStatus(d.expiry) })).filter(d => d.st.days <= 30).sort((a, b) => a.st.days - b.st.days);
    const month = TODAY.slice(0, 7), fuel = t.fuel.filter(f => (f.date || '').startsWith(month));
    const onBus = db.students.filter(s => s.busRoute);
    const attention = docs.map(d => ({ id: 'd' + d.id, letter: 'D', color: d.st.days < 0 ? '#DC2626' : '#B45309', title: `${d.vehicle} — ${d.type} ${d.st.days < 0 ? 'expired' : 'expires in ' + d.st.days + ' days'}`, sub: `${d.num} · valid to ${prettyDate(d.expiry)}`, actions: [{ label: 'Open', variant: 'outline', run: () => go('docs') }] }));
    return { db, todayDeps, docs, fuel, fuelAmt: fuel.reduce((a, f) => a + (f.amount || 0), 0), fuelL: fuel.reduce((a, f) => a + (f.litres || 0), 0), onBus, routes: db.routes, recentFuel: t.fuel.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 4), attention };
  }, [t, db]);   // eslint-disable-line react-hooks/exhaustive-deps
}

export function transportHub(S, go, t) {
  const expired = S.docs.filter(d => d.st.days < 0).length;
  const pulse = [
    { label: 'Routes', value: S.routes.length, note: 'Active bus routes', run: () => go('routes') },
    { label: 'Students on bus', value: S.onBus.length, note: 'Across all routes', color: '#1A5FB4', run: () => go('manifest') },
    { label: 'Departures today', value: S.todayDeps.length, note: 'Early departures', color: '#6D28D9', run: () => go('departure') },
    { label: 'Documents', value: S.docs.length, note: expired ? `${expired} expired` : 'Need attention', color: S.docs.length ? '#DC2626' : '#166534', run: () => go('docs') },
  ];
  const today = S.todayDeps.map(d => ({ id: d.id, time: d.time, title: `${S.db.students.find(s => s.id === d.studentId)?.name || d.studentId} leaves early`, tag: d.reason }));
  const cfg = {
    daily: { title: S.todayDeps.length ? `${plural(S.todayDeps.length, 'early departure')} today` : 'No early departures today', sub: `${plural(S.routes.length, 'route')} · ${plural(S.onBus.length, 'student')} ride the bus`,
      actions: [{ label: 'Log a departure', primary: true, page: 'departure' }, { label: 'Daily manifest', page: 'manifest' }],
      tiles: [{ label: 'Departures today', value: S.todayDeps.length, note: 'Early leavers', page: 'departure' }, { label: 'Students on bus', value: S.onBus.length, note: 'All routes', color: '#1A5FB4', page: 'manifest' }, { label: 'Routes', value: S.routes.length, note: 'Running today', color: '#6D28D9', page: 'stops' }, { label: 'Parents not informed', value: S.todayDeps.filter(d => !d.smsSent).length, note: 'SMS not sent', color: S.todayDeps.some(d => !d.smsSent) ? '#B45309' : '#166534', page: 'departure' }],
      panels: [{ title: 'Today’s early departures', meta: plural(S.todayDeps.length, 'departure'), action: { label: 'Log departure', page: 'departure' }, rows: S.todayDeps.map(d => ({ key: d.id, icon: '🚪', title: S.db.students.find(s => s.id === d.studentId)?.name || d.studentId, sub: `${d.time} · ${d.reason}`, right: <Badge variant={d.smsSent ? 'green' : 'grey'}>{d.smsSent ? 'Parent informed' : 'Not sent'}</Badge> })), empty: { icon: '🚪', title: 'No early departures today' } }] },
    fleet: { title: S.docs.length ? `${plural(S.docs.length, 'vehicle document')} need attention` : 'All vehicle documents are valid', sub: `${plural(t.maintenance.length, 'maintenance entry', 'maintenance entries')} · ₹${Math.round(S.fuelAmt).toLocaleString('en-IN')} fuel this month`,
      actions: [{ label: 'Vehicle documents', primary: true, page: 'docs' }, { label: 'Routes & drivers', page: 'routes' }],
      tiles: [{ label: 'Routes', value: S.routes.length, note: 'With drivers', page: 'routes' }, { label: 'Documents', value: S.docs.length, note: expired ? `${expired} expired` : 'Expiring within 30 days', color: S.docs.length ? '#DC2626' : '#166534', page: 'docs' }, { label: 'Maintenance', value: t.maintenance.length, note: 'Entries logged', color: '#6D28D9', page: 'maintenance' }, { label: 'Fuel this month', value: `₹${(S.fuelAmt / 1000).toFixed(1)}K`, note: `${Math.round(S.fuelL)} litres`, color: '#1A5FB4', page: 'fuel' }],
      panels: [{ title: 'Documents needing attention', meta: S.docs.length ? plural(S.docs.length, 'document') : 'All valid ✓', action: { label: 'Open', page: 'docs' }, rows: S.docs.map(d => ({ key: d.id, icon: '📄', title: `${d.vehicle} — ${d.type}`, sub: `${d.num} · ${prettyDate(d.expiry)}`, right: <Badge variant={d.st.variant}>{d.st.label}</Badge>, page: 'docs' })), empty: { icon: '✓', title: 'All vehicle documents are valid' } },
        { title: 'Recent fuel entries', meta: plural(S.recentFuel.length, 'entry', 'entries'), rows: S.recentFuel.map(f => ({ key: f.id, icon: '⛽', title: `${f.vehicle} · ${f.litres} L`, sub: `${prettyDate(f.date)} · ${f.driver || ''}`, right: <b className="font-mono text-[13px]">₹{(f.amount || 0).toLocaleString('en-IN')}</b>, page: 'fuel' })), empty: { icon: '⛽', title: 'No fuel entries yet' } }] },
  };
  return { pulse, today, upcoming: [], cfg };
}

import { useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import { plural } from '../../components/shell/Page';
import { getFeeStructure } from '../finance/constants';
import { MONTHLY_FEE, fmt, TODAY } from './constants';
import { paidForMonth, joinMonth } from './hostelFees';

export const APPS = [
  { id: 'hostel', name: 'Hostel', icon: '🏠', desc: 'Admission, rooms, inmate records and fees', pages: [['admit', 'Hostel Admission', '➕'], ['rooms', 'Room Allocation', '🏠'], ['inmates', 'Inmate Records', '👥'], ['fees', 'Hostel Fees', '₹']] },
  { id: 'mess', name: 'Mess', icon: '🍽', desc: 'Stock, orders and the weekly menu', pages: [['mess', 'Mess Management', '🍽'], ['menu', 'Weekly Menu', '📅']] },
  { id: 'welfare', name: 'Welfare', icon: '🛡', desc: 'Outing requests and the incident log', pages: [['outing', 'Outing Requests', '🚪'], ['incidents', 'Incident Log', '⚠️']] },
];

export function useHostelSummary(h, H, go) {
  const db = useStore(s => s.db);
  return useMemo(() => {
    const rooms = h.rooms.filter(r => r.type !== 'Staff');
    const beds = rooms.reduce((a, r) => a + r.capacity, 0), occupied = rooms.reduce((a, r) => a + r.inmates.length, 0);
    const placed = new Set(h.rooms.flatMap(r => r.inmates));
    const boarders = db.students.filter(s => s.boarding), waiting = boarders.filter(s => !placed.has(s.name));
    const month = TODAY.slice(0, 7);
    const dues = boarders.map(s => { const fee = Math.round((getFeeStructure()[s.cls]?.hostel || MONTHLY_FEE * 12) / 12), rec = (h.admissions || []).find(a => a.studentId === s.id);
      return { s, bal: month >= joinMonth(s.id, rec, db.payments) ? Math.max(0, fee - paidForMonth(db.payments, s.id, month)) : 0 }; }).filter(x => x.bal > 0);
    const outings = h.outings.filter(o => o.status === 'Pending Approval');
    const incidents = h.incidents.filter(i => i.status === 'Open');
    const lowStock = h.stock.filter(s => s.qty <= s.low);
    const openOrders = (h.orders || []).filter(o => o.status !== 'Received');
    const attention = [
      ...outings.map(o => ({ id: 'o' + o.id, letter: 'O', color: '#B45309', title: `${o.stuName} — outing (${o.purpose})`, sub: `${o.dep} to ${o.ret}`, actions: [{ label: 'Approve', run: () => H.setOutingStatus(o.id, 'Approved') }, { label: 'Reject', variant: 'outline', run: () => H.setOutingStatus(o.id, 'Rejected') }] })),
      ...incidents.map(i => ({ id: 'i' + i.id, letter: '!', color: '#DC2626', title: `${i.stuName} — ${i.type} incident`, sub: (i.desc || '').slice(0, 70), actions: [{ label: 'Open', variant: 'outline', run: () => go('incidents') }] })),
      ...(waiting.length ? [{ id: 'w', letter: 'R', color: '#1A5FB4', title: `${plural(waiting.length, 'boarder')} without a room`, sub: waiting.map(s => s.name).join(', '), actions: [{ label: 'Admit', run: () => go('admit') }] }] : []),
      ...(lowStock.length ? [{ id: 'ls', letter: 'S', color: '#B45309', title: `${plural(lowStock.length, 'mess item')} low on stock`, sub: lowStock.map(s => s.item).join(', '), actions: [{ label: 'Reorder', variant: 'outline', run: () => go('mess') }] }] : []),
    ];
    return { db, beds, occupied, free: beds - occupied, boarders, waiting, dues, dueAmt: dues.reduce((a, x) => a + x.bal, 0), outings, incidents, lowStock, openOrders, stockValue: h.stock.reduce((a, s) => a + s.qty * (s.cost || 0), 0), attention };
  }, [h, db]);   // eslint-disable-line react-hooks/exhaustive-deps
}

export function hostelHub(S, H, go, h) {
  const pulse = [
    { label: 'Beds occupied', value: `${S.occupied}/${S.beds}`, note: `${S.free} free`, run: () => go('rooms') },
    { label: 'Fees due', value: fmt(S.dueAmt), note: `${plural(S.dues.length, 'student')} this month`, color: S.dues.length ? '#DC2626' : '#166534', run: () => go('fees') },
    { label: 'Pending outings', value: S.outings.length, note: 'Awaiting approval', color: S.outings.length ? '#B45309' : '#166534', run: () => go('outing') },
    { label: 'Open incidents', value: S.incidents.length, note: 'Welfare log', color: S.incidents.length ? '#DC2626' : '#166534', run: () => go('incidents') },
  ];
  const today = h.outings.filter(o => o.dep === TODAY && o.status === 'Approved').map(o => ({ id: 'o' + o.id, title: `${o.stuName} leaves for ${o.purpose}`, time: `Returns ${o.ret}`, tag: 'Outing' }));
  const outingRows = S.outings.map(o => ({ key: o.id, icon: '🚪', title: `${o.stuName} — ${o.purpose}`, sub: `${o.dep} to ${o.ret} · consent ${o.consent}`, right: <span className="flex gap-3"><button onClick={e => { e.stopPropagation(); H.setOutingStatus(o.id, 'Approved'); }} className="text-[12px] font-semibold text-[#166534] bg-none border-none cursor-pointer">Approve</button><button onClick={e => { e.stopPropagation(); H.setOutingStatus(o.id, 'Rejected'); }} className="text-[12px] font-semibold text-[#DC2626] bg-none border-none cursor-pointer">Reject</button></span> }));
  const cfg = {
    hostel: { kicker: 'HOSTEL', title: `${S.occupied} of ${S.beds} beds occupied`, progress: S.beds ? Math.round(S.occupied / S.beds * 100) : 0, sub: `${plural(S.boarders.length, 'boarder')} · ${plural(S.free, 'bed')} free${S.waiting.length ? ` · ${S.waiting.length} waiting for a room` : ''}`,
      actions: [{ label: 'Admit a student', primary: true, page: 'admit' }, { label: 'Collect fees', page: 'fees' }],
      tiles: [{ label: 'Boarders', value: S.boarders.length, note: 'Enrolled as boarding', page: 'inmates' }, { label: 'Occupancy', value: `${S.beds ? Math.round(S.occupied / S.beds * 100) : 0}%`, note: `${S.occupied} of ${S.beds} beds`, color: '#1A5FB4', bar: S.beds ? S.occupied / S.beds * 100 : 0, page: 'rooms' }, { label: 'Waiting for a room', value: S.waiting.length, note: 'Boarders unplaced', color: S.waiting.length ? '#B45309' : '#166534', page: 'admit' }, { label: 'Fees due', value: fmt(S.dueAmt), note: 'This month', color: S.dues.length ? '#DC2626' : '#166534', page: 'fees' }],
      panels: [{ title: 'Fees due this month', meta: S.dues.length ? fmt(S.dueAmt) : 'All paid ✓', action: { label: 'Collect', page: 'fees' }, rows: S.dues.map(({ s, bal }) => ({ key: s.id, icon: '₹', title: s.name, sub: `${s.cls} ${s.section}`, right: <b className="font-mono text-[13px] text-[#DC2626]">{fmt(bal)}</b>, page: 'fees' })), empty: { icon: '✓', title: 'Hostel fees are up to date' } },
        { title: 'Boarders waiting for a room', meta: String(S.waiting.length), rows: S.waiting.map(s => ({ key: s.id, icon: '🛏', title: s.name, sub: `${s.cls} ${s.section}`, right: <Badge variant="amber">No room</Badge>, page: 'admit' })), empty: { icon: '✓', title: 'Every boarder has a room' } }] },
    mess: { kicker: 'MESS', title: S.lowStock.length ? `${plural(S.lowStock.length, 'item')} low on stock` : 'Stock is healthy', sub: `${plural(h.stock.length, 'item')} tracked · ₹${Math.round(S.stockValue).toLocaleString('en-IN')} in stock · ${plural(S.openOrders.length, 'open order')}`,
      actions: [{ label: 'Mess management', primary: true, page: 'mess' }, { label: 'Weekly menu', page: 'menu' }],
      tiles: [{ label: 'Items in stock', value: h.stock.length, note: 'Tracked items', page: 'mess' }, { label: 'Low stock', value: S.lowStock.length, note: 'To reorder', color: S.lowStock.length ? '#B45309' : '#166534', page: 'mess' }, { label: 'Stock value', value: `₹${(S.stockValue / 1000).toFixed(1)}K`, note: 'At cost', color: '#6D28D9', page: 'mess' }, { label: 'Open orders', value: S.openOrders.length, note: 'Awaiting delivery', color: '#1A5FB4', page: 'mess' }],
      panels: [{ title: 'Low stock', meta: S.lowStock.length ? plural(S.lowStock.length, 'item') : 'All good ✓', action: { label: 'Reorder', page: 'mess' }, rows: S.lowStock.map(s => ({ key: s.item, icon: '📦', title: s.item, sub: `${s.qty} ${s.unit} left · alert at ${s.low}`, right: <Badge variant="amber">Low</Badge>, page: 'mess' })), empty: { icon: '✓', title: 'Nothing is running low' } }] },
    welfare: { kicker: 'WELFARE', title: S.outings.length ? `${plural(S.outings.length, 'outing request')} pending` : 'No pending outing requests', sub: `${plural(S.incidents.length, 'open incident')} in the log`,
      actions: [{ label: 'Outing requests', primary: true, page: 'outing' }, { label: 'Incident log', page: 'incidents' }],
      tiles: [{ label: 'Pending outings', value: S.outings.length, note: 'Awaiting approval', color: S.outings.length ? '#B45309' : '#166534', page: 'outing' }, { label: 'Approved', value: h.outings.filter(o => o.status === 'Approved').length, note: 'Outings this term', color: '#166534', page: 'outing' }, { label: 'Open incidents', value: S.incidents.length, note: 'Need follow-up', color: S.incidents.length ? '#DC2626' : '#166534', page: 'incidents' }, { label: 'Resolved', value: h.incidents.filter(i => i.status !== 'Open').length, note: 'Incidents closed', color: '#1A5FB4', page: 'incidents' }],
      panels: [{ title: 'Outing requests', meta: S.outings.length ? `${S.outings.length} pending` : 'None pending', action: { label: 'All requests', page: 'outing' }, rows: outingRows, empty: { icon: '🚪', title: 'No pending outing requests' } },
        { title: 'Open incidents', meta: plural(S.incidents.length, 'incident'), rows: S.incidents.map(i => ({ key: i.id, icon: '⚠️', title: `${i.stuName} · ${i.type}`, sub: (i.desc || '').slice(0, 80), right: <Badge variant="red">Open</Badge>, page: 'incidents' })), empty: { icon: '✓', title: 'No open incidents' } }] },
  };
  return { pulse, today, upcoming: [], cfg };
}

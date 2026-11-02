// Reads/writes other portals' stores so the Principal sees (and can act on) live data.
import { loadHR, saveHR } from '../hr/constants';
import { loadHostel, saveHostel } from '../hostel/constants';
import { loadCampus, saveCampus, loanStatus } from '../campus/constants';
import { loadTransport, docStatus } from '../transport/constants';
import { loadAdmissions } from '../admissions/constants';
import { TODAY } from './constants';

export function snapshot() {
  return { hr: loadHR(), hostel: loadHostel(), campus: loadCampus(), transport: loadTransport(), admissions: loadAdmissions() };
}
export function setLeaveStatus(id, status) { const d = loadHR(); const l = d.leaveRequests.find(x => x.id === id); if (l) { l.status = status; saveHR(d); } }
// l.subMode is 'arrange' (needs a substitute) or 'adjust' (class adjustment)
export function addLeaveRequest(l) { const d = loadHR(); d.leaveRequests.push({ ...l, id:'LR'+String(d.leaveRequests.length + 1).padStart(3, '0'), status:'Pending' }); saveHR(d); }
export function setOutingStatus(id, status) { const d = loadHostel(); const o = d.outings.find(x => x.id === id); if (o) { o.status = status; saveHostel(d); } }
export function signOutVisitor(id) { const d = loadCampus(); const v = d.visitors.find(x => x.id === id); if (v) { v.timeOut = new Date().toTimeString().slice(0, 5); v.status = 'Out'; saveCampus(d); } }

// Staff attendance lives in the HR store: { 'T001-2026-10': { 30: 'P' } }
const monthKey = id => `${id}-${TODAY.slice(0, 7)}`;
export const staffAttToday = (hr, id) => (hr.staffAtt[monthKey(id)] || {})[+TODAY.slice(8)] || '';
export function setStaffAttToday(id, status) { const d = loadHR(); const k = monthKey(id); (d.staffAtt[k] ||= {})[+TODAY.slice(8)] = status; saveHR(d); }

export { loanStatus, docStatus };
export const onLeaveToday = (hr, staffId) => hr.leaveRequests.some(l => l.staffId === staffId && l.status === 'Approved' && l.from <= TODAY && (l.to || l.from) >= TODAY);

export function addVisitorEntry(v) { const d = loadCampus(); d.visitors.unshift({ ...v, id: 'V' + Date.now().toString().slice(-5), timeOut: '', status: 'In' }); saveCampus(d); }

// Same checks as "today", for any date
export const staffAttOn = (hr, id, date) => (hr.staffAtt[`${id}-${date.slice(0, 7)}`] || {})[+date.slice(8)] || '';
export const onLeaveOn = (hr, staffId, date) => hr.leaveRequests.some(l => l.staffId === staffId && l.status === 'Approved' && l.from <= date && (l.to || l.from) >= date);

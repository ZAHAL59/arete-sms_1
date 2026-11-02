export const TRANSPORT_KEY = 'ARETE_TRANSPORT_v1';
export const TODAY = new Date().toISOString().slice(0, 10);
export const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

export const VEHICLE_TYPES = ['Bus (52 seats)', 'Van (15 seats)', 'Mini Bus (25 seats)'];
export const DEP_REASONS = ['Medical appointment', 'Family emergency', 'School event (early)', 'Other'];
export const MAINT_TYPES = ['Routine Service', 'Tyre Replacement', 'Breakdown Repair', 'AC Service', 'Inspection'];
export const DOC_TYPES = ['Insurance', 'Fitness Certificate', 'Permit', 'Pollution Certificate', 'Road Tax'];

export const seatsOf = type => +(/\((\d+) seats\)/.exec(type || '')?.[1] || 0);

export const SEED = {
  departures: [
    {id:'DEP001', studentId:'S004', reason:'Medical appointment', time:'13:30', date:'2026-10-14', smsSent:true},
    {id:'DEP002', studentId:'S002', reason:'Family function',     time:'14:00', date:'2026-10-12', smsSent:true},
  ],
  boarding: {},   // { '2026-10-30': { S001: 'absent' } } — anything not listed counts as boarded
  maintenance: [
    {id:'M001', vehicle:'KL 11 AB 1234', type:'Routine Service',  desc:'Oil change, brake check', date:'2026-10-05', cost:4200,  next:'2027-01-05'},
    {id:'M002', vehicle:'KL 11 GH 3456', type:'Tyre Replacement', desc:'2 rear tyres replaced',   date:'2026-09-28', cost:12800, next:'2027-09-28'},
  ],
  docs: [
    {id:'D001', vehicle:'KL 11 AB 1234', type:'Insurance',             num:'INS-2026-0001',  issued:'2026-01-01', expiry:'2027-01-01'},
    {id:'D002', vehicle:'KL 11 AB 1234', type:'Fitness Certificate',   num:'FC-KL-2026-001', issued:'2026-04-01', expiry:'2027-04-01'},
    {id:'D003', vehicle:'KL 11 CD 5678', type:'Insurance',             num:'INS-2026-0002',  issued:'2026-02-15', expiry:'2026-11-15'},
    {id:'D004', vehicle:'KL 11 CD 5678', type:'Permit',                num:'PRM-KL-5678',    issued:'2025-06-01', expiry:'2026-12-01'},
    {id:'D005', vehicle:'KL 11 EF 9012', type:'Insurance',             num:'INS-2026-0003',  issued:'2026-03-01', expiry:'2027-03-01'},
    {id:'D006', vehicle:'KL 11 EF 9012', type:'Pollution Certificate', num:'PUC-2026-1234',  issued:'2026-09-01', expiry:'2026-12-01'},
    {id:'D007', vehicle:'KL 11 GH 3456', type:'Insurance',             num:'INS-2026-0004',  issued:'2026-01-15', expiry:'2026-12-15'},
    {id:'D008', vehicle:'KL 11 GH 3456', type:'Road Tax',              num:'RT-KL-2026-3456',issued:'2026-04-01', expiry:'2027-03-31'},
  ],
  fuel: [
    {id:'F005', date:'2026-10-14', vehicle:'KL 11 AB 1234', driver:'Rajan P.',     litres:45, rate:96, amount:4320, km:24560, mileage:8.2, station:'Indian Oil, Nadapuram'},
    {id:'F004', date:'2026-10-14', vehicle:'KL 11 CD 5678', driver:'Suresh Kumar', litres:50, rate:96, amount:4800, km:18230, mileage:7.8, station:'HP Petrol, Koyilandy'},
    {id:'F003', date:'2026-10-12', vehicle:'KL 11 EF 9012', driver:'Krishnan K.',  litres:42, rate:96, amount:4032, km:31450, mileage:8.5, station:'Indian Oil, Vatakara'},
    {id:'F002', date:'2026-10-10', vehicle:'KL 11 AB 1234', driver:'Rajan P.',     litres:48, rate:95, amount:4560, km:24180, mileage:8.1, station:'Indian Oil, Nadapuram'},
    {id:'F001', date:'2026-10-08', vehicle:'KL 11 GH 3456', driver:'Sunil M.',     litres:38, rate:95, amount:3610, km:12780, mileage:9.2, station:'BPCL, Peringathur'},
  ],
};

export function loadTransport() {
  try { const r = localStorage.getItem(TRANSPORT_KEY); if (r) return { ...SEED, ...JSON.parse(r) }; } catch {}
  return JSON.parse(JSON.stringify(SEED));
}
export function saveTransport(d) { try { localStorage.setItem(TRANSPORT_KEY, JSON.stringify(d)); } catch {} }

export function docStatus(expiry) {
  const days = Math.floor((new Date(expiry) - new Date(TODAY)) / 86400000);
  if (days < 0) return { label: 'Expired', variant: 'red', days };
  if (days <= 30) return { label: `Expires in ${days}d`, variant: 'amber', days };
  return { label: 'Valid', variant: 'green', days };
}

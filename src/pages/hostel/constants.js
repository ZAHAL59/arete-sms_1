export const HOSTEL_KEY = 'ARETE_HOSTEL_v1';

export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const MONTHLY_FEE = 3500;

// One-time charges at admission. Amounts are starting values — edit them under Hostel Fees → Fee structure.
export const DEFAULT_FEE_HEADS = [
  { id: 'adm',     name: 'Hostel Admission Fee', amount: 5000,  kind: 'One-time fee' },
  { id: 'caution', name: 'Caution Deposit',      amount: 10000, kind: 'Refundable deposit' },
  { id: 'mess',    name: 'Mess Advance',         amount: 5000,  kind: 'Advance' },
];
export const HEAD_KINDS = ['One-time fee', 'Refundable deposit', 'Advance'];
export const HOSTEL_DUE_DAY = 10;                       // monthly fee is due by the 10th

export const SEED = {
  rooms: [
    {id:'H-101',capacity:4,inmates:['Devika Nair','Ananya R.','Fathima Z.','Sreya M.'],type:'Girls'},
    {id:'H-102',capacity:4,inmates:['Arjun Menon','Mohammed Ashiq','Rohit T.'],type:'Boys'},
    {id:'H-103',capacity:4,inmates:['Kiran P.','Suresh V.'],type:'Boys'},
    {id:'H-104',capacity:4,inmates:[],type:'Girls'},
    {id:'H-105',capacity:4,inmates:['Aishwarya K.','Meghna S.','Riya T.','Pavithra N.'],type:'Girls'},
    {id:'H-201',capacity:4,inmates:['Abdul R.','Jithin K.'],type:'Boys'},
    {id:'H-202',capacity:4,inmates:[],type:'Boys'},
    {id:'H-203',capacity:2,inmates:['Warden Room'],type:'Staff'},
  ],
  outings: [
    {id:'OUT001',stuId:'S003',stuName:'Devika Nair',cls:'Grade 10 A',purpose:'Family Visit',dep:'2026-10-20',ret:'2026-10-22',consent:'Written',status:'Approved'},
    {id:'OUT002',stuId:'S006',stuName:'Arjun Menon',cls:'Grade 9 A',purpose:'Medical',dep:'2026-10-18',ret:'2026-10-18',consent:'WhatsApp',status:'Approved'},
    {id:'OUT003',stuId:'S003',stuName:'Devika Nair',cls:'Grade 10 A',purpose:'Festival',dep:'2026-10-28',ret:'2026-10-31',consent:'Pending',status:'Pending Approval'},
  ],
  costLog: [
    {date:'2026-10-14',amount:4200,by:'Warden'},{date:'2026-10-13',amount:3950,by:'Cook'},
    {date:'2026-10-12',amount:4100,by:'Warden'},{date:'2026-10-11',amount:3800,by:'Cook'},
    {date:'2026-10-10',amount:4400,by:'Warden'},{date:'2026-10-09',amount:3750,by:'Cook'},
    {date:'2026-10-08',amount:4050,by:'Warden'},
  ],
  stock: [
    {item:'Rice (Ponni)',     unit:'kg',   qty:280,max:400,low:80,cost:58, cat:'Staples'},
    {item:'Cooking Oil',      unit:'L',    qty:38, max:60, low:15,cost:145,cat:'Staples'},
    {item:'Dal (Mixed)',      unit:'kg',   qty:45, max:80, low:15,cost:98, cat:'Staples'},
    {item:'Fresh Vegetables', unit:'kg',   qty:35, max:80, low:20,cost:40, cat:'Vegetables'},
    {item:'Eggs',             unit:'dozen',qty:18, max:40, low:10,cost:95, cat:'Protein'},
  ],
  menu: {
    Monday:   {B:'Idli (3), Sambar, Coconut Chutney, Banana',L:'Rice, Dal Tadka, Beans Mezhukkupuratti, Pickle, Papad',D:'Chapati (2), Paneer Butter Masala, Salad, Rice'},
    Tuesday:  {B:'Puttu, Kadala Curry, Boiled Egg, Tea',L:'Rice, Fish Curry (Kerala), Thoran, Rasam',D:'Chapati (2), Egg Curry, Dal, Rice'},
    Wednesday:{B:'Dosa (2), Sambar, Chutneys, Tea',L:'Rice, Chicken Curry, Cabbage Thoran, Buttermilk',D:'Chapati (2), Dal Makhani, Vegetable Sabzi, Salad'},
    Thursday: {B:'Idiyappam (4), Egg Curry, Tea',L:'Rice, Sambar, Avial, Papad',D:'Parotta (2), Veg Kurma, Rice, Pickle'},
    Friday:   {B:'Poori (3), Chana Masala, Tea',L:'Rice, Fish Curry, Stir Fry, Rasam',D:'Chapati (2), Mixed Veg Curry, Dal, Curd Rice'},
    Saturday: {B:'Upma, Coconut Chutney, Tea, Fruit',L:'Chicken Biryani, Raita, Salad, Papad',D:'Chapati (2), Paneer Sabzi, Dal, Rice'},
    Sunday:   {B:'Appam (3), Vegetable Stew, Fruit Juice',L:'Special Meals: Biriyani / Pulao, Raita, Payasam',D:'Chapati (2), Butter Chicken, Dal, Rice, Ice Cream'},
  },
  orders: [],
  admissions: [],   // hostel admission records (one per student)
  feeHeads: DEFAULT_FEE_HEADS,
  incidents: [
    {id:'INC001',date:'2026-10-15 21:30',stuName:'Mohammed Ashiq',cls:'Grade 7',type:'Health',desc:'Student complained of fever and stomach ache after dinner. Temperature: 38.4°C.',action:'Paracetamol given. Parents informed. Dr. Rajan consulted over phone. Student resting in sick room.',by:'Muhd Zahal (Warden)',status:'Resolved'},
    {id:'INC002',date:'2026-10-12 19:00',stuName:'Arjun Menon',cls:'Grade 9',type:'Behavioural',desc:'Argument with roommate over phone usage. Raised voice and minor push incident.',action:'Both students counselled. Room rules reminder. Parents to be informed at next meeting.',by:'Muhd Zahal (Warden)',status:'Open'},
  ],
};

export function loadHostel() {
  try { const r = localStorage.getItem(HOSTEL_KEY); if (r) return { ...SEED, ...JSON.parse(r) }; } catch {}
  return JSON.parse(JSON.stringify(SEED));
}
export function saveHostel(d) { try { localStorage.setItem(HOSTEL_KEY, JSON.stringify(d)); } catch {} }

export const fmt = n => '₹' + (n||0).toLocaleString('en-IN');
export const TODAY = new Date().toISOString().slice(0,10);
export const OUTING_PURPOSES = ['Family Visit','Medical','Festival','Emergency','Other'];
export const CONSENT_MODES = ['Verbal','Written','WhatsApp','Pending'];
export const STOCK_CATS = ['Staples','Vegetables','Dairy','Spices','Cooking Oil','Protein'];
export const STOCK_UNITS = ['kg','litres','pieces','grams','packets'];
export const INCIDENT_TYPES = ['Health','Behavioural','Safety','Property Damage','Other'];

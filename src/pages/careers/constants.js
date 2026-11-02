export const QUALIFICATIONS = ['B.Ed','M.Ed','B.Sc + B.Ed','M.Sc + B.Ed','BA + B.Ed','MA + B.Ed','B.Com + B.Ed','M.Com + B.Ed','B.Tech + B.Ed','M.Tech + B.Ed','Ph.D','Other'];
export const EXPERIENCE = [['fresher','Fresher (0 years)'],['1','1 year'],['2','2 years'],['3','3 years'],['5','5 years'],['7','7+ years'],['10','10+ years']];
export const MAX_CV_BYTES = 5 * 1024 * 1024;
export const CV_EXT = ['.pdf', '.doc', '.docx'];

export const WHY = [
  ['📚','Continuous Learning','Regular NEP-aligned training, workshops, and national educator development programmes throughout the year.'],
  ['🌱','Growth Pathway','Clear promotion tracks, annual appraisals, and leadership opportunities for high performers.'],
  ['💡','Arete Digital Platform','Access to the Arete DLSS — a cutting-edge digital learning support system with curated resources and AR/VR tools.'],
  ['🏫','Modern Facilities','Smart classrooms, science labs, a Living Learning Park, and a fully stocked library across a beautiful campus.'],
  ['🤝','Supportive Community','A collaborative staff culture, dedicated leadership, and an engaged parent community that values educators.'],
  ['💰','Competitive Package','Market-aligned salaries, timely payment, and additional benefits for boarding and transport staff.'],
];
export const PROCESS = [
  ['📋','1. Apply Online','Fill the application form and upload your CV/résumé'],
  ['🔍','2. CV Screening','HR reviews applications against vacancy criteria'],
  ['📧','3. Shortlist & Invite','Shortlisted candidates receive an interview invitation'],
  ['🎙','4. Interview','Panel interview + demo lesson for teaching positions'],
  ['✅','5. Offer Letter','Selected candidates receive a formal offer letter'],
];

// Rough first-pass score (0-100) so HR can sort the inbox. It is a guide, not a decision.
export function scoreApplication({ qual, exp, skills }, vacancy) {
  let score = 0;
  const q = qual.toLowerCase();
  if (/^(m\.|ma\b|ph\.d)/.test(q)) score += 40;          // any postgraduate / doctorate
  else if (q.includes('b.ed')) score += 28;
  else score += 10;
  const yrs = exp === 'fresher' ? 0 : parseInt(exp) || 0;
  const req = parseInt((vacancy?.exp || '').replace(/[^0-9]/g, '')) || 0;
  if (yrs >= req + 2) score += 35; else if (yrs >= req) score += 30; else if (yrs >= req - 1) score += 20; else if (yrs >= 1) score += 10;
  const len = (skills || '').trim().length;
  score += len > 30 ? 25 : len > 10 ? 15 : 5;
  return score;
}

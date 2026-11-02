import { useState, useMemo } from 'react';
import Logo from '../../components/Logo';
import { Link } from 'react-router-dom';
import { loadHR } from '../hr/constants';
import ApplyModal from './ApplyModal';
import { WHY, PROCESS } from './constants';

const PORTALS = [['/', '🏠 All Portals'], ['/principal', '🏛 Principal Dashboard'], ['/admissions', '📋 Admissions'], ['/hr', '👥 HR — Staff & Recruitment'], ['/finance', '₹ Finance'], ['/transport', '🚌 Transport'], ['/hostel', '🏠 Hostel'], ['/campus', '🏫 Campus'], ['/teacher', '🍎 Teacher']];

export default function CareersPage() {
  const hr = useMemo(loadHR, []);
  const [vac, setVac] = useState(null);
  const [menu, setMenu] = useState(false);
  const active = hr.vacancies.filter(v => v.status === 'Active');
  const apps = id => (hr.applications || []).filter(a => a.vacId === id).length;
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E4E4E4] px-6 h-14 flex items-center gap-5">
        <div className="flex items-center gap-2.5"><Logo /><span className="text-[15px] font-extrabold tracking-tight">Arete</span></div>
        <nav className="hidden md:flex gap-1 ml-4">{[['openings-section', 'Current Openings'], ['why-section', 'Why Join Us'], ['process-section', 'Selection Process']].map(([id, l]) => <button key={id} onClick={() => go(id)} className="px-3 py-1.5 text-[13px] font-medium text-[#555] hover:text-[#C8202E] rounded-[6px] hover:bg-[#FEF4F4] cursor-pointer bg-none border-none">{l}</button>)}</nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative"><button onClick={() => setMenu(m => !m)} className="px-3 py-1.5 text-[12.5px] font-semibold border border-[#E4E4E4] rounded-[6px] cursor-pointer bg-white hover:bg-[#F8F8F8]">All Portals ▾</button>
            {menu && <div className="absolute right-0 mt-1 w-60 bg-white border border-[#E4E4E4] rounded-[8px] shadow-[0_8px_30px_rgba(0,0,0,.12)] py-1" onMouseLeave={() => setMenu(false)}>{PORTALS.map(([to, l]) => <Link key={to} to={to} className="block px-3.5 py-2 text-[12.5px] text-[#333] no-underline hover:bg-[#FEF4F4] hover:text-[#C8202E]">{l}</Link>)}</div>}</div>
          <a href="mailto:hr@aretemodel.edu" className="hidden sm:inline text-[12.5px] text-[#555] no-underline hover:text-[#C8202E]">✉ hr@aretemodel.edu</a>
        </div>
      </header>

      <section className="px-6 py-16 text-white" style={{ background:'linear-gradient(135deg,#C8202E,#9A1822)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-3">Arete Model School · Kozhikode, Kerala · CBSE Affiliated · Estd. 2015</div>
          <h1 className="text-[40px] font-extrabold tracking-tight leading-tight mb-3">Build Your Career at Arete</h1>
          <p className="text-[15.5px] text-white/80 leading-relaxed max-w-xl mb-8">Join a school that believes in excellence, innovation, and the holistic development of every child — and every educator.</p>
          <div className="flex gap-8 flex-wrap">{[[active.length, 'Open Positions'], ['842', 'Students'], ['40+', 'Staff Members'], ['2015', 'Established']].map(([v, l]) => <div key={l}><div className="text-[28px] font-extrabold leading-none">{v}</div><div className="text-[11.5px] text-white/65 mt-1">{l}</div></div>)}</div>
        </div>
      </section>

      <section id="openings-section" className="px-6 py-14 bg-[#F8F8F8]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[24px] font-extrabold tracking-tight">Current Openings</h2>
          <p className="text-[13.5px] text-[#777] mt-1 mb-6">{active.length ? `${active.length} position${active.length > 1 ? 's' : ''} open · Apply directly on this page` : 'No current openings — check back soon'}</p>
          {!active.length ? <div className="text-center py-12 text-[#777]">No positions are currently open. Please check back or send your CV to hr@aretemodel.edu</div> :
            <div className="grid md:grid-cols-2 gap-4">{active.map(v => (
              <div key={v.id} onClick={() => setVac(v)} className={`bg-white rounded-[12px] p-5 cursor-pointer border transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,.1)] ${v.priority === 'Urgent' ? 'border-[#C8202E]' : 'border-[#E4E4E4]'}`}>
                <div className="flex items-center gap-2 mb-2"><span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${v.priority === 'Urgent' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#F2F2F2] text-[#777]'}`}>{v.priority}</span>{apps(v.id) > 0 && <span className="text-[11px] text-[#AAA]">{apps(v.id)} applicant{apps(v.id) > 1 ? 's' : ''} so far</span>}</div>
                <div className="text-[18px] font-extrabold">{v.subj} Teacher</div>
                <div className="text-[12.5px] text-[#777] mb-3">{v.dept} Department</div>
                <div className="text-[13px] text-[#555] leading-relaxed"><b>Qualification:</b> {v.qual}<br /><b>Experience:</b> {v.exp}{v.skills && <><br /><b>Skills:</b> {v.skills}</>}</div>
                <div className="flex gap-2 flex-wrap mt-3">{v.count > 0 && <span className="text-[11.5px] bg-[#F8F8F8] px-2.5 py-1 rounded-full text-[#555]">👥 {v.count} position{v.count > 1 ? 's' : ''}</span>}{v.deadline && <span className="text-[11.5px] bg-[#F8F8F8] px-2.5 py-1 rounded-full text-[#555]">📅 Deadline: {v.deadline}</span>}</div>
                <button className="mt-4 w-full py-2.5 bg-[#C8202E] text-white text-[13px] font-bold rounded-[8px] cursor-pointer border-none hover:bg-[#9A1822]">Apply Now →</button>
              </div>))}</div>}
        </div>
      </section>

      <section id="why-section" className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[24px] font-extrabold tracking-tight">Why Join Arete</h2>
          <p className="text-[13.5px] text-[#777] mt-1 mb-6">A school that invests in its educators as much as its students</p>
          <div className="grid md:grid-cols-3 gap-4">{WHY.map(([i, t, d]) => <div key={t} className="border border-[#E4E4E4] rounded-[12px] p-5"><div className="text-[26px] mb-2">{i}</div><div className="text-[14.5px] font-bold mb-1">{t}</div><div className="text-[12.5px] text-[#666] leading-relaxed">{d}</div></div>)}</div>
        </div>
      </section>

      <section id="process-section" className="px-6 py-14 bg-[#F8F8F8]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[24px] font-extrabold tracking-tight">Selection Process</h2>
          <p className="text-[13.5px] text-[#777] mt-1 mb-6">Transparent, fair, and typically completed within 2–3 weeks</p>
          <div className="grid md:grid-cols-5 gap-3">{PROCESS.map(([i, t, d]) => <div key={t} className="bg-white border border-[#E4E4E4] rounded-[12px] p-4 text-center"><div className="text-[24px] mb-1.5">{i}</div><div className="text-[13px] font-bold mb-1">{t}</div><div className="text-[11.5px] text-[#777] leading-relaxed">{d}</div></div>)}</div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-[12px] text-[#AAA] border-t border-[#E4E4E4]">Arete Model School · Kozhikode, Kerala · <a href="mailto:hr@aretemodel.edu" className="text-[#C8202E] no-underline">hr@aretemodel.edu</a></footer>
      {vac && <ApplyModal vac={vac} onClose={() => setVac(null)} />}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import CommandPalette from '../../components/shell/CommandPalette';
import { PORTAL_LIST } from '../../components/shell/registry';
import { ThemeToggle } from '../../components/shell/ThemeToggle';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const GROUPS = ['Administration', 'Teaching & Campus', 'Public'];

// The front door: pick a portal. Same look as the Principal's home and every portal's frame.
export default function IndexPage() {
  const navigate = useNavigate(); const [palette, setPalette] = useState(false);
  useEffect(() => {
    const h = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(o => !o); } };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);
  const items = useMemo(() => PORTAL_LIST.map(p => ({ id: p.id, group: 'Pages', icon: p.icon, label: p.name, hint: p.desc, run: () => navigate(p.to) })), []);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#111]">
      <header className="flex items-center gap-3 px-8 py-4">
        <div className="flex items-center gap-2.5 mr-3"><Logo size={34} /><span className="text-[22px] font-extrabold tracking-tight">Arete</span><span className="text-[11px] text-[#999] ml-1 mt-1">Model School · AY 2026–27</span></div>
        <button onClick={() => setPalette(true)} aria-label="Search anything" className="flex items-center gap-2.5 w-[420px] max-w-[40vw] px-4 py-2.5 rounded-full bg-white border border-[#E4E4E4] text-left cursor-pointer hover:border-[#C8202E]/50">
          <span className="text-[#999]">⌕</span><span className="flex-1 text-[13px] text-[#999]">Search anything</span><kbd className="text-[10.5px] text-[#888] bg-[#F4F4F5] rounded-md px-1.5 py-0.5 font-sans">⌘K</kbd>
        </button>
        <div className="ml-auto"><ThemeToggle /></div>
      </header>
      <main className="max-w-[1240px] mx-auto px-8 pt-6 pb-16">
        <h1 className="text-[36px] font-extrabold tracking-tight">{greeting()}, Muhd</h1>
        <p className="text-[15px] text-[#777] mt-1 mb-9">Pick an app to work in.</p>
        {GROUPS.map(g => (
          <section key={g} className="mb-9">
            <div className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#AAA] mb-3.5">{g}</div>
            <div className="grid grid-cols-4 gap-6">{PORTAL_LIST.filter(p => p.group === g).map(p => (
              <Link key={p.id} to={p.to} className="block bg-white rounded-[26px] p-7 pb-8 no-underline text-inherit shadow-[0_2px_16px_rgba(0,0,0,.045)] hover:shadow-[0_12px_34px_rgba(200,32,46,.14)] hover:-translate-y-0.5 transition-all">
                <div className="w-16 h-16 rounded-[18px] bg-[#FEF4F4] flex items-center justify-center text-[28px] mb-10">{p.icon}</div>
                <div className="text-[17px] font-bold">{p.name}</div>
                <div className="text-[13px] text-[#777] mt-1 leading-snug">{p.desc}</div>
              </Link>))}</div>
          </section>))}
      </main>
      <footer className="px-8 py-6 text-center text-[12px] text-[#AAA]">Arete Model School · Built by Shaheen Digital Academy · Mohammed Zahal · R&D Team</footer>
      <CommandPalette open={palette} onClose={() => setPalette(false)} items={items} />
    </div>
  );
}

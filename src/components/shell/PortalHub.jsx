import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import Dropdown from './Dropdown';
import CommandPalette from './CommandPalette';
import HubHome from './HubHome';
import usePageMeta from '../../hooks/usePageMeta';
import { PORTAL_LIST, findPortal } from './registry';
import { AttentionRow } from './widgets';
import { ThemeToggle, AppearancePicker } from './ThemeToggle';

const GridIcon = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4" /><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.4" /><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.4" /><rect x="9" y="9" width="5.5" height="5.5" rx="1.4" /></svg>;
const BellIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 11.5h9l-1.2-1.7V6.7a3.3 3.3 0 0 0-6.6 0v3.1L3.5 11.5Z" /><path d="M6.6 13.4a1.5 1.5 0 0 0 2.8 0" /></svg>;
const MenuIcon = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12" /></svg>;
const iconBtn = 'relative w-9 h-9 flex-shrink-0 rounded-full border border-[#E4E4E4] bg-white flex items-center justify-center text-[#555] cursor-pointer hover:border-[#71717A] hover:text-[#111]';
const USER = { name: 'Muhd Zahal', first: 'Muhd', initials: 'MZ' };

function useMediaQuery(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const h = () => setM(mq.matches); mq.addEventListener('change', h); h(); return () => mq.removeEventListener('change', h); }, [q]);
  return m;
}

// The frame every portal shares:  Home (pulse + areas + today + attention)  →  an area (sidebar, Overview, pages).
// ≥1024px the sidebar sits beside the page; below that it is a slide-in sheet opened from the ☰ button.
export default function PortalHub({ portalId, apps, nav, overviews, badges = {}, pulse = [], attention = [], today = [], upcoming = [], entities = [], accountExtras = [], prompt, children }) {
  const navigate = useNavigate(); const portal = findPortal(portalId); const { app, page, go, goApp, goHome } = nav;
  const desktop = useMediaQuery('(min-width: 1024px)');
  const [palette, setPalette] = useState(false); const [drawer, setDrawer] = useState(false); const n = attention.length;
  const menuBtn = useRef(null), asideRef = useRef(null), mainRef = useRef(null);
  const pageName = app ? (page ? app.pages.find(p => p[0] === page)?.[1] : 'Overview') : 'Home';
  usePageMeta(app ? `${pageName} · ${app.name} · ${portal.name}` : portal.name);

  // global ⌘K / Ctrl+K
  useEffect(() => {
    const h = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(o => !o); } };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);

  // phone/tablet sidebar sheet: closes on navigation, on Esc, when the screen grows; keeps focus inside while open
  const closeDrawer = useCallback(() => { setDrawer(false); menuBtn.current?.focus(); }, []);
  useEffect(() => { if (desktop) setDrawer(false); }, [desktop]);
  useEffect(() => { setDrawer(false); }, [app?.id, page]);
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const items = () => [...(asideRef.current?.querySelectorAll('button:not([disabled]), a[href]') || [])];
    (asideRef.current?.querySelector('[aria-label="Close navigation menu"]') || items()[0])?.focus();
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); }
      if (e.key === 'Tab') { const f = items(); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', key); };
  }, [drawer, closeDrawer]);
  // after moving to another page, don't leave focus on an element that no longer exists
  useEffect(() => { if (!document.activeElement || document.activeElement === document.body) mainRef.current?.focus({ preventScroll: true }); }, [app?.id, page]);

  const items = useMemo(() => [
    { id: 'home', group: 'Pages', icon: '⌂', label: `${portal.name} home`, hint: 'All areas', run: goHome },
    ...apps.flatMap(a => [{ id: 'a.' + a.id, group: 'Pages', icon: a.icon, label: `${a.name} overview`, hint: a.name, run: () => goApp(a.id) }, ...a.pages.map(([id, label, icon]) => ({ id: 'p.' + id, group: 'Pages', icon, label, hint: a.name, run: () => go(id) }))]),
    ...PORTAL_LIST.filter(p => p.id !== portalId).map(p => ({ id: 'portal.' + p.id, group: 'Portals', icon: p.icon, label: p.name, hint: p.desc, run: () => navigate(p.to) })),
    ...entities,
  ], [apps, entities, portalId, app?.id]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── top bar ── */
  const bar = (
    <header className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      {app && !desktop && <button ref={menuBtn} onClick={() => setDrawer(true)} aria-label="Open navigation menu" aria-expanded={drawer} aria-controls="app-sidebar" className={iconBtn}><MenuIcon /></button>}
      {!app && <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mr-1 sm:mr-3 cursor-pointer bg-transparent border-none p-0"><Logo size={34} /><span className="sr-only sm:not-sr-only text-[22px] font-extrabold tracking-tight text-[#111]">Arete</span></button>}
      <button onClick={() => setPalette(true)} aria-keyshortcuts="Control+K Meta+K" className="flex items-center gap-2.5 flex-1 min-w-0 sm:flex-none sm:w-[420px] sm:max-w-[40vw] px-4 py-2.5 rounded-full bg-white border border-[#E4E4E4] text-left cursor-pointer hover:border-[#71717A]">
        <span className="text-[#666666]" aria-hidden="true">⌕</span><span className="flex-1 text-[13px] text-[#666666] truncate">Search anything</span><kbd className="hidden sm:inline text-[10.5px] text-[#555] bg-[#F4F4F5] rounded-md px-1.5 py-0.5 font-sans" aria-hidden="true">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
        <ThemeToggle />
        <Dropdown width={400} trigger={(o, toggle) => (
          <button onClick={toggle} aria-label={`Notifications${n ? `, ${n} need attention` : ''}`} aria-haspopup="true" aria-expanded={o} className={iconBtn}><BellIcon />{n > 0 && <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-accent text-white text-[9.5px] font-bold flex items-center justify-center">{n}</span>}</button>)}>
          {close => (
            <div>
              <div className="px-4 py-3 border-b border-[#E4E4E4] flex items-center"><span className="text-[13.5px] font-bold">Needs your attention</span><span className="ml-auto text-[11.5px] text-[#666666]">{n ? `${n} item${n > 1 ? 's' : ''}` : 'All clear'}</span></div>
              <div className="max-h-[360px] overflow-y-auto">{n ? attention.slice(0, 7).map(i => <AttentionRow key={i.id} compact item={{ ...i, actions: i.actions.map(a => ({ ...a, run: () => { a.run(); close(); } })) }} />) : <div className="px-4 py-8 text-center text-[13px] text-[#666666]">✓ Nothing needs your attention</div>}</div>
              {n > 7 && <button onClick={() => { goHome(); close(); }} className="w-full px-4 py-2.5 text-[12px] font-semibold text-[#111] border-t border-[#E4E4E4] cursor-pointer bg-white">See all {n} on the home page</button>}
            </div>)}
        </Dropdown>
        <Dropdown width={310} trigger={(o, toggle) => <button onClick={toggle} aria-label="Switch portal or area" aria-haspopup="true" aria-expanded={o} className={`${iconBtn} hidden sm:flex`}><GridIcon /></button>}>
          {close => (
            <div className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#666666] px-1 pb-1.5">{portal.name}</div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">{apps.map(a => <button key={a.id} onClick={() => { goApp(a.id); close(); }} className={`flex items-center gap-2 px-2.5 py-2 rounded-[10px] text-left cursor-pointer border ${app?.id === a.id ? 'border-[#71717A]/40 bg-[#F6F6F7]' : 'border-transparent bg-[#FAFAFA] hover:border-[#71717A]/40 hover:bg-[#F6F6F7]'}`}><span className="text-[16px]" aria-hidden="true">{a.icon}</span><span className="text-[12.5px] font-semibold text-[#111] truncate">{a.name}</span></button>)}</div>
              <div className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#666666] px-1 pb-1.5">Other portals</div>
              <div className="grid grid-cols-2 gap-1">{PORTAL_LIST.filter(p => p.id !== portalId).map(p => <button key={p.id} onClick={() => { navigate(p.to); close(); }} className="flex items-center gap-2 px-2 py-1.5 rounded-[8px] text-left cursor-pointer bg-white border-none hover:bg-[#F6F6F7]"><span className="text-[13px]" aria-hidden="true">{p.icon}</span><span className="text-[12px] text-[#444] truncate">{p.name}</span></button>)}</div>
              <button onClick={() => { goHome(); close(); }} className="w-full mt-3 pt-2.5 border-t border-[#EEE] text-[12px] font-semibold text-[#111] cursor-pointer bg-white">Back to {portal.name} home</button>
            </div>)}
        </Dropdown>
        <Dropdown width={250} trigger={(o, toggle) => (
          <button onClick={toggle} aria-haspopup="true" aria-expanded={o} className="flex items-center gap-2.5 pl-1.5 sm:pr-3.5 pr-1.5 py-1.5 rounded-full border border-[#E4E4E4] bg-white cursor-pointer hover:border-[#71717A]">
            <span aria-hidden="true" className="w-7 h-7 rounded-full bg-[#18181B] text-white text-[10.5px] font-bold flex items-center justify-center">{USER.initials}</span><span className="sr-only sm:not-sr-only text-[12.5px] font-semibold text-[#111]">{USER.name}</span><span className="hidden sm:inline text-[10px] text-[#666666]" aria-hidden="true">▾</span></button>)}>
          {close => (
            <div>
              <div className="px-4 py-3 border-b border-[#EEE]"><div className="text-[13px] font-bold text-[#111]">{USER.name}</div><div className="text-[11.5px] text-[#666666]">{portal.role}</div></div>
              <AppearancePicker />
              {[...accountExtras, ['🧩', 'All portals', () => navigate('/')], ['⎋', 'Sign out', () => navigate('/')]].map(([i, l, run]) => <button key={l} onClick={() => { close(); run(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[12.5px] text-[#333] cursor-pointer bg-white border-none hover:bg-[#F6F6F7]"><span className="w-5 text-center" aria-hidden="true">{i}</span>{l}</button>)}
            </div>)}
        </Dropdown>
      </div>
    </header>
  );
  const search = <CommandPalette open={palette} onClose={() => setPalette(false)} items={items} />;
  const announcer = <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{`${portal.name}: ${app ? `${app.name}, ${pageName}` : 'home'}`}</div>;

  /* ── home ── */
  if (!app) return (
    <div className="h-screen flex flex-col bg-[#F4F4F5]">{bar}{announcer}
      <main id="main" tabIndex={-1} ref={mainRef} className="flex-1 overflow-y-auto"><HubHome portal={portal} firstName={USER.first} prompt={prompt || 'Pick an area to work in.'} pulse={pulse} apps={apps} badges={badges} onOpen={goApp} onPage={go} today={today} upcoming={upcoming} attention={attention} /></main>
      {search}</div>
  );

  /* ── inside an area ── */
  const NavBtn = ({ id, label, icon, badge }) => (
    <button onClick={() => (id ? go(id) : goApp(app.id))} aria-current={(id || null) === page ? 'page' : undefined}
      className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[13.5px] text-left cursor-pointer border-none transition-colors ${(id || null) === page ? 'bg-[#F4F4F5] text-[#111] font-bold' : 'bg-transparent text-[#444] font-medium hover:bg-[#FAFAFA]'}`}>
      {(id || null) === page && <span aria-hidden="true" className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-accent" />}
      <span className="w-5 text-center text-[15px]" aria-hidden="true">{icon}</span><span className="flex-1">{label}</span>{badge > 0 && <span className="text-[10px] font-bold bg-accent text-white px-1.5 py-0.5 rounded-full" aria-label={`${badge} need attention`}>{badge}</span>}
    </button>
  );
  const hidden = !desktop && !drawer;
  return (
    <div className="h-screen flex bg-[#F4F4F5]">
      {drawer && !desktop && <div className="fixed inset-0 z-40 bg-black/45" onClick={closeDrawer} aria-hidden="true" />}
      <aside id="app-sidebar" ref={asideRef} aria-label={`${app.name} navigation`} inert={hidden ? '' : undefined}
        className={`${desktop ? 'w-[264px] flex-shrink-0 m-3 mr-0 rounded-[20px] border border-[#E4E4E4]' : `fixed inset-y-0 left-0 z-50 w-[min(300px,86vw)] shadow-[0_20px_60px_rgba(0,0,0,.3)] transition-transform duration-200 ${drawer ? 'translate-x-0' : '-translate-x-full'}`} bg-white flex flex-col`}>
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2"><button onClick={goHome} aria-label={`${portal.name} home`} className="cursor-pointer bg-transparent border-none p-0"><Logo size={28} /></button><span className="text-[#666666] text-[15px]" aria-hidden="true">/</span><span className="text-[17px]" aria-hidden="true">{app.icon}</span><span className="text-[16px] font-bold text-[#111] truncate">{app.name}</span>
            {!desktop && <button onClick={closeDrawer} aria-label="Close navigation menu" className="ml-auto w-8 h-8 rounded-full border border-[#E4E4E4] bg-white text-[#555] cursor-pointer flex items-center justify-center">✕</button>}</div>
          <div className="text-[11px] text-[#666666] mt-1.5 ml-[38px]">{portal.name}</div>
        </div>
        <nav aria-label={`${app.name} pages`} className="flex-1 overflow-y-auto px-3 py-1.5 space-y-0.5">
          <NavBtn id={null} label="Overview" icon="⊞" />
          {app.pages.map(([id, label, icon]) => <NavBtn key={id} id={id} label={label} icon={icon} badge={badges[id]} />)}
          {app.links && <><div className="px-3.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[1.4px] text-[#666666]">Open a portal</div>{app.links.map(([to, name, icon]) => <button key={to} onClick={() => navigate(to)} className="w-full flex items-center gap-3 px-3.5 py-2 rounded-[12px] text-[13px] text-left cursor-pointer border-none bg-transparent text-[#444] hover:bg-[#FAFAFA]"><span className="w-5 text-center" aria-hidden="true">{icon}</span><span className="flex-1">{name}</span><span className="text-[#666666] text-[11px]" aria-hidden="true">↗</span></button>)}</>}
        </nav>
        <div className="p-3">
          <Dropdown width={330} align="left" placement="up" className="w-full" trigger={(o, toggle) => (
            <button onClick={toggle} aria-label="All apps" aria-haspopup="true" aria-expanded={o} className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] border bg-white text-[13px] font-semibold cursor-pointer ${o ? 'border-[#71717A] text-[#111]' : 'border-[#E4E4E4] text-[#333] hover:border-[#71717A]'}`}><GridIcon s={15} />All apps</button>)}>
            {close => (
              <div className="p-2">{apps.map(a => (
                <button key={a.id} onClick={() => { goApp(a.id); close(); }} aria-current={a.id === app.id ? 'true' : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left cursor-pointer border-none ${a.id === app.id ? 'bg-[#F6F6F7]' : 'bg-white hover:bg-[#FAFAFA]'}`}>
                  <span className="w-10 h-10 rounded-[11px] bg-[#F6F6F7] flex items-center justify-center text-[18px] flex-shrink-0" aria-hidden="true">{a.icon}</span>
                  <span className="flex-1 min-w-0"><span className="block text-[13.5px] font-bold text-[#111]">{a.name}</span><span className="block text-[11.5px] text-[#666666] leading-snug">{a.desc}</span></span>
                  {a.id === app.id && <span className="text-[#111] text-[13px]" aria-label="current">✓</span>}
                </button>))}
                <button onClick={() => { goHome(); close(); }} className="w-full mt-1 pt-2.5 pb-1.5 border-t border-[#EFEFEF] text-[12px] font-semibold text-[#555] cursor-pointer bg-white hover:text-[#111]">⌂ Back to home</button>
              </div>)}
          </Dropdown>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">{bar}{announcer}<main id="main" tabIndex={0} aria-label={pageName} ref={mainRef} className="flex-1 overflow-y-auto overflow-x-auto">{page ? children : overviews[app.id]()}</main></div>
      {search}
    </div>
  );
}

import { useState } from 'react';
import { CPanel, Row, DateChip, Empty, AttentionRow } from './widgets';
import Badge from '../ui/Badge';
import { loadPrincipal } from '../../pages/principal/constants';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

// A portal's front page: the Arete banner (school · portal · year, greeting and the key numbers), the areas as cards,
// then Today and Needs-your-attention underneath.
export default function HubHome({ portal, firstName, prompt, pulse, apps, badges = {}, onOpen, today, upcoming = [], attention }) {
  const [all, setAll] = useState(false);
  const items = all ? attention : attention.slice(0, 5);
  const st = loadPrincipal().settings || {};
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="max-w-[1240px] mx-auto px-8 pt-6 pb-14">
      {/* Arete banner */}
      <div className="arete-hero rounded-[26px] p-8 mb-8 text-white shadow-[0_10px_34px_rgba(154,24,34,.22)]" style={{ background: 'linear-gradient(135deg,#C8202E 0%,#9A1822 100%)' }}>
        <div className="text-[11px] font-bold uppercase tracking-[1.8px] text-white/70">{st.school || 'Arete Model School'} · {portal.name} · AY {st.year || '2026–27'}</div>
        <h1 className="text-[36px] font-extrabold tracking-tight leading-tight mt-1.5">{greeting()}, {firstName}</h1>
        <div className="text-[14px] text-white/75 mt-1">{prompt} · {dateStr}</div>
        <div className="grid gap-3 mt-6" style={{ gridTemplateColumns: `repeat(${pulse.length}, minmax(0, 1fr))` }}>{pulse.map(t => (
          <button key={t.label} onClick={t.run} className="arete-stat text-left bg-white/15 border border-white/10 rounded-[14px] px-4 py-3.5 text-white cursor-pointer hover:bg-white/25 transition-colors">
            <div className="text-[28px] font-extrabold leading-none">{t.value}</div>
            <div className="text-[12px] text-white/85 mt-1.5 font-semibold">{t.label}</div>
            <div className="text-[11px] text-white/60">{t.note}</div>
          </button>))}
        </div>
      </div>

      {/* areas */}
      <div className="grid grid-cols-4 gap-6 mb-9">{apps.map(a => {
        const n = a.pages.reduce((s, p) => s + (badges[p[0]] || 0), 0);
        return (
          <div key={a.id} onClick={() => onOpen(a.id)} role="link" aria-label={`Open ${a.name}`} className="relative bg-white rounded-[26px] p-7 pb-8 cursor-pointer shadow-[0_2px_16px_rgba(0,0,0,.045)] hover:shadow-[0_12px_34px_rgba(200,32,46,.14)] hover:-translate-y-0.5 transition-all">
            {n > 0 && <span className="absolute top-5 right-5 text-[10.5px] font-bold bg-[#C8202E] text-white px-2 py-0.5 rounded-full">{n}</span>}
            <div className="w-16 h-16 rounded-[18px] bg-[#FEF4F4] flex items-center justify-center text-[28px] mb-10">{a.icon}</div>
            <div className="text-[17px] font-bold text-[#111]">{a.name}</div>
            <div className="text-[13px] text-[#777] mt-1 leading-snug">{a.desc}</div>
          </div>);
      })}</div>

      <div className="grid grid-cols-[1.15fr_1fr] gap-6 items-start">
        <CPanel title="Today" meta={today.length ? `${today.length} scheduled` : 'Nothing scheduled'}>
          {today.length ? today.map(i => <Row key={i.id} icon="🕘" title={i.title} sub={i.time || 'All day'} right={i.tag ? <Badge variant="grey">{i.tag}</Badge> : null} />) : (
            <><Empty icon="📅" title="Nothing scheduled today" sub={upcoming.length ? 'Coming up next:' : 'Events and interviews will show here'} />{upcoming.slice(0, 3).map(e => <Row key={e.id} icon={e.date ? <DateChip iso={e.date} /> : '📅'} title={e.title} sub={e.sub} right={e.tag ? <Badge variant="grey">{e.tag}</Badge> : null} />)}</>)}
        </CPanel>
        <CPanel title="Needs your attention" meta={attention.length ? <b className="text-[#C8202E]">{attention.length} item{attention.length > 1 ? 's' : ''}</b> : 'All clear ✓'}>
          {attention.length ? <>{items.map(i => <AttentionRow key={i.id} item={i} />)}{attention.length > 5 && <button onClick={() => setAll(a => !a)} className="mt-2 text-[12px] font-semibold text-[#C8202E] cursor-pointer bg-none border-none">{all ? 'Show fewer' : `Show all ${attention.length}`}</button>}</> : <Empty title="Nothing needs your attention" sub="Requests and reminders will appear here" />}
        </CPanel>
      </div>
    </div>
  );
}

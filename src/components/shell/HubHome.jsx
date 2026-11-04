import { useState } from 'react';
import { CPanel, Row, DateChip, Empty, AttentionRow } from './widgets';
import Badge from '../ui/Badge';
import { loadPrincipal } from '../../pages/principal/constants';
import HeroMark from './HeroMark';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

// A portal's front page: the Arete banner (school · portal · year, greeting and the key numbers), the areas as cards,
// then Today and Needs-your-attention underneath.
export default function HubHome({ portal, firstName, prompt, pulse, apps, badges = {}, onOpen, today, upcoming = [], attention }) {
  const [all, setAll] = useState(false);
  const items = all ? attention : attention.slice(0, 5);
  const st = loadPrincipal().settings || {};
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-14">
      {/* Arete banner */}
      <div className="arete-hero rounded-[22px] sm:rounded-[26px] p-5 sm:p-7 mb-6 sm:mb-8 shadow-[0_10px_30px_rgba(0,0,0,.16)]">
        <HeroMark size={92} className="hidden sm:block absolute right-6 top-5 pointer-events-none" />
        <div className="text-[11px] font-bold uppercase tracking-[1.8px] opacity-70 sm:pr-28">{st.school || 'Arete Model School'} · {portal.name} · AY {st.year || '2026–27'}</div>
        <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight leading-tight mt-1.5">{greeting()}, {firstName}</h1>
        <div className="text-[14px] opacity-75 mt-1 sm:pr-28">{prompt} · {dateStr}</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5">{pulse.map(t => (
          <button key={t.label} onClick={t.run} className="arete-stat text-left rounded-[14px] px-3.5 sm:px-4 py-3 cursor-pointer transition-colors">
            <div className="text-[24px] sm:text-[26px] font-extrabold leading-none">{t.value}</div>
            <div className="text-[12px] mt-1.5 font-semibold">{t.label}</div>
            <div className="text-[11px] opacity-75">{t.note}</div>
          </button>))}
        </div>
      </div>

      {/* areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-9">{apps.map(a => {
        const n = a.pages.reduce((s, p) => s + (badges[p[0]] || 0), 0);
        return (
          <button key={a.id} type="button" data-area={a.name} onClick={() => onOpen(a.id)} className="relative block w-full text-left bg-white rounded-[22px] sm:rounded-[26px] p-5 sm:p-7 pb-6 sm:pb-8 cursor-pointer border-none shadow-[0_2px_16px_rgba(0,0,0,.045)] hover:shadow-[0_12px_34px_rgba(0,0,0,.10)] hover:-translate-y-0.5 transition-all">
            {n > 0 && <span aria-hidden="true" className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[10.5px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">{n}</span>}
            <span className="flex w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] sm:rounded-[18px] bg-[#F6F6F7] items-center justify-center text-[26px] sm:text-[28px] mb-6 sm:mb-10" aria-hidden="true">{a.icon}</span>
            <span className="block text-[17px] font-bold text-[#111]">{a.name}{n > 0 && <span className="sr-only"> — {n} need attention</span>}</span>
            <span className="block text-[13px] text-[#666666] mt-1 leading-snug">{a.desc}</span>
          </button>);
      })}</div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 sm:gap-6 items-start">
        <CPanel title="Today" meta={today.length ? `${today.length} scheduled` : 'Nothing scheduled'}>
          {today.length ? today.map(i => <Row key={i.id} icon="🕘" title={i.title} sub={i.time || 'All day'} right={i.tag ? <Badge variant="grey">{i.tag}</Badge> : null} />) : (
            <><Empty icon="📅" title="Nothing scheduled today" sub={upcoming.length ? 'Coming up next:' : 'Events and interviews will show here'} />{upcoming.slice(0, 3).map(e => <Row key={e.id} icon={e.date ? <DateChip iso={e.date} /> : '📅'} title={e.title} sub={e.sub} right={e.tag ? <Badge variant="grey">{e.tag}</Badge> : null} />)}</>)}
        </CPanel>
        <CPanel title="Needs your attention" meta={attention.length ? <b className="text-accent">{attention.length} item{attention.length > 1 ? 's' : ''}</b> : 'All clear ✓'}>
          {attention.length ? <>{items.map(i => <AttentionRow key={i.id} item={i} />)}{attention.length > 5 && <button onClick={() => setAll(a => !a)} className="mt-2 text-[12px] font-semibold text-[#111] cursor-pointer bg-none border-none">{all ? 'Show fewer' : `Show all ${attention.length}`}</button>}</> : <Empty title="Nothing needs your attention" sub="Requests and reminders will appear here" />}
        </CPanel>
      </div>
    </div>
  );
}

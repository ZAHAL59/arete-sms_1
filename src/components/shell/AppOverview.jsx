import { Tile, Hero, QuickActions, CPanel, Row, Empty } from './widgets';
import Page, { TwoCol, TwoColTop, TileGrid, todayLabel } from './Page';

// An area's Overview page, described as data:
//   { kicker, title, sub, progress, actions:[{label, primary, page}], tiles:[{label,value,note,color,page}],
//     panels:[{ title, meta, action:{label,page}, empty:{icon,title,sub}, rows:[{key,icon,title,sub,right,page}] }] }
// Quick actions are built from the area's own pages.
export default function AppOverview({ cfg, app, go }) {
  const quick = app.pages.map(([id, label, icon]) => [icon, label, () => go(id)]);
  return (
    <Page title="Overview">
      <TwoCol>
        <Hero kicker={cfg.kicker || `${app.name.toUpperCase()} · ${todayLabel()}`} title={cfg.title} sub={cfg.sub} progress={cfg.progress}
          actions={(cfg.actions || []).map(a => ({ label: a.label, primary: a.primary, run: a.run || (() => go(a.page)) }))} />
        <TileGrid>{cfg.tiles.map(t => <Tile key={t.label} label={t.label} value={t.value} note={t.note} color={t.color} bar={t.bar} onClick={t.page ? () => go(t.page) : undefined} />)}</TileGrid>
      </TwoCol>
      <TwoColTop className="mt-6">
        <div className="space-y-6">{(cfg.panels || []).map(p => (
          <CPanel key={p.title} title={p.title} meta={p.meta} action={p.action && <button onClick={() => go(p.action.page)} className="text-[12px] font-semibold text-[#C8202E] cursor-pointer bg-none border-none">{p.action.label}</button>}>
            {p.rows.length ? p.rows.map(r => <Row key={r.key} icon={r.icon} title={r.title} sub={r.sub} right={r.right} onClick={r.page ? () => go(r.page) : undefined} />) : <Empty icon={p.empty?.icon || '✓'} title={p.empty?.title || 'Nothing here'} sub={p.empty?.sub} />}
          </CPanel>))}
        </div>
        <QuickActions items={quick.slice(0, 8)} />
      </TwoColTop>
    </Page>
  );
}

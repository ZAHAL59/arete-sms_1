import { useState } from 'react';
import useHostel from './useHostel';
import Rooms from './Rooms';
import Admission from './Admission';
import useStore from '../../store/useStore';
import Inmates from './Inmates';
import Fees from './Fees';
import Mess from './Mess';
import Menu from './Menu';
import Outing from './Outing';
import Incidents from './Incidents';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import AppOverview from '../../components/shell/AppOverview';
import { APPS, useHostelSummary, hostelHub } from './Overview';


export default function HostelPortal() {
  const nav = useHubNav(APPS); const view = nav.page; const setView = nav.go;
  const H = useHostel();
  const students = useStore(st => st.db.students);
  const { h } = H;
  const pending = h.outings.filter(o => o.status === 'Pending Approval').length;
  const openInc = h.incidents.filter(i => i.status === 'Open').length;
  const placed = new Set(h.rooms.flatMap(r => r.inmates));
  const waiting = students.filter(x => x.boarding && !placed.has(x.name)).length;   // boarders still without a room
  const badge = { outing: pending, incidents: openInc, admit: waiting };
  const S = useHostelSummary(h, H, setView);
  const entities = S.boarders.map(s => ({ id: 'bo' + s.id, group: 'Boarders', icon: '🏠', label: s.name, hint: `${s.cls} ${s.section}`, run: () => setView('inmates') }));

  const hub = hostelHub(S, H, setView, h);
  const overviews = Object.fromEntries(APPS.map(a => [a.id, () => <AppOverview cfg={hub.cfg[a.id]} app={a} go={setView} />]));

  return (
    <PortalHub portalId="hostel" apps={APPS} nav={nav} overviews={overviews} badges={badge} pulse={hub.pulse} today={hub.today} upcoming={hub.upcoming} attention={S.attention} entities={entities}>
        {view === 'admit'     && <Admission h={h} admitStudent={H.admitStudent} go={setView} />}
        {view === 'rooms'     && <Rooms h={h} removeInmate={H.removeInmate} go={setView} />}
        {view === 'inmates'   && <Inmates h={h} />}
        {view === 'fees'      && <Fees h={h} setFeeHeads={H.setFeeHeads} />}
        {view === 'mess'      && <Mess h={h} saveStock={H.saveStock} addStock={H.addStock} addOrder={H.addOrder} receiveOrder={H.receiveOrder} />}
        {view === 'menu'      && <Menu h={h} saveMenu={H.saveMenu} />}
        {view === 'outing'    && <Outing h={h} addOuting={H.addOuting} setOutingStatus={H.setOutingStatus} />}
        {view === 'incidents' && <Incidents h={h} addIncident={H.addIncident} resolveIncident={H.resolveIncident} />}
    </PortalHub>
  );
}

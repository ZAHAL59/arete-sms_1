import { useState } from 'react';
import useTransport from './useTransport';
import { docStatus } from './constants';
import Departures from './Departures';
import Routes from './Routes';
import Stops from './Stops';
import Manifest from './Manifest';
import Maintenance from './Maintenance';
import Docs from './Docs';
import Fuel from './Fuel';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import AppOverview from '../../components/shell/AppOverview';
import { APPS, useTransportSummary, transportHub } from './Overview';


export default function TransportPortal() {
  const nav = useHubNav(APPS); const view = nav.page; const setView = nav.go;
  const T = useTransport();
  const { t } = T;
  const todayDeps = t.departures.filter(d => d.date === new Date().toISOString().slice(0, 10)).length;
  const docIssues = t.docs.filter(d => docStatus(d.expiry).days <= 30).length;
  const badge = { departure: todayDeps, docs: docIssues };
  const S = useTransportSummary(t, setView);
  const entities = S.onBus.map(s => ({ id: 'bs' + s.id, group: 'Students on bus', icon: '🚌', label: s.name, hint: `${s.cls} ${s.section}`, run: () => setView('manifest') }));

  const hub = transportHub(S, setView, t);
  const overviews = Object.fromEntries(APPS.map(a => [a.id, () => <AppOverview cfg={hub.cfg[a.id]} app={a} go={setView} />]));

  return (
    <PortalHub portalId="transport" apps={APPS} nav={nav} overviews={overviews} badges={badge} pulse={hub.pulse} today={hub.today} upcoming={hub.upcoming} attention={S.attention} entities={entities}>
        {view === 'departure'   && <Departures t={t} addDeparture={T.addDeparture} />}
        {view === 'stops'       && <Stops t={t} setBoarding={T.setBoarding} />}
        {view === 'manifest'    && <Manifest />}
        {view === 'routes'      && <Routes addRoute={T.addRoute} updateRoute={T.updateRoute} />}
        {view === 'maintenance' && <Maintenance t={t} addMaint={T.addMaint} />}
        {view === 'docs'        && <Docs t={t} addDoc={T.addDoc} />}
        {view === 'fuel'        && <Fuel t={t} addFuel={T.addFuel} />}
    </PortalHub>
  );
}

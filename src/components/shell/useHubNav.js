import { useSearchParams } from 'react-router-dom';

// Where you are lives in the address: /hr  → home · /hr?app=recruitment → that area's Overview · /hr?app=recruitment&page=interviews → a page.
// Screens only ever say go('interviews') — the area is worked out from the page id.
export default function useHubNav(apps) {
  const [sp, setSp] = useSearchParams();
  const app = apps.find(a => a.id === sp.get('app')) || null;
  const pageParam = sp.get('page');
  const page = app && app.pages.some(p => p[0] === pageParam) ? pageParam : null;            // null = the area's Overview
  const goApp = (appId, pg) => setSp(pg ? { app: appId, page: pg } : { app: appId });
  const go = pageId => { const a = apps.find(x => x.pages.some(p => p[0] === pageId)); if (a) goApp(a.id, pageId); };
  const goHome = () => setSp({});
  return { app, page, go, goApp, goHome };
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { PORTAL_LIST } from '../components/shell/registry';

const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };

// 404 — with a "did you mean…" for mistyped addresses, patterned on the 21st.dev 404 blocks.
export default function NotFound() {
  usePageMeta('Page not found'); const { pathname } = useLocation(); const navigate = useNavigate();
  const seg = pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
  const scored = PORTAL_LIST.map(p => ({ p, d: Math.min(lev(seg, p.id), lev(seg, p.to.slice(1))) })).sort((a, b) => a.d - b.d);
  const guess = seg && scored[0].d <= Math.max(2, Math.floor(seg.length / 3)) ? scored[0].p : null;
  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-6">
      <main id="main" tabIndex={-1} className="w-full max-w-[560px] bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,.05)] border border-[#E4E4E4]">
        <div className="text-[72px] sm:text-[88px] leading-none font-extrabold tracking-tighter text-[#111]" aria-hidden="true">404</div>
        <h1 className="text-[24px] font-extrabold tracking-tight text-[#111] mt-3">We can’t find that page</h1>
        <p className="text-[14px] text-[#555] mt-2 leading-relaxed">There’s nothing at <code className="px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[13px] line-through decoration-[#71717A]">{pathname}</code>. It may have been moved, or the address was mistyped.</p>
        {guess && <div className="mt-5 rounded-[14px] bg-[#F6F6F7] p-4 flex items-center gap-3"><span className="text-[22px]" aria-hidden="true">{guess.icon}</span><div className="flex-1 min-w-0"><div className="text-[12px] text-[#555]">Did you mean</div><Link to={guess.to} className="text-[14.5px] font-bold text-[#111] underline">{guess.name}</Link></div></div>}
        <div className="flex flex-wrap gap-2 mt-6">
          <Link to="/" className="px-4 py-2.5 rounded-[10px] bg-[#18181B] text-white text-[13px] font-semibold no-underline">Go to home</Link>
          <button onClick={() => navigate(-1)} className="px-4 py-2.5 rounded-[10px] bg-white border border-[#E4E4E4] text-[#111] text-[13px] font-semibold cursor-pointer">Go back</button>
        </div>
        <nav aria-label="Portals" className="mt-7 pt-5 border-t border-[#EEE]"><div className="text-[11px] font-bold uppercase tracking-[1.6px] text-[#666666] mb-2.5">Or open a portal</div>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">{PORTAL_LIST.map(p => <li key={p.id}><Link to={p.to} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F6F7] text-[12.5px] font-semibold text-[#333] no-underline hover:bg-[#EDEDF0]"><span aria-hidden="true">{p.icon}</span>{p.name}</Link></li>)}</ul></nav>
      </main>
    </div>
  );
}

import { useState } from 'react';
import Logo from './Logo';

export default function PortalShell({ title, user, views, defaultView, children }) {
  const [view, setView] = useState(defaultView || views[0]?.id);
  const sections = [...new Set(views.map(v => v.section))];

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#E4E4E4] flex flex-col overflow-y-auto">
        <div className="px-4 py-3.5 border-b border-[#E4E4E4] flex items-center gap-2.5">
          <Logo />
          <div>
            <div className="text-[14px] font-bold text-[#111] leading-tight">Arete</div>
            <div className="text-[10px] text-[#AAA] leading-tight">{title}</div>
          </div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {sections.map(sec => (
            <div key={sec}>
              <div className="px-4 pt-3 pb-1 text-[9px] font-bold tracking-[1.8px] uppercase text-[#AAA]">{sec}</div>
              {views.filter(v => v.section === sec).map(v => (
                <div key={v.id} onClick={() => setView(v.id)}
                  className={`flex items-center gap-2.5 py-2 mx-2 rounded-[7px] text-[12.5px] cursor-pointer transition-all select-none
                    ${view === v.id
                      ? 'bg-[#FEF4F4] text-[#C8202E] font-semibold border-l-[3px] border-[#C8202E] rounded-l-none ml-0 pl-[11px] pr-3'
                      : 'text-[#555] hover:bg-[#FEF4F4] hover:text-[#C8202E] px-3'}`}
                >
                  <span className="text-[14px] w-5 text-center flex-shrink-0">{v.icon}</span>
                  <span className="flex-1">{v.label}</span>
                  {v.badge && <span className="text-[9px] font-bold bg-[#C8202E] text-white px-1.5 py-0.5 rounded-full">{v.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-3 border-t border-[#E4E4E4]">
            <div className="w-8 h-8 rounded-full bg-[#C8202E] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{user.initials}</div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold text-[#111] truncate">{user.name}</div>
              <div className="text-[10.5px] text-[#AAA] truncate">{user.role}</div>
            </div>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#F8F8F8]">
        {children(view, setView)}
      </main>
    </div>
  );
}

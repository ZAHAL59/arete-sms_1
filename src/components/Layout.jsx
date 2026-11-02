import { NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';

const PORTALS = [
  { path: '/principal',  label: 'Principal',   icon: '🏛', section: 'Administration' },
  { path: '/admissions', label: 'Admissions',  icon: '🎓', section: 'Administration' },
  { path: '/teacher',    label: 'Teacher',     icon: '🍎', section: 'Administration' },
  { path: '/hr',         label: 'HR & Staff',  icon: '👥', section: 'Administration' },
  { path: '/finance',    label: 'Finance',     icon: '₹',  section: 'Administration' },
  { path: '/hostel',     label: 'Hostel',      icon: '🏠', section: 'Campus' },
  { path: '/transport',  label: 'Transport',   icon: '🚌', section: 'Campus' },
  { path: '/campus',     label: 'Campus',      icon: '🏫', section: 'Campus' },
  { path: '/careers',    label: 'Careers',     icon: '📋', section: 'Public' },
];

function NavSection({ title, items }) {
  return (
    <div className="mb-1">
      <div className="px-4 pt-3 pb-1 text-[9px] font-bold tracking-[1.8px] uppercase text-[#AAA]">{title}</div>
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 mx-2 rounded-[7px] text-[13px] font-medium cursor-pointer transition-all duration-150 no-underline ` +
            (isActive
              ? 'bg-[#FEF4F4] text-[#C8202E] font-semibold border-l-[3px] border-[#C8202E] rounded-l-none ml-0 pl-[11px]'
              : 'text-[#555] hover:bg-[#FEF4F4] hover:text-[#C8202E]')
          }
        >
          <span className="text-[14px] w-5 text-center flex-shrink-0">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export default function Layout({ children, user }) {
  const sections = [...new Set(PORTALS.map(p => p.section))];
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#E4E4E4] flex flex-col overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#E4E4E4]">
          <Logo />
          <div>
            <div className="text-[14px] font-bold text-[#111] leading-tight">Arete</div>
            <div className="text-[10px] text-[#AAA] leading-tight">Model School</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          {sections.map(sec => (
            <NavSection key={sec} title={sec} items={PORTALS.filter(p => p.section === sec)} />
          ))}
        </nav>

        {/* User */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-3 border-t border-[#E4E4E4]">
            <div className="w-8 h-8 rounded-full bg-[#C8202E] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {user.initials}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold text-[#111] truncate">{user.name}</div>
              <div className="text-[10.5px] text-[#AAA] truncate">{user.role}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#F8F8F8]">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-[3px] h-[18px] bg-[#C8202E] rounded-full inline-block"></span>
          <h1 className="text-[20px] font-extrabold text-[#111] tracking-tight">{title}</h1>
        </div>
        {subtitle && <p className="text-[12.5px] text-[#777] mt-1 ml-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 items-center flex-wrap">{actions}</div>}
    </div>
  );
}

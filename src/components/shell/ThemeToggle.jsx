import { useTheme } from '../../theme';

const Sun = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.8" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></svg>;
const Moon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" /></svg>;

// Round icon button: shows a moon in light mode (→ go dark) and a sun in dark mode (→ go light).
export function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="Toggle dark mode" aria-pressed={dark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-9 h-9 rounded-full border border-[#E4E4E4] bg-white flex items-center justify-center text-[#555] cursor-pointer hover:border-[#C8202E]/50 hover:text-[#C8202E] ${className}`}>{dark ? <Sun /> : <Moon />}</button>
  );
}

// Three-way choice for the account menu.
export function AppearancePicker() {
  const { pref, setPref } = useTheme();
  return (
    <div className="px-4 py-3 border-b border-[#EEE]">
      <div className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#AAA] mb-2">Appearance</div>
      <div className="grid grid-cols-3 gap-1 p-1 rounded-[10px] bg-[#F4F4F5]" role="radiogroup" aria-label="Appearance">
        {[['light', '☀', 'Light'], ['dark', '☾', 'Dark'], ['system', '◐', 'System']].map(([id, icon, label]) => (
          <button key={id} role="radio" aria-checked={pref === id} onClick={() => setPref(id)}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] text-[11.5px] font-semibold cursor-pointer border-none ${pref === id ? 'bg-white text-[#C8202E] shadow-[0_1px_4px_rgba(0,0,0,.12)]' : 'bg-transparent text-[#777] hover:text-[#111]'}`}><span>{icon}</span>{label}</button>))}
      </div>
    </div>
  );
}

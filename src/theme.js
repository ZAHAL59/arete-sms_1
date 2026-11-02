import { useSyncExternalStore } from 'react';

// Light / Dark / System. The choice is remembered in this browser; "System" follows the device setting.
const KEY = 'ARETE_THEME';
const listeners = new Set();
const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export const getPref = () => { try { const v = localStorage.getItem(KEY); return v === 'dark' || v === 'system' ? v : 'light'; } catch { return 'light'; } };
export const resolve = pref => (pref === 'system' ? (mq && mq.matches ? 'dark' : 'light') : pref);

export function applyTheme(pref = getPref()) {
  const dark = resolve(pref) === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', dark ? '#0F0F11' : '#C8202E');
}
export function setPref(pref) { try { localStorage.setItem(KEY, pref); } catch {} applyTheme(pref); listeners.forEach(l => l()); }

export function initTheme() {
  applyTheme();
  if (mq) mq.addEventListener?.('change', () => { if (getPref() === 'system') { applyTheme(); listeners.forEach(l => l()); } });
  window.addEventListener('storage', e => { if (e.key === KEY) { applyTheme(); listeners.forEach(l => l()); } });   // another tab changed it
}

const subscribe = cb => { listeners.add(cb); return () => listeners.delete(cb); };
export function useTheme() {
  const pref = useSyncExternalStore(subscribe, getPref, () => 'light');
  return { pref, dark: resolve(pref) === 'dark', setPref, toggle: () => setPref(resolve(pref) === 'dark' ? 'light' : 'dark') };
}

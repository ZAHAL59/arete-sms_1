// The app keeps its data in the browser (localStorage). Some browsers (private mode, strict settings, full disk)
// block or fill it. Instead of crashing, fall back to memory for this session and tell the person once.
export const STORAGE_EVENT = 'arete:storage-problem';
let problem = null;
export const getStorageProblem = () => problem;

export function installStorageGuard() {
  const announce = kind => { if (problem) return; problem = kind; window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: kind })); };
  try { const k = '__arete_probe__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); }
  catch {
    const mem = new Map();
    const shim = { getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => { mem.set(k, String(v)); }, removeItem: k => { mem.delete(k); }, clear: () => mem.clear(), key: i => [...mem.keys()][i] ?? null, get length() { return mem.size; } };
    try { Object.defineProperty(window, 'localStorage', { value: shim, configurable: true }); } catch { /* ignore */ }
    announce('blocked');
  }
  // a full disk throws QuotaExceededError on write — swallow it (the screen keeps working) and warn
  const orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { try { return orig.call(this, k, v); } catch (e) { announce('full'); } };
}

// Wipes only this app's saved data (used by the "start fresh" recovery button).
export function clearAppData() {
  try { Object.keys(localStorage).filter(k => k.startsWith('ARETE_') && k !== 'ARETE_THEME').forEach(k => localStorage.removeItem(k)); } catch { /* ignore */ }
}

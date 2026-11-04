// One place that every unexpected error passes through. Today it logs to the console and remembers the last
// error for support; swap the body for Sentry / LogRocket / your own endpoint when you add monitoring.
export function reportError(error, context = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('[Arete]', err, context);
  try { sessionStorage.setItem('ARETE_LAST_ERROR', JSON.stringify({ message: err.message, stack: (err.stack || '').split('\n').slice(0, 6).join('\n'), where: context.where || '', at: new Date().toISOString(), url: location.pathname + location.search })); } catch { /* storage unavailable */ }
}
export function installGlobalErrorHandlers() {
  window.addEventListener('error', e => { if (e.error) reportError(e.error, { where: 'window.onerror' }); });
  window.addEventListener('unhandledrejection', e => reportError(e.reason, { where: 'unhandledrejection' }));
}

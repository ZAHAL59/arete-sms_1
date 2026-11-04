import { Component } from 'react';
import { reportError, } from '../lib/report';
import { clearAppData } from '../lib/storageGuard';

// Catches a crash in any screen so the whole app never turns into a blank page.
// Plain classes on purpose: this must still render if something deeper (theme, router, a store) is what broke.
export default class ErrorBoundary extends Component {
  state = { error: null, details: false, confirm: false };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { reportError(error, { where: this.props.name, componentStack: info?.componentStack }); }
  componentDidUpdate(prev) { if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null, details: false, confirm: false }); }
  copy = async () => { try { await navigator.clipboard.writeText(`${this.state.error?.message}\n${this.state.error?.stack || ''}`); this.setState({ copied: true }); } catch { /* clipboard blocked */ } };

  render() {
    const { error, details, confirm, copied } = this.state;
    if (!error) return this.props.children;
    const btn = 'px-4 py-2 rounded-[10px] text-[13px] font-semibold cursor-pointer border';
    return (
      <div role="alert" className={`${this.props.fullPage ? 'min-h-screen' : 'min-h-[60vh]'} flex items-center justify-center p-6 bg-[#F4F4F5]`}>
        <div className="w-full max-w-[520px] bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,.06)] border border-[#E4E4E4] text-[#111]">
          <div className="w-12 h-12 rounded-[14px] bg-[#F6F6F7] flex items-center justify-center text-[22px] mb-5" aria-hidden="true">⚠️</div>
          <h1 className="text-[22px] font-extrabold tracking-tight">This screen hit a problem</h1>
          <p className="text-[14px] text-[#555] mt-2 leading-relaxed">Nothing you saved has been lost — your data stays in this browser. Try again, or reload the page. If it keeps happening, the saved data may be damaged and you can start fresh below.</p>
          <div className="flex flex-wrap gap-2 mt-6">
            <button className={`${btn} bg-[#18181B] text-white border-[#18181B]`} onClick={() => this.setState({ error: null })}>Try again</button>
            <button className={`${btn} bg-white text-[#111] border-[#E4E4E4]`} onClick={() => location.reload()}>Reload page</button>
            <a className={`${btn} bg-white text-[#111] border-[#E4E4E4] no-underline`} href="/">Go to home</a>
          </div>
          <div className="mt-6 pt-5 border-t border-[#EEE]">
            <button className="text-[12.5px] font-semibold text-[#555] bg-transparent border-none cursor-pointer p-0 underline" onClick={() => this.setState({ details: !details })} aria-expanded={details}>{details ? 'Hide' : 'Show'} technical details</button>
            {details && (
              <div className="mt-3">
                <pre className="text-[11.5px] bg-[#F4F4F5] rounded-[10px] p-3 overflow-auto max-h-[160px] whitespace-pre-wrap break-words text-[#333]">{String(error?.message || error)}{'\n'}{(error?.stack || '').split('\n').slice(1, 5).join('\n')}</pre>
                <button className="mt-2 text-[12px] font-semibold text-[#555] bg-transparent border-none cursor-pointer p-0 underline" onClick={this.copy}>{copied ? 'Copied ✓' : 'Copy details'}</button>
              </div>)}
            <div className="mt-4">
              {!confirm ? <button className="text-[12.5px] font-semibold text-[#B91C1C] bg-transparent border-none cursor-pointer p-0 underline" onClick={() => this.setState({ confirm: true })}>Clear saved data and start fresh…</button> : (
                <div className="rounded-[12px] bg-[#FEF2F2] border border-[#FECACA] p-3">
                  <div className="text-[12.5px] text-[#7F1D1D]">This erases the demo data saved in this browser for every portal. It cannot be undone.</div>
                  <div className="flex gap-2 mt-2.5">
                    <button className={`${btn} !py-1.5 bg-[#B91C1C] text-white border-[#B91C1C]`} onClick={() => { clearAppData(); location.href = '/'; }}>Yes, erase and restart</button>
                    <button className={`${btn} !py-1.5 bg-white text-[#111] border-[#E4E4E4]`} onClick={() => this.setState({ confirm: false })}>Cancel</button>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

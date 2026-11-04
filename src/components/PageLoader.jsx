// Shown for a moment while a portal's code downloads. Mirrors the real layout so the page doesn't jump.
export default function PageLoader() {
  const bar = 'rounded-[12px] bg-[#E9E9EC] animate-pulse';
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="h-screen flex bg-[#F4F4F5]">
      <span className="sr-only">Loading…</span>
      <div className="hidden lg:flex w-[264px] flex-shrink-0 m-3 mr-0 rounded-[20px] bg-white border border-[#E4E4E4] flex-col p-5 gap-3" aria-hidden="true">
        <div className={`${bar} h-7 w-32`} />{[...Array(5)].map((_, i) => <div key={i} className={`${bar} h-9`} />)}
      </div>
      <div className="flex-1 p-6 lg:p-8" aria-hidden="true">
        <div className={`${bar} h-11 w-full max-w-[420px] rounded-full`} />
        <div className={`${bar} h-9 w-48 mt-8`} />
        <div className={`${bar} h-[260px] mt-6 rounded-[26px]`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-6">{[...Array(4)].map((_, i) => <div key={i} className={`${bar} h-28 rounded-[22px]`} />)}</div>
      </div>
    </div>
  );
}

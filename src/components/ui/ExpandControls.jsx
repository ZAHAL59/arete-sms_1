// "Expand all / Collapse all" for a page made of collapsible sections
export default function ExpandControls({ ex, ids }) {
  const cls = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12px] font-semibold text-[#555] bg-white cursor-pointer hover:border-[#C8202E] hover:text-[#C8202E]';
  return (
    <div className="inline-flex gap-1.5">
      <button className={cls} onClick={() => ex.expandAll(ids)}>⤢ Expand all</button>
      <button className={cls} onClick={() => ex.collapseAll()}>⤡ Collapse all</button>
    </div>
  );
}

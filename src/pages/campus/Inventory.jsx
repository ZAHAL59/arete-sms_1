import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import Badge from '../../components/ui/Badge';
import useExpand from '../../components/ui/useExpand';
import ExpandControls from '../../components/ui/ExpandControls';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { ASSET_CATS, ASSET_ICONS, fmt } from './constants';

export default function Inventory({ c, addAsset, editAsset }) {
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [ef, setEf] = useState({});
  const [action, setAction] = useState('');
  const [nf, setNf] = useState({ name:'', cat:ASSET_CATS[0], total:'', value:'', note:'' });

  const cats = [...new Set([...ASSET_CATS.filter(x => c.inventory.some(i => i.cat === x)), ...c.inventory.map(i => i.cat)])];
  const ex = useExpand(cats.filter(x => c.inventory.some(i => i.cat === x && i.repair > 0)).map(x => 'c:' + x));   // categories with repairs open
  const allIds = [...cats.map(x => 'c:' + x), 'log'];
  const totalUnits = c.inventory.reduce((a, i) => a + i.total, 0);
  const repair = c.inventory.reduce((a, i) => a + i.repair, 0);
  const value = c.inventory.reduce((a, i) => a + i.value, 0);

  function openEdit(i) { setEdit(i); setAction(''); setEf({ name:i.name, cat:i.cat, total:String(i.total), working:String(i.working), repair:String(i.repair), value:String(i.value), note:i.note || '' }); }
  function saveEdit() {
    const total = +ef.total || edit.total, rep = Math.max(0, +ef.repair || 0);
    editAsset(edit.id, { name:ef.name.trim() || edit.name, cat:ef.cat, total, working:Math.max(0, +ef.working || 0), repair:rep, value:+ef.value || 0, note:ef.note.trim(), icon:ASSET_ICONS[ef.cat] || edit.icon }, action.trim());
    setEdit(null);
  }
  function saveNew() {
    if (!nf.name.trim() || !+nf.total) return;
    addAsset({ name:nf.name.trim(), cat:nf.cat, total:+nf.total, value:+nf.value || 0, note:nf.note, icon:ASSET_ICONS[nf.cat] });
    setAddOpen(false); setNf({ name:'', cat:ASSET_CATS[0], total:'', value:'', note:'' });
  }

  return (
    <div className="p-6">
      <PageHeader title="Inventory" subtitle="School assets and equipment — grouped by category" actions={<><ExpandControls ex={ex} ids={allIds} /><Button onClick={() => setAddOpen(true)}>+ Add Asset</Button></>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Asset Types" value={c.inventory.length} note="Tracked categories" />
        <Kpi label="Total Units" value={totalUnits.toLocaleString('en-IN')} note="All assets" color="#1A5FB4" />
        <Kpi label="Under Repair" value={repair} note="Need attention" color={repair ? '#DC2626' : '#166534'} />
        <Kpi label="Total Value" value={fmt(value)} note="Replacement value" color="#166534" />
      </div>

      {cats.map(cat => {
        const items = c.inventory.filter(i => i.cat === cat), units = items.reduce((a, i) => a + i.total, 0), rep = items.reduce((a, i) => a + i.repair, 0);
        return (
          <Collapsible key={cat} className="mb-3" open={ex.isOpen('c:' + cat)} onToggle={() => ex.toggle('c:' + cat)}
            header={<div className="flex items-center gap-2.5"><span className="text-[18px]">{items[0]?.icon}</span><span className="text-[13.5px] font-bold text-[#111]">{cat}</span><Badge variant="grey">{items.length} type{items.length === 1 ? '' : 's'}</Badge><span className="text-[12px] text-[#777]">{units.toLocaleString('en-IN')} units</span>{rep > 0 && <Badge variant="red">⚠ {rep} under repair</Badge>}</div>}>
            <div className="grid grid-cols-3 gap-3 p-3 border-t border-[#E4E4E4]">
              {items.map(i => (
                <div key={i.id} className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 shadow-[0_1px_4px_rgba(0,0,0,.07)]">
            <div className="flex justify-between items-start mb-1"><div className="text-[24px]">{i.icon}</div><Button size="sm" variant="outline" onClick={() => openEdit(i)}>✎ Edit</Button></div>
            <div className="text-[14px] font-bold text-[#111]">{i.name}</div>
            <div className="text-[11.5px] text-[#AAA] mb-3">{i.cat}</div>
            <div className="grid grid-cols-4 gap-1 text-center">
              {[['Total', i.total, '#111'], ['Working', i.working, '#166534'], ['Repair', i.repair, i.repair ? '#DC2626' : '#AAA'], ['Value', fmt(i.value), '#111']].map(([l, v, col]) => (
                <div key={l}><div className="font-extrabold" style={{ color:col, fontSize: l === 'Value' ? 11.5 : 17 }}>{v}</div><div className="text-[9.5px] text-[#AAA] uppercase tracking-wider">{l}</div></div>
              ))}
            </div>
            {i.repair > 0 && <div className="text-[11px] text-[#DC2626] bg-[#FEF2F2] rounded-[4px] px-2 py-1 mt-3">⚠ {i.repair} unit{i.repair > 1 ? 's' : ''} need{i.repair === 1 ? 's' : ''} repair</div>}
            {i.note && <div className="text-[11px] text-[#777] mt-2">{i.note}</div>}
          </div>
              ))}
            </div>
          </Collapsible>);
      })}

      <Collapsible open={ex.isOpen('log')} onToggle={() => ex.toggle('log')} header={<span className="text-[13.5px] font-bold text-[#111]">🧾 Activity Log</span>}>
        <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
          <thead><tr><Th>Date</Th><Th>Asset</Th><Th>Action</Th><Th>Qty</Th><Th>By</Th></tr></thead>
          <tbody>{c.invLog.slice(0, 15).map((l, i) => (
            <tr key={i} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
              <td className="px-4 py-2.5 text-[#555]">{l.date}</td><td className="px-4 py-2.5 font-semibold text-[#111]">{l.asset}</td>
              <td className="px-4 py-2.5 text-[#555]">{l.action}</td><td className="px-4 py-2.5 font-bold">{l.qty}</td><td className="px-4 py-2.5 text-[#777]">{l.by}</td>
            </tr>))}</tbody>
        </table>
      </Collapsible>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Asset"
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={saveNew}>Save Asset</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Asset Name *" className="col-span-2"><input value={nf.name} onChange={e => setNf(x => ({ ...x, name:e.target.value }))} placeholder="e.g. Smartboards" className={inputCls} /></Field>
          <Field label="Category"><select value={nf.cat} onChange={e => setNf(x => ({ ...x, cat:e.target.value }))} className={inputCls}>{ASSET_CATS.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Total Count *"><input type="number" min={1} value={nf.total} onChange={e => setNf(x => ({ ...x, total:e.target.value }))} className={inputCls} /></Field>
          <Field label="Estimated Value (₹)" className="col-span-2"><input type="number" value={nf.value} onChange={e => setNf(x => ({ ...x, value:e.target.value }))} placeholder="Total replacement value" className={inputCls} /></Field>
          <Field label="Notes" className="col-span-2"><input value={nf.note} onChange={e => setNf(x => ({ ...x, note:e.target.value }))} placeholder="Supplier, warranty date, location..." className={inputCls} /></Field>
        </div>
      </Modal>

      {edit && (
        <Modal open onClose={() => setEdit(null)} title={`Update — ${edit.name}`}
          footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={saveEdit}>Save Changes</Button></>}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Asset Name"><input value={ef.name} onChange={e => setEf(x => ({ ...x, name:e.target.value }))} className={inputCls} /></Field>
            <Field label="Category"><select value={ef.cat} onChange={e => setEf(x => ({ ...x, cat:e.target.value }))} className={inputCls}>{ASSET_CATS.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Total Units"><input type="number" min={0} value={ef.total} onChange={e => setEf(x => ({ ...x, total:e.target.value }))} className={inputCls} /></Field>
            <Field label="✓ Working"><input type="number" min={0} value={ef.working} onChange={e => setEf(x => ({ ...x, working:e.target.value }))} className={inputCls} /></Field>
            <Field label="⚠ Under Repair"><input type="number" min={0} value={ef.repair} onChange={e => setEf(x => ({ ...x, repair:e.target.value }))} className={inputCls} /></Field>
            <Field label="Value (₹)"><input type="number" value={ef.value} onChange={e => setEf(x => ({ ...x, value:e.target.value }))} className={inputCls} /></Field>
            <Field label="Action taken (for the log)" className="col-span-2"><input value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. Sent 2 units to vendor for repair" className={inputCls} /></Field>
            <Field label="Notes" className="col-span-2"><input value={ef.note} onChange={e => setEf(x => ({ ...x, note:e.target.value }))} className={inputCls} /></Field>
          </div>
          {(+ef.working || 0) + (+ef.repair || 0) > (+ef.total || 0) && <div className="mt-3 text-[12px] text-[#B45309] bg-[#FFFBEB] rounded-[6px] p-2.5">Working + repair exceeds total — working will be reduced automatically.</div>}
        </Modal>
      )}
    </div>
  );
}

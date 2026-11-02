import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Field, inputCls, Th } from './ui';
import { fmt } from './constants';

const esc = t => String(t || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function printOrder(lines, total, supplier, delivery) {
  const td = 'border:1px solid #ccc;padding:8px;font-size:12.5px';
  const w = window.open('', '_blank', 'width=820,height=800'); if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>Procurement Order</title></head><body style="font-family:Arial,sans-serif;padding:28px"><h2 style="margin:0">Procurement Order — Arete Model School Hostel</h2><p style="color:#666;font-size:13px">${new Date().toDateString()} · Supplier: <b>${esc(supplier) || '—'}</b>${delivery ? ' · Expected delivery: ' + esc(delivery) : ''}</p>
<table style="width:100%;border-collapse:collapse"><thead><tr>${['Item', 'Quantity', 'Unit cost', 'Amount'].map(h => `<th style="${td};background:#eee;text-align:left">${h}</th>`).join('')}</tr></thead><tbody>${lines.map(l => `<tr><td style="${td}">${esc(l.item)}</td><td style="${td}">${l.qty} ${esc(l.unit)}</td><td style="${td}">₹${l.cost}</td><td style="${td}">₹${(l.qty * l.cost).toLocaleString('en-IN')}</td></tr>`).join('')}<tr><td style="${td};font-weight:700" colspan="3">Estimated total</td><td style="${td};font-weight:700">₹${total.toLocaleString('en-IN')}</td></tr></tbody></table>
<button onclick="window.print()" style="margin-top:20px;padding:8px 20px;background:#C8202E;color:#fff;border:none;border-radius:6px;cursor:pointer">Print</button></body></html>`);
  w.document.close();
}

// Build an order from any stock items — low-stock ones are ticked for you, but nothing stops you ordering more.
export default function ProcurementModal({ stock, onClose, onPlace }) {
  const [rows, setRows] = useState(() => Object.fromEntries(stock.map(s => [s.item, { on: s.qty <= s.low, qty: Math.max(1, s.max - s.qty) }])));
  const [supplier, setSupplier] = useState(''); const [delivery, setDelivery] = useState(''); const [placed, setPlaced] = useState(false); const [err, setErr] = useState('');
  const set = (item, f) => setRows(r => ({ ...r, [item]: { ...r[item], ...f } }));
  const chosen = stock.filter(s => rows[s.item].on && +rows[s.item].qty > 0).map(s => ({ item: s.item, unit: s.unit, cost: s.cost, qty: Math.round(+rows[s.item].qty) }));
  const total = chosen.reduce((a, l) => a + l.qty * l.cost, 0);
  const lowCount = stock.filter(s => s.qty <= s.low).length;
  const tick = fn => setRows(r => Object.fromEntries(stock.map(s => [s.item, { ...r[s.item], on: fn(s) }])));

  function place() {
    if (!chosen.length) return setErr('Select at least one item and enter a quantity.');
    onPlace({ supplier: supplier.trim() || 'Supplier', delivery, total, lines: chosen }); setPlaced(true); setErr('');
  }

  return (
    <Modal open onClose={onClose} size="lg" title="Procurement Order" subtitle={`Arete Model School Hostel · ${new Date().toDateString()}`}
      footer={<><span className="mr-auto text-[12px] text-[#DC2626] font-semibold">{err}</span><Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="outline" disabled={!chosen.length} onClick={() => printOrder(chosen, total, supplier, delivery)}>🖨 Print</Button>
        {!placed && <Button disabled={!chosen.length} onClick={place}>📦 Place order</Button>}</>}>
      {placed && <div className="mb-3 text-[13px] text-[#166534] bg-[#F0FDF4] rounded-[6px] p-2.5">✓ Order recorded under Procurement Orders. Contact the supplier directly — orders are not sent automatically.</div>}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Supplier name"><input value={supplier} disabled={placed} onChange={e => setSupplier(e.target.value)} className={inputCls} /></Field>
        <Field label="Expected delivery"><input type="date" value={delivery} disabled={placed} onChange={e => setDelivery(e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] text-[#777]">{lowCount ? `${lowCount} item${lowCount > 1 ? 's are' : ' is'} low on stock and ticked.` : 'All items are adequately stocked — tick anything you still want to order.'}</span>
        <div className="ml-auto flex gap-1.5"><Button size="sm" variant="outline" disabled={placed} onClick={() => tick(s => s.qty <= s.low)}>Low stock only</Button><Button size="sm" variant="outline" disabled={placed} onClick={() => tick(() => true)}>All items</Button><Button size="sm" variant="outline" disabled={placed} onClick={() => tick(() => false)}>Clear</Button></div>
      </div>
      <div className="border border-[#E4E4E4] rounded-[8px] overflow-hidden"><table className="w-full border-collapse text-[13px]">
        <thead><tr><Th /><Th>Item</Th><Th>In stock</Th><Th>Order qty</Th><Th>Unit cost</Th><Th>Amount</Th></tr></thead>
        <tbody>{stock.map(s => { const r = rows[s.item]; const isLow = s.qty <= s.low; return (
          <tr key={s.item} className={`border-b border-[#E4E4E4] last:border-b-0 ${r.on ? 'bg-[#FEF9F9]' : ''}`}>
            <td className="px-3 py-2"><input type="checkbox" aria-label={`Order ${s.item}`} checked={r.on} disabled={placed} onChange={e => set(s.item, { on: e.target.checked })} className="accent-[#C8202E] w-4 h-4" /></td>
            <td className="px-3 py-2 font-semibold text-[#111]">{s.item} {isLow && <Badge variant="red" className="ml-1">Low</Badge>}</td>
            <td className="px-3 py-2 text-[#555]">{s.qty} <span className="text-[#AAA]">/ {s.max} {s.unit}</span></td>
            <td className="px-3 py-2"><div className="flex items-center gap-1.5"><input type="number" min={1} disabled={!r.on || placed} value={r.qty} onChange={e => set(s.item, { qty: e.target.value })} className="w-20 px-2 py-1 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[12.5px] text-right outline-none focus:border-[#C8202E] disabled:opacity-40" /><span className="text-[11.5px] text-[#AAA]">{s.unit}</span></div></td>
            <td className="px-3 py-2 font-mono text-[12px] text-[#555]">{fmt(s.cost)}</td>
            <td className="px-3 py-2 font-mono text-[12.5px] font-bold text-[#111]">{r.on && +r.qty > 0 ? fmt(Math.round(+r.qty) * s.cost) : '—'}</td></tr>); })}</tbody></table></div>
      <div className="bg-[#FEF4F4] border border-[#FECACA] rounded-[8px] p-3 mt-3 flex justify-between"><span className="font-bold text-[#111]">Estimated total · {chosen.length} item{chosen.length === 1 ? '' : 's'}</span><span className="font-extrabold text-[#C8202E] font-mono">{fmt(total)}</span></div>
    </Modal>
  );
}

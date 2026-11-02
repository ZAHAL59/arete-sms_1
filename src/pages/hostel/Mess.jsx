import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import ProcurementModal from './ProcurementModal';
import { Kpi, Field, inputCls, Th } from './ui';
import { MONTHLY_FEE, fmt, TODAY, STOCK_CATS, STOCK_UNITS } from './constants';
import { getFeeStructure } from '../finance/constants';

export default function Mess({ h, saveStock, addStock, addOrder, receiveOrder }) {
  const db = useStore(s => s.db);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});
  const [procure, setProcure] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [nw, setNw] = useState({ item:'', unit:'kg', qty:'', max:'', low:'', cost:'', cat:STOCK_CATS[0], supplier:'' });

  const stockValue = h.stock.reduce((a, s) => a + s.qty * s.cost, 0);
  const openOrders = (h.orders || []).filter(o => o.status === 'Ordered').length;
  const low = h.stock.filter(s => s.qty <= s.low);

  function openEdit(s) { setEdit(s); setForm({ qty:String(s.qty), max:String(s.max), low:String(s.low), cost:String(s.cost) }); }
  function saveEdit() {
    saveStock(edit.item, { qty:+form.qty||0, max:+form.max||0, low:+form.low||0, cost:+form.cost||0 });
    setEdit(null);
  }
  function saveNew() {
    if (!nw.item) return;
    addStock({ ...nw, qty:+nw.qty||0, max:+nw.max||0, low:+nw.low||0, cost:+nw.cost||0 });
    setAddOpen(false); setNw({ item:'', unit:'kg', qty:'', max:'', low:'', cost:'', cat:STOCK_CATS[0], supplier:'' });
  }

  return (
    <div className="p-6">
      <PageHeader title="Mess Management" subtitle="Kitchen stock and procurement orders"
        actions={<>
          <Button variant="outline" onClick={() => setAddOpen(true)}>+ Add Item</Button>
          <Button onClick={() => setProcure(true)}>Generate Procurement Order</Button>
        </>} />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Items in Stock" value={h.stock.length} note="Tracked kitchen items" />
        <Kpi label="Low Stock" value={low.length} note="Items to reorder" color={low.length ? '#DC2626' : '#166534'} />
        <Kpi label="Stock Value" value={fmt(stockValue)} note="Quantity × unit cost" color="#1A5FB4" />
        <Kpi label="Open Orders" value={openOrders} note="Placed, not yet received" color={openOrders ? '#B45309' : '#166534'} />
      </div>

      <Collapsible defaultOpen className="mb-3" header={<span className="text-[13.5px] font-bold text-[#111]">📦 Stock Levels</span>}>
        <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
          <thead><tr><Th>Item</Th><Th>Category</Th><Th>Stock</Th><Th>Level</Th><Th>Unit Cost</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>
            {h.stock.map(s => {
              const pct = Math.round(s.qty / s.max * 100); const isLow = s.qty <= s.low;
              return (
                <tr key={s.item} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                  <td className="px-4 py-2.5 font-semibold text-[#111]">{s.item}</td>
                  <td className="px-4 py-2.5"><Badge variant="grey">{s.cat}</Badge></td>
                  <td className="px-4 py-2.5 font-bold">{s.qty} <span className="text-[#AAA] font-normal">/ {s.max} {s.unit}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="h-1.5 bg-[#E4E4E4] rounded-full w-20 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${Math.min(100,pct)}%`, background: isLow ? '#DC2626' : '#C8202E' }} />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{fmt(s.cost)}</td>
                  <td className="px-4 py-2.5"><Badge variant={isLow ? 'red' : 'green'}>{isLow ? 'Low Stock' : 'OK'}</Badge></td>
                  <td className="px-4 py-2.5"><button onClick={() => openEdit(s)} className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">Edit</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Collapsible>


      <Collapsible className="mb-3" header={<span className="text-[13.5px] font-bold text-[#111]">📦 Procurement Orders ({(h.orders || []).length})</span>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{!(h.orders || []).length && <div className="p-4 text-[13px] text-[#AAA]">No orders yet — generate one from low-stock items.</div>}{(h.orders || []).map(o => (
          <div key={o.id} className="flex items-center gap-3 px-4 py-2.5"><div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{o.supplier} · {fmt(o.total)}</div><div className="text-[11.5px] text-[#777]">{o.date}{o.delivery ? ` · expected ${o.delivery}` : ''} · {o.lines.map(l => `${l.item} ×${l.qty}`).join(', ')}</div></div>
            <Badge variant={o.status === 'Received' ? 'green' : 'amber'}>{o.status}</Badge>{o.status !== 'Received' && <Button size="sm" variant="outline" onClick={() => receiveOrder(o.id)}>Mark received</Button>}</div>))}</div>
      </Collapsible>

      {/* Edit stock */}
      {edit && (
        <Modal open onClose={() => setEdit(null)} title={`Edit — ${edit.item}`}
          footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={saveEdit}>Save</Button></>}>
          <div className="grid grid-cols-2 gap-3">
            {[['Current Qty','qty'],['Max Qty','max'],['Low Alert At','low'],['Unit Cost (₹)','cost']].map(([l, k]) => (
              <Field key={k} label={l}><input type="number" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className={inputCls} /></Field>
            ))}
          </div>
        </Modal>
      )}

      {/* Add item */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Stock Item"
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={saveNew}>Add</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Item *" className="col-span-2"><input value={nw.item} onChange={e => setNw(f => ({ ...f, item:e.target.value }))} className={inputCls} /></Field>
          <Field label="Unit"><select value={nw.unit} onChange={e => setNw(f => ({ ...f, unit:e.target.value }))} className={inputCls}>{STOCK_UNITS.map(u => <option key={u}>{u}</option>)}</select></Field>
          <Field label="Category">
            <select value={nw.cat} onChange={e => setNw(f => ({ ...f, cat:e.target.value }))} className={inputCls}>
              {STOCK_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Supplier" className="col-span-2"><input value={nw.supplier} onChange={e => setNw(f => ({ ...f, supplier:e.target.value }))} className={inputCls} /></Field>
          {[['Qty','qty'],['Max','max'],['Low alert (reorder trigger)','low'],['Unit cost','cost']].map(([l, k]) => (
            <Field key={k} label={l}><input type="number" value={nw[k]} onChange={e => setNw(f => ({ ...f, [k]:e.target.value }))} className={inputCls} /></Field>
          ))}
        </div>
      </Modal>

      {procure && <ProcurementModal stock={h.stock} onClose={() => setProcure(false)} onPlace={addOrder} />}
    </div>
  );
}

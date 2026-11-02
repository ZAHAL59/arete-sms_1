import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { TODAY, fmt } from './constants';

export default function Fuel({ t, addFuel }) {
  const db = useStore(s => s.db);
  const [veh, setVeh] = useState('');
  const [open, setOpen] = useState(false);
  const blank = { date: TODAY, vehicle: db.routes[0]?.vehicle || '', litres: '', rate: '96', km: '', station: '' };
  const [f, setF] = useState(blank);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const list = t.fuel.filter(x => !veh || x.vehicle === veh);
  const totalAmt = list.reduce((a, x) => a + x.amount, 0);
  const totalLit = list.reduce((a, x) => a + x.litres, 0);
  const withM = list.filter(x => x.mileage > 0);
  const avgM = withM.length ? Math.round(withM.reduce((a, x) => a + x.mileage, 0) / withM.length * 10) / 10 : 0;
  const avgRate = totalLit ? totalAmt / totalLit : 0;

  function save() {
    if (!f.vehicle || !+f.litres || !+f.rate) return;
    const route = db.routes.find(r => r.vehicle === f.vehicle);
    addFuel({ date: f.date, vehicle: f.vehicle, driver: route?.driver || '—', litres: +f.litres, rate: +f.rate, km: +f.km || 0, station: f.station || '—' });
    setOpen(false); setF(blank);
  }

  return (
    <div className="p-6">
      <PageHeader title="Fuel Log" subtitle="Fill-ups, mileage and running cost"
        actions={<>
          <select value={veh} onChange={e => setVeh(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
            <option value="">All vehicles</option>{db.routes.map(r => <option key={r.id}>{r.vehicle}</option>)}
          </select>
          <Button onClick={() => { setF(blank); setOpen(true); }}>+ Log Fuel</Button>
        </>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Fuel Cost" value={fmt(totalAmt)} note={veh || 'All vehicles'} />
        <Kpi label="Total Litres" value={`${totalLit}L`} note={`${list.length} fill-ups`} color="#1A5FB4" />
        <Kpi label="Avg Mileage" value={`${avgM} km/L`} note="From logged fill-ups" color="#166534" />
        <Kpi label="Cost / KM" value={avgM > 0 ? '₹' + (Math.round(avgRate / avgM * 10) / 10) : '—'} note="Approx per km" color="#B45309" />
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)] mb-3">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Date</Th><Th>Vehicle</Th><Th>Driver</Th><Th>Litres</Th><Th>Rate</Th><Th>Amount</Th><Th>Odometer</Th><Th>Mileage</Th><Th>Station</Th></tr></thead>
          <tbody>
            {!list.length
              ? <tr><td colSpan={9} className="text-center py-10 text-[#AAA]">No fuel entries</td></tr>
              : list.map(x => (
                <tr key={x.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                  <td className="px-4 py-2.5 text-[#555]">{x.date}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] font-bold text-[#111]">{x.vehicle}</td>
                  <td className="px-4 py-2.5 text-[#555]">{x.driver}</td>
                  <td className="px-4 py-2.5 font-bold text-[#111]">{x.litres}L</td>
                  <td className="px-4 py-2.5 text-[#555]">₹{x.rate}</td>
                  <td className="px-4 py-2.5 font-bold text-[#C8202E]">{fmt(x.amount)}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#555]">{x.km || '—'}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: x.mileage >= 8 ? '#166534' : x.mileage > 0 ? '#DC2626' : '#AAA' }}>{x.mileage > 0 ? `${x.mileage} km/L` : '—'}</td>
                  <td className="px-4 py-2.5 text-[12px] text-[#777]">{x.station}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Collapsible header={<div className="flex items-center gap-2"><span className="text-[13.5px] font-bold text-[#111]">📡 GPS Tracking</span><Badge variant="grey">Not connected</Badge></div>}>
        <div className="p-4 border-t border-[#E4E4E4] text-[13px] text-[#777]">
          Live vehicle location needs a GPS device or tracking service connected. The HTML version showed placeholder statuses here — they were not real data, so this is left empty until a tracker is integrated.
        </div>
      </Collapsible>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Fuel Fill-up" subtitle="Mileage is calculated from the previous odometer reading"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Entry</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" value={f.date} onChange={e => set('date', e.target.value)} className={inputCls} /></Field>
          <Field label="Vehicle *"><select value={f.vehicle} onChange={e => set('vehicle', e.target.value)} className={inputCls}>{db.routes.map(r => <option key={r.id} value={r.vehicle}>{r.vehicle} — {r.driver}</option>)}</select></Field>
          <Field label="Litres *"><input type="number" value={f.litres} onChange={e => set('litres', e.target.value)} className={inputCls} /></Field>
          <Field label="Rate (₹/L) *"><input type="number" value={f.rate} onChange={e => set('rate', e.target.value)} className={inputCls} /></Field>
          <Field label="Odometer (km)"><input type="number" value={f.km} onChange={e => set('km', e.target.value)} className={inputCls} /></Field>
          <Field label="Station"><input value={f.station} onChange={e => set('station', e.target.value)} className={inputCls} /></Field>
        </div>
        {+f.litres > 0 && +f.rate > 0 && <div className="mt-3 text-[12.5px] text-[#555]">Amount: <strong className="text-[#111]">{fmt(Math.round(f.litres * f.rate))}</strong></div>}
      </Modal>
    </div>
  );
}

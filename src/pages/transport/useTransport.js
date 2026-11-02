import { useState, useCallback } from 'react';
import { loadTransport, saveTransport, TODAY } from './constants';
import useStore from '../../store/useStore';

export default function useTransport() {
  const [t, setT] = useState(loadTransport);
  const updateDB = useStore(s => s.updateDB);
  const update = useCallback(fn => {
    setT(prev => { const next = fn(JSON.parse(JSON.stringify(prev))); saveTransport(next); return next; });
  }, []);

  return {
    t,
    // Routes live in the shared DB so Admissions / Finance see the same list
    addRoute: r => updateDB(d => { d.routes.push({ ...r, id:'R'+String(d.routes.length+1).padStart(3,'0'), arr:'08:00', status:'Active' }); return d; }),
    updateRoute: (id, f) => updateDB(d => { const r = d.routes.find(x => x.id === id); if (r) Object.assign(r, f); return d; }),

    addDeparture: dep => update(d => { d.departures.unshift({ ...dep, id:'DEP'+Date.now().toString().slice(-6), date:TODAY, smsSent:true }); return d; }),
    setBoarding: (stuId, status) => update(d => {
      if (!d.boarding[TODAY]) d.boarding[TODAY] = {};
      if (status === 'boarded') delete d.boarding[TODAY][stuId]; else d.boarding[TODAY][stuId] = status;
      return d;
    }),
    addMaint: m => update(d => { d.maintenance.unshift({ ...m, id:'M'+Date.now().toString().slice(-6) }); return d; }),
    addDoc:   x => update(d => { d.docs.unshift({ ...x, id:'D'+Date.now().toString().slice(-6) }); return d; }),
    addFuel:  f => update(d => {
      const prev = d.fuel.filter(x => x.vehicle === f.vehicle && x.km < f.km).sort((a, b) => b.km - a.km)[0];
      const mileage = prev ? Math.round((f.km - prev.km) / f.litres * 10) / 10 : 0;
      d.fuel.unshift({ ...f, id:'F'+Date.now().toString().slice(-6), amount:Math.round(f.litres * f.rate), mileage });
      d.fuel.sort((a, b) => b.date.localeCompare(a.date));
      return d;
    }),
  };
}

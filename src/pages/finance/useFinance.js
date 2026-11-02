import { useState, useCallback } from 'react';
import { loadFinance, saveFinance } from './constants';
import useStore from '../../store/useStore';

export default function useFinance() {
  const db = useStore(s => s.db);
  const updateDB = useStore(s => s.updateDB);
  const [fin, setFin] = useState(loadFinance);

  const update = useCallback((fn) => {
    setFin(prev => {
      const next = fn(JSON.parse(JSON.stringify(prev)));
      saveFinance(next);
      return next;
    });
  }, []);

  // All payments = db.payments + fin.extraPayments
  const allPayments = [...db.payments, ...(fin.extraPayments||[])];

  function recordPayment(payment) {
    const p = { ...payment, id:'RC-'+Date.now().toString().slice(-8) };
    // Store in db for shared access
    updateDB(ddb => { ddb.payments.unshift(p); return ddb; });
  }

  function addBudgetLine(line) {
    update(f => {
      f.budget.push({ ...line, id:'B'+String(f.budget.length+1).padStart(3,'0') });
      return f;
    });
  }

  function updateBudgetLine(id, fields) {
    update(f => {
      const idx = f.budget.findIndex(b=>b.id===id);
      if (idx>=0) f.budget[idx] = { ...f.budget[idx], ...fields };
      return f;
    });
  }

  function deleteBudgetLine(id) {
    update(f => { f.budget = f.budget.filter(b=>b.id!==id); return f; });
  }

  function processPayroll() {
    const now = new Date();
    db.staff.forEach(s => {
      const already = db.payments.find(p =>
        p.staffId===s.id && p.category==='Staff Salary' &&
        new Date(p.date).getMonth()===now.getMonth() &&
        new Date(p.date).getFullYear()===now.getFullYear()
      );
      if (!already) {
        updateDB(ddb => {
          ddb.payments.unshift({
            id:'PR-'+Date.now().toString().slice(-8)+'-'+s.id,
            studentId:null, staffId:s.id, name:s.name,
            category:'Staff Salary', amount:s.salary,
            date:now.toISOString().slice(0,10), mode:'Bank Transfer', ref:''
          });
          return ddb;
        });
      }
    });
  }

  function payStaff(staffId) {
    const s = db.staff.find(x => x.id === staffId); if (!s) return;
    const now = new Date();
    const paid = db.payments.some(p => p.staffId === staffId && p.category === 'Staff Salary' && new Date(p.date).getMonth() === now.getMonth() && new Date(p.date).getFullYear() === now.getFullYear());
    if (paid) return;
    updateDB(ddb => { ddb.payments.unshift({ id: 'PR-' + Date.now().toString().slice(-8) + '-' + s.id, studentId: null, staffId: s.id, name: s.name, category: 'Staff Salary', amount: s.salary, date: now.toISOString().slice(0, 10), mode: 'Bank Transfer', ref: '' }); return ddb; });
  }
  const setActualsFrom = date => update(f => { f.actualsFrom = date; return f; });
  function updateSalary(staffId, salary) { updateDB(d => { const s = d.staff.find(x => x.id === staffId); if (s) s.salary = salary; return d; }); }

  return { fin, allPayments, payStaff, setActualsFrom, updateSalary, recordPayment, addBudgetLine, updateBudgetLine, deleteBudgetLine, processPayroll };
}

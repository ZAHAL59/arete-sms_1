import { useState } from 'react';
import useFinance from './useFinance';
import FeeOverview from './FeeOverview';
import StudentLedger from './StudentLedger';
import PaymentHistory from './PaymentHistory';
import Budget from './Budget';
import Payroll from './Payroll';
import Reports from './Reports';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import AppOverview from '../../components/shell/AppOverview';
import { APPS, useFinanceSummary, financeHub } from './Overview';


export default function FinancePortal() {
  const nav = useHubNav(APPS); const view = nav.page; const setView = nav.go;
  const { fin, allPayments, recordPayment, addBudgetLine, updateBudgetLine, deleteBudgetLine, processPayroll, payStaff, setActualsFrom, updateSalary } = useFinance();

  const sharedProps = { fin, allPayments, recordPayment };
  const S = useFinanceSummary(allPayments, setView);
  const entities = S.db.students.map(s => ({ id: 'su' + s.id, group: 'Students', icon: '👤', label: s.name, hint: `${s.cls} ${s.section} · ledger`, run: () => setView('students') }));

  const hub = financeHub(S, setView);
  const overviews = Object.fromEntries(APPS.map(a => [a.id, () => <AppOverview cfg={hub.cfg[a.id]} app={a} go={setView} />]));

  return (
    <PortalHub portalId="finance" apps={APPS} nav={nav} overviews={overviews}  pulse={hub.pulse} today={hub.today} upcoming={hub.upcoming} attention={S.attention} entities={entities}>
        {view==='feeoverview' && <FeeOverview   {...sharedProps}/>}
        {view==='students'  && <StudentLedger  {...sharedProps}/>}
        {view==='payments'  && <PaymentHistory {...sharedProps}/>}
        {view==='budget'    && <Budget fin={fin} allPayments={allPayments} addBudgetLine={addBudgetLine} updateBudgetLine={updateBudgetLine} deleteBudgetLine={deleteBudgetLine} setActualsFrom={setActualsFrom}/>}
        {view==='payroll'   && <Payroll allPayments={allPayments} processPayroll={processPayroll} payStaff={payStaff} updateSalary={updateSalary}/>}
        {view==='reports'   && <Reports allPayments={allPayments}/>}
    </PortalHub>
  );
}

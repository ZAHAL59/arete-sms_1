import { useState } from 'react';
import useFinance from '../finance/useFinance';
import FeeOverview from '../finance/FeeOverview';
import StudentLedger from '../finance/StudentLedger';
import PaymentHistory from '../finance/PaymentHistory';

// Fee Collection: the Fee Overview comes first (key numbers, progress, then one Collection section with a
// By grade / By category dropdown), followed by the other tabs.
export default function Fees() {
  const { allPayments, recordPayment } = useFinance();
  const [tab, setTab] = useState('overview');
  const props = { allPayments, recordPayment };

  return (
    <div>
      <div className="px-4 sm:px-6 pt-6 flex gap-1 border-b border-[#E4E4E4] mx-4 sm:mx-6 overflow-x-auto">{[['overview', 'Overview'], ['ledger', 'Student Ledger'], ['history', 'Payments']].map(([id, l]) => <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-none ${tab === id ? 'border-[#71717A] text-[#111]' : 'border-transparent text-[#666666]'}`}>{l}</button>)}</div>
      {tab === 'overview' && <FeeOverview {...props} unified />}{tab === 'ledger' && <StudentLedger {...props} />}{tab === 'history' && <PaymentHistory {...props} />}
    </div>
  );
}

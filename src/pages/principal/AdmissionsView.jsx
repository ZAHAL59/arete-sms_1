import { useState } from 'react';
import useAdmissions from '../admissions/useAdmissions';
import Pipeline from '../admissions/Pipeline';
import ApplicationList from '../admissions/ApplicationList';
import NewApplicationModal from '../admissions/modals/NewApplicationModal';
import Button from '../../components/ui/Button';

export default function AdmissionsView() {
  const A = useAdmissions();
  const [tab, setTab] = useState('pipeline'); const [newOpen, setNewOpen] = useState(false);
  return (
    <>
      <div className="px-4 sm:px-6 pt-5 flex flex-wrap items-center gap-1 border-b border-[#E4E4E4] mx-4 sm:mx-6 overflow-x-auto">
        {[['pipeline', 'Pipeline'], ['list', 'All Applications']].map(([id, l]) => <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-none ${tab === id ? 'border-[#71717A] text-[#111]' : 'border-transparent text-[#666666]'}`}>{l}</button>)}
        <Button className="sm:ml-auto mb-1.5" onClick={() => setNewOpen(true)}>+ New Application</Button>
      </div>
      {tab === 'pipeline' ? <Pipeline A={A} hideNew onNavigate={v => v === 'new' ? setNewOpen(true) : setTab(v === 'list' ? 'list' : 'pipeline')} /> : <ApplicationList A={A} />}
      {newOpen && <NewApplicationModal onSave={A.addAdmission} onClose={() => setNewOpen(false)} />}
    </>
  );
}

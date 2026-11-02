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
      <div className="px-6 pt-5 flex items-center gap-1 border-b border-[#E4E4E4] mx-6">
        {[['pipeline', 'Pipeline'], ['list', 'All Applications']].map(([id, l]) => <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-none ${tab === id ? 'border-[#C8202E] text-[#C8202E]' : 'border-transparent text-[#777]'}`}>{l}</button>)}
        <Button className="ml-auto mb-1.5" onClick={() => setNewOpen(true)}>+ New Application</Button>
      </div>
      {tab === 'pipeline' ? <Pipeline A={A} hideNew onNavigate={v => v === 'new' ? setNewOpen(true) : setTab(v === 'list' ? 'list' : 'pipeline')} /> : <ApplicationList A={A} />}
      {newOpen && <NewApplicationModal onSave={A.addAdmission} onClose={() => setNewOpen(false)} />}
    </>
  );
}

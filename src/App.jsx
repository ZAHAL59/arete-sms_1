import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndexPage          from './pages/index/IndexPage';
import PrincipalPortal    from './pages/principal/PrincipalPortal';
import PrincipalClassic   from './pages/principal/PrincipalClassic';
import TeacherPortal      from './pages/teacher/TeacherPortal';
import AdmissionsPortal   from './pages/admissions/AdmissionsPortal';
import HRPortal           from './pages/hr/HRPortal';
import FinancePortal      from './pages/finance/FinancePortal';
import HostelPortal       from './pages/hostel/HostelPortal';
import TransportPortal    from './pages/transport/TransportPortal';
import CampusPortal       from './pages/campus/CampusPortal';
import CareersPage        from './pages/careers/CareersPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<IndexPage />} />
        <Route path="/principal"  element={<PrincipalPortal />} />
        <Route path="/principal-classic" element={<PrincipalClassic />} />
        <Route path="/teacher"    element={<TeacherPortal />} />
        <Route path="/admissions" element={<AdmissionsPortal />} />
        <Route path="/hr"         element={<HRPortal />} />
        <Route path="/finance"    element={<FinancePortal />} />
        <Route path="/hostel"     element={<HostelPortal />} />
        <Route path="/transport"  element={<TransportPortal />} />
        <Route path="/campus"     element={<CampusPortal />} />
        <Route path="/careers"    element={<CareersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

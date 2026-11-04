import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import StorageNotice from './components/StorageNotice';
import IndexPage from './pages/index/IndexPage';      // the front door loads immediately; every portal below loads on demand
import NotFound from './pages/NotFound';

const PrincipalPortal  = lazy(() => import('./pages/principal/PrincipalPortal'));
const TeacherPortal    = lazy(() => import('./pages/teacher/TeacherPortal'));
const AdmissionsPortal = lazy(() => import('./pages/admissions/AdmissionsPortal'));
const HRPortal         = lazy(() => import('./pages/hr/HRPortal'));
const FinancePortal    = lazy(() => import('./pages/finance/FinancePortal'));
const HostelPortal     = lazy(() => import('./pages/hostel/HostelPortal'));
const TransportPortal  = lazy(() => import('./pages/transport/TransportPortal'));
const CampusPortal     = lazy(() => import('./pages/campus/CampusPortal'));
const CareersPage      = lazy(() => import('./pages/careers/CareersPage'));

// A crash inside one screen shows a friendly recovery card; moving to another page clears it.
function Guarded({ name, children }) {
  const { pathname, search } = useLocation();
  return <ErrorBoundary name={name} resetKey={pathname + search}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <ErrorBoundary fullPage name="app">
      <BrowserRouter>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:px-4 focus:py-2 focus:rounded-[10px] focus:bg-[#18181B] focus:text-white focus:text-[13px] focus:font-semibold focus:no-underline">Skip to main content</a>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"           element={<Guarded name="index"><IndexPage /></Guarded>} />
            <Route path="/principal"  element={<Guarded name="principal"><PrincipalPortal /></Guarded>} />
            <Route path="/teacher"    element={<Guarded name="teacher"><TeacherPortal /></Guarded>} />
            <Route path="/admissions" element={<Guarded name="admissions"><AdmissionsPortal /></Guarded>} />
            <Route path="/hr"         element={<Guarded name="hr"><HRPortal /></Guarded>} />
            <Route path="/finance"    element={<Guarded name="finance"><FinancePortal /></Guarded>} />
            <Route path="/hostel"     element={<Guarded name="hostel"><HostelPortal /></Guarded>} />
            <Route path="/transport"  element={<Guarded name="transport"><TransportPortal /></Guarded>} />
            <Route path="/campus"     element={<Guarded name="campus"><CampusPortal /></Guarded>} />
            <Route path="/careers"    element={<Guarded name="careers"><CareersPage /></Guarded>} />
            <Route path="*"           element={<NotFound />} />
          </Routes>
        </Suspense>
        <StorageNotice />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

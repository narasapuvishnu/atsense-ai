import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from './layouts/MainLayout';

// Lazy-load pages
const LandingPage   = lazy(() => import('./pages/LandingPage'));
const AnalyzerShell = lazy(() => import('./pages/AnalyzerShell'));

const PageLoader = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--at-bg-primary)',
    }}
    role="status"
    aria-label="Loading"
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: 'var(--at-indigo)',
          animation: 'rotateSlow 0.8s linear infinite',
          margin: '0 auto 1rem',
        }}
        aria-hidden="true"
      />
      <div style={{ fontSize: '0.875rem', color: 'var(--at-text-muted)' }}>Loading ATSense…</div>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/"         element={<LandingPage />} />
            <Route path="/analyzer" element={<AnalyzerShell />} />
            {/* Catch-all redirect */}
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;

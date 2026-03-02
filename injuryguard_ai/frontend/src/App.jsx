import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load pages for better error isolation
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PlayerDashboard from './pages/PlayerDashboard';
import AssessmentForm from './pages/AssessmentForm';
import TeamOverview from './pages/TeamOverview';
import ModelInsights from './pages/ModelInsights';
import DietPlan from './pages/DietPlan';
import WorkoutPlan from './pages/WorkoutPlan';
import Sidebar from './components/Sidebar';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#fff', background: '#0a0b1e', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>⚠ Runtime Error</h1>
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>The app crashed. Check the browser console for details.</p>
          <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', color: '#fbbf24', overflow: 'auto', fontSize: '12px' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#06b6d4', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const isPlayer = user?.role === 'player';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '32px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(0,242,255,0.1)', borderTop: '4px solid #00f2ff', borderRadius: '50%', animation: 'spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite' }} />
          <div style={{ position: 'absolute', inset: '10px', border: '2px solid rgba(0,242,255,0.05)', borderBottom: '2px solid #00f2ff', borderRadius: '50%', animation: 'spin 2s linear infinite reverse' }} />
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#00f2ff', textShadow: '0 0 10px rgba(0,242,255,0.3)' }}>
          InjuryGuard <span style={{ color: '#fff' }}>AI</span>
        </h3>
        <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#64748b', marginTop: '12px' }}>
          Initializing Station Protocol
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex bg-deep-black min-h-screen text-slate-100 font-['Outfit']">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-cyan/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <ErrorBoundary>
          <Routes location={location}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/player" element={<PlayerDashboard />} />
            <Route path="/assessment" element={<AssessmentForm />} />
            <Route path="/team" element={<TeamOverview />} />
            <Route path="/models" element={<ModelInsights />} />
            <Route path="/diet" element={<DietPlan />} />
            <Route path="/workout" element={<WorkoutPlan />} />
            <Route path="/" element={<Navigate to={isPlayer ? '/player' : '/dashboard'} replace />} />
            <Route path="*" element={<Navigate to={isPlayer ? '/player' : '/dashboard'} replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

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
        <div style={{ padding: '40px', color: '#fff', background: '#050505', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
          <h1 style={{ color: '#ef4444', fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 'tighter', fontStyle: 'italic', marginBottom: '24px' }}>⚠ Neural Core Critical Failure</h1>
          <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>The tactical intelligence layer has collapsed. Data-stream interrupted.</p>
          <pre style={{ background: '#121212', padding: '24px', borderRadius: '2rem', border: '1px solid rgba(255,50,50,0.1)', color: '#FF5F01', overflow: 'auto', fontSize: '14px', fontWeight: 'bold' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '24px', padding: '16px 32px', background: '#FF5F01', color: '#000', border: 'none', borderRadius: '1.5rem', cursor: 'pointer', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Re-Initialize Core
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '40px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,95,1,0.1)', borderTop: '2px solid #FF5F01', borderRadius: '50%', animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite' }} />
          <div style={{ position: 'absolute', inset: '15px', border: '1px solid rgba(255,95,1,0.05)', borderBottom: '1px solid #FF5F01', borderRadius: '50%', animation: 'spin 2s linear infinite reverse' }} />
        </div>
        <h3 style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#FF5F01', textShadow: '0 0 20px rgba(255,95,1,0.2)' }}>
          InjuryGuard <span style={{ color: '#fff' }}>AI</span>
        </h3>
        <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6em', color: '#444', marginTop: '16px' }}>
          System Authorization Active
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
    <div className="flex bg-[#050505] min-h-screen text-white font-['Outfit']">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-16 relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
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

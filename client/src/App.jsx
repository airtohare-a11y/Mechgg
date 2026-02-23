import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Nav from './components/Nav';
import { GlobalLegalFooter } from './components/Legal';
import MechBotWidget from './components/MechBotWidget';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import AnalysisResult from './pages/AnalysisResult';
import Community from './pages/Community';
import Pricing from './pages/Pricing';
import Forum, { ForumPost } from './pages/Forum';
import Messages from './pages/Messages';
import DrillPlan from './pages/DrillPlan';
import Billing from './pages/Billing';
import Report from './pages/Report';
import LegalPage from './pages/Legal';
import Privacy from './pages/Privacy';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:'5rem' }}><span className="spinner" style={{ width:'28px', height:'28px' }}/></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:'5rem' }}><span className="spinner" style={{ width:'28px', height:'28px' }}/></div>;
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Auth mode="login" />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Auth mode="register" />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/community" element={<Community />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/post/:postId" element={<ForumPost />} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/upload" element={<Guard><Upload /></Guard>} />
        <Route path="/history" element={<Guard><History /></Guard>} />
        <Route path="/analysis/:id" element={<Guard><AnalysisResult /></Guard>} />
        <Route path="/analysis/:analysisId/drills" element={<Guard><DrillPlan /></Guard>} />
        <Route path="/messages" element={<Guard><Messages /></Guard>} />
        <Route path="/billing" element={<Guard><Billing /></Guard>} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/report" element={<Guard><Report /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalLegalFooter />
      <MechBotWidget />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

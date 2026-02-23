import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export default function Nav() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const a = p => pathname === p || pathname.startsWith(p+'/') ? ' active' : '';
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">⌖ Mech.gg</Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className={'nav-link'+a('/dashboard')}>Dashboard</Link>
              <Link to="/upload" className={'nav-link'+a('/upload')}>Analyze</Link>
              <Link to="/history" className={'nav-link'+a('/history')}>History</Link>
              <Link to="/community" className={'nav-link'+a('/community')}>Community</Link>
              <Link to="/forum" className={'nav-link'+a('/forum')}>Forum</Link>
              <Link to="/messages" className={'nav-link'+a('/messages')}>Messages</Link>
            </>
          ) : (
            <>
              <Link to="/pricing" className={'nav-link'+a('/pricing')}>Pricing</Link>
              <Link to="/community" className={'nav-link'+a('/community')}>Community</Link>
              <Link to="/forum" className={'nav-link'+a('/forum')}>Forum</Link>
            </>
          )}
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--text-3)' }}>{user.analysesRemaining} left</span>
              <span className="tag tag-accent" style={{ fontSize:'0.65rem' }}>{user.planLabel}</span>
              {user.planTier === 'free' && <Link to="/pricing" className="btn btn-primary" style={{ fontSize:'0.75rem', padding:'0.3rem 0.7rem' }}>Upgrade</Link>}
              <Link to="/report" className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'0.3rem 0.7rem', color:'var(--red)' }}>Report</Link>
              <Link to="/billing" className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'0.3rem 0.7rem' }}>Billing</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'0.3rem 0.7rem' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

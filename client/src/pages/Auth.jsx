import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth({ mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedToS, setAgreedToS] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (!isLogin && (!agreedToS || !agreedAge)) { setError('You must confirm your age and accept the Terms of Use to register.'); setLoading(false); return; }
      if (isLogin) await login(email, password);
      else await register(email, password, name);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page fade-in" style={{ maxWidth:'420px' }}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'1.8rem', color:'var(--accent)', marginBottom:'0.5rem' }}>⌖</div>
        <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:800 }}>{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.35rem' }}>{isLogin ? 'Sign in to Mech.gg' : 'Start free — 3 analyses per month'}</p>
      </div>
      <div className="card">
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {!isLogin && (
            <div className="form-group">
              <label className="label">Display Name</label>
              <input className="input" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your gamer tag" required minLength={2} maxLength={40} disabled={loading}/>
            </div>
          )}
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required disabled={loading}/>
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={isLogin?'Your password':'Min. 8 characters'} required minLength={8} disabled={loading}/>
          </div>
          {!isLogin && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', padding:'0.875rem', background:'var(--bg-elevated)', borderRadius:'var(--r)', fontSize:'0.8rem' }}>
              <label style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', cursor:'pointer', lineHeight:1.5 }}>
                <input type="checkbox" checked={agreedAge} onChange={e=>setAgreedAge(e.target.checked)} style={{ marginTop:'2px', flexShrink:0 }}/>
                <span style={{ color:'var(--text-2)' }}>I confirm I am <strong style={{ color:'var(--text)' }}>18 years of age or older</strong>, or I am between 13–17 and have <strong style={{ color:'var(--text)' }}>active parental consent and supervision</strong>. I am not under 13.</span>
              </label>
              <label style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', cursor:'pointer', lineHeight:1.5 }}>
                <input type="checkbox" checked={agreedToS} onChange={e=>setAgreedToS(e.target.checked)} style={{ marginTop:'2px', flexShrink:0 }}/>
                <span style={{ color:'var(--text-2)' }}>I have read and agree to the <a href="/legal" target="_blank" style={{ color:'var(--accent)' }}>Terms of Use and Refund Policy</a>. I understand analysis results are statistical estimates, not professional coaching.</span>
              </label>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding:'0.75rem', fontSize:'1rem', marginTop:'0.25rem' }}>
            {loading ? <><span className="spinner"/> {isLogin?'Signing in...':'Creating account...'}</> : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'var(--text-3)' }}>
          {isLogin ? <>No account? <Link to="/register" style={{ color:'var(--accent)' }}>Sign up free</Link></> : <>Have an account? <Link to="/login" style={{ color:'var(--accent)' }}>Sign in</Link></>}
        </p>
      </div>
    </div>
  );
}

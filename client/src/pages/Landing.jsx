import AdSpot from '../components/AdSpot';
import { Link } from 'react-router-dom';
const CATS = [
  { emoji:'🎯', label:'FPS / Shooter', color:'#6ee7f7', desc:'Flick accuracy, spread control, tracking consistency' },
  { emoji:'🏎️', label:'Racing', color:'#fb923c', desc:'Braking points, apex precision, lap consistency' },
  { emoji:'⚽', label:'Sports', color:'#4ade80', desc:'Decision speed, input timing, pressure performance' },
  { emoji:'⚔️', label:'Strategy / MOBA', color:'#a78bfa', desc:'APM, decision rhythm, resource efficiency' },
  { emoji:'👊', label:'Fighting', color:'#f87171', desc:'Input precision, combos, punish accuracy' },
];
export default function Landing() {
  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 1.5rem' }}>
      {/* Hero */}
      <div style={{ textAlign:'center', padding:'5rem 0 3rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.3rem 0.875rem', borderRadius:'100px', background:'var(--accent-bg)', border:'1px solid var(--accent-glow)', fontSize:'0.78rem', color:'var(--accent)', fontFamily:'var(--mono)', marginBottom:'2rem', letterSpacing:'0.05em' }}>
          ⌖ MECHANICAL ANALYSIS FOR COMPETITIVE GAMERS
        </div>
        <h1 style={{ fontFamily:'var(--mono)', fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:900, lineHeight:1.1, marginBottom:'1.25rem', letterSpacing:'-0.02em' }}>
          <span style={{ background:'linear-gradient(135deg,var(--text) 0%,var(--accent) 60%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Know exactly what</span>
          <br/><span>to fix in your game.</span>
        </h1>
        <p style={{ fontSize:'1.05rem', color:'var(--text-2)', maxWidth:'560px', margin:'0 auto 2.5rem', lineHeight:1.7 }}>
          Upload a gameplay clip. Get a statistical mechanical breakdown tailored to your game — FPS, racing, sports, strategy, or fighting. Track habits, spot patterns, and improve session over session.
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding:'0.875rem 2rem', fontSize:'1rem' }}>Get Started Free</Link>
          <Link to="/pricing" className="btn btn-secondary" style={{ padding:'0.875rem 2rem', fontSize:'1rem' }}>View Plans</Link>
        </div>
        <p style={{ marginTop:'1rem', fontSize:'0.82rem', color:'var(--text-3)' }}>3 free analyses per month · No credit card · All platforms</p>
      </div>
      <AdSpot slot="top-banner" page="landing" style={{ marginBottom:'2rem' }}/>
      <div style={{ display:'none' }}>
      </div>

      {/* Categories */}
      <div style={{ padding:'3rem 0' }}>
        <p className="section-label" style={{ textAlign:'center', marginBottom:'1.5rem' }}>5 Game Categories Supported</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:'1rem' }}>
          {CATS.map(c => (
            <div key={c.label} className="card" style={{ textAlign:'center', padding:'1.5rem 1rem', borderColor:c.color+'30', background:c.color+'06' }}>
              <div style={{ fontSize:'1.75rem', marginBottom:'0.5rem' }}>{c.emoji}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.78rem', fontWeight:700, color:c.color, marginBottom:'0.35rem' }}>{c.label}</div>
              <div style={{ fontSize:'0.77rem', color:'var(--text-3)', lineHeight:1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding:'3rem 0', borderTop:'1px solid var(--border)' }}>
        <p className="section-label" style={{ textAlign:'center', marginBottom:'2rem' }}>How It Works</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'2rem' }}>
          {[
            ['01','Upload a clip','Record from any platform — PC, Xbox, PlayStation, mobile. Drop it here in MP4, MOV, AVI, WebM, or MKV.'],
            ['02','Statistical analysis engine','The engine scores your specific category — tracking patterns for FPS, braking consistency for racing, input rhythm for sports. Results are estimates, not real-time video AI.'],
            ['03','Get coaching-style feedback','Habit detection surfaces patterns to work on. Track improvement across sessions with trend charts and session comparisons.'],
          ].map(([n,t,d]) => (
            <div key={n}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'2.2rem', fontWeight:900, color:'var(--accent)', opacity:0.25, marginBottom:'0.5rem' }}>{n}</div>
              <h3 style={{ fontFamily:'var(--mono)', fontSize:'0.9rem', fontWeight:700, marginBottom:'0.5rem' }}>{t}</h3>
              <p style={{ fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1rem', padding:'3rem 0', borderTop:'1px solid var(--border)' }}>
        {[
          ['🔒','Zero Video Storage','Your clip is analyzed and permanently deleted the moment analysis completes. Only your scores are stored.','var(--green)'],
          ['🎮','All Platforms','Upload from PC, Xbox, PlayStation, or mobile. Supports MP4, MOV, AVI, WebM, and MKV up to 500MB.','var(--accent)'],
          ['📈','Track Improvement','History, trend charts, and personal bests across every session and game.','var(--purple)'],
        ].map(([icon,title,desc,color]) => (
          <div key={title} className="card">
            <div style={{ fontSize:'1.4rem', marginBottom:'0.75rem' }}>{icon}</div>
            <h3 style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', fontWeight:700, color, marginBottom:'0.4rem' }}>{title}</h3>
            <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign:'center', padding:'3rem 0 5rem', borderTop:'1px solid var(--border)' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1.6rem', fontWeight:800, marginBottom:'0.75rem' }}>Start analyzing your gameplay today</h2>
        <p style={{ color:'var(--text-2)', marginBottom:'2rem' }}>Free to start. No credit card required.</p>
        <Link to="/register" className="btn btn-primary" style={{ padding:'0.875rem 2.5rem', fontSize:'1rem' }}>Create Free Account</Link>
      </div>
    </div>
  );
}

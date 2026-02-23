import AdSpot from '../components/AdSpot';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { DisclaimerBanner } from '../components/Legal';

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    period: 'forever',
    color: 'var(--text-2)',
    analyses: '3 / month',
    featured: false,
    badge: null,
    description: 'Try Mech.gg and see what mechanical analysis looks like. Perfect for casual players who want to understand their gameplay basics.',
    features: [
      '3 analyses per month',
      'All 5 game categories (27 games)',
      'Mechanical Index score',
      'Habit detection & coaching notes',
      'Session history',
      'Community & Forum access',
    ],
    notIncluded: ['Drill plans','Trend charts','Priority processing','Coach profile'],
  },
  {
    id: 'starter',
    label: 'Starter',
    price: '$4.99',
    period: '/ month',
    color: 'var(--green)',
    analyses: '15 / month',
    featured: false,
    badge: 'GREAT VALUE',
    description: 'For players who want to actively improve. Enough analyses to track progress across multiple games each month.',
    features: [
      '15 analyses per month',
      'All 5 game categories',
      'Mechanical Index + dimension scores',
      'Habit detection & coaching notes',
      '4-week drill plans',
      'Trend charts & personal bests',
      'Session history & comparison',
      'Community & Forum access',
    ],
    notIncluded: ['Coach profile listing'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$9.99',
    period: '/ month',
    color: 'var(--accent)',
    analyses: '50 / month',
    featured: true,
    badge: 'MOST POPULAR',
    description: 'For serious players grinding ranked or preparing for competition. Enough analyses to review every meaningful session.',
    features: [
      '50 analyses per month',
      'All 5 game categories',
      'Full mechanical breakdown',
      'Habit detection & coaching notes',
      '4-week drill plans',
      'Trend charts & progress tracking',
      'Session comparison (before/after)',
      'Timeline event analysis',
      'Priority processing',
      'Community & Forum access',
    ],
    notIncluded: ['Coach profile listing'],
  },
  {
    id: 'paypera',
    label: 'Pay Per Analysis',
    price: '$1.99',
    period: 'per analysis',
    color: 'var(--yellow)',
    analyses: 'As needed',
    featured: false,
    badge: 'FLEXIBLE',
    description: 'No monthly commitment. Buy analyses one at a time. Great for players who analyze occasionally or want to test before subscribing.',
    features: [
      'No monthly fee',
      'Pay only when you analyze',
      '$1.99 per clip',
      'Full analysis results',
      'Habit detection & coaching notes',
      'Drill plans per analysis',
      'Trend charts (if multiple)',
      'Credits never expire',
    ],
    notIncluded: ['Coach profile listing'],
  },
  {
    id: 'coach',
    label: 'Coach',
    price: '$49.99',
    period: '/ month',
    color: 'var(--purple)',
    analyses: '200 / month',
    featured: false,
    badge: 'FOR PROFESSIONALS',
    description: 'Built for coaches who use Mech.gg as a professional tool. Analyze your clients\' clips, track their progress, and grow your coaching business.',
    features: [
      '200 analyses per month',
      'All 5 game categories',
      'Full analysis suite',
      'Coach profile listing in directory',
      'Verified coach badge',
      'Client progress tracking',
      'Priority processing',
      'Community Coach badge',
      'Forum coach flair',
      'Direct message from students',
      'Upvote ranking in coach directory',
    ],
    notIncluded: [],
    coachNote: true,
  },
  {
    id: 'team',
    label: 'Team',
    price: '$99.99',
    period: '/ month',
    color: 'var(--orange)',
    analyses: 'Unlimited',
    featured: false,
    badge: 'BEST FOR ORGS',
    description: 'For esports organizations, academies, and content teams. Unlimited analyses, multi-seat access, and everything in Coach — for your entire roster.',
    features: [
      'Unlimited analyses',
      'Up to 15 team member seats',
      'All Coach features for all members',
      'Shared team dashboard',
      'Roster-wide trend tracking',
      'Bulk clip analysis',
      'Dedicated support contact',
      'Organization badge & branding',
      'Early access to new features',
      'Custom onboarding session',
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState('');
  const [msg, setMsg] = useState({ type:'', text:'' });
  const [expanded, setExpanded] = useState(null);

  const upgrade = async plan => {
    if (!user) return;
    setLoading(plan); setMsg({ type:'', text:'' });
    try {
      await api.upgrade(plan);
      await refresh();
      setMsg({ type:'success', text:'Plan updated to ' + plan + '!' });
    } catch (err) { setMsg({ type:'error', text: err.message }); }
    finally { setLoading(''); }
  };

  return (
    <div className="page fade-in">
      <AdSpot slot="top-banner" page="pricing" style={{ marginBottom:'1.5rem' }}/>
      <DisclaimerBanner type="pricing" />

      <div style={{ textAlign:'center', marginBottom:'3rem' }}>
        <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.75rem', fontWeight:800, marginBottom:'0.5rem' }}>Choose Your Plan</h1>
        <p style={{ color:'var(--text-2)', maxWidth:'520px', margin:'0 auto', lineHeight:1.7 }}>
          Start free with 3 analyses. Upgrade when you're ready to get serious about improvement.
        </p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`} style={{ maxWidth:'500px', margin:'0 auto 2rem' }}>{msg.text}</div>}

      {/* Plan grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1.25rem', marginBottom:'3rem' }}>
        {PLANS.map(p => (
          <div key={p.id} style={{ background:'var(--bg-card)', border:'2px solid', borderColor:p.featured?p.color:'var(--border)', borderRadius:'var(--r-lg)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', boxShadow:p.featured?`0 0 30px ${p.color}18`:undefined, transition:'border-color 0.2s' }}
            onMouseEnter={e=>{ if(!p.featured) e.currentTarget.style.borderColor=p.color; }}
            onMouseLeave={e=>{ if(!p.featured) e.currentTarget.style.borderColor='var(--border)'; }}>

            {/* Badge */}
            {p.badge && <div style={{ background:p.color, color: p.color==='var(--yellow)'||p.color==='var(--green)'?'#000':'#000', fontFamily:'var(--mono)', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.08em', padding:'0.25rem 0', textAlign:'center' }}>{p.badge}</div>}

            <div style={{ padding:'1.5rem', flex:1, display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Header */}
              <div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', color:p.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.35rem' }}>{p.label}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem', marginBottom:'0.25rem' }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'1.9rem', fontWeight:900 }}>{p.price}</span>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>{p.period}</span>
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.75rem', color:p.color }}>{p.analyses} analyses</div>
              </div>

              {/* Description */}
              <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.6 }}>{p.description}</p>

              {/* Coach note */}
              {p.coachNote && (
                <div style={{ padding:'0.75rem', background:'var(--purple-bg)', border:'1px solid rgba(167,139,250,0.25)', borderRadius:'var(--r)', fontSize:'0.78rem', color:'var(--text-2)', lineHeight:1.6 }}>
                  <strong style={{ color:'var(--purple)' }}>💰 Earn with Mech.gg:</strong> List yourself in our Coach Directory. Students can find and contact you directly. Use your 200 monthly analyses to review client clips and deliver professional-grade feedback. Some coaches charge $25–$100/hr for VOD review sessions — Mech.gg gives you tools to support that workflow. Individual results vary. No specific income is guaranteed.
                  <div style={{ marginTop:'0.5rem', fontSize:'0.72rem', color:'var(--text-3)', borderTop:'1px solid rgba(167,139,250,0.15)', paddingTop:'0.5rem' }}>
                    ⚠ All payment arrangements between coaches and students are made independently outside Mech.gg. Mech.gg is not a party to any financial transaction between coaches and students and accepts no liability for such arrangements. See our <Link to="/legal" style={{ color:'var(--purple)' }}>Terms</Link> for full details.
                  </div>
                </div>
              )}

              {/* Features */}
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                  {p.features.map(f => (
                    <div key={f} style={{ fontSize:'0.8rem', color:'var(--text-2)', display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                      <span style={{ color:p.color, flexShrink:0, marginTop:'1px' }}>✓</span>{f}
                    </div>
                  ))}
                  {p.notIncluded?.map(f => (
                    <div key={f} style={{ fontSize:'0.78rem', color:'var(--text-3)', display:'flex', gap:'0.5rem', alignItems:'flex-start', opacity:0.5 }}>
                      <span style={{ flexShrink:0 }}>✗</span>{f}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              {user ? (
                user.planTier === p.id ? (
                  <div className="btn btn-ghost" style={{ textAlign:'center', cursor:'default', opacity:0.6 }}>Current Plan</div>
                ) : (
                  <button className="btn" onClick={()=>upgrade(p.id)} disabled={!!loading}
                    style={{ background:p.featured?p.color:'var(--bg-elevated)', color:p.featured?'#000':'var(--text)', border:p.featured?'none':'1px solid var(--border-hi)', fontWeight:p.featured?700:500, padding:'0.65rem' }}>
                    {loading===p.id ? <span className="spinner"/> : p.id==='free'?'Switch to Free':p.id==='paypera'?'Buy Credits':'Upgrade'}
                  </button>
                )
              ) : (
                <Link to="/register" className="btn"
                  style={{ background:p.featured?p.color:'var(--bg-elevated)', color:p.featured?'#000':'var(--text)', border:p.featured?'none':'1px solid var(--border-hi)', fontWeight:p.featured?700:500, textAlign:'center', padding:'0.65rem' }}>
                  {p.id === 'free' ? 'Start Free' : 'Get Started'}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment note */}
      <div className="card" style={{ textAlign:'center', marginBottom:'2rem', padding:'1.5rem', maxWidth:'600px', margin:'0 auto 2rem' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'0.75rem', color:'var(--accent)', marginBottom:'0.5rem' }}>PAYMENT & BILLING</div>
        <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7, marginBottom:'0.75rem' }}>
          Payment processing is coming soon via Stripe. To upgrade now, email us directly and we'll arrange your plan manually.
        </p>
        <a href="mailto:mechggofficial@gmail.com" className="btn btn-primary">mechggofficial@gmail.com</a>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth:'700px', margin:'0 auto 2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, textAlign:'center', marginBottom:'1.5rem' }}>Common Questions</h2>
        {[
          ['What counts as one analysis?','One uploaded clip = one analysis. The clip is deleted immediately after. Only your scores are stored.'],
          ['Do unused analyses roll over?','No. Monthly allocations reset on the 1st of each month.'],
          ['Can I cancel anytime?','Yes. Cancel before your next billing date and you keep access until the end of the period.'],
          ['How do Pay Per Analysis credits work?','You buy credits that never expire. Each analysis deducts one credit. No monthly commitment.'],
          ['How do coach/student payments work?','All payment arrangements between coaches and students are made privately and independently outside of Mech.gg. We do not process, hold, or facilitate those transactions. See our Terms for full details.'],
          ['What is your refund policy?','Refunds are reviewed case-by-case. See our full Refund Policy at /legal or email mechggofficial@gmail.com.'],
        ].map(([q,a]) => (
          <div key={q} style={{ borderBottom:'1px solid var(--border)', padding:'1rem 0' }}>
            <div style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:'0.4rem', cursor:'pointer' }}>{q}</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7 }}>{a}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--text-3)', lineHeight:1.8, maxWidth:'600px', margin:'0 auto' }}>
        Mech.gg is intended for users 18 and older. Users aged 13–17 may use the service with active parental supervision.
        All plan features subject to our <Link to="/legal" style={{ color:'var(--accent)' }}>Terms of Use</Link>.
        Questions? <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a>
      </div>
    </div>
  );
}

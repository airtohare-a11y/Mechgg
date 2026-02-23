import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

const PLANS = [
  { id:'pro', label:'Pro', price:'$9/mo', features:['30 analyses/month','Trend charts','Priority processing'] },
  { id:'coach', label:'Coach', price:'$19/mo', features:['60 analyses/month','Coach profile listing','Community badge'] },
  { id:'team', label:'Team', price:'$49/mo', features:['Unlimited analyses','Up to 10 members','Dedicated support'] },
];

export default function Billing() {
  const { user, refresh } = useAuth();
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [refundForm, setRefundForm] = useState({ paymentId:'', reason:'' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type:'', text:'' });

  useEffect(() => {
    Promise.all([
      fetch('/api/payments/history', { headers:{ Authorization:'Bearer '+localStorage.getItem('mechgg_token') }}).then(r=>r.json()),
      fetch('/api/payments/refunds', { headers:{ Authorization:'Bearer '+localStorage.getItem('mechgg_token') }}).then(r=>r.json()),
    ]).then(([p, r]) => {
      setPayments(p.payments||[]);
      setRefunds(r.refunds||[]);
    }).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const requestUpgrade = async plan => {
    setSubmitting(true); setMsg({ type:'', text:'' });
    try {
      const res = await fetch('/api/payments/create', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('mechgg_token') }, body:JSON.stringify({ plan }) });
      const d = await res.json();
      setMsg({ type:'info', text: d.message + ' Payment ID: ' + d.paymentId });
    } catch(e) { setMsg({ type:'error', text:e.message }); }
    finally { setSubmitting(false); }
  };

  const submitRefund = async e => {
    e.preventDefault();
    if (!refundForm.paymentId || !refundForm.reason.trim()) return setMsg({ type:'error', text:'Please select a payment and provide a reason.' });
    setSubmitting(true); setMsg({ type:'', text:'' });
    try {
      const res = await fetch('/api/payments/refund', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('mechgg_token') }, body:JSON.stringify(refundForm) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg({ type:'success', text: d.message });
      setRefundForm({ paymentId:'', reason:'' });
    } catch(e) { setMsg({ type:'error', text:e.message }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page fade-in" style={{ maxWidth:'800px' }}>
      <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.35rem' }}>Billing & Payments</h1>
      <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginBottom:'2rem' }}>Manage your subscription, view payment history, and request refunds.</p>

      {/* Current plan */}
      <div className="card" style={{ marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom:'0.35rem' }}>Current Plan</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'1.2rem', fontWeight:700, color:'var(--accent)' }}>{user?.planLabel}</div>
          <div style={{ fontSize:'0.82rem', color:'var(--text-3)', marginTop:'0.2rem' }}>{user?.analysesThisMonth} of {user?.analysesLimit} analyses used this month</div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <Link to="/pricing" className="btn btn-secondary">View Plans</Link>
          <a href="mailto:mechggofficial@gmail.com" className="btn btn-ghost">Contact Support</a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
        {['overview','upgrade','refund','account'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'0.4rem 0.875rem', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'0.78rem', color:tab===t?(t==='account'?'var(--red)':'var(--accent)'):'var(--text-3)', borderBottom:tab===t?`2px solid ${t==='account'?'var(--red)':'var(--accent)'}`:'2px solid transparent', marginBottom:'-1px', textTransform:'capitalize' }}>{t === 'account' ? '⚠ Account' : t}</button>
        ))}
      </div>

      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':msg.type==='success'?'success':'info'}`} style={{ marginBottom:'1rem' }}>{msg.text}</div>}

      {tab === 'overview' && (
        <div>
          <div className="section-label" style={{ marginBottom:'0.75rem' }}>Payment History</div>
          {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><span className="spinner"/></div> :
          payments.length === 0 ? <div className="card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-3)' }}>No payments on record.</div> :
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {payments.map(p=>(
              <div key={p.id} className="card" style={{ padding:'0.875rem 1rem', display:'grid', gridTemplateColumns:'1fr auto auto', gap:'1rem', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{p.plan_tier} plan</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{new Date(p.created_at*1000).toLocaleDateString()} · ID: {p.id.slice(0,8)}</div>
                </div>
                <div style={{ fontFamily:'var(--mono)', color:'var(--green)' }}>${(p.amount_cents/100).toFixed(2)}</div>
                <div>
                  <span className={`tag tag-${p.status==='completed'?'green':p.status==='pending'?'orange':'red'}`} style={{ fontSize:'0.65rem' }}>{p.status}</span>
                  {p.refund_status && <span className="tag tag-purple" style={{ fontSize:'0.65rem', marginLeft:'0.25rem' }}>{p.refund_status}</span>}
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}

      {tab === 'upgrade' && (
        <div>
          <div className="section-label" style={{ marginBottom:'0.75rem' }}>Upgrade Plan</div>
          <div className="alert alert-info" style={{ marginBottom:'1rem' }}>
            Payment processing is coming soon. To upgrade now, email <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a> with your account email and desired plan.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
            {PLANS.filter(p=>p.id!==user?.planTier).map(p=>(
              <div key={p.id} className="card">
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', fontWeight:700, color:'var(--accent)', marginBottom:'0.25rem' }}>{p.label}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'1.3rem', fontWeight:800, marginBottom:'0.75rem' }}>{p.price}</div>
                {p.features.map(f=><div key={f} style={{ fontSize:'0.8rem', color:'var(--text-2)', marginBottom:'0.25rem' }}>✓ {f}</div>)}
                <button className="btn btn-primary" style={{ width:'100%', marginTop:'0.875rem' }} onClick={()=>requestUpgrade(p.id)} disabled={submitting}>
                  {submitting?<span className="spinner"/>:'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'refund' && (
        <div>
          <div className="section-label" style={{ marginBottom:'0.75rem' }}>Request a Refund</div>
          <div className="card" style={{ marginBottom:'1rem', fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7 }}>
            <strong style={{ color:'var(--text)' }}>Refund Policy:</strong> Mech.gg processes refunds on a case-by-case basis. Only viable refund requests will be approved. Review our full <Link to="/legal" style={{ color:'var(--accent)' }}>Refund Policy</Link> before submitting. Allow 3–5 business days for review.
          </div>
          {payments.filter(p=>p.status==='completed'&&!p.refund_status).length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-3)' }}>No eligible payments for refund.<br/>Questions? Email <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a></div>
          ) : (
            <form onSubmit={submitRefund} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group">
                <label className="label">Select Payment</label>
                <select className="input" value={refundForm.paymentId} onChange={e=>setRefundForm({...refundForm,paymentId:e.target.value})} required>
                  <option value="">Choose a payment...</option>
                  {payments.filter(p=>p.status==='completed'&&!p.refund_status).map(p=>(
                    <option key={p.id} value={p.id}>${(p.amount_cents/100).toFixed(2)} — {p.plan_tier} plan — {new Date(p.created_at*1000).toLocaleDateString()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Reason for Refund</label>
                <textarea className="input" value={refundForm.reason} onChange={e=>setRefundForm({...refundForm,reason:e.target.value})} placeholder="Please describe why you are requesting a refund..." rows={4} maxLength={1000} required/>
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting} style={{ alignSelf:'flex-start' }}>
                {submitting?<span className="spinner"/>:'Submit Refund Request'}
              </button>
            </form>
          )}
          {refunds.length > 0 && (
            <div style={{ marginTop:'2rem' }}>
              <div className="section-label" style={{ marginBottom:'0.75rem' }}>Previous Refund Requests</div>
              {refunds.map(r=>(
                <div key={r.id} className="card" style={{ padding:'0.875rem', marginBottom:'0.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
                    <span style={{ fontSize:'0.875rem' }}>${(r.amount_cents/100).toFixed(2)} — {r.plan_tier} plan</span>
                    <span className={`tag tag-${r.status==='approved'?'green':r.status==='denied'?'red':'orange'}`} style={{ fontSize:'0.65rem' }}>{r.status}</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>{r.reason}</div>
                  {r.admin_note && <div style={{ fontSize:'0.78rem', color:'var(--accent)', marginTop:'0.35rem' }}>Response: {r.admin_note}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'account' && (
        <div>
          <div className="section-label" style={{ marginBottom:'0.75rem', color:'var(--red)' }}>Danger Zone</div>
          <div className="card" style={{ border:'1px solid rgba(248,113,113,0.3)', marginBottom:'1rem' }}>
            <h3 style={{ fontFamily:'var(--mono)', fontSize:'0.9rem', fontWeight:700, color:'var(--red)', marginBottom:'0.5rem' }}>Delete Account</h3>
            <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7, marginBottom:'1rem' }}>
              Permanently deletes your account, all analyses, messages, posts, and personal data. Payment records are retained for 7 years as required by law. <strong style={{ color:'var(--text)' }}>This cannot be undone.</strong>
            </p>
            <div className="form-group" style={{ marginBottom:'0.875rem' }}>
              <label className="label" style={{ color:'var(--red)' }}>Type DELETE to confirm</label>
              <input className="input" value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} placeholder="DELETE" style={{ borderColor:'rgba(248,113,113,0.3)' }}/>
            </div>
            <button className="btn btn-danger" disabled={deleteConfirm !== 'DELETE' || deleting} onClick={async () => {
              setDeleting(true);
              try {
                await fetch('/api/auth/account', { method:'DELETE', headers:{ Authorization:'Bearer '+localStorage.getItem('mechgg_token') }});
                localStorage.removeItem('mechgg_token');
                window.location.href = '/';
              } catch(e) { setMsg({ type:'error', text:'Deletion failed. Email mechggofficial@gmail.com.' }); setDeleting(false); }
            }}>
              {deleting ? <span className="spinner"/> : 'Permanently Delete My Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

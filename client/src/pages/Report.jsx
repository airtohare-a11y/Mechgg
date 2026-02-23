import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { timeAgo } from '../utils/api';

const REPORT_TYPES = [
  { id:'coach_nonpayment', label:'Coach Did Not Pay / Honor Agreement', forRole:'student', icon:'💸' },
  { id:'student_nonpayment', label:'Student Did Not Pay / Honor Agreement', forRole:'coach', icon:'💸' },
  { id:'harassment', label:'Harassment or Abusive Behavior', forRole:'both', icon:'🚨' },
  { id:'fraud', label:'Fraud or Misrepresentation', forRole:'both', icon:'⚠️' },
  { id:'scam', label:'Scam or Unauthorized Charges', forRole:'both', icon:'🔴' },
  { id:'inappropriate_content', label:'Inappropriate Content or Conduct', forRole:'both', icon:'🚫' },
  { id:'other', label:'Other Violation', forRole:'both', icon:'📋' },
];

const STATUS_COLORS = { open:'var(--yellow)', reviewing:'var(--accent)', resolved:'var(--green)', dismissed:'var(--text-3)' };

export default function Report() {
  const { user } = useAuth();
  const [tab, setTab] = useState('new');
  const [form, setForm] = useState({ reportedUserId:'', reportType:'', subject:'', description:'', evidence:'' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type:'', text:'' });
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/reports/my-reports', { headers:{ Authorization:'Bearer '+localStorage.getItem('mechgg_token') }});
      const d = await res.json();
      setMyReports(d.reports||[]);
    } catch {}
    finally { setLoadingReports(false); }
  };

  useEffect(() => { if (tab==='history') loadReports(); }, [tab]);

  const submit = async e => {
    e.preventDefault();
    if (!form.reportedUserId.trim()||!form.reportType||!form.subject.trim()||!form.description.trim())
      return setMsg({ type:'error', text:'Please fill in all required fields.' });
    setSubmitting(true); setMsg({ type:'', text:'' });
    try {
      const res = await fetch('/api/reports', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('mechgg_token') }, body:JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg({ type:'success', text: d.message });
      setForm({ reportedUserId:'', reportType:'', subject:'', description:'', evidence:'' });
    } catch(err) { setMsg({ type:'error', text:err.message }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page fade-in" style={{ maxWidth:'750px' }}>
      <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.25rem' }}>Report a User</h1>
      <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginBottom:'2rem' }}>Report coaches or students for violations including non-payment, harassment, fraud, or misconduct.</p>

      {/* Important notice */}
      <div style={{ padding:'1rem', background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:'var(--r)', marginBottom:'2rem', fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7 }}>
        <strong style={{ color:'var(--yellow)', fontFamily:'var(--mono)', fontSize:'0.72rem', letterSpacing:'0.05em' }}>⚖️ IMPORTANT — PAYMENT DISCLAIMER</strong>
        <p style={{ marginTop:'0.5rem' }}>All financial transactions between coaches and students occur <strong style={{ color:'var(--text)' }}>entirely outside of Mech.gg</strong>. Mech.gg is not a party to any payment arrangement, does not process or hold funds between users, and accepts no liability for financial disputes between coaches and students.</p>
        <p style={{ marginTop:'0.5rem' }}>This report system exists to help maintain community standards. Filing a report does not guarantee any outcome. For legal or financial disputes, consult appropriate legal counsel. Contact us at <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a> for urgent matters.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
        {[['new','File a Report'],['history','My Reports']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'0.4rem 0.875rem', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'0.78rem', color:tab===t?'var(--accent)':'var(--text-3)', borderBottom:tab===t?'2px solid var(--accent)':'2px solid transparent', marginBottom:'-1px' }}>{l}</button>
        ))}
      </div>

      {tab === 'new' && (
        <div className="card">
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>

            <div className="form-group">
              <label className="label">Report Type *</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                {REPORT_TYPES.map(rt => (
                  <label key={rt.id} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 0.75rem', borderRadius:'var(--r)', border:'1px solid', borderColor:form.reportType===rt.id?'var(--accent)':'var(--border)', background:form.reportType===rt.id?'var(--accent-bg)':'var(--bg-elevated)', cursor:'pointer', fontSize:'0.78rem', color:form.reportType===rt.id?'var(--text)':'var(--text-2)', transition:'all 0.15s' }}>
                    <input type="radio" name="reportType" value={rt.id} checked={form.reportType===rt.id} onChange={e=>setForm({...form,reportType:e.target.value})} style={{ display:'none' }}/>
                    <span>{rt.icon}</span>
                    <span style={{ lineHeight:1.3 }}>{rt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Reported User ID *</label>
              <input className="input" value={form.reportedUserId} onChange={e=>setForm({...form,reportedUserId:e.target.value})} placeholder="Paste the user's ID (found on their profile or coach listing)" required/>
              <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>You can find a user's ID on their coach profile page or by contacting <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a></span>
            </div>

            <div className="form-group">
              <label className="label">Subject *</label>
              <input className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Brief summary of the issue" maxLength={150} required/>
            </div>

            <div className="form-group">
              <label className="label">Description *</label>
              <textarea className="input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the situation in detail. Include dates, amounts (if financial), and any relevant context..." rows={5} maxLength={2000} required style={{ minHeight:'120px' }}/>
            </div>

            <div className="form-group">
              <label className="label">Evidence (optional)</label>
              <textarea className="input" value={form.evidence} onChange={e=>setForm({...form,evidence:e.target.value})} placeholder="Paste any relevant links, screenshot descriptions, message excerpts, or other evidence..." rows={3} maxLength={1000}/>
              <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>Do not paste personal financial information. Describe evidence you can provide if contacted.</span>
            </div>

            {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}

            <div style={{ padding:'0.75rem', background:'var(--bg-elevated)', borderRadius:'var(--r)', fontSize:'0.75rem', color:'var(--text-3)', lineHeight:1.7 }}>
              By submitting this report you confirm the information is accurate to the best of your knowledge. Filing false reports is a violation of our Terms of Use and may result in account suspension.
            </div>

            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ padding:'0.75rem', fontSize:'0.95rem' }}>
              {submitting ? <><span className="spinner"/> Submitting...</> : '📋 Submit Report'}
            </button>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {loadingReports ? <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><span className="spinner"/></div> :
          myReports.length===0 ? (
            <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text-3)' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>✅</div>
              <p>No reports filed. We hope it stays that way!</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {myReports.map(r => (
                <div key={r.id} className="card" style={{ padding:'1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem', gap:'1rem' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:'0.2rem' }}>{r.subject}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
                        Against: {r.reported_name} · {REPORT_TYPES.find(t=>t.id===r.report_type)?.label||r.report_type} · {timeAgo(r.created_at)}
                      </div>
                    </div>
                    <span className="tag" style={{ fontSize:'0.65rem', color:STATUS_COLORS[r.status]||'var(--text-3)', borderColor:STATUS_COLORS[r.status]||'var(--border)', background:'transparent', flexShrink:0 }}>{r.status.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.6 }}>{r.description.slice(0,200)}{r.description.length>200?'...':''}</p>
                  {r.admin_note && (
                    <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.875rem', background:'var(--accent-bg)', borderRadius:'var(--r)', fontSize:'0.78rem', color:'var(--accent)', borderLeft:'3px solid var(--accent)' }}>
                      <strong>Mech.gg Response:</strong> {r.admin_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop:'2rem', textAlign:'center', fontSize:'0.78rem', color:'var(--text-3)' }}>
        For urgent safety issues contact <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a> directly.
      </div>
    </div>
  );
}

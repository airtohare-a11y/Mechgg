import AdSpot from '../components/AdSpot';
import { DisclaimerBanner } from '../components/Legal';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, timeAgo } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function Community() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('findings');
  const [coaches, setCoaches] = useState([]);
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState({ title:'', body:'', anonymous:false });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api.getFindings().then(d=>setFindings(d.findings)).finally(()=>setLoading(false));
    api.getCoaches().then(d=>setCoaches(d.coaches));
  }, []);

  const upvoteCoach = async id => {
    if (!user) return;
    try {
      await fetch('/api/community/coaches/'+id+'/upvote', { method:'POST', headers:{ Authorization:'Bearer '+localStorage.getItem('mechgg_token') }});
      setCoaches(prev => prev.map(c => c.id===id ? {...c, upvote_count:(c.upvote_count||0)+1} : c));
    } catch {}
  };

  const upvote = async id => {
    if (!user) return;
    await api.upvote(id);
    setFindings(prev=>prev.map(f=>f.id===id?{...f,upvotes:f.upvotes+(f._upvoted?-1:1),_upvoted:!f._upvoted}:f));
  };

  const post = async e => {
    e.preventDefault();
    if (!form.title.trim()||!form.body.trim()) return setError('Title and body required');
    setPosting(true); setError('');
    try {
      const fd = await api.postFinding(form);
      fetch('/api/mechbot/moderate', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('mechgg_token')}, body:JSON.stringify({ text: form.title+' '+form.body }) });
      const d = await api.getFindings();
      setFindings(d.findings);
      setForm({ title:'', body:'', anonymous:false });
      setShowPost(false);
    } catch(err) { setError(err.message); }
    finally { setPosting(false); }
  };

  return (
    <div className="page fade-in">
      <DisclaimerBanner type="community" />
      <AdSpot slot="top-banner" page="community" style={{ marginBottom:'1.5rem' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700 }}>Community</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Share findings, get coaching, learn from others</p>
        </div>
        {user && tab==='findings' && <button className="btn btn-primary" onClick={()=>setShowPost(!showPost)}>+ Post Finding</button>}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'0' }}>
        {['findings','coaches'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'0.5rem 1rem', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'0.82rem', color:tab===t?'var(--accent)':'var(--text-3)', borderBottom:tab===t?'2px solid var(--accent)':'2px solid transparent', marginBottom:'-1px', textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab==='findings' && (
        <>
          {showPost && (
            <div className="card" style={{ marginBottom:'1.5rem' }}>
              <h3 style={{ fontFamily:'var(--mono)', fontSize:'0.9rem', marginBottom:'1rem' }}>Share a Finding</h3>
              <form onSubmit={post} style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                <div className="form-group"><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Fixing right-side bias in Valorant" maxLength={120} required/></div>
                <div className="form-group"><label className="label">Body</label><textarea className="input" value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Share what you found and what helped..." rows={4} maxLength={2000} required/></div>
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.82rem', color:'var(--text-2)', cursor:'pointer' }}>
                  <input type="checkbox" checked={form.anonymous} onChange={e=>setForm({...form,anonymous:e.target.checked})}/> Post anonymously
                </label>
                {error && <div className="alert alert-error">{error}</div>}
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button className="btn btn-primary" type="submit" disabled={posting}>{posting?<span className="spinner"/>:'Post'}</button>
                  <button className="btn btn-ghost" type="button" onClick={()=>setShowPost(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? <div style={{ display:'flex', justifyContent:'center', paddingTop:'2rem' }}><span className="spinner"/></div> : findings.length===0 ? (
            <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text-3)' }}>No findings yet. Be the first to share one!</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {findings.map(f=>(
                <div key={f.id} className="card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
                    <div style={{ flex:1 }}>
                      <h3 style={{ fontSize:'0.95rem', fontWeight:600, marginBottom:'0.35rem' }}>{f.title}</h3>
                      <p style={{ fontSize:'0.84rem', color:'var(--text-2)', lineHeight:1.6, marginBottom:'0.75rem' }}>{f.body}</p>
                      <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', fontSize:'0.75rem', color:'var(--text-3)' }}>
                        <span>{f.author_name}</span>
                        <span>·</span>
                        <span>{timeAgo(f.created_at)}</span>
                        {f.game_name && <><span>·</span><span>{f.cover_emoji} {f.game_name}</span></>}
                      </div>
                    </div>
                    <button onClick={()=>upvote(f.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'0.4rem 0.6rem', cursor:user?'pointer':'default', color:f._upvoted?'var(--accent)':'var(--text-3)', minWidth:'44px' }}>
                      <span style={{ fontSize:'0.9rem' }}>▲</span>
                      <span style={{ fontFamily:'var(--mono)', fontSize:'0.75rem' }}>{f.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!user && <div className="alert alert-info" style={{ marginTop:'1.5rem' }}>
            <Link to="/register" style={{ color:'var(--accent)' }}>Create an account</Link> to post findings and upvote.
          </div>}
        </>
      )}

      {tab==='coaches' && (
        <div>
          {coaches.length===0 ? (
            <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
              <p style={{ color:'var(--text-2)', marginBottom:'1rem' }}>No coaches listed yet.</p>
              {user && <Link to="/pricing" style={{ color:'var(--accent)', fontSize:'0.875rem' }}>Upgrade to Coach plan to list your profile →</Link>}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
              {coaches.map(c=>(
                <div key={c.id} className="card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                    <div>
                      <div style={{ fontFamily:'var(--mono)', fontSize:'0.9rem', fontWeight:700 }}>{c.display_name}</div>
                      {c.verified && <span className="tag tag-accent" style={{ marginTop:'0.25rem' }}>Verified</span>}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem' }}>
                      <button onClick={()=>upvoteCoach(c.id)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'0.3rem 0.5rem', cursor:user?'pointer':'default', color:'var(--green)', display:'flex', flexDirection:'column', alignItems:'center', minWidth:'44px' }}>
                        <span style={{ fontSize:'0.9rem' }}>▲</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'0.72rem' }}>{c.upvote_count||0}</span>
                      </button>
                      <span style={{ fontSize:'0.62rem', color:'var(--text-3)' }}>helpful</span>
                    </div>
                  </div>
                  {c.avg_rating && <div style={{ fontSize:'0.78rem', color:'var(--yellow)', marginBottom:'0.5rem' }}>★ {c.avg_rating} ({c.review_count} reviews)</div>}
                  <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.6, marginBottom:'0.75rem' }}>{c.bio?.slice(0,160)}{c.bio?.length>160?'...':''}</p>
                  {c.rate_info && <div style={{ fontSize:'0.78rem', color:'var(--green)', marginBottom:'0.5rem' }}>{c.rate_info}</div>}
                  <div style={{ fontSize:'0.78rem', color:'var(--text-3)', marginBottom:'0.5rem' }}>{c.contact_info}</div>
                  <a href={'mailto:'+c.contact_info} className="btn btn-ghost" style={{ fontSize:'0.75rem', padding:'0.3rem 0.7rem', width:'100%', textAlign:'center', marginBottom:'0.4rem' }}>Contact Coach</a>
                  <Link to="/report" className="btn btn-ghost" style={{ fontSize:'0.7rem', padding:'0.25rem 0.5rem', width:'100%', textAlign:'center', color:'var(--red)', borderColor:'rgba(248,113,113,0.2)' }}>Report</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

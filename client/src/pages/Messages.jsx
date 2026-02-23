import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api, timeAgo } from '../utils/api';
import { DisclaimerBanner } from '../components/Legal';

export default function Messages() {
  const { user } = useAuth();
  const [tab, setTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ recipientId:'', subject:'', body:'' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const fn = tab === 'inbox' ? api.getInbox : api.getSent;
      const d = await fn();
      setMessages(d.messages);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); setSelected(null); }, [tab]);

  const open = async msg => {
    setSelected(msg);
    if (tab === 'inbox' && !msg.read) {
      await api.markRead(msg.id);
      setMessages(prev => prev.map(m => m.id===msg.id ? {...m, read:1} : m));
    }
  };

  const send = async e => {
    e.preventDefault();
    if (!form.recipientId.trim() || !form.body.trim()) return setError('Recipient ID and message body required');
    setSending(true); setError(''); setSuccess('');
    try {
      await api.sendMessage(form);
      setSuccess('Message sent!');
      setForm({ recipientId:'', subject:'', body:'' });
      setShowCompose(false);
      if (tab==='sent') load();
    } catch(err) { setError(err.message); }
    finally { setSending(false); }
  };

  const del = async id => {
    await api.deleteMessage(id);
    setMessages(prev => prev.filter(m=>m.id!==id));
    if (selected?.id===id) setSelected(null);
  };

  return (
    <div className="page fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700 }}>Messages</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Direct messages with coaches and community members</p>
        </div>
        <button className="btn btn-primary" onClick={()=>{setShowCompose(!showCompose);setError('');setSuccess('');}}>+ Compose</button>
      </div>

      <DisclaimerBanner type="messaging" />

      {showCompose && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'var(--mono)', fontSize:'0.9rem', marginBottom:'1rem' }}>New Message</h3>
          <form onSubmit={send} style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            <div className="form-group">
              <label className="label">Recipient User ID</label>
              <input className="input" value={form.recipientId} onChange={e=>setForm({...form,recipientId:e.target.value})} placeholder="Paste the recipient's user ID" required/>
              <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>You can find a user's ID on their coach profile</span>
            </div>
            <div className="form-group">
              <label className="label">Subject (optional)</label>
              <input className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Coaching inquiry" maxLength={120}/>
            </div>
            <div className="form-group">
              <label className="label">Message</label>
              <textarea className="input" value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your message..." rows={5} maxLength={2000} required/>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={sending}>{sending?<span className="spinner"/>:'Send'}</button>
              <button className="btn btn-ghost" type="button" onClick={()=>setShowCompose(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1rem', minHeight:'400px' }}>
        {/* List */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', gap:'0.25rem', marginBottom:'0.75rem' }}>
            {['inbox','sent'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:'0.4rem', background:tab===t?'var(--accent-bg)':'var(--bg-elevated)', border:'1px solid', borderColor:tab===t?'var(--accent)':'var(--border)', borderRadius:'var(--r)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'0.75rem', color:tab===t?'var(--accent)':'var(--text-3)', textTransform:'capitalize' }}>{t}</button>
            ))}
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.4rem', overflowY:'auto' }}>
            {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><span className="spinner"/></div> :
            messages.length===0 ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-3)', fontSize:'0.875rem' }}>No messages</div> :
            messages.map(m => (
              <div key={m.id} onClick={()=>open(m)} style={{ padding:'0.75rem', borderRadius:'var(--r)', border:'1px solid', borderColor:selected?.id===m.id?'var(--accent)':'var(--border)', background:selected?.id===m.id?'var(--accent-bg)':tab==='inbox'&&!m.read?'var(--bg-elevated)':'var(--bg-card)', cursor:'pointer', transition:'all 0.15s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.2rem' }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:tab==='inbox'&&!m.read?700:400, color:tab==='inbox'&&!m.read?'var(--text)':'var(--text-2)' }}>
                    {tab==='inbox'?m.sender_name:m.recipient_name}
                  </span>
                  {tab==='inbox'&&!m.read && <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)', display:'inline-block', flexShrink:0 }}/>}
                </div>
                {m.subject && <div style={{ fontSize:'0.78rem', color:'var(--text-2)', marginBottom:'0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.subject}</div>}
                <div style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{timeAgo(m.created_at)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="card">
          {!selected ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-3)', fontSize:'0.875rem' }}>Select a message to read</div>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                <div>
                  {selected.subject && <h2 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'0.35rem' }}>{selected.subject}</h2>}
                  <div style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>
                    {tab==='inbox'?`From: ${selected.sender_name}`:`To: ${selected.recipient_name}`} · {timeAgo(selected.created_at)}
                  </div>
                </div>
                <button onClick={()=>del(selected.id)} className="btn btn-danger" style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}>Delete</button>
              </div>
              <div className="divider"/>
              <p style={{ fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{selected.body}</p>
              {tab==='inbox' && (
                <div style={{ marginTop:'1.5rem' }}>
                  <button className="btn btn-secondary" onClick={()=>{setShowCompose(true);setForm({recipientId:selected.sender_id,subject:'Re: '+(selected.subject||''),body:''});}}>Reply</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

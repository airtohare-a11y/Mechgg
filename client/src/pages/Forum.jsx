import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, timeAgo } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { DisclaimerBanner } from '../components/Legal';
import AdSpot from '../components/AdSpot';

function ForumHome({ categories, onSelect }) {
  return (
    <div>
      <DisclaimerBanner type="community" />
      <AdSpot slot="top-banner" page="forum" style={{ marginBottom:'1.5rem' }}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
        {categories.map(c => (
          <div key={c.id} className="card" style={{ cursor:'pointer' }} onClick={()=>onSelect(c)}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
              <span style={{ fontSize:'1.5rem' }}>{c.icon}</span>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.95rem' }}>{c.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{c.post_count} posts</div>
              </div>
            </div>
            <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.5 }}>{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForumCategory({ category, onBack, onPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.getForumPosts(category.id).then(d=>setPosts(d.posts)).finally(()=>setLoading(false));
  }, [category.id]);
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
        <button onClick={onBack} style={{ color:'var(--text-3)', fontSize:'0.875rem', background:'none', border:'none', cursor:'pointer' }}>← Forums</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <span style={{ fontSize:'1.5rem' }}>{category.icon}</span>
          <h2 style={{ fontFamily:'var(--mono)', fontSize:'1.1rem', fontWeight:700 }}>{category.name}</h2>
        </div>
        <button className="btn btn-primary" onClick={()=>onPost(category)}>+ New Post</button>
      </div>
      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><span className="spinner"/></div> :
      posts.length===0 ? <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text-3)' }}>No posts yet. Be the first!</div> :
      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {posts.map(p=>(
          <Link key={p.id} to={`/forum/post/${p.id}`} style={{ textDecoration:'none' }}>
            <div className="card" style={{ padding:'1rem', display:'grid', gridTemplateColumns:'1fr auto', gap:'1rem', alignItems:'center' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem' }}>
                  {p.pinned && <span className="tag tag-accent" style={{ fontSize:'0.6rem' }}>PINNED</span>}
                  <span style={{ fontWeight:600, fontSize:'0.9rem' }}>{p.title}</span>
                </div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
                  by {p.author_name} · {timeAgo(p.created_at)} · {p.reply_count} replies · {p.view_count} views
                </div>
              </div>
              <div style={{ textAlign:'right', fontSize:'0.75rem', color:'var(--text-3)' }}>
                <div style={{ fontFamily:'var(--mono)', color:'var(--accent)' }}>▲ {p.upvotes}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>}
    </div>
  );
}

function NewPostForm({ category, onBack, onSuccess }) {
  const [form, setForm] = useState({ title:'', body:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const navigate = useNavigate();

  const suggestCategory = async title => {
    if (title.length < 10) return;
    try {
      const res = await fetch('/api/mechbot/suggest-category', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('mechgg_token')}, body:JSON.stringify({ title }) });
      const d = await res.json();
      if (d.category && d.category !== category.id) setSuggestion(d);
    } catch {}
  };
  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const d = await api.createForumPost({ categoryId:category.id, ...form });
      navigate('/forum/post/'+d.id);
    } catch(err) { setError(err.message); setLoading(false); }
  };
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
        <button onClick={onBack} style={{ color:'var(--text-3)', fontSize:'0.875rem', background:'none', border:'none', cursor:'pointer' }}>← {category.name}</button>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1.1rem', fontWeight:700 }}>New Post in {category.icon} {category.name}</h2>
      </div>
      <div className="card">
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="form-group">
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={e=>{setForm({...form,title:e.target.value});suggestCategory(e.target.value);}} placeholder="Write a clear, descriptive title" maxLength={150} required/>
              {suggestion && <div style={{ fontSize:'0.75rem', color:'var(--accent)', marginTop:'0.3rem' }}>⌖ MechBot suggests: <strong>{suggestion.category}</strong> — {suggestion.reason}</div>}
            </div>
          <div className="form-group"><label className="label">Body</label><textarea className="input" value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Share your thoughts, questions, or insights..." rows={8} maxLength={5000} required style={{ minHeight:'200px' }}/></div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading?<span className="spinner"/>:'Post'}</button>
            <button className="btn btn-ghost" type="button" onClick={onBack}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ForumPost() {
  const { postId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.getForumPost(postId).then(setData).finally(()=>setLoading(false));
  useEffect(() => { load(); }, [postId]);

  const submitReply = async e => {
    e.preventDefault();
    if (!reply.trim()) return;
    setPosting(true); setError('');
    try {
      const rd = await api.replyForumPost(postId, reply);
      fetch('/api/mechbot/moderate', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('mechgg_token')}, body:JSON.stringify({ text: reply, replyId: rd.id }) });
      setReply('');
      load();
    } catch(err) { setError(err.message); }
    finally { setPosting(false); }
  };

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><span className="spinner" style={{ width:'28px', height:'28px' }}/></div>;
  if (!data) return <div className="page"><div className="alert alert-error">Post not found</div></div>;

  return (
    <div className="page fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
        <Link to="/forum" style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>← Forum</Link>
        <span className="tag tag-muted">{data.post.category_icon} {data.post.category_name}</span>
      </div>

      <div className="card" style={{ marginBottom:'1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', marginBottom:'1rem' }}>
          <h1 style={{ fontSize:'1.2rem', fontWeight:700 }}>{data.post.title}</h1>
          <button onClick={()=>api.upvoteForumPost(postId)} style={{ display:'flex', flexDirection:'column', alignItems:'center', background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'0.4rem 0.6rem', cursor:'pointer', color:'var(--text-3)', minWidth:'44px' }}>
            <span>▲</span>
            <span style={{ fontFamily:'var(--mono)', fontSize:'0.75rem' }}>{data.post.upvotes}</span>
          </button>
        </div>
        <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:'1rem' }}>
          by <strong style={{ color:'var(--text-2)' }}>{data.post.author_name}</strong> · {timeAgo(data.post.created_at)} · {data.post.view_count} views
        </div>
        <p style={{ fontSize:'0.9rem', color:'var(--text-2)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{data.post.body}</p>
      </div>

      {/* Replies */}
      <div style={{ marginBottom:'1.5rem' }}>
        <div className="section-label" style={{ marginBottom:'0.75rem' }}>{data.replies.length} {data.replies.length===1?'Reply':'Replies'}</div>
        {data.replies.map((r,i) => (
          <div key={r.id} style={{ display:'flex', gap:'0.875rem', marginBottom:'0.875rem' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--text-3)', flexShrink:0 }}>{i+1}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:'0.35rem' }}>
                <strong style={{ color:'var(--text-2)' }}>{r.author_name}</strong> · {timeAgo(r.created_at)}
              </div>
              <p style={{ fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{r.body}</p>
            </div>
          </div>
        ))}
      </div>

      {user ? (
        <div className="card">
          <h3 style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', marginBottom:'0.875rem' }}>Post a Reply</h3>
          <form onSubmit={submitReply} style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            <textarea className="input" value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write your reply..." rows={4} maxLength={3000} required/>
            {error && <div className="alert alert-error">{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={posting||!reply.trim()} style={{ alignSelf:'flex-start' }}>{posting?<span className="spinner"/>:'Post Reply'}</button>
          </form>
        </div>
      ) : (
        <div className="alert alert-info"><Link to="/register" style={{ color:'var(--accent)' }}>Create an account</Link> to reply.</div>
      )}
    </div>
  );
}

export default function Forum() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('home'); // home | category | new-post
  const [selected, setSelected] = useState(null);

  useEffect(() => { api.getForumCategories().then(d=>setCategories(d.categories)); }, []);

  return (
    <div className="page fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700 }}>Forum</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Discuss gameplay, share tips, find coaches</p>
        </div>
      </div>

      {view==='home' && <ForumHome categories={categories} onSelect={c=>{setSelected(c);setView('category');}}/>}
      {view==='category' && selected && <ForumCategory category={selected} onBack={()=>setView('home')} onPost={c=>{setSelected(c);setView('new-post');}}/>}
      {view==='new-post' && selected && (
        user ? <NewPostForm category={selected} onBack={()=>setView('category')} onSuccess={()=>setView('category')}/> :
        <div className="alert alert-info"><Link to="/register" style={{ color:'var(--accent)' }}>Create an account</Link> to post.</div>
      )}
    </div>
  );
}

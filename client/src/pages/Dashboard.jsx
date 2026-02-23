import AdSpot from '../components/AdSpot';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api, scoreColor, scoreLabel, timeAgo } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => { api.getDashboard().then(setData).catch(console.error).finally(()=>setLoading(false)); }, []);

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><span className="spinner" style={{ width:'28px', height:'28px' }}/></div>;
  const empty = !data || data.overall.total_analyses === 0;

  return (
    <div className="page fade-in">
      <AdSpot slot="top-banner" page="dashboard" style={{ marginBottom:'1.5rem' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700 }}>⌖ {user?.displayName}</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Your mechanical improvement journey</p>
        </div>
        <Link to="/upload" className="btn btn-primary">+ Analyze Clip</Link>
      </div>

      {empty ? (
        <div className="card" style={{ textAlign:'center', padding:'4rem 2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🎯</div>
          <h2 style={{ fontFamily:'var(--mono)', marginBottom:'0.75rem' }}>No analyses yet</h2>
          <p style={{ color:'var(--text-2)', maxWidth:'380px', margin:'0 auto 2rem', lineHeight:1.6 }}>Upload your first gameplay clip to get your mechanical profile and start tracking improvement.</p>
          <Link to="/upload" className="btn btn-primary" style={{ padding:'0.75rem 2rem' }}>Analyze Your First Clip →</Link>
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
            {[
              ['Total Clips', data.overall.total_analyses, null],
              ['Best MI', data.overall.best_mi?.toFixed(1)||'—', scoreColor(data.overall.best_mi)],
              ['Avg MI', data.overall.avg_mi?.toFixed(1)||'—', scoreColor(data.overall.avg_mi)],
              ['This Month', (user?.analysesThisMonth||0)+' / '+(user?.analysesLimit||5), null],
            ].map(([label,value,color]) => (
              <div key={label} className="card">
                <div className="section-label" style={{ marginBottom:'0.5rem' }}>{label}</div>
                <span style={{ fontFamily:'var(--mono)', fontSize:'1.6rem', fontWeight:700, color:color||'var(--text)', lineHeight:1 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:'1.5rem', marginBottom:'1.5rem' }}>
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <div className="section-label">Mechanical Index — Trend</div>
                <span style={{ fontSize:'0.7rem', color:'var(--text-3)', fontFamily:'var(--mono)' }}>📅 upload oldest → newest</span>
              </div>
              {data.recentTrend.length >= 2 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={[...data.recentTrend].reverse()}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3"/>
                    <XAxis dataKey="analyzed_at" tickFormatter={v=>timeAgo(v).replace(' ago','')} tick={{ fill:'var(--text-3)', fontSize:10, fontFamily:'monospace' }}/>
                    <YAxis domain={[0,100]} tick={{ fill:'var(--text-3)', fontSize:10, fontFamily:'monospace' }}/>
                    <Tooltip contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-hi)', borderRadius:'8px', fontFamily:'monospace', fontSize:'12px' }} labelFormatter={v=>timeAgo(v)} formatter={v=>[v?.toFixed(1),'MI Score']}/>
                    <Line type="monotone" dataKey="mechanical_index" stroke="var(--accent)" strokeWidth={2} dot={{ fill:'var(--accent)', strokeWidth:0, r:3 }} activeDot={{ r:5 }}/>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height:190, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'var(--text-3)', fontSize:'0.875rem', textAlign:'center', padding:'1rem' }}>
                  <div>Upload more clips to see your trend</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-3)', maxWidth:'280px', lineHeight:1.6 }}>📅 For accurate trends, upload clips in chronological order — oldest first, newest last.</div>
                </div>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div className="section-label">By Game</div>
              {data.byGame.map(g => (
                <Link to={`/history?gameId=${g.id}`} key={g.id} style={{ textDecoration:'none' }}>
                  <div className="card" style={{ padding:'0.75rem' }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.3rem' }}>
                      <span>{g.cover_emoji}</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:500 }}>{g.name}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{g.clip_count} clips</span>
                      <span style={{ fontFamily:'var(--mono)', fontSize:'0.78rem', fontWeight:700, color:scoreColor(g.avg_mi) }}>{g.avg_mi?.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <div className="section-label">Recent Sessions</div>
              <Link to="/history" style={{ fontSize:'0.8rem', color:'var(--accent)' }}>View all →</Link>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {data.recentTrend.map(a => (
                <Link key={a.id} to={`/analysis/${a.id}`} style={{ textDecoration:'none' }}>
                  <div className="card" style={{ padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'1rem' }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <span style={{ fontSize:'1.2rem' }}>{a.cover_emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.875rem' }}>{a.game_name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{timeAgo(a.analyzed_at)}</div>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontWeight:700, fontSize:'1.2rem', color:scoreColor(a.mechanical_index) }}>{a.mechanical_index?.toFixed(1)}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-3)', width:'70px', textAlign:'right' }}>{scoreLabel(a.mechanical_index)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

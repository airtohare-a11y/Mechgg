import { DisclaimerBanner } from '../components/Legal';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, scoreColor, scoreLabel, timeAgo, DIMENSION_LABELS } from '../utils/api';
import { MechanicalIndex, DimensionBar, DimensionRadar, HabitCard } from '../components/ScoreComponents';

function SimTimeline({ habits, duration = 60 }) {
  // Generate fake timestamps for each negative habit
  const events = [];
  let t = 4;
  habits.filter(h => !h.isPositive).forEach((h, i) => {
    const count = Math.min(6, 2 + i);
    for (let j = 0; j < count; j++) {
      t += 4 + Math.floor(Math.random() * 8);
      if (t < duration) events.push({ time: t, label: h.name, severity: h.severity });
    }
  });
  events.sort((a, b) => a.time - b.time);

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{ position:'relative', paddingBottom:'1rem' }}>
      {/* Timeline bar */}
      <div style={{ height:'3px', background:'var(--bg-elevated)', borderRadius:'2px', margin:'1rem 0', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,var(--accent),var(--purple))', borderRadius:'2px', opacity:0.3 }}/>
        {events.map((e, i) => (
          <div key={i} style={{ position:'absolute', left:`${(e.time/duration)*100}%`, top:'-6px', transform:'translateX(-50%)' }}>
            <div style={{ width:'3px', height:'15px', background:e.severity==='frequent'?'var(--red)':'var(--orange)', borderRadius:'2px' }}/>
          </div>
        ))}
        <div style={{ position:'absolute', left:0, top:'-5px', fontSize:'0.65rem', color:'var(--text-3)', fontFamily:'var(--mono)' }}>0:00</div>
        <div style={{ position:'absolute', right:0, top:'-5px', fontSize:'0.65rem', color:'var(--text-3)', fontFamily:'var(--mono)' }}>{fmtTime(duration)}</div>
      </div>

      {/* Event list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', maxHeight:'180px', overflowY:'auto' }}>
        {events.map((e, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.78rem' }}>
            <span style={{ fontFamily:'var(--mono)', color:'var(--text-3)', minWidth:'36px' }}>{fmtTime(e.time)}</span>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:e.severity==='frequent'?'var(--red)':'var(--orange)', flexShrink:0 }}/>
            <span style={{ color:'var(--text-2)' }}>{e.label}</span>
          </div>
        ))}
        {events.length === 0 && <div style={{ fontSize:'0.82rem', color:'var(--text-3)' }}>No habit events detected</div>}
      </div>
    </div>
  );
}

function CompareBar({ label, current, prev }) {
  const color = scoreColor(current);
  const delta = prev !== null ? current - prev : null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.78rem', color:'var(--text-2)' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {delta !== null && (
            <span style={{ fontFamily:'var(--mono)', fontSize:'0.68rem', color:delta>=0?'var(--green)':'var(--red)', background:delta>=0?'var(--green-bg)':'var(--red-bg)', padding:'0.1rem 0.35rem', borderRadius:'4px' }}>
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
            </span>
          )}
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', fontWeight:700, color }}>{current?.toFixed(1)}</span>
        </div>
      </div>
      <div style={{ position:'relative', height:'5px', background:'var(--bg-elevated)', borderRadius:'3px', overflow:'hidden' }}>
        {prev !== null && (
          <div style={{ position:'absolute', left:0, top:0, height:'100%', width:prev+'%', background:'rgba(255,255,255,0.12)', borderRadius:'3px' }}/>
        )}
        <div style={{ position:'absolute', left:0, top:0, height:'100%', width:current+'%', background:color, borderRadius:'3px', transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
      </div>
    </div>
  );
}

export default function AnalysisResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [prev, setPrev] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.getAnalysis(id)
      .then(async d => {
        setData(d);
        // Try to find previous analysis for same game
        try {
          const hist = await api.getHistory({ gameId: d.game_id, limit: 10 });
          const older = hist.analyses.filter(a => a.id !== id);
          if (older.length > 0) setPrev(older[0]);
        } catch {}
      })
      .catch(() => setError('Analysis not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><span className="spinner" style={{ width:'28px', height:'28px' }}/></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const scores = data.dimensionScores || {};
  const habits = data.habits || [];
  const prevScores = prev ? (prev.dimensionScores || {}) : null;
  const negHabits = habits.filter(h => !h.isPositive);
  const posHabits = habits.filter(h => h.isPositive);
  const miDelta = prev ? data.mechanical_index - prev.mechanical_index : null;

  // Simulate clip duration from score variation
  const clipDuration = 45 + Math.floor(Object.values(scores).reduce((a,b)=>a+b,0) % 60);

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap' }}>
        <Link to="/history" style={{ color:'var(--text-3)', fontSize:'0.875rem', flexShrink:0 }}>← History</Link>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <span style={{ fontSize:'1.5rem' }}>{data.cover_emoji}</span>
          <div>
            <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.2rem', fontWeight:700 }}>{data.game_name}</h1>
            <div style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>{timeAgo(data.analyzed_at)} · {data.category}</div>
          </div>
        </div>
        <Link to={`/analysis/${id}/drills`} className="btn btn-secondary" style={{ marginRight:'0.5rem' }}>📋 Drill Plan</Link><Link to="/upload" className="btn btn-primary">+ New Analysis</Link>
      </div>

      <DisclaimerBanner type="analysis" />
      {/* MI Hero */}
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
        <div className="card" style={{ textAlign:'center', padding:'2rem 1rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
          <div className="section-label">Mechanical Index</div>
          <MechanicalIndex score={data.mechanical_index} />
          {miDelta !== null && (
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontFamily:'var(--mono)', fontSize:'0.8rem' }}>
              <span style={{ color:miDelta>=0?'var(--green)':'var(--red)', fontSize:'1.1rem' }}>{miDelta>=0?'↑':'↓'}</span>
              <span style={{ color:miDelta>=0?'var(--green)':'var(--red)', fontWeight:700 }}>{Math.abs(miDelta).toFixed(1)}</span>
              <span style={{ color:'var(--text-3)' }}>vs last session</span>
            </div>
          )}
          <div style={{ fontSize:'0.78rem', color:'var(--text-2)', lineHeight:1.6, textAlign:'left', borderTop:'1px solid var(--border)', paddingTop:'0.75rem' }}>
            {data.coaching_summary}
          </div>
        </div>

        <div className="card">
          <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'0' }}>
            {['overview','timeline','compare'].map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{ padding:'0.4rem 0.875rem', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'0.78rem', color:tab===t?'var(--accent)':'var(--text-3)', borderBottom:tab===t?'2px solid var(--accent)':'2px solid transparent', marginBottom:'-1px', textTransform:'capitalize' }}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && <DimensionRadar dimensionScores={scores} height={240}/>}

          {tab === 'timeline' && (
            <div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-2)', marginBottom:'0.75rem', lineHeight:1.5 }}>
                Habit events detected across your {Math.floor(clipDuration/60)}:{String(clipDuration%60).padStart(2,'0')} clip
              </div>
              <SimTimeline habits={habits} duration={clipDuration}/>
            </div>
          )}

          {tab === 'compare' && (
            <div>
              {prev ? (
                <>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-2)', marginBottom:'1rem' }}>
                    Compared to your previous {data.game_name} session ({timeAgo(prev.analyzed_at)})
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    {Object.entries(scores).map(([k,v]) => (
                      <CompareBar key={k} label={DIMENSION_LABELS[k]||k} current={v} prev={prevScores?.[k]??null}/>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--text-3)', fontSize:'0.875rem', textAlign:'center' }}>
                  No previous {data.game_name} session to compare.<br/>Upload another clip to see your progress.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dimension scores */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div className="section-label" style={{ marginBottom:'1rem' }}>Dimension Breakdown</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'0.875rem' }}>
          {Object.entries(scores).map(([k,v]) => (
            <DimensionBar key={k} dimensionKey={k} score={v} prev={prevScores?.[k]??null}/>
          ))}
        </div>
      </div>

      {/* Habits */}
      {negHabits.length > 0 && (
        <div style={{ marginBottom:'1.5rem' }}>
          <div className="section-label" style={{ marginBottom:'0.875rem' }}>⚠ Habits to Address ({negHabits.length})</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'0.875rem' }}>
            {negHabits.map((h,i) => <HabitCard key={i} habit={h}/>)}
          </div>
        </div>
      )}

      {posHabits.length > 0 && (
        <div>
          <div className="section-label" style={{ marginBottom:'0.875rem' }}>✓ Strengths Detected ({posHabits.length})</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'0.875rem' }}>
            {posHabits.map((h,i) => <HabitCard key={i} habit={h}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

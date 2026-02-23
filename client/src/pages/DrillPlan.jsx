import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { DisclaimerBanner } from '../components/Legal';

const DIFF_COLOR = { Beginner:'var(--green)', Intermediate:'var(--yellow)', Advanced:'var(--red)', 'All levels':'var(--accent)' };

export default function DrillPlan() {
  const { analysisId } = useParams();
  const [plan, setPlan] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    api.getDrillPlan(analysisId)
      .then(d => { setPlan(d.plan); setCompleted(d.completedDrills); setPlanId(d.planId); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [analysisId]);

  const toggleDrill = async drillId => {
    const next = completed.includes(drillId) ? completed.filter(x=>x!==drillId) : [...completed, drillId];
    setCompleted(next);
    await api.completeDrill(planId, drillId);
  };

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><span className="spinner" style={{ width:'28px', height:'28px' }}/></div>;
  if (!plan) return <div className="page"><div className="alert alert-error">Plan not found</div></div>;

  const totalDrills = plan.weeks.reduce((s,w)=>s+w.drills.length,0);
  const pct = totalDrills > 0 ? Math.round((completed.length/totalDrills)*100) : 0;
  const week = plan.weeks.find(w=>w.week===activeWeek);

  return (
    <div className="page fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem' }}>
        <Link to={`/analysis/${analysisId}`} style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>← Analysis</Link>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700 }}>4-Week Improvement Plan</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Targeting: {plan.targetHabits.join(', ')||'General mechanics'}</p>
        </div>
      </div>

      <DisclaimerBanner type="drills" />

      {/* Progress */}
      <div className="card" style={{ marginBottom:'1.5rem', padding:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
          <span className="section-label">Overall Progress</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', color:'var(--accent)' }}>{completed.length} / {totalDrills} drills completed</span>
        </div>
        <div style={{ height:'8px', background:'var(--bg-elevated)', borderRadius:'4px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:pct+'%', background:'linear-gradient(90deg,var(--accent),var(--purple))', borderRadius:'4px', transition:'width 0.5s ease' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.5rem', fontSize:'0.75rem', color:'var(--text-3)' }}>
          <span>~{plan.estimatedDailyTime}/day</span>
          <span>{pct}% complete</span>
        </div>
      </div>

      {/* Week selector */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {plan.weeks.map(w => {
          const wDrills = w.drills.map(d=>d.id);
          const wDone = wDrills.filter(id=>completed.includes(id)).length;
          const wPct = wDrills.length > 0 ? Math.round((wDone/wDrills.length)*100) : 0;
          return (
            <button key={w.week} onClick={()=>setActiveWeek(w.week)} style={{ padding:'0.6rem 1rem', borderRadius:'var(--r)', border:'1px solid', borderColor:activeWeek===w.week?'var(--accent)':'var(--border)', background:activeWeek===w.week?'var(--accent-bg)':'var(--bg-card)', cursor:'pointer', textAlign:'left', minWidth:'140px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', color:activeWeek===w.week?'var(--accent)':'var(--text-3)', marginBottom:'0.2rem' }}>WEEK {w.week}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text)', fontWeight:500 }}>{w.focus.split('—')[0].trim()}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)', marginTop:'0.2rem' }}>{wPct}% done</div>
            </button>
          );
        })}
      </div>

      {/* Active week */}
      {week && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem' }}>
              <div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--accent)', letterSpacing:'0.08em', marginBottom:'0.25rem' }}>WEEK {week.week} — {week.focus.toUpperCase()}</div>
                <h2 style={{ fontSize:'1.1rem', fontWeight:600 }}>{week.theme}</h2>
              </div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-2)', textAlign:'right' }}>
                <div>{week.dailyTime} / day</div>
              </div>
            </div>
            <div style={{ marginTop:'0.75rem', padding:'0.75rem', background:'var(--accent-bg)', borderRadius:'var(--r)', fontSize:'0.82rem', color:'var(--text-2)', borderLeft:'3px solid var(--accent)' }}>
              🎯 <strong>Goal:</strong> {week.goal}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {week.drills.length === 0 ? (
              <div style={{ color:'var(--text-3)', fontSize:'0.875rem', padding:'1rem' }}>No specific drills for this week — focus on applying corrections in live play.</div>
            ) : week.drills.map(d => {
              const done = completed.includes(d.id);
              return (
                <div key={d.id} style={{ padding:'1rem', borderRadius:'var(--r)', background:done?'var(--green-bg)':'var(--bg-elevated)', border:'1px solid', borderColor:done?'rgba(74,222,128,0.25)':'var(--border)', transition:'all 0.2s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', marginBottom:'0.5rem' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:600, fontSize:'0.9rem', textDecoration:done?'line-through':'none', color:done?'var(--text-3)':'var(--text)' }}>{d.name}</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:DIFF_COLOR[d.difficulty]||'var(--text-3)', border:'1px solid', borderColor:DIFF_COLOR[d.difficulty]||'var(--border)', padding:'0.1rem 0.4rem', borderRadius:'4px' }}>{d.difficulty}</span>
                      </div>
                      <div style={{ display:'flex', gap:'1rem', marginTop:'0.3rem', fontSize:'0.75rem', color:'var(--text-3)' }}>
                        <span>⏱ {d.duration}</span>
                        <span>📅 {d.frequency}</span>
                      </div>
                    </div>
                    <button onClick={()=>toggleDrill(d.id)} style={{ flexShrink:0, width:'28px', height:'28px', borderRadius:'50%', border:'2px solid', borderColor:done?'var(--green)':'var(--border-hi)', background:done?'var(--green)':'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', color:done?'#000':'var(--text-3)', transition:'all 0.2s' }}>
                      {done?'✓':''}
                    </button>
                  </div>
                  <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.6 }}>{d.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ textAlign:'center', padding:'1.5rem' }}>
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginBottom:'1rem' }}>After completing Week 4, upload a new clip to measure your improvement.</p>
        <Link to="/upload" className="btn btn-primary">Upload New Clip →</Link>
      </div>
    </div>
  );
}

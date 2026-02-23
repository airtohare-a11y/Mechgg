import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { scoreColor, scoreLabel, DIMENSION_LABELS } from '../utils/api';

export function MechanicalIndex({ score, size='large' }) {
  const color = scoreColor(score);
  const sz = { large:{num:'3.5rem',ring:130,stroke:7}, medium:{num:'2.2rem',ring:90,stroke:6}, small:{num:'1.5rem',ring:65,stroke:5} }[size]||{num:'3.5rem',ring:130,stroke:7};
  const R = sz.ring/2 - sz.stroke*2;
  const circ = 2*Math.PI*R;
  const offset = circ*(1-(Math.min(100,Math.max(0,score||0))/100));
  const c = sz.ring/2;
  return (
    <div style={{ position:'relative', width:sz.ring, height:sz.ring, margin:'0 auto' }}>
      <svg width={sz.ring} height={sz.ring}>
        <circle cx={c} cy={c} r={R} fill="none" stroke="var(--bg-elevated)" strokeWidth={sz.stroke}/>
        <circle cx={c} cy={c} r={R} fill="none" stroke={color} strokeWidth={sz.stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${c} ${c})`} style={{ transition:'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:sz.num, fontWeight:800, color, lineHeight:1 }}>{score?.toFixed(1)??'—'}</span>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--text-3)', marginTop:'0.15rem' }}>{scoreLabel(score)}</span>
      </div>
    </div>
  );
}

export function DimensionBar({ dimensionKey, score, prev=null }) {
  const label = DIMENSION_LABELS[dimensionKey] || dimensionKey.replace(/([A-Z])/g,' $1').trim();
  const color = scoreColor(score);
  const delta = prev !== null ? score - prev : null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.78rem', color:'var(--text-2)' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          {delta!==null && <span style={{ fontFamily:'var(--mono)', fontSize:'0.68rem', color:delta>=0?'var(--green)':'var(--red)' }}>{delta>0?'+':''}{delta.toFixed(1)}</span>}
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', fontWeight:700, color }}>{score?.toFixed(1)}</span>
        </div>
      </div>
      <div className="score-bar-track"><div className="score-bar-fill" style={{ width:(score||0)+'%', background:color }}/></div>
    </div>
  );
}

export function DimensionRadar({ dimensionScores, height=240 }) {
  if (!dimensionScores || !Object.keys(dimensionScores).length) return null;
  const SHORT = { 'Target Acquisition':'Acquisition','On-Target Tracking':'Tracking','Overshoot Control':'Overshoot','Session Momentum':'Momentum','Braking Consistency':'Braking','Throttle Control':'Throttle','Oversteer Recovery':'Oversteer','Lap Consistency':'Lap Time','Hazard Reaction':'Hazard','Execution Consistency':'Execution','Pressure Performance':'Pressure','Actions Per Minute':'APM','Decision Rhythm':'Rhythm','Resource Efficiency':'Resources','Attention Switching':'Attention','Build Order':'Build','Crisis Management':'Crisis','Combo Execution':'Combos','Reaction Timing':'Reaction','Punish Accuracy':'Punish','Neutral Game':'Neutral' };
  const data = Object.entries(dimensionScores).map(([k,v]) => {
    const full = DIMENSION_LABELS[k]||k;
    return { dimension: SHORT[full]||full, score: v, fullMark: 100 };
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid gridType="polygon" stroke="var(--border)" strokeDasharray="3 3"/>
        <PolarAngleAxis dataKey="dimension" tick={{ fill:'var(--text-3)', fontSize:10, fontFamily:'monospace' }}/>
        <Radar dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} strokeWidth={2}/>
        <Tooltip contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-hi)', borderRadius:'8px', fontFamily:'monospace', fontSize:'0.8rem' }} itemStyle={{ color:'var(--accent)' }} labelStyle={{ color:'var(--text-2)' }}/>
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function HabitCard({ habit }) {
  const pos = habit.isPositive;
  const color = pos ? 'var(--green)' : habit.severity==='frequent' ? 'var(--red)' : 'var(--orange)';
  const bg = pos ? 'var(--green-bg)' : habit.severity==='frequent' ? 'var(--red-bg)' : 'var(--yellow-bg)';
  const border = pos ? 'rgba(74,222,128,0.2)' : habit.severity==='frequent' ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)';
  return (
    <div style={{ padding:'1rem', borderRadius:'var(--r)', background:bg, border:'1px solid '+border }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem', gap:'1rem' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:'0.82rem', fontWeight:700, color }}>{pos?'✓':'⚠'} {habit.name}</span>
        {habit.severity && <span className={`tag tag-${pos?'green':habit.severity==='frequent'?'red':'orange'}`} style={{ fontSize:'0.62rem', flexShrink:0 }}>{habit.severity}</span>}
      </div>
      <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.6, marginBottom:'0.5rem' }}>{habit.description}</p>
      {habit.coachingNote && <div style={{ fontSize:'0.77rem', color:'var(--text-3)', paddingTop:'0.5rem', borderTop:'1px solid '+border }}>💡 {habit.coachingNote}</div>}
    </div>
  );
}

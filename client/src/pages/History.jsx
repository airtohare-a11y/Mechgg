import AdSpot from '../components/AdSpot';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, scoreColor, scoreLabel, timeAgo, DIMENSION_LABELS } from '../utils/api';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');

  useEffect(() => {
    api.getHistory(gameId ? { gameId } : {}).then(d=>setAnalyses(d.analyses)).finally(()=>setLoading(false));
  }, [gameId]);

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><span className="spinner" style={{ width:'28px', height:'28px' }}/></div>;

  return (
    <div className="page fade-in">
      <AdSpot slot="top-banner" page="history" style={{ marginBottom:'1.5rem' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700 }}>Analysis History</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>{analyses.length} sessions recorded</p>
        </div>
        <Link to="/upload" className="btn btn-primary">+ New Analysis</Link>
      </div>

      {analyses.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <p style={{ color:'var(--text-2)' }}>No analyses yet. <Link to="/upload" style={{ color:'var(--accent)' }}>Upload your first clip →</Link></p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {analyses.map(a => (
            <Link key={a.id} to={`/analysis/${a.id}`} style={{ textDecoration:'none' }}>
              <div className="card" style={{ padding:'1rem', display:'grid', gridTemplateColumns:'auto 1fr auto auto', alignItems:'center', gap:'1rem' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <span style={{ fontSize:'1.3rem' }}>{a.cover_emoji}</span>
                <div>
                  <div style={{ fontSize:'0.9rem', fontWeight:500 }}>{a.game_name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{timeAgo(a.analyzed_at)}</div>
                </div>
                <div style={{ fontFamily:'var(--mono)', fontWeight:700, fontSize:'1.3rem', color:scoreColor(a.mechanical_index) }}>{a.mechanical_index?.toFixed(1)}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-3)', width:'70px', textAlign:'right' }}>{scoreLabel(a.mechanical_index)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

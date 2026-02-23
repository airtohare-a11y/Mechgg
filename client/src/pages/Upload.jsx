import { DisclaimerBanner } from '../components/Legal';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const STAGES = [
  { label: 'Uploading clip...', pct: 15 },
  { label: 'Reading video metadata...', pct: 30 },
  { label: 'Detecting engagement windows...', pct: 50 },
  { label: 'Measuring mechanical patterns...', pct: 68 },
  { label: 'Scoring dimensions...', pct: 82 },
  { label: 'Generating habit report...', pct: 93 },
  { label: 'Finalizing analysis...', pct: 98 },
];

export default function Upload() {
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState('');
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [pct, setPct] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const stageInterval = useRef(null);

  useEffect(() => { api.getGames().then(d => setGames(d.games)); }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
    }
  }, [file]);

  const startStageAnimation = () => {
    let i = 0;
    setStage(0); setPct(STAGES[0].pct);
    stageInterval.current = setInterval(() => {
      i++;
      if (i < STAGES.length) {
        setStage(i);
        setPct(STAGES[i].pct);
      }
    }, 1800);
  };

  const submit = async e => {
    e.preventDefault();
    if (!file) return setError('Please select a clip');
    if (!gameId) return setError('Please select a game');
    setError(''); setLoading(true);
    startStageAnimation();
    if (videoRef.current) { videoRef.current.play().catch(()=>{}); }
    try {
      const fd = new FormData();
      fd.append('clip', file);
      fd.append('gameId', gameId);
      const result = await api.uploadClip(fd);
      clearInterval(stageInterval.current);
      setPct(100);
      setTimeout(() => navigate('/analysis/' + result.id), 600);
    } catch (err) {
      clearInterval(stageInterval.current);
      setLoading(false); setPct(0); setStage(0);
      setError(err.code === 'QUOTA_EXCEEDED' ? 'Monthly limit reached. Upgrade your plan.' : err.message);
    }
  };

  const CATS = { fps:'🎯 FPS / Shooter', racing:'🏎️ Racing', sports:'⚽ Sports', strategy:'⚔️ Strategy / MOBA', fighting:'👊 Fighting' };
  const grouped = games.reduce((acc, g) => { (acc[g.category]=acc[g.category]||[]).push(g); return acc; }, {});

  return (
    <div className="page fade-in" style={{ maxWidth:'680px' }}>
      <DisclaimerBanner type="analysis" />
      <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.35rem' }}>Analyze a Clip</h1>
      <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginBottom:'2rem' }}>Upload gameplay footage. Your clip plays while we analyze it, then gets permanently deleted.</p>

      {user && (
        <div className="alert alert-info" style={{ marginBottom:'1.5rem' }}>
          {user.analysesRemaining} of {user.analysesLimit} analyses remaining this month
        </div>
      )}

      {/* Video preview */}
      {videoUrl && (
        <div style={{ marginBottom:'1.5rem', borderRadius:'var(--r-lg)', overflow:'hidden', background:'#000', border:'1px solid var(--border)', position:'relative' }}>
          <video ref={videoRef} src={videoUrl} controls={!loading} muted={loading} loop={loading} style={{ width:'100%', maxHeight:'320px', display:'block', objectFit:'contain' }}/>
          {loading && (
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', color:'var(--accent)', letterSpacing:'0.05em' }}>{STAGES[stage]?.label}</div>
              <div style={{ width:'280px', height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', background:'var(--accent)', borderRadius:'2px', width:pct+'%', transition:'width 0.8s ease' }}/>
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.75rem', color:'var(--text-3)' }}>{pct}%</div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        <div className="form-group">
          <label className="label">Game</label>
          <select className="input" value={gameId} onChange={e=>setGameId(e.target.value)} required disabled={loading}>
            <option value="">Select your game...</option>
            {Object.entries(grouped).map(([cat, gs]) => (
              <optgroup key={cat} label={CATS[cat]||cat}>
                {gs.map(g => <option key={g.id} value={g.id}>{g.cover_emoji} {g.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Gameplay Clip</label>
          <div
            style={{ border:'2px dashed', borderColor:file?'rgba(74,222,128,0.4)':'var(--border-hi)', borderRadius:'var(--r)', padding:'1.75rem', textAlign:'center', background:file?'var(--green-bg)':'var(--bg-elevated)', transition:'all 0.2s', cursor:loading?'default':'pointer' }}
            onClick={() => !loading && document.getElementById('file-input').click()}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();if(!loading&&e.dataTransfer.files[0])setFile(e.dataTransfer.files[0]);}}>
            <input id="file-input" type="file" accept=".mp4,.mov,.avi,.webm,.mkv" style={{ display:'none' }} onChange={e=>setFile(e.target.files[0])} disabled={loading}/>
            {file ? (
              <div>
                <div style={{ fontSize:'1.3rem', marginBottom:'0.4rem' }}>✅</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.85rem', color:'var(--green)', fontWeight:700 }}>{file.name}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-3)', marginTop:'0.2rem' }}>{(file.size/1024/1024).toFixed(1)} MB</div>
                {!loading && <button type="button" onClick={e=>{e.stopPropagation();setFile(null);}} style={{ marginTop:'0.6rem', fontSize:'0.75rem', color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }}>Remove</button>}
              </div>
            ) : (
              <div>
                <div style={{ fontSize:'1.75rem', marginBottom:'0.4rem' }}>📁</div>
                <div style={{ fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'0.2rem' }}>Click to select or drag & drop</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>MP4, MOV, AVI, WebM, MKV · Max 500MB</div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading||!file||!gameId} style={{ padding:'0.875rem', fontSize:'1rem' }}>
          {loading ? <><span className="spinner"/> Analyzing...</> : '⌖ Analyze Mechanics'}
        </button>
      </form>

      {!loading && (
        <div style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <div style={{ padding:'1rem', background:'rgba(167,139,250,0.07)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'var(--r)', fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7 }}>
            <strong style={{ color:'var(--purple)', fontFamily:'var(--mono)', fontSize:'0.75rem' }}>📅 UPLOAD IN CHRONOLOGICAL ORDER</strong>
            <p style={{ marginTop:'0.35rem' }}>For accurate improvement tracking and trend charts, upload your clips in the order they were recorded — oldest first, newest last. Uploading out of order will show incorrect progress data on your Dashboard.</p>
          </div>
          <div style={{ padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--r)', fontSize:'0.8rem', color:'var(--text-3)', lineHeight:1.7 }}>
            <strong style={{ color:'var(--text-2)' }}>Tips:</strong> 30–90 seconds of active gameplay works best. Avoid cutscenes or menus. Your clip is deleted from our servers immediately after analysis — only your scores are kept.
          </div>
        </div>
      )}
    </div>
  );
}

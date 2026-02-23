export default function AdSpot({ slot, page, style={} }) {
  // In production this would fetch from /api/ads/:page and display active ads
  // For now shows a placeholder that advertisers can see
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px dashed var(--border-hi)', borderRadius:'var(--r)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1rem', minHeight: slot==='top-banner'?'80px':slot==='mid-banner'?'120px':'200px', gap:'0.4rem', opacity:0.5, ...style }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Advertisement</div>
      <div style={{ fontSize:'0.72rem', color:'var(--text-3)', textAlign:'center' }}>Advertise here · <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a></div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const BOT_AVATAR = '⌖';

export default function MechBotWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm MechBot — Mech.gg's AI assistant. Ask me anything about the app, gameplay habits, game mechanics, or improvement strategies. I'm here to help!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async e => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/mechbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('mechgg_token') },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)} style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', boxShadow:'0 4px 20px rgba(110,231,247,0.3)', zIndex:1000, transition:'transform 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {open ? '✕' : BOT_AVATAR}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{ position:'fixed', bottom:'4.5rem', right:'1.5rem', width:'340px', maxHeight:'480px', background:'var(--bg-card)', border:'1px solid var(--border-hi)', borderRadius:'var(--r-lg)', display:'flex', flexDirection:'column', zIndex:1000, boxShadow:'0 8px 40px rgba(0,0,0,0.4)', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ padding:'0.875rem 1rem', background:'linear-gradient(135deg,rgba(110,231,247,0.1),rgba(167,139,250,0.1))', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>{BOT_AVATAR}</div>
            <div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.82rem', fontWeight:700, color:'var(--accent)' }}>MechBot</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)' }}>AI Assistant & Moderator · Always on</div>
            </div>
            <span className="tag tag-green" style={{ fontSize:'0.6rem', marginLeft:'auto' }}>ONLINE</span>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'0.875rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', flexDirection:m.role==='user'?'row-reverse':'row', alignItems:'flex-end' }}>
                {m.role === 'assistant' && (
                  <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', flexShrink:0 }}>{BOT_AVATAR}</div>
                )}
                <div style={{ maxWidth:'80%', padding:'0.5rem 0.75rem', borderRadius:m.role==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px', background:m.role==='user'?'var(--accent)':'var(--bg-elevated)', color:m.role==='user'?'#000':'var(--text)', fontSize:'0.82rem', lineHeight:1.6 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-end' }}>
                <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem' }}>{BOT_AVATAR}</div>
                <div style={{ padding:'0.5rem 0.875rem', borderRadius:'12px 12px 12px 2px', background:'var(--bg-elevated)', display:'flex', gap:'4px', alignItems:'center' }}>
                  {[0,1,2].map(i=><div key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--accent)', animation:'bounce 1s infinite', animationDelay:`${i*0.15}s` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <form onSubmit={send} style={{ padding:'0.75rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.5rem' }}>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask MechBot anything..." disabled={loading} style={{ flex:1, background:'var(--bg-elevated)', border:'1px solid var(--border-hi)', borderRadius:'var(--r)', padding:'0.5rem 0.75rem', color:'var(--text)', fontSize:'0.82rem', outline:'none', fontFamily:'var(--sans)' }} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border-hi)'}/>
            <button type="submit" disabled={loading||!input.trim()} style={{ width:'34px', height:'34px', borderRadius:'var(--r)', background:'var(--accent)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0, opacity:!input.trim()||loading?0.4:1 }}>➤</button>
          </form>

          <div style={{ padding:'0.4rem 0.75rem', fontSize:'0.65rem', color:'var(--text-3)', textAlign:'center', borderTop:'1px solid var(--border)' }}>
            AI responses may be inaccurate. Not a substitute for professional coaching.
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </>
  );
}

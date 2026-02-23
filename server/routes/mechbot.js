const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const MECHBOT_ID = 'mechbot-system-user';
const MECHBOT_SYSTEM = `You are MechBot, the AI moderator and assistant for Mech.gg — a gameplay mechanics coaching platform.

MODERATION: When given a post/reply to moderate, respond with JSON only:
{"action": "allow"|"flag"|"delete", "reason": "brief reason or null"}

Delete if: hate speech, slurs, harassment, spam, illegal content, doxxing, explicit sexual content.
Flag if: off-topic, potentially misleading coaching advice, low quality but not harmful.
Allow if: normal gameplay discussion, questions, tips, opinions, criticism.

CHAT: You are a knowledgeable esports and gaming mechanics coach. Be concise, practical, and encouraging. You can suggest users upload a clip to Mech.gg for detailed analysis.

When welcoming new users: be warm, brief, mention uploading a clip for their first free mechanical analysis.`;

function anthropicHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY || '',
    'anthropic-version': '2023-06-01',
  };
}

async function callClaude(messages) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: anthropicHeaders(),
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, system: MECHBOT_SYSTEM, messages }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || null;
}

async function moderateContent(text) {
  if (!process.env.ANTHROPIC_API_KEY) return { action: 'allow', reason: null };
  try {
    const reply = await callClaude([{ role:'user', content:`Moderate this content: "${text.slice(0,500)}"` }]);
    if (!reply) return { action:'allow', reason:null };
    return JSON.parse(reply.replace(/```json|```/g,'').trim());
  } catch { return { action:'allow', reason:null }; }
}

function ensureMechBot() {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO users (id,email,password_hash,display_name,plan_tier) VALUES (?,?,?,?,?)').run(
    MECHBOT_ID, 'mechbot@mech.gg', 'NOT_A_REAL_HASH_CANNOT_LOGIN', 'MechBot ⌖', 'team'
  );
}

// Rate limit: track chat calls per user per minute in memory
const chatRateMap = new Map();
function checkChatRate(userId) {
  const now = Date.now();
  const key = userId;
  const entry = chatRateMap.get(key) || { count:0, window: now };
  if (now - entry.window > 60000) { entry.count = 0; entry.window = now; }
  entry.count++;
  chatRateMap.set(key, entry);
  return entry.count <= 15; // 15 messages per minute max
}

router.post('/chat', requireAuth, async (req, res) => {
  if (!checkChatRate(req.user.id)) return res.status(429).json({ error:'Too many messages. Please wait a moment.' });
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error:'Message required' });
  if (message.length > 1000) return res.status(400).json({ error:'Message too long' });
  if (!process.env.ANTHROPIC_API_KEY) return res.json({ reply:"MechBot is not yet configured. Add your ANTHROPIC_API_KEY to Replit Secrets to enable it." });
  try {
    const messages = [
      ...history.slice(-8).map(m => ({ role: m.role, content: String(m.content).slice(0,500) })),
      { role:'user', content: message.trim() },
    ];
    const reply = await callClaude(messages);
    res.json({ reply: reply || 'Sorry, I had trouble responding. Try again!' });
  } catch (err) {
    console.error('MechBot chat error:', err);
    res.status(500).json({ error:'Bot unavailable' });
  }
});

router.post('/moderate', requireAuth, async (req, res) => {
  const { text, postId, replyId } = req.body;
  if (!text) return res.status(400).json({ error:'Text required' });
  try {
    const result = await moderateContent(text);
    if (result.action === 'delete') {
      const db = getDb();
      if (postId) db.prepare('UPDATE forum_posts SET deleted_at=unixepoch() WHERE id=?').run(postId);
      if (replyId) db.prepare('UPDATE forum_replies SET deleted_at=unixepoch() WHERE id=?').run(replyId);
    }
    res.json({ action: result.action, reason: result.reason });
  } catch { res.status(500).json({ error:'Moderation failed' }); }
});

router.post('/welcome', requireAuth, async (req, res) => {
  ensureMechBot();
  const postCount = getDb().prepare('SELECT COUNT(*) as c FROM forum_posts WHERE user_id=?').get(req.user.id);
  if (postCount.c !== 1) return res.json({ welcomed:false });
  if (!process.env.ANTHROPIC_API_KEY) return res.json({ welcomed:true, message:`Welcome to Mech.gg, ${req.user.display_name}! Head to Analyze to upload your first clip and get your Mechanical Index score.` });
  try {
    const msg = await callClaude([{ role:'user', content:`Write a warm 2-sentence welcome for a new user named "${req.user.display_name.slice(0,40)}" on Mech.gg. Mention uploading a clip.` }]);
    res.json({ welcomed:true, message: msg || `Welcome, ${req.user.display_name}!` });
  } catch { res.json({ welcomed:false }); }
});

router.post('/suggest-category', requireAuth, async (req, res) => {
  const { title, body } = req.body;
  if (!title?.trim()) return res.json({ category:'general', reason:null });
  if (!process.env.ANTHROPIC_API_KEY) return res.json({ category:'general', reason:null });
  try {
    const reply = await callClaude([{ role:'user', content:`Categorize forum post. Title: "${title.slice(0,100)}"\nBody: "${(body||'').slice(0,200)}"\nCategories: fps-general,racing-general,sports-general,strategy-general,fighting-general,coaching,improvement,general\nJSON only: {"category":"id","reason":"brief"}` }]);
    if (!reply) return res.json({ category:'general', reason:null });
    res.json(JSON.parse(reply.replace(/```json|```/g,'').trim()));
  } catch { res.json({ category:'general', reason:null }); }
});

module.exports = router;

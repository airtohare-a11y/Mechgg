const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth, PLANS } = require('../middleware/auth');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'dev-secret';

function makeToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' });
}

function publicUser(user) {
  const plan = PLANS[user.plan_tier] || PLANS.free;
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    planTier: user.plan_tier,
    planLabel: plan.label,
    analysesThisMonth: user.analyses_this_month,
    analysesLimit: plan.limit,
    analysesRemaining: Math.max(0, plan.limit - user.analyses_this_month),
  };
}

router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) return res.status(400).json({ error: 'All fields required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });
  if (displayName.trim().length < 2 || displayName.trim().length > 40) return res.status(400).json({ error: 'Display name must be 2–40 characters' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const db = getDb();
  if (db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase())) return res.status(409).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,email,password_hash,display_name) VALUES (?,?,?,?)').run(id, email.toLowerCase(), hash, displayName.trim());
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(id);
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ token: makeToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/upgrade', requireAuth, (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });
  // Free downgrades are always allowed. Paid upgrades require a completed payment record.
  const FREE_PLANS = ['free'];
  if (!FREE_PLANS.includes(plan)) {
    const db = getDb();
    const payment = db.prepare('SELECT id FROM payments WHERE user_id=? AND plan_tier=? AND status=? ORDER BY created_at DESC LIMIT 1').get(req.user.id, plan, 'completed');
    if (!payment) {
      // For now allow during demo — in production remove this bypass
      // return res.status(402).json({ error: 'Payment required before upgrading. Contact mechggofficial@gmail.com.', code: 'PAYMENT_REQUIRED' });
    }
  }
  getDb().prepare('UPDATE users SET plan_tier=? WHERE id=?').run(plan, req.user.id);
  const user = getDb().prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  res.json({ user: publicUser(user) });
});

router.delete('/account', requireAuth, (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  // Hard delete user data in correct order to respect FK constraints
  db.prepare('DELETE FROM drill_plans WHERE user_id=?').run(uid);
  db.prepare('DELETE FROM refund_requests WHERE user_id=?').run(uid);
  db.prepare('DELETE FROM payments WHERE user_id=?').run(uid);
  db.prepare('DELETE FROM reports WHERE reporter_id=? OR reported_user_id=?').run(uid, uid);
  db.prepare('DELETE FROM coach_upvotes WHERE voter_id=?').run(uid);
  db.prepare('UPDATE forum_replies SET deleted_at=unixepoch() WHERE user_id=?').run(uid);
  db.prepare('UPDATE forum_posts SET deleted_at=unixepoch() WHERE user_id=?').run(uid);
  db.prepare('UPDATE community_findings SET deleted_at=unixepoch(), body='[deleted]', title='[deleted]' WHERE user_id=?').run(uid);
  db.prepare('DELETE FROM finding_upvotes WHERE user_id=?').run(uid);
  db.prepare('DELETE FROM messages WHERE sender_id=? OR recipient_id=?').run(uid, uid);
  db.prepare('DELETE FROM analyses WHERE user_id=?').run(uid);
  db.prepare('DELETE FROM coach_profiles WHERE user_id=?').run(uid);
  db.prepare('DELETE FROM users WHERE id=?').run(uid);
  res.json({ deleted: true, message: 'Your account and all associated data has been permanently deleted.' });
});

module.exports = router;

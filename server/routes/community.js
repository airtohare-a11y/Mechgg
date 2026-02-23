const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/findings', (req, res) => {
  const { gameId, limit=20, offset=0 } = req.query;
  const db = getDb();
  let q = `SELECT f.id,f.game_id,f.title,f.body,f.anonymous,f.upvotes,f.pinned,f.created_at,CASE WHEN f.anonymous=1 THEN NULL ELSE f.user_id END as user_id,CASE WHEN f.anonymous=1 THEN 'Anonymous' ELSE u.display_name END as author_name,g.name as game_name,g.cover_emoji FROM community_findings f JOIN users u ON f.user_id=u.id LEFT JOIN games g ON f.game_id=g.id WHERE f.deleted_at IS NULL`;
  const p = [];
  if (gameId) { q += ' AND f.game_id=?'; p.push(gameId); }
  q += ' ORDER BY f.pinned DESC,f.upvotes DESC,f.created_at DESC LIMIT ? OFFSET ?';
  p.push(parseInt(limit), parseInt(offset));
  res.json({ findings: db.prepare(q).all(...p) });
});

router.post('/findings', requireAuth, (req, res) => {
  const { gameId, title, body, anonymous } = req.body;
  if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'Title and body required' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO community_findings (id,user_id,game_id,title,body,anonymous) VALUES (?,?,?,?,?,?)').run(id, req.user.id, gameId||null, title.trim(), body.trim(), anonymous?1:0);
  res.status(201).json({ id });
});

router.post('/findings/:id/upvote', requireAuth, (req, res) => {
  const db = getDb();
  try {
    db.prepare('INSERT INTO finding_upvotes (finding_id,user_id) VALUES (?,?)').run(req.params.id, req.user.id);
    db.prepare('UPDATE community_findings SET upvotes=upvotes+1 WHERE id=?').run(req.params.id);
    res.json({ upvoted: true });
  } catch {
    db.prepare('DELETE FROM finding_upvotes WHERE finding_id=? AND user_id=?').run(req.params.id, req.user.id);
    db.prepare('UPDATE community_findings SET upvotes=MAX(0,upvotes-1) WHERE id=?').run(req.params.id);
    res.json({ upvoted: false });
  }
});

router.get('/findings/:id/comments', (req, res) => {
  const comments = getDb().prepare(`SELECT c.*,CASE WHEN c.anonymous=1 THEN 'Anonymous' ELSE u.display_name END as author_name FROM finding_comments c JOIN users u ON c.user_id=u.id WHERE c.finding_id=? AND c.deleted_at IS NULL ORDER BY c.created_at ASC`).all(req.params.id);
  res.json({ comments });
});

router.post('/findings/:id/comments', requireAuth, (req, res) => {
  const { body, anonymous } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Body required' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO finding_comments (id,finding_id,user_id,body,anonymous) VALUES (?,?,?,?,?)').run(id, req.params.id, req.user.id, body.trim(), anonymous?1:0);
  res.status(201).json({ id });
});

router.get('/coaches', (req, res) => {
  const coaches = getDb().prepare('SELECT cp.*,u.display_name,(SELECT COUNT(*) FROM coach_upvotes WHERE coach_id=cp.id) as upvote_count FROM coach_profiles cp JOIN users u ON cp.user_id=u.id ORDER BY cp.verified DESC,upvote_count DESC,COALESCE(cp.avg_rating,0) DESC LIMIT 30').all();
  res.json({ coaches });
});

router.post('/coaches/:id/upvote', requireAuth, (req, res) => {
  try {
    getDb().prepare('INSERT INTO coach_upvotes (coach_id,voter_id) VALUES (?,?)').run(req.params.id, req.user.id);
    res.json({ upvoted: true });
  } catch {
    res.json({ upvoted: false, message: 'Already upvoted' });
  }
});

router.post('/coaches', requireAuth, (req, res) => {
  const { bio, specialtyGames, rateInfo, contactInfo } = req.body;
  if (!bio?.trim() || !contactInfo?.trim()) return res.status(400).json({ error: 'Bio and contact info required' });
  const db = getDb();
  const existing = db.prepare('SELECT id FROM coach_profiles WHERE user_id=?').get(req.user.id);
  const user = db.prepare('SELECT display_name FROM users WHERE id=?').get(req.user.id);
  if (existing) {
    db.prepare('UPDATE coach_profiles SET bio=?,specialty_games=?,rate_info=?,contact_info=? WHERE user_id=?').run(bio.trim(), specialtyGames||null, rateInfo||null, contactInfo.trim(), req.user.id);
    res.json({ id: existing.id });
  } else {
    const id = uuidv4();
    db.prepare('INSERT INTO coach_profiles (id,user_id,display_name,bio,specialty_games,rate_info,contact_info) VALUES (?,?,?,?,?,?,?)').run(id, req.user.id, user.display_name, bio.trim(), specialtyGames||null, rateInfo||null, contactInfo.trim());
    res.status(201).json({ id });
  }
});

module.exports = router;

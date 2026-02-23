const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth, checkQuota } = require('../middleware/auth');
const { analyzeClip } = require('../services/analysisEngine');
const router = express.Router();

const upload = multer({
  dest: '/tmp/mechgg_uploads/',
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 500) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validExts = ['.mp4','.mov','.avi','.webm','.mkv'];
    const validMimes = ['video/mp4','video/quicktime','video/x-msvideo','video/webm','video/x-matroska','video/mpeg'];
    const extOk = validExts.includes(path.extname(file.originalname).toLowerCase());
    const mimeOk = validMimes.includes(file.mimetype) || file.mimetype.startsWith('video/');
    const ok = extOk && mimeOk;
    cb(ok ? null : new Error('Invalid file type — only video files accepted'), ok);
  }
});

router.post('/upload', requireAuth, checkQuota, upload.single('clip'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { gameId } = req.body;
  if (!gameId) return res.status(400).json({ error: 'Game ID required' });
  const game = getDb().prepare('SELECT * FROM games WHERE id=?').get(gameId);
  if (!game) return res.status(400).json({ error: 'Invalid game' });
  const fs = require('fs');
  try {
    const result = await analyzeClip(req.file.path, gameId);
    const id = uuidv4();
    const db = getDb();
    const saveAnalysis = db.transaction(() => {
      db.prepare('INSERT INTO analyses (id,user_id,game_id,mechanical_index,scores_json,habits_json,coaching_summary) VALUES (?,?,?,?,?,?,?)')
        .run(id, req.user.id, gameId, result.mechanicalIndex, JSON.stringify(result.dimensionScores), JSON.stringify(result.habits), result.coachingSummary);
      db.prepare('UPDATE users SET analyses_this_month=analyses_this_month+1 WHERE id=?').run(req.user.id);
    });
    saveAnalysis();
    res.json({ id, mechanicalIndex: result.mechanicalIndex, dimensionScores: result.dimensionScores, habits: result.habits, coachingSummary: result.coachingSummary, gameCategory: result.gameCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  } finally {
    try { fs.unlinkSync(req.file.path); } catch {}
  }
});

router.get('/history', requireAuth, (req, res) => {
  const { gameId, limit=20, offset=0 } = req.query;
  let q = `SELECT a.*,g.name as game_name,g.cover_emoji,g.category FROM analyses a JOIN games g ON a.game_id=g.id WHERE a.user_id=?`;
  const params = [req.user.id];
  if (gameId) { q += ' AND a.game_id=?'; params.push(gameId); }
  q += ' ORDER BY a.analyzed_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  const rows = getDb().prepare(q).all(...params);
  const analyses = rows.map(r => ({ ...r, dimensionScores: JSON.parse(r.scores_json||'{}'), habits: JSON.parse(r.habits_json||'[]') }));
  res.json({ analyses });
});

router.get('/stats/dashboard', requireAuth, (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  const overall = db.prepare('SELECT COUNT(*) as total_analyses, MAX(mechanical_index) as best_mi, AVG(mechanical_index) as avg_mi FROM analyses WHERE user_id=?').get(uid);
  const byGame = db.prepare('SELECT g.id,g.name,g.cover_emoji,COUNT(*) as clip_count,AVG(a.mechanical_index) as avg_mi FROM analyses a JOIN games g ON a.game_id=g.id WHERE a.user_id=? GROUP BY g.id ORDER BY clip_count DESC LIMIT 6').all(uid);
  const recentTrend = db.prepare('SELECT a.id,a.mechanical_index,a.analyzed_at,g.name as game_name,g.cover_emoji FROM analyses a JOIN games g ON a.game_id=g.id WHERE a.user_id=? ORDER BY a.analyzed_at DESC LIMIT 10').all(uid);
  res.json({ overall, byGame, recentTrend, streak: 0, persistentHabits: [] });
});

router.get('/:id', requireAuth, (req, res) => {
  const row = getDb().prepare('SELECT a.*,g.name as game_name,g.cover_emoji,g.category FROM analyses a JOIN games g ON a.game_id=g.id WHERE a.id=? AND a.user_id=?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ ...row, dimensionScores: JSON.parse(row.scores_json||'{}'), habits: JSON.parse(row.habits_json||'[]') });
});

router.delete('/:id', requireAuth, (req, res) => {
  getDb().prepare('DELETE FROM analyses WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ deleted: true });
});

module.exports = router;

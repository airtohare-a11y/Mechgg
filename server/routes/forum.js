const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/categories', (req, res) => {
  const cats = getDb().prepare('SELECT * FROM forum_categories ORDER BY sort_order').all();
  res.json({ categories: cats });
});

router.get('/posts', (req, res) => {
  const { categoryId, limit=20, offset=0 } = req.query;
  let q = `SELECT p.*,u.display_name as author_name,c.name as category_name,c.icon as category_icon FROM forum_posts p JOIN users u ON p.user_id=u.id JOIN forum_categories c ON p.category_id=c.id WHERE p.deleted_at IS NULL`;
  const params = [];
  if (categoryId) { q += ' AND p.category_id=?'; params.push(categoryId); }
  q += ' ORDER BY p.pinned DESC,p.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  res.json({ posts: getDb().prepare(q).all(...params) });
});

router.get('/posts/:id', (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT p.*,u.display_name as author_name FROM forum_posts p JOIN users u ON p.user_id=u.id WHERE p.id=? AND p.deleted_at IS NULL').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  db.prepare('UPDATE forum_posts SET view_count=view_count+1 WHERE id=?').run(req.params.id);
  const replies = db.prepare(`SELECT r.*,u.display_name as author_name FROM forum_replies r JOIN users u ON r.user_id=u.id WHERE r.post_id=? AND r.deleted_at IS NULL ORDER BY r.created_at ASC`).all(req.params.id);
  res.json({ post, replies });
});

router.post('/posts', requireAuth, (req, res) => {
  const { categoryId, title, body } = req.body;
  if (!categoryId || !title?.trim() || !body?.trim()) return res.status(400).json({ error: 'Category, title and body required' });
  if (title.length > 200) return res.status(400).json({ error: 'Title too long (max 200 chars)' });
  if (body.length > 10000) return res.status(400).json({ error: 'Body too long (max 10000 chars)' });
  const cat = getDb().prepare('SELECT id FROM forum_categories WHERE id=?').get(categoryId);
  if (!cat) return res.status(400).json({ error: 'Invalid category' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO forum_posts (id,category_id,user_id,title,body) VALUES (?,?,?,?,?)').run(id, categoryId, req.user.id, title.trim(), body.trim());
  getDb().prepare('UPDATE forum_categories SET post_count=post_count+1 WHERE id=?').run(categoryId);
  res.status(201).json({ id });
});

router.post('/posts/:id/reply', requireAuth, (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Body required' });
  if (body.length > 5000) return res.status(400).json({ error: 'Reply too long (max 5000 chars)' });
  const post = getDb().prepare('SELECT id,locked FROM forum_posts WHERE id=? AND deleted_at IS NULL').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.locked) return res.status(403).json({ error: 'Post is locked' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO forum_replies (id,post_id,user_id,body) VALUES (?,?,?,?)').run(id, req.params.id, req.user.id, body.trim());
  getDb().prepare('UPDATE forum_posts SET reply_count=reply_count+1, updated_at=unixepoch() WHERE id=?').run(req.params.id);
  res.status(201).json({ id });
});

router.post('/posts/:id/upvote', requireAuth, (req, res) => {
  getDb().prepare('UPDATE forum_posts SET upvotes=upvotes+1 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

router.delete('/posts/:id', requireAuth, (req, res) => {
  const post = getDb().prepare('SELECT user_id FROM forum_posts WHERE id=?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  getDb().prepare('UPDATE forum_posts SET deleted_at=unixepoch() WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

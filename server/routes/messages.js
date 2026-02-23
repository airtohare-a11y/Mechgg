const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/inbox', requireAuth, (req, res) => {
  const msgs = getDb().prepare(`
    SELECT m.*,u.display_name as sender_name FROM messages m
    JOIN users u ON m.sender_id=u.id
    WHERE m.recipient_id=? AND m.deleted_recipient=0
    ORDER BY m.created_at DESC LIMIT 50
  `).all(req.user.id);
  res.json({ messages: msgs });
});

router.get('/sent', requireAuth, (req, res) => {
  const msgs = getDb().prepare(`
    SELECT m.*,u.display_name as recipient_name FROM messages m
    JOIN users u ON m.recipient_id=u.id
    WHERE m.sender_id=? AND m.deleted_sender=0
    ORDER BY m.created_at DESC LIMIT 50
  `).all(req.user.id);
  res.json({ messages: msgs });
});

router.get('/unread-count', requireAuth, (req, res) => {
  const r = getDb().prepare('SELECT COUNT(*) as count FROM messages WHERE recipient_id=? AND read=0 AND deleted_recipient=0').get(req.user.id);
  res.json({ count: r.count });
});

router.post('/send', requireAuth, (req, res) => {
  const { recipientId, subject, body } = req.body;
  if (!recipientId || !body?.trim()) return res.status(400).json({ error: 'Recipient and body required' });
  if (body.trim().length > 2000) return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  if (req.body.subject && req.body.subject.length > 150) return res.status(400).json({ error: 'Subject too long (max 150 characters)' });
  if (recipientId === req.user.id) return res.status(400).json({ error: 'Cannot message yourself' });
  const recipient = getDb().prepare('SELECT id FROM users WHERE id=?').get(recipientId);
  if (!recipient) return res.status(404).json({ error: 'User not found' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO messages (id,sender_id,recipient_id,subject,body) VALUES (?,?,?,?,?)').run(id, req.user.id, recipientId, subject?.trim()||null, body.trim());
  res.status(201).json({ id });
});

router.post('/:id/read', requireAuth, (req, res) => {
  getDb().prepare('UPDATE messages SET read=1 WHERE id=? AND recipient_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const msg = db.prepare('SELECT * FROM messages WHERE id=?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Not found' });
  if (msg.sender_id === req.user.id) db.prepare('UPDATE messages SET deleted_sender=1 WHERE id=?').run(req.params.id);
  if (msg.recipient_id === req.user.id) db.prepare('UPDATE messages SET deleted_recipient=1 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

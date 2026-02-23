const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const REPORT_TYPES = ['coach_nonpayment','student_nonpayment','harassment','fraud','scam','inappropriate_content','other'];

router.post('/', requireAuth, (req, res) => {
  const { reportedUserId, reportType, subject, description, evidence } = req.body;
  if (!reportedUserId || !reportType || !subject?.trim() || !description?.trim())
    return res.status(400).json({ error: 'All fields required' });
  if (!REPORT_TYPES.includes(reportType))
    return res.status(400).json({ error: 'Invalid report type' });
  if (reportedUserId === req.user.id)
    return res.status(400).json({ error: 'Cannot report yourself' });
  const reported = getDb().prepare('SELECT id,display_name FROM users WHERE id=?').get(reportedUserId);
  if (!reported) return res.status(404).json({ error: 'User not found' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO reports (id,reporter_id,reported_user_id,report_type,subject,description,evidence) VALUES (?,?,?,?,?,?,?)').run(id, req.user.id, reportedUserId, reportType, subject.trim(), description.trim(), evidence?.trim()||null);
  res.status(201).json({ id, message: 'Report submitted. Mech.gg will review within 3 business days. You will be notified at your registered email.' });
});

router.get('/my-reports', requireAuth, (req, res) => {
  const reports = getDb().prepare(`
    SELECT r.*,u.display_name as reported_name FROM reports r
    JOIN users u ON r.reported_user_id=u.id
    WHERE r.reporter_id=? ORDER BY r.created_at DESC
  `).all(req.user.id);
  res.json({ reports });
});

router.get('/report-types', (req, res) => {
  res.json({ types: [
    { id:'coach_nonpayment', label:'Coach Did Not Pay / Honor Agreement', forRole:'student' },
    { id:'student_nonpayment', label:'Student Did Not Pay / Honor Agreement', forRole:'coach' },
    { id:'harassment', label:'Harassment or Abusive Behavior', forRole:'both' },
    { id:'fraud', label:'Fraud or Misrepresentation', forRole:'both' },
    { id:'scam', label:'Scam or Unauthorized Charges', forRole:'both' },
    { id:'inappropriate_content', label:'Inappropriate Content or Conduct', forRole:'both' },
    { id:'other', label:'Other Violation', forRole:'both' },
  ]});
});

module.exports = router;

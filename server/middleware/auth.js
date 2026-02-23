const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

const PLANS = {
  free:    { label: 'Free',       limit: 3 },
  starter: { label: 'Starter',    limit: 15 },
  pro:     { label: 'Pro',        limit: 50 },
  paypera: { label: 'Pay Per Use',limit: 0 }, // enforced via credits system, not monthly quota
  coach:   { label: 'Coach',      limit: 200 },
  team:    { label: 'Team',       limit: 9999 },
};

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-secret');
    const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

function checkQuota(req, res, next) {
  const user = req.user;
  const now = Math.floor(Date.now() / 1000);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const db = getDb();
  if (user.month_reset_at < Math.floor(monthStart.getTime()/1000)) {
    db.prepare('UPDATE users SET analyses_this_month=0, month_reset_at=? WHERE id=?').run(now, user.id);
    user.analyses_this_month = 0;
  }
  // Pay-per-use: check credits instead of monthly limit
  if (user.plan_tier === 'paypera') {
    const credits = getDb().prepare('SELECT credits FROM payperuse_credits WHERE user_id=?').get(user.id);
    if (!credits || credits.credits <= 0) return res.status(429).json({ error: 'No analysis credits remaining. Purchase more credits to continue.', code: 'NO_CREDITS' });
    return next();
  }
  const limit = PLANS[user.plan_tier]?.limit || 3;
  if (user.analyses_this_month >= limit) return res.status(429).json({ error: `Monthly limit of ${limit} analyses reached. Upgrade your plan.`, code: 'QUOTA_EXCEEDED' });
  next();
}

module.exports = { requireAuth, checkQuota, PLANS };

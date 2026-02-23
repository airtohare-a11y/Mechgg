require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { initDb, migrateDb } = require('./database');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 200, message: { error: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
const uploadLimiter = rateLimit({ windowMs: 60*60*1000, max: 30, message: { error: 'Upload rate limit reached. Try again later.' } });
const reportLimiter = rateLimit({ windowMs: 60*60*1000, max: 5, message: { error: 'Report limit reached. Contact mechggofficial@gmail.com for urgent issues.' } });

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start in production without it.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1); // Required for rate limiting and HTTPS detection behind Replit proxy
app.use(morgan('combined'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN || true : true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

initDb();
migrateDb();

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/analysis', uploadLimiter, require('./routes/analysis'));
app.use('/api/community', require('./routes/community'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/drills', require('./routes/drills'));
app.use('/api/mechbot', require('./routes/mechbot'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/reports', reportLimiter, require('./routes/reports'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large. Maximum size is 500MB.' });
  if (err.message === 'Invalid file type — only video files accepted') return res.status(400).json({ error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎯 Mech.gg running on port ${PORT}`);
});

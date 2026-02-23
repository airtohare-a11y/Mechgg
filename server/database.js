const Database = require('better-sqlite3');
const path = require('path');
let db;

function getDb() {
  if (!db) db = new Database(path.join(__dirname, '../mechgg.db'));
  return db;
}

function initDb() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      plan_tier TEXT DEFAULT 'free',
      analyses_this_month INTEGER DEFAULT 0,
      month_reset_at INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      cover_emoji TEXT DEFAULT '🎮'
    );
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_id TEXT NOT NULL,
      mechanical_index REAL,
      scores_json TEXT,
      habits_json TEXT,
      coaching_summary TEXT,
      analyzed_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (game_id) REFERENCES games(id)
    );
    CREATE TABLE IF NOT EXISTS community_findings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_id TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      anonymous INTEGER DEFAULT 0,
      upvotes INTEGER DEFAULT 0,
      pinned INTEGER DEFAULT 0,
      deleted_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS finding_upvotes (
      finding_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (finding_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS finding_comments (
      id TEXT PRIMARY KEY,
      finding_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      anonymous INTEGER DEFAULT 0,
      deleted_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS coach_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      display_name TEXT,
      bio TEXT,
      specialty_games TEXT,
      rate_info TEXT,
      contact_info TEXT,
      avg_rating REAL,
      review_count INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS coach_reviews (
      id TEXT PRIMARY KEY,
      coach_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      body TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `);

  const GAMES = [
    ['valorant','Valorant','fps','🎯'],['csgo','CS2','fps','🎯'],['apex','Apex Legends','fps','🎯'],
    ['fortnite','Fortnite','fps','🎯'],['overwatch2','Overwatch 2','fps','🎯'],['r6siege','Rainbow Six Siege','fps','🎯'],
    ['warzone','Warzone','fps','🎯'],['arcraiders','Arc Raiders','fps','🎯'],
    ['f1','F1','racing','🏎️'],['gt7','Gran Turismo 7','racing','🏎️'],['forzamotorsport','Forza Motorsport','racing','🏎️'],
    ['forzahorizon','Forza Horizon','racing','🏎️'],['mariokart','Mario Kart','racing','🏎️'],['dirtally','Dirt Rally','racing','🏎️'],
    ['fifa','EA FC / FIFA','sports','⚽'],['nba2k','NBA 2K','sports','🏀'],['madden','Madden','sports','🏈'],
    ['nhl','EA NHL','sports','🏒'],['mlbtheshow','MLB The Show','sports','⚾'],
    ['starcraft2','StarCraft II','strategy','⚔️'],['aoe4','Age of Empires IV','strategy','⚔️'],
    ['leagueoflegends','League of Legends','strategy','⚔️'],['dota2','Dota 2','strategy','⚔️'],
    ['sf6','Street Fighter 6','fighting','👊'],['tekken8','Tekken 8','fighting','👊'],
    ['mortalkombat','Mortal Kombat','fighting','👊'],['smashbros','Super Smash Bros.','fighting','👊'],
    ['other','Other','fps','🎮'],
  ];

  const insert = db.prepare('INSERT OR IGNORE INTO games (id,name,category,cover_emoji) VALUES (?,?,?,?)');
  GAMES.forEach(g => insert.run(...g));
  console.log('✅ Database ready');
}

module.exports = { getDb, initDb };

// This will be called separately to add new tables
function migrateDb() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      deleted_sender INTEGER DEFAULT 0,
      deleted_recipient INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS forum_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT '💬',
      post_count INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS forum_posts (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      pinned INTEGER DEFAULT 0,
      locked INTEGER DEFAULT 0,
      upvotes INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      reply_count INTEGER DEFAULT 0,
      deleted_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (category_id) REFERENCES forum_categories(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS forum_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      deleted_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (post_id) REFERENCES forum_posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS drill_plans (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      completed_drills TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (analysis_id) REFERENCES analyses(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed forum categories
  const cats = [
    ['fps-general','FPS / Shooter','Tips, clips, and discussions for FPS games','fps-general','🎯',1],
    ['racing-general','Racing Games','Racing lines, setups, and lap time discussions','racing-general','🏎️',2],
    ['sports-general','Sports Games','Sports game tactics and execution tips','sports-general','⚽',3],
    ['strategy-general','Strategy / MOBA','Build orders, macro, and decision making','strategy-general','⚔️',4],
    ['fighting-general','Fighting Games','Frame data, combos, and matchup discussions','fighting-general','👊',5],
    ['coaching','Find a Coach','Connect with coaches and mentors','coaching','🎓',6],
    ['improvement','Improvement Logs','Share your progress journey','improvement','📈',7],
    ['general','General Discussion','Everything else gaming related','general','💬',8],
  ];
  const ins = db.prepare('INSERT OR IGNORE INTO forum_categories (id,name,description,slug,icon,sort_order) VALUES (?,?,?,?,?,?)');
  cats.forEach(c => ins.run(...c));
  console.log('✅ Forum seeded');

  // Ad spots
  const db2 = getDb();
  db2.exec(`
    CREATE TABLE IF NOT EXISTS coach_upvotes (
      coach_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (coach_id, voter_id)
    );
    CREATE TABLE IF NOT EXISTS ad_spots (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      slot TEXT NOT NULL,
      advertiser_name TEXT,
      ad_image_url TEXT,
      ad_link TEXT,
      ad_alt TEXT,
      active INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      plan_tier TEXT,
      status TEXT DEFAULT 'pending',
      stripe_payment_intent TEXT,
      refund_status TEXT,
      refund_reason TEXT,
      refunded_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS refund_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_note TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      resolved_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    );
  `);

  db2.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      reported_user_id TEXT NOT NULL,
      report_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT,
      status TEXT DEFAULT 'open',
      admin_note TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      resolved_at INTEGER,
      FOREIGN KEY (reporter_id) REFERENCES users(id),
      FOREIGN KEY (reported_user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS payperuse_credits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      credits INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed placeholder ad spots
  const adSlots = [
    ['ad-home-top','landing','top-banner'],
    ['ad-home-mid','landing','mid-banner'],
    ['ad-dashboard-sidebar','dashboard','sidebar'],
    ['ad-upload-sidebar','upload','sidebar'],
    ['ad-community-banner','community','top-banner'],
    ['ad-forum-sidebar','forum','sidebar'],
    ['ad-pricing-banner','pricing','top-banner'],
    ['ad-history-sidebar','history','sidebar'],
    ['ad-analysis-sidebar','analysis','sidebar'],
  ];
  const adIns = db2.prepare('INSERT OR IGNORE INTO ad_spots (id,page,slot,active) VALUES (?,?,?,0)');
  adSlots.forEach(([id,page,slot]) => adIns.run(id,page,slot));
}

module.exports = { getDb, initDb, migrateDb };

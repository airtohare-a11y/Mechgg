const express = require('express');
const { getDb } = require('../database');
const router = express.Router();

router.get('/:page', (req, res) => {
  const ads = getDb().prepare('SELECT * FROM ad_spots WHERE page=? AND active=1').all(req.params.page);
  const placeholders = getDb().prepare('SELECT * FROM ad_spots WHERE page=?').all(req.params.page);
  res.json({ ads, placeholders });
});

module.exports = router;

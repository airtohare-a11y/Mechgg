const express = require('express');
const { getDb } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let q = 'SELECT * FROM games ORDER BY name';
  const games = category ? getDb().prepare('SELECT * FROM games WHERE category=? ORDER BY name').all(category) : getDb().prepare(q).all();
  res.json({ games });
});

router.get('/categories', (req, res) => {
  const rows = getDb().prepare('SELECT DISTINCT category FROM games').all();
  res.json({ categories: rows.map(r => r.category) });
});

router.get('/:id', (req, res) => {
  const game = getDb().prepare('SELECT * FROM games WHERE id=?').get(req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json({ game });
});

module.exports = router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth, PLANS } = require('../middleware/auth');
const router = express.Router();

const PLAN_PRICES = {
  starter: { cents:  499, label: 'Starter Plan — $4.99/month' },
  pro:     { cents:  999, label: 'Pro Plan — $9.99/month' },
  paypera: { cents:  199, label: 'Pay Per Analysis — $1.99 each' },
  coach:   { cents: 4999, label: 'Coach Plan — $49.99/month' },
  team:    { cents: 9999, label: 'Team Plan — $99.99/month' },
};

// Create a payment record (Stripe-ready stub)
router.post('/create', requireAuth, async (req, res) => {
  const { plan } = req.body;
  if (!PLAN_PRICES[plan]) return res.status(400).json({ error: 'Invalid plan' });
  const price = PLAN_PRICES[plan];
  const id = uuidv4();

  // In production: create Stripe PaymentIntent here
  // const intent = await stripe.paymentIntents.create({ amount: price.cents, currency: 'usd', metadata: { userId: req.user.id, plan } });
  // For now: record as pending
  getDb().prepare('INSERT INTO payments (id,user_id,amount_cents,plan_tier,status,stripe_payment_intent) VALUES (?,?,?,?,?,?)')
    .run(id, req.user.id, price.cents, plan, 'pending', 'stripe_not_configured');

  res.json({
    paymentId: id,
    amount: price.cents,
    label: price.label,
    // clientSecret: intent.client_secret  // Uncomment when Stripe is configured
    stripeReady: false,
    message: 'Payment processing is not yet configured. Contact mechggofficial@gmail.com to arrange payment.',
    contactEmail: 'mechggofficial@gmail.com',
  });
});

// Confirm payment (called by Stripe webhook in production)
router.post('/confirm', requireAuth, (req, res) => {
  const { paymentId } = req.body;
  const db = getDb();
  const payment = db.prepare('SELECT * FROM payments WHERE id=? AND user_id=?').get(paymentId, req.user.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  db.prepare('UPDATE payments SET status=? WHERE id=?').run('completed', paymentId);
  db.prepare('UPDATE users SET plan_tier=? WHERE id=?').run(payment.plan_tier, req.user.id);
  res.json({ success: true, plan: payment.plan_tier });
});

// Get payment history
router.get('/history', requireAuth, (req, res) => {
  const payments = getDb().prepare('SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json({ payments });
});

// Submit refund request
router.post('/refund', requireAuth, (req, res) => {
  const { paymentId, reason } = req.body;
  if (!paymentId || !reason?.trim()) return res.status(400).json({ error: 'Payment ID and reason required' });
  const db = getDb();
  const payment = db.prepare('SELECT * FROM payments WHERE id=? AND user_id=?').get(paymentId, req.user.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (payment.status !== 'completed') return res.status(400).json({ error: 'Only completed payments can be refunded' });
  if (payment.refund_status) return res.status(400).json({ error: 'A refund request already exists for this payment' });
  const id = uuidv4();
  db.prepare('INSERT INTO refund_requests (id,user_id,payment_id,reason) VALUES (?,?,?,?)').run(id, req.user.id, paymentId, reason.trim());
  db.prepare('UPDATE payments SET refund_status=? WHERE id=?').run('requested', paymentId);
  res.status(201).json({ id, message: 'Refund request submitted. We will review within 3-5 business days and respond to your registered email.' });
});

// Get refund requests for user
router.get('/refunds', requireAuth, (req, res) => {
  const refunds = getDb().prepare('SELECT r.*,p.amount_cents,p.plan_tier FROM refund_requests r JOIN payments p ON r.payment_id=p.id WHERE r.user_id=? ORDER BY r.created_at DESC').all(req.user.id);
  res.json({ refunds });
});

module.exports = router;

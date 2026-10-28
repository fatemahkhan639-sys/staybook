const express = require('express');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Stripe is only ever loaded when the keys exist. On a deployment
// without Stripe, the card option stays hidden on the client and
// this route refuses to pretend a payment happened.
function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  // Lazy require keeps the module out of servers that never use it.
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// POST /api/payments — pay for a booking you own.
// Card: creates a Stripe PaymentIntent and returns its clientSecret
// for the client to confirm; without keys it answers requires_setup
// and creates nothing. Wallet: records the guest's transaction for
// an admin to verify. Pay-at-property just marks the booking.
router.post('/', requireAuth, async (req, res) => {
  const { bookingId, method, walletNumber, transactionId } = req.body;

  if (!bookingId || !method) {
    return res.status(400).json({ message: 'A booking and a payment method are required.' });
  }

  const booking = await Booking.findOne({ _id: bookingId, user: req.userId });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'This booking was cancelled.' });
  }

  if (method === 'payAtProperty') {
    booking.paymentMethod = 'payAtProperty';
    booking.paymentStatus = 'unpaid';
    await booking.save();
    return res.json({ status: 'unpaid', booking });
  }

  if (method === 'wallet') {
    if (!walletNumber || !transactionId) {
      return res.status(400).json({ message: 'Wallet number and transaction id are required.' });
    }
    const payment = await Payment.create({
      booking: booking._id,
      user: req.userId,
      method: 'wallet',
      amount: booking.totalPrice,
      status: 'pending_verification',
      walletNumber,
      transactionId,
    });
    booking.paymentMethod = 'wallet';
    booking.paymentStatus = 'pending_verification';
    await booking.save();
    return res.status(201).json(payment);
  }

  if (method === 'card') {
    const stripe = stripeClient();
    if (!stripe) return res.json({ status: 'requires_setup' });

    // PKR uses paisa as its minor unit.
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'pkr',
      metadata: { bookingId: booking._id.toString() },
    });
    const payment = await Payment.create({
      booking: booking._id,
      user: req.userId,
      method: 'card',
      amount: booking.totalPrice,
      status: 'pending',
      paymentIntentId: intent.id,
    });
    booking.paymentMethod = 'card';
    await booking.save();
    return res.status(201).json({ ...payment.toObject(), clientSecret: intent.client_secret });
  }

  return res.status(400).json({ message: 'Unknown payment method.' });
});

// GET /api/payments/mine — the guest's own payment attempts.
router.get('/mine', requireAuth, async (req, res) => {
  const payments = await Payment.find({ user: req.userId })
    .populate('booking', 'roomName checkIn checkOut totalPrice')
    .sort({ createdAt: -1 });
  return res.json(payments);
});

// POST /api/payments/webhook — Stripe calls this, not the browser.
// The signature check is the whole point: an unsigned request is
// refused before anything is marked paid.
// TODO: register this URL in the Stripe dashboard with
// STRIPE_WEBHOOK_SECRET set, or the endpoint stays inert.
router.post('/webhook', async (req, res) => {
  const stripe = stripeClient();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ message: 'Stripe is not configured.' });
  }

  const signature = req.headers['stripe-signature'];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid webhook signature.' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const payment = await Payment.findOne({ paymentIntentId: intent.id });
    if (payment && payment.status !== 'paid') {
      payment.status = 'paid';
      await payment.save();
      await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'paid' });
    }
  }

  return res.json({ received: true });
});

module.exports = router;

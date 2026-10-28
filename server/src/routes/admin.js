const express = require('express');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// Every route here is admin-only: a normal signed-in guest gets a
// 403 from the middleware before any handler runs.
router.use(requireAdmin);

router.get('/bookings', async (req, res) => {
  const bookings = await Booking.find()
    .populate('hotel', 'name city')
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(bookings);
});

router.get('/hotels', async (req, res) => {
  const hotels = await Hotel.find().sort({ createdAt: -1 }).limit(200);
  return res.json(hotels);
});

// Only real hotel fields are accepted; ownership and ids are never
// overwritten from a request body.
router.patch('/hotels/:id', async (req, res) => {
  const body = { ...req.body };
  delete body._id;
  delete body.listedBy;
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });
  return res.json(hotel);
});

router.delete('/hotels/:id', async (req, res) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });
  return res.json({ message: 'Hotel removed.' });
});

router.get('/payments', async (req, res) => {
  const payments = await Payment.find()
    .populate('booking', 'roomName checkIn totalPrice')
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(payments);
});

// Mark a manual wallet payment as checked. Card payments are only
// ever marked paid by the Stripe webhook, never by hand.
router.patch('/payments/:id/verify', async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found.' });
  if (payment.method !== 'wallet') {
    return res.status(400).json({ message: 'Only wallet payments can be verified by hand.' });
  }

  payment.status = 'paid';
  await payment.save();
  await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'paid' });
  return res.json(payment);
});

router.get('/coupons', async (req, res) => {
  return res.json(await Coupon.find().sort({ createdAt: -1 }));
});

router.post('/coupons', async (req, res) => {
  const { code, discountPercent, validFrom, validUntil, maxUses, active } = req.body;
  if (!code || discountPercent == null) {
    return res.status(400).json({ message: 'A code and a discount percent are required.' });
  }
  const coupon = await Coupon.create({
    code,
    discountPercent,
    validFrom: validFrom || null,
    validUntil: validUntil || null,
    maxUses: maxUses ?? null,
    active: active !== false,
  });
  return res.status(201).json(coupon);
});

router.patch('/coupons/:id', async (req, res) => {
  const body = { ...req.body };
  delete body._id;
  delete body.usedCount;
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
  return res.json(coupon);
});

router.delete('/coupons/:id', async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
  return res.json({ message: 'Coupon removed.' });
});

module.exports = router;

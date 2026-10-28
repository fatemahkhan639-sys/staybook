const express = require('express');
const Flight = require('../models/Flight');
const Car = require('../models/Car');
const Activity = require('../models/Activity');
const Transfer = require('../models/Transfer');
const VerticalBooking = require('../models/VerticalBooking');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function regexMatch(value) {
  return value ? { $regex: value, $options: 'i' } : undefined;
}

// Search endpoints: an empty filter means "everything", the way
// the hotel search works when no destination is typed.
router.get('/flights', async (req, res) => {
  const filter = {};
  const from = regexMatch(req.query.from);
  const to = regexMatch(req.query.to);
  if (from) filter.from = from;
  if (to) filter.to = to;
  const rows = await Flight.find(filter).sort({ price: 1 });
  return res.json(rows);
});

router.get('/cars', async (req, res) => {
  const filter = {};
  const city = regexMatch(req.query.city);
  if (city) filter.city = city;
  const rows = await Car.find(filter).sort({ pricePerDay: 1 });
  return res.json(rows);
});

router.get('/activities', async (req, res) => {
  const filter = {};
  const city = regexMatch(req.query.city);
  const category = regexMatch(req.query.category);
  if (city) filter.city = city;
  if (category) filter.category = category;
  const rows = await Activity.find(filter).sort({ rating: -1 });
  return res.json(rows);
});

router.get('/transfers', async (req, res) => {
  const filter = {};
  const airport = regexMatch(req.query.airport);
  if (airport) filter.airport = airport;
  const rows = await Transfer.find(filter).sort({ price: 1 });
  return res.json(rows);
});

function nightsBetween(from, to) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const n = Math.round((new Date(to) - new Date(from)) / msPerDay);
  return n > 0 ? n : 1;
}

// POST /api/vertical-bookings — book a flight, car, activity or
// transfer. Works signed in or as a guest, and the price is
// worked out on the server from the listing, never from the
// request. Payment is on the day, like pay-at-property.
router.post('/vertical-bookings', optionalAuth, async (req, res) => {
  const {
    kind, itemId, travelDate, returnDate, adults, children,
    tickets, flightNumber, guestDetails,
  } = req.body;

  const models = { flight: Flight, car: Car, activity: Activity, transfer: Transfer };
  const Model = models[kind];
  if (!Model) return res.status(400).json({ message: 'Unknown booking type.' });
  if (!itemId || !travelDate || !guestDetails?.email) {
    return res.status(400).json({ message: 'Item, travel date and guest email are required.' });
  }

  const item = await Model.findById(itemId);
  if (!item) return res.status(404).json({ message: 'That listing was not found.' });

  const people = (adults || 1) + (children || 0);
  let totalPrice = 0;
  let title = '';
  let detail = '';
  let extra = '';
  if (kind === 'flight') {
    totalPrice = item.price * people;
    title = `${item.airline} ${item.flightNumber} · ${item.from} → ${item.to}`;
    detail = `${item.departAt} → ${item.arriveAt} · ${item.duration} · ${item.cabin}`;
  } else if (kind === 'car') {
    const days = returnDate ? nightsBetween(travelDate, returnDate) : 1;
    totalPrice = item.pricePerDay * days;
    title = `${item.name} · ${item.city}`;
    detail = `${item.type} · ${item.transmission} · ${item.fuel} · ${days} day${days > 1 ? 's' : ''}`;
  } else if (kind === 'activity') {
    const count = tickets || people;
    totalPrice = item.price * count;
    title = item.title;
    detail = `${item.city} · ${item.duration} · ${count} ticket${count > 1 ? 's' : ''}`;
    extra = String(count);
  } else {
    totalPrice = item.price;
    title = `${item.airport} → ${item.destination}`;
    detail = `${item.vehicleType} · up to ${item.capacity} passengers`;
    extra = flightNumber || '';
  }

  const booking = await VerticalBooking.create({
    user: req.userId || null,
    kind,
    itemId: item._id.toString(),
    title,
    detail,
    travelDate,
    returnDate: returnDate || '',
    adults: adults || 1,
    children: children || 0,
    extra,
    totalPrice,
    guestDetails,
  });

  return res.status(201).json(booking);
});

// GET /api/vertical-bookings/mine — the signed-in guest's trips.
router.get('/vertical-bookings/mine', requireAuth, async (req, res) => {
  const bookings = await VerticalBooking.find({ user: req.userId }).sort({ createdAt: -1 });
  return res.json(bookings);
});

// PATCH /api/vertical-bookings/:id/cancel — cancel your own booking.
router.patch('/vertical-bookings/:id/cancel', requireAuth, async (req, res) => {
  const booking = await VerticalBooking.findOne({ _id: req.params.id, user: req.userId });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.status = 'cancelled';
  await booking.save();
  return res.json(booking);
});

// One item endpoint per kind, for the booking page. It sits
// last on purpose: the /vertical-bookings routes above must
// match before this catch-all shape does.
router.get('/:kind/:id', async (req, res) => {
  const models = { flight: Flight, car: Car, activity: Activity, transfer: Transfer };
  const Model = models[req.params.kind];
  if (!Model) return res.status(404).json({ message: 'Unknown booking type.' });
  const item = await Model.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found.' });
  return res.json(item);
});

module.exports = router;

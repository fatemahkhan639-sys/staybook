const express = require('express');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { bookedUnits } = require('../services/availability');
const { loyaltyFor } = require('../services/loyalty');
const { validateCoupon } = require('../services/coupons');
const { sendBookingConfirmation } = require('../services/email');

const router = express.Router();

// Whole nights between two dates (check-out day is not charged).
function countNights(checkIn, checkOut) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay);
}

// Dates come in as "2026-11-05" strings; comparing them as dates
// (not timestamps) is what "in the past" means to a guest.
function startOfDay(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST /api/bookings — reserve a room. Works signed in or as a guest.
// Rejects past dates, checkout-before-checkin, too many guests for
// the room, and stays that would oversell the room's inventory.
router.post('/', optionalAuth, async (req, res) => {
  const {
    hotelId, roomName, checkIn, checkOut, guests, guestDetails,
    couponCode, paymentMethod, specialRequests, arrivalTime,
  } = req.body;

  if (!hotelId || !roomName || !checkIn || !checkOut || !guestDetails?.email) {
    return res.status(400).json({ message: 'Hotel, room, dates and guest email are required.' });
  }

  const nights = countNights(checkIn, checkOut);
  if (nights < 1) {
    return res.status(400).json({ message: 'Check-out must be after check-in.' });
  }
  if (startOfDay(checkIn) < startOfDay(new Date())) {
    return res.status(400).json({ message: 'Check-in cannot be in the past.' });
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const room = hotel.rooms.find((r) => r.name === roomName);
  if (!room) return res.status(400).json({ message: 'That room type is not available here.' });

  const roomCount = guests?.rooms || 1;
  const people = (guests?.adults || 2) + (guests?.children || 0);
  if (people > room.maxGuests * roomCount) {
    return res.status(400).json({
      message: `This room sleeps ${room.maxGuests} per room; ${people} guests need more rooms.`,
    });
  }

  const taken = await bookedUnits(hotel._id, roomName, checkIn, checkOut);
  if (taken + roomCount > (room.totalUnits ?? 5)) {
    return res.status(400).json({ message: 'Not enough rooms left for those dates.' });
  }

  const subtotal = room.pricePerNight * nights * roomCount;
  const taxAmount = Math.round(subtotal * 0.16);

  let loyaltyDiscount = 0;
  if (req.userId) {
    const loyalty = await loyaltyFor(req.userId);
    loyaltyDiscount = Math.round(subtotal * (loyalty.discountPercent / 100));
  }

  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const check = await validateCoupon(couponCode, subtotal);
    if (!check.valid) return res.status(400).json({ message: check.reason });
    discountAmount = check.discountAmount;
    appliedCoupon = check.coupon;
  }

  const method = ['payAtProperty', 'card', 'wallet'].includes(paymentMethod)
    ? paymentMethod
    : 'payAtProperty';

  const booking = await Booking.create({
    user: req.userId || null,
    hotel: hotel._id,
    roomName,
    checkIn,
    checkOut,
    nights,
    guests: {
      adults: guests?.adults || 2,
      children: guests?.children || 0,
      rooms: roomCount,
    },
    guestDetails,
    specialRequests: specialRequests || guestDetails.specialRequests || '',
    arrivalTime: arrivalTime || guestDetails.arrivalTime || '',
    subtotal,
    taxAmount,
    loyaltyDiscount,
    couponCode: appliedCoupon ? appliedCoupon.code : null,
    discountAmount,
    totalPrice: Math.max(0, subtotal + taxAmount - loyaltyDiscount - discountAmount),
    paymentMethod: method,
    // Wallet stays unverified until an admin checks the transaction;
    // card stays unpaid until Stripe confirms it.
    paymentStatus: method === 'wallet' ? 'pending_verification' : 'unpaid',
  });

  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    await appliedCoupon.save();
  }

  // Email is best-effort: a missing SMTP setup must never fail a booking.
  sendBookingConfirmation(booking, hotel).catch(() => {});

  return res.status(201).json(booking);
});

// GET /api/bookings/mine — the signed-in guest's trips.
router.get('/mine', requireAuth, async (req, res) => {
  const bookings = await Booking.find({ user: req.userId })
    .populate('hotel', 'name city images')
    .sort({ createdAt: -1 });
  return res.json(bookings);
});

// PATCH /api/bookings/:id/cancel — cancel your own booking.
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.userId });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });

  booking.status = 'cancelled';
  await booking.save();
  return res.json(booking);
});

module.exports = router;

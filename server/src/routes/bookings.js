const express = require('express');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Whole nights between two dates (check-out day is not charged).
function countNights(checkIn, checkOut) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay);
}

// POST /api/bookings — reserve a room. Works signed in or as a guest.
router.post('/', optionalAuth, async (req, res) => {
  const { hotelId, roomName, checkIn, checkOut, guests, guestDetails } = req.body;

  if (!hotelId || !roomName || !checkIn || !checkOut || !guestDetails?.email) {
    return res.status(400).json({ message: 'Hotel, room, dates and guest email are required.' });
  }

  const nights = countNights(checkIn, checkOut);
  if (nights < 1) {
    return res.status(400).json({ message: 'Check-out must be after check-in.' });
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const room = hotel.rooms.find((r) => r.name === roomName);
  if (!room) return res.status(400).json({ message: 'That room type is not available here.' });

  const roomCount = guests?.rooms || 1;
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
    // The guest is not charged at reservation time; this is the
    // total they will pay at the property (or online, per the rate).
    totalPrice: room.pricePerNight * nights * roomCount,
  });

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

const express = require('express');
const Hotel = require('../models/Hotel');
const Wishlist = require('../models/Wishlist');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Everything here needs a signed-in guest: a wishlist belongs
// to an account, and guests have none.
router.use(requireAuth);

// GET /api/wishlist — the guest's saved stays, with hotel cards.
router.get('/', async (req, res) => {
  const rows = await Wishlist.find({ user: req.userId })
    .populate('hotel')
    .sort({ createdAt: -1 });
  return res.json(rows);
});

// POST /api/wishlist — save a stay. Saving twice returns the
// existing row instead of an error, so the button can toggle.
router.post('/', async (req, res) => {
  const { hotelId } = req.body;
  if (!hotelId) return res.status(400).json({ message: 'A hotel is required.' });

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const existing = await Wishlist.findOne({ user: req.userId, hotel: hotelId });
  if (existing) return res.json(existing);

  const created = await Wishlist.create({ user: req.userId, hotel: hotelId });
  return res.status(201).json(created);
});

// DELETE /api/wishlist/:hotelId — remove a stay by hotel, not by
// wishlist row id: the client knows the hotel, not the row.
router.delete('/:hotelId', async (req, res) => {
  await Wishlist.deleteOne({ user: req.userId, hotel: req.params.hotelId });
  return res.json({ message: 'Removed from wishlist.' });
});

module.exports = router;

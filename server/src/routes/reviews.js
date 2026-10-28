const express = require('express');
const Hotel = require('../models/Hotel');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews — leave a review, then refresh the hotel's score.
router.post('/', requireAuth, async (req, res) => {
  const { hotelId, rating, comment, categories } = req.body;

  if (!hotelId || !rating) {
    return res.status(400).json({ message: 'Hotel and rating are required.' });
  }

  const review = await Review.create({
    user: req.userId,
    hotel: hotelId,
    rating,
    comment: comment || '',
    categories: categories || {},
  });

  // Recompute the hotel's average score from all its reviews.
  const all = await Review.find({ hotel: hotelId });
  const average = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
  await Hotel.findByIdAndUpdate(hotelId, {
    reviewScore: Math.round(average * 10) / 10,
    reviewCount: all.length,
  });

  return res.status(201).json(review);
});

// POST /api/reviews/:id/reply — the host who listed the hotel, or
// an admin, answers a review. Guests cannot reply to each other.
router.post('/:id/reply', requireAuth, async (req, res) => {
  const { hostReply } = req.body;
  if (!hostReply || !String(hostReply).trim()) {
    return res.status(400).json({ message: 'A reply is required.' });
  }

  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found.' });

  const hotel = await Hotel.findById(review.hotel);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const User = require('../models/User');
  const user = await User.findById(req.userId);
  const isOwner = hotel.listedBy && String(hotel.listedBy) === req.userId;
  if (!isOwner && (!user || user.role !== 'admin')) {
    return res.status(403).json({ message: 'Only the host or an admin can reply.' });
  }

  review.hostReply = String(hostReply).trim();
  await review.save();
  return res.json(review);
});

module.exports = router;

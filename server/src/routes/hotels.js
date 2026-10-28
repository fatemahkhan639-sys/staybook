const express = require('express');
const Hotel = require('../models/Hotel');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Words shown next to a review score, the way guests read them.
function scoreLabel(score) {
  if (score >= 9) return 'Wonderful';
  if (score >= 8) return 'Very Good';
  if (score >= 7) return 'Good';
  if (score >= 6) return 'Pleasant';
  return 'Review score';
}

// GET /api/hotels — search + filters + sorting.
// Query params: destination, type, minPrice, maxPrice, minStars,
// minScore, amenities (comma separated), freeCancellation, sort, page, limit.
router.get('/', async (req, res) => {
  const {
    destination, type, minPrice, maxPrice, minStars, minScore,
    amenities, freeCancellation, deals, sort, page = 1, limit = 20,
  } = req.query;

  const filter = {};

  if (destination) {
    // Match the city or the hotel name, case-insensitive.
    filter.$or = [
      { city: { $regex: destination, $options: 'i' } },
      { name: { $regex: destination, $options: 'i' } },
    ];
  }
  if (type) filter.type = type;
  if (minPrice || maxPrice) {
    filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
  }
  if (minStars) filter.starRating = { $gte: Number(minStars) };
  if (minScore) filter.reviewScore = { $gte: Number(minScore) };
  if (amenities) {
    filter.amenities = { $all: amenities.split(',').map((a) => a.trim()) };
  }
  if (freeCancellation === 'true') {
    filter['rooms.freeCancellation'] = true;
  }
  // Deals page: only stays whose original price is higher than
  // the price guests actually pay.
  if (deals === 'true') {
    filter.$expr = { $gt: ['$originalPrice', '$pricePerNight'] };
  }

  // "Our top picks" blends score and popularity; the rest are plain sorts.
  const sortBy = { top: { reviewScore: -1, reviewCount: -1 } }[sort]
    || { priceAsc: { pricePerNight: 1 } }[sort]
    || { priceDesc: { pricePerNight: -1 } }[sort]
    || { rating: { starRating: -1 } }[sort]
    || { reviewScore: -1, reviewCount: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [hotels, total] = await Promise.all([
    Hotel.find(filter).sort(sortBy).skip(skip).limit(Number(limit)),
    Hotel.countDocuments(filter),
  ]);

  return res.json({
    hotels: hotels.map((h) => ({ ...h.toObject(), scoreLabel: scoreLabel(h.reviewScore) })),
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/hotels/featured — the "Homes guests love" row on the homepage.
router.get('/featured', async (req, res) => {
  const hotels = await Hotel.find({ featured: true }).limit(8);
  return res.json(hotels);
});

// GET /api/hotels/meta/destinations — every city with its hotel
// count, for the Destinations page and the homepage buttons.
// (Defined before /:id, otherwise "meta" would be read as an id.)
router.get('/meta/destinations', async (req, res) => {
  const rows = await Hotel.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 }, images: { $first: '$images' } } },
    { $sort: { count: -1 } },
  ]);
  return res.json(
    rows.map((row) => ({
      city: row._id,
      count: row.count,
      image: row.images?.[0] || '/images/hero.jpg',
    }))
  );
});

// GET /api/hotels/:id — full detail page, with its reviews.
router.get('/:id', async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const reviews = await Review.find({ hotel: hotel._id })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

  return res.json({ ...hotel.toObject(), scoreLabel: scoreLabel(hotel.reviewScore), reviews });
});

// POST /api/hotels — list a property (signed-in guests only).
router.post('/', requireAuth, async (req, res) => {
  const hotel = await Hotel.create({ ...req.body, listedBy: req.userId });
  return res.status(201).json(hotel);
});

module.exports = router;

const express = require('express');
const Hotel = require('../models/Hotel');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');
const { availableUnits } = require('../services/availability');

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
// minScore, amenities (comma separated), freeCancellation,
// breakfastIncluded, bedType, petsAllowed, sort, page, limit.
router.get('/', async (req, res) => {
  const {
    destination, type, minPrice, maxPrice, minStars, minScore,
    amenities, freeCancellation, breakfastIncluded, bedType, petsAllowed,
    deals, sort, page = 1, limit = 20,
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
  if (breakfastIncluded === 'true') {
    filter['rooms.breakfastIncluded'] = true;
  }
  if (bedType) {
    // Bed names in the data read like "Double bed" or
    // "King bed + double bed", so match the chosen word
    // anywhere in the room's bed setup.
    filter['rooms.bedType'] = { $regex: bedType, $options: 'i' };
  }
  if (petsAllowed === 'true') {
    filter['houseRules.petsAllowed'] = true;
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
// With checkIn/checkOut query params, each room also reports how
// many units are still free for those dates.
router.get('/:id', async (req, res) => {
  const hotel = await Hotel.findById(req.params.id).populate('listedBy', 'name');
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const reviews = await Review.find({ hotel: hotel._id })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

  const data = hotel.toObject();
  const { checkIn, checkOut } = req.query;
  if (checkIn && checkOut) {
    data.rooms = await Promise.all(
      data.rooms.map(async (room) => ({
        ...room,
        availableUnits: await availableUnits(hotel, room, checkIn, checkOut),
      }))
    );
  }

  return res.json({ ...data, scoreLabel: scoreLabel(hotel.reviewScore), reviews });
});

// POST /api/hotels — list a property (signed-in guests only).
router.post('/', requireAuth, async (req, res) => {
  const hotel = await Hotel.create({ ...req.body, listedBy: req.userId });
  return res.status(201).json(hotel);
});

// PATCH/DELETE /api/hotels/:id — the host who listed it, or an
// admin. (The admin routes also cover these for the admin panel;
// this pair is what "My listings" uses, so a host never needs
// admin rights to fix their own listing.)
async function loadOwnedHotel(req, res, next) {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });
  const owner = hotel.listedBy && String(hotel.listedBy);
  if (owner === req.userId) {
    req.hotel = hotel;
    return next();
  }
  const User = require('../models/User');
  const user = await User.findById(req.userId);
  if (user && user.role === 'admin') {
    req.hotel = hotel;
    return next();
  }
  return res.status(403).json({ message: 'Not your listing.' });
}

router.patch('/:id', requireAuth, loadOwnedHotel, async (req, res) => {
  const allowed = ['name', 'pricePerNight', 'description'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.hotel[field] = req.body[field];
  });
  await req.hotel.save();
  return res.json(req.hotel);
});

router.delete('/:id', requireAuth, loadOwnedHotel, async (req, res) => {
  await req.hotel.deleteOne();
  return res.json({ message: 'Listing deleted.' });
});

module.exports = router;

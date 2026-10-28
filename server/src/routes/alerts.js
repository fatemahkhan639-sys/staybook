const express = require('express');
const Hotel = require('../models/Hotel');
const PriceAlert = require('../models/PriceAlert');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// POST /api/alerts — watch a stay. A second alert for the same
// hotel just moves the target price; there is one row per pair.
router.post('/', async (req, res) => {
  const { hotelId, targetPrice } = req.body;
  if (!hotelId || targetPrice == null) {
    return res.status(400).json({ message: 'A hotel and a target price are required.' });
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const alert = await PriceAlert.findOneAndUpdate(
    { user: req.userId, hotel: hotelId },
    { targetPrice },
    { new: true, upsert: true }
  );
  return res.status(201).json(alert);
});

// GET /api/alerts/mine — each alert next to the stay's current
// price, so the client can flag the ones already triggered.
router.get('/mine', async (req, res) => {
  const alerts = await PriceAlert.find({ user: req.userId })
    .populate('hotel', 'name city pricePerNight images')
    .sort({ createdAt: -1 });

  return res.json(
    alerts.map((a) => {
      const currentPrice = a.hotel?.pricePerNight ?? null;
      return {
        ...a.toObject(),
        currentPrice,
        triggered: currentPrice != null && currentPrice <= a.targetPrice,
      };
    })
  );
});

// DELETE /api/alerts/:id — stop watching. Only your own alerts.
router.delete('/:id', async (req, res) => {
  const alert = await PriceAlert.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!alert) return res.status(404).json({ message: 'Alert not found.' });
  return res.json({ message: 'Alert removed.' });
});

module.exports = router;

const express = require('express');
const { loyaltyFor } = require('../services/loyalty');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/loyalty/me — the signed-in guest's tier, stay count and
// how far the next tier is. The discount itself is applied at
// checkout; this endpoint only reports it.
router.get('/me', requireAuth, async (req, res) => {
  return res.json(await loyaltyFor(req.userId));
});

module.exports = router;

const express = require('express');
const { validateCoupon } = require('../services/coupons');

const router = express.Router();

// GET /api/coupons/validate?code=WELCOME10&subtotal=20000 — what the
// checkout page asks before showing a discount line. Public: the
// code itself is the secret, and the answer reveals no account data.
router.get('/validate', async (req, res) => {
  const { code, subtotal } = req.query;
  const result = await validateCoupon(code, Number(subtotal) || 0);
  return res.json({
    valid: result.valid,
    discountAmount: result.discountAmount,
    reason: result.reason,
  });
});

module.exports = router;

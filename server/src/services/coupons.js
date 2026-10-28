const Coupon = require('../models/Coupon');

// One place checks a code so checkout and the public validate
// endpoint can never disagree about what "valid" means.
async function validateCoupon(code, subtotal) {
  if (!code) return { valid: false, discountAmount: 0, reason: 'No code given.' };

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return { valid: false, discountAmount: 0, reason: 'This code does not exist.' };
  if (!coupon.active) return { valid: false, discountAmount: 0, reason: 'This code is no longer active.' };

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return { valid: false, discountAmount: 0, reason: 'This code is not valid yet.' };
  }
  if (coupon.validUntil && now > coupon.validUntil) {
    return { valid: false, discountAmount: 0, reason: 'This code has expired.' };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discountAmount: 0, reason: 'This code has reached its usage limit.' };
  }

  return {
    valid: true,
    discountAmount: Math.round((Number(subtotal) || 0) * (coupon.discountPercent / 100)),
    reason: null,
    coupon,
  };
}

module.exports = { validateCoupon };

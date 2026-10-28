const mongoose = require('mongoose');

// Percentage-off codes, created by an admin. Dates and maxUses are
// optional: a coupon with neither just runs until it is switched off.
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);

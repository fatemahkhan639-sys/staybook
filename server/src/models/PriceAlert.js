const mongoose = require('mongoose');

// "Tell me when this stay drops to Rs X." One alert per guest per
// hotel; setting a new target just overwrites the old one.
const priceAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    targetPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

priceAlertSchema.index({ user: 1, hotel: 1 }, { unique: true });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);

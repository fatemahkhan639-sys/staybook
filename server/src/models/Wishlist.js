const mongoose = require('mongoose');

// A saved stay. One row per guest per hotel; saving twice is a
// no-op rather than an error, so the heart button can toggle freely.
const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1, hotel: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);

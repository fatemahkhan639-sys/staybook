const mongoose = require('mongoose');

// A guest review for one hotel. Category scores are optional;
// the headline rating (out of 10) is what the hotel cards show.
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    rating: { type: Number, min: 1, max: 10, required: true },
    comment: { type: String, default: '' },
    categories: {
      cleanliness: { type: Number, min: 1, max: 10, default: null },
      comfort: { type: Number, min: 1, max: 10, default: null },
      location: { type: Number, min: 1, max: 10, default: null },
      facilities: { type: Number, min: 1, max: 10, default: null },
      staff: { type: Number, min: 1, max: 10, default: null },
      value: { type: Number, min: 1, max: 10, default: null },
    },
  },
  { timestamps: true }
);

// One review per guest per hotel keeps scores honest.
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

const mongoose = require('mongoose');

// A tour, day trip or ticketed experience in one city.
const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  city: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  rating: { type: Number, required: true },
  reviewCount: { type: Number, default: 0 },
  description: { type: String, required: true },
});

module.exports = mongoose.model('Activity', activitySchema);

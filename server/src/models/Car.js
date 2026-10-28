const mongoose = require('mongoose');

// A rental car in one city, priced per day.
const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  city: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  seats: { type: Number, required: true },
  transmission: { type: String, required: true },
  fuel: { type: String, required: true },
  features: { type: [String], default: [] },
});

module.exports = mongoose.model('Car', carSchema);

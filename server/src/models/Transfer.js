const mongoose = require('mongoose');

// A fixed-price airport pickup: one airport, one destination
// area, one vehicle type. The driver tracks the flight, so a
// delayed landing does not cancel the pickup.
const transferSchema = new mongoose.Schema({
  airport: { type: String, required: true },
  destination: { type: String, required: true },
  vehicleType: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  features: { type: [String], default: [] },
});

module.exports = mongoose.model('Transfer', transferSchema);

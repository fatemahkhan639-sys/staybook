const mongoose = require('mongoose');

// A flight that runs every day. Times are local departure and
// arrival times; the date the guest picks is the travel date.
const flightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departAt: { type: String, required: true },
  arriveAt: { type: String, required: true },
  duration: { type: String, required: true },
  stops: { type: Number, default: 0 },
  price: { type: Number, required: true },
  cabin: { type: String, default: 'Economy' },
  seatsLeft: { type: Number, default: 10 },
});

module.exports = mongoose.model('Flight', flightSchema);

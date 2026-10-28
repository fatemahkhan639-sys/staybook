const mongoose = require('mongoose');

// One confirmed reservation. The guest does not have to own an
// account: guest checkout stores the details on the booking
// itself, and `user` stays empty in that case.
const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomName: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true },
    guests: {
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
      rooms: { type: Number, default: 1 },
    },
    guestDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      country: { type: String, default: '' },
      specialRequests: { type: String, default: '' },
      arrivalTime: { type: String, default: '' },
    },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

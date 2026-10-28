const mongoose = require('mongoose');

// A booking for something that is not a hotel: a flight, a
// rental car, an activity or an airport transfer. The title and
// detail are a snapshot of the item at booking time, so the
// booking still reads right if the listing ever changes.
// Payment is on the day (pay at pickup, at the counter, or at
// the gate), the same way pay-at-property works for stays.
const verticalBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    kind: { type: String, enum: ['flight', 'car', 'activity', 'transfer'], required: true },
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, default: '' },
    travelDate: { type: String, required: true },
    returnDate: { type: String, default: '' },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    extra: { type: String, default: '' },
    totalPrice: { type: Number, required: true },
    guestDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    paymentMethod: { type: String, default: 'payAtProperty' },
    paymentStatus: { type: String, default: 'unpaid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VerticalBooking', verticalBookingSchema);

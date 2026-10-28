const mongoose = require('mongoose');

// One confirmed reservation. The guest does not have to own an
// account: guest checkout stores the details on the booking
// itself, and `user` stays empty in that case.
//
// Money is always stored in PKR. The breakdown lines exist so the
// confirmation screen can show the same maths the guest saw at
// checkout, instead of recomputing it from the nightly rate.
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
      // Ages of the children, when the guest gave them. Hotels
      // use them for extra beds and child pricing, if any.
      childrenAges: { type: [Number], default: [] },
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
    // Kept at top level too: the confirmation page reads these
    // without digging into guestDetails.
    specialRequests: { type: String, default: '' },
    arrivalTime: { type: String, default: '' },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    loyaltyDiscount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['payAtProperty', 'card', 'wallet'],
      default: 'payAtProperty',
    },
    // Card bookings stay "unpaid" until Stripe confirms them;
    // wallet bookings wait for an admin to check the transaction.
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending_verification', 'paid'],
      default: 'unpaid',
    },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

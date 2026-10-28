const mongoose = require('mongoose');

// One payment attempt against a booking. Card payments go through
// Stripe; wallet payments are manual and wait for an admin to
// verify the transaction id the guest typed in.
const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    method: { type: String, enum: ['card', 'wallet', 'payAtProperty'], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'paid', 'failed'],
      default: 'pending',
    },
    // Stripe's id, so the webhook can find this row later.
    paymentIntentId: { type: String, default: null },
    walletNumber: { type: String, default: null },
    transactionId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

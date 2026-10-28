require('dotenv').config();

// Sign-in tokens need a secret. Fail fast with a plain message
// instead of crashing later on the first login attempt.
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET. Copy server/.env.example to server/.env and set a secret.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const loyaltyRoutes = require('./routes/loyalty');
const alertRoutes = require('./routes/alerts');
const questionRoutes = require('./routes/questions');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

const app = express();

// The React app runs on another port in development, so the
// browser needs CORS permission to call this API.
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
// The Stripe webhook verifies its signature against the raw request
// body, so it must skip the JSON parser that every other route uses.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotels/:id/questions', questionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// One plain error handler, so API failures always come back as JSON.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // First start with an empty database: load the demo hotels,
    // demo account and guest reviews, so the site works without
    // running seed.
    const Hotel = require('./models/Hotel');
    const { insertDemoData } = require('./seedData');

    if ((await Hotel.countDocuments()) === 0) {
      await insertDemoData();
      console.log('Demo data inserted (24 hotels + demo account + reviews).');
    } else if (!(await Hotel.exists({ lat: { $ne: null } }))) {
      // One-time upgrade: the first demo dataset had no
      // coordinates, galleries or coupons, so it cannot serve
      // the new hotel pages. Replace it with the rewritten
      // listings, keeping registered users and contact messages.
      // New listings all carry lat/lng, so this runs once.
      const Review = require('./models/Review');
      const Booking = require('./models/Booking');
      const Coupon = require('./models/Coupon');
      const Question = require('./models/Question');
      const Payment = require('./models/Payment');
      const PriceAlert = require('./models/PriceAlert');
      const Wishlist = require('./models/Wishlist');
      await Promise.all([
        Hotel.deleteMany({}),
        Review.deleteMany({}),
        Booking.deleteMany({}),
        Coupon.deleteMany({}),
        Question.deleteMany({}),
        Payment.deleteMany({}),
        PriceAlert.deleteMany({}),
        Wishlist.deleteMany({}),
      ]);
      await insertDemoData();
      console.log('Demo data upgraded to the new listings.');
    }

    app.listen(PORT, () => console.log(`StayBook API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

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

const app = express();

// The React app runs on another port in development, so the
// browser needs CORS permission to call this API.
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

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
    }

    app.listen(PORT, () => console.log(`StayBook API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

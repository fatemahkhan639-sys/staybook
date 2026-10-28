// Seed script: wipes the demo data and re-inserts it.
// Run it with:  npm run seed
//
// You usually do not need this: the server inserts the same demo
// data automatically the first time it starts with an empty
// database. Use this only when you want to reset the data.
// Demo sign-in: demo@staybook.local / demo1234
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Coupon = require('./models/Coupon');
const Wishlist = require('./models/Wishlist');
const PriceAlert = require('./models/PriceAlert');
const Question = require('./models/Question');
const Payment = require('./models/Payment');
const Flight = require('./models/Flight');
const Car = require('./models/Car');
const Activity = require('./models/Activity');
const Transfer = require('./models/Transfer');
const VerticalBooking = require('./models/VerticalBooking');
const { insertDemoData } = require('./seedData');
const { insertVerticalData } = require('./seedVerticalData');

async function seed() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
    Wishlist.deleteMany({}),
    PriceAlert.deleteMany({}),
    Question.deleteMany({}),
    Payment.deleteMany({}),
    Flight.deleteMany({}),
    Car.deleteMany({}),
    Activity.deleteMany({}),
    Transfer.deleteMany({}),
    VerticalBooking.deleteMany({}),
  ]);

  await insertDemoData();
  await insertVerticalData();
  console.log('Seed complete: 24 hotels + demo account + guest reviews + verticals.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

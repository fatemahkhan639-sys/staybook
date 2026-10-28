// Demo data, shared by two entry points:
// - seed.js (manual reset: npm run seed)
// - server.js (automatic first start: when the database is empty,
//   the server inserts this data itself, so the site works even
//   if you never run the seed script)
//
// Hotels are defined in one short table below, and rooms,
// amenities, review scores and guest reviews are derived from
// it, so adding another hotel is a single new row.
//
// The pictures live in the client's public/images folder.
const { Types } = require('mongoose');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Review = require('./models/Review');

// Sign-in for the demo: demo@staybook.local / demo1234
const demoUser = {
  _id: new Types.ObjectId(),
  name: 'Demo Guest',
  email: 'demo@staybook.local',
  password: 'demo1234',
};

// Fictional past guests, so hotel pages show real-looking reviews.
// Passwords are hashed by the User model's pre-save hook on create.
const reviewerNames = [
  'Ayesha Khan', 'Bilal Ahmed', 'Fatima Noor', 'Usman Tariq',
  'Zainab Ali', 'Hamza Raza', 'Maryam Siddiqui', 'Omar Farooq',
];
const reviewers = reviewerNames.map((name, index) => ({
  _id: new Types.ObjectId(),
  name,
  email: `guest${index + 1}@staybook.local`,
  password: 'guest1234',
}));

const reviewComments = [
  'Clean rooms and very helpful staff. Would stay again.',
  'Great location, easy to reach everything on foot.',
  'Breakfast was fresh and the room was quiet at night.',
  'Good value for the price. The wifi worked well.',
  'Beautiful view from the room. A memorable stay.',
  'Check-in was quick and the staff were friendly.',
  'Comfortable bed, spotless bathroom. Recommended.',
  'A little far from the center but worth it for the calm.',
  'Family rooms are spacious, kids loved the place.',
  'Lovely atmosphere, we extended our stay by a night.',
];

// Amenities each property type gets by default.
const AMENITIES = {
  Hotel: ['Free WiFi', 'Restaurant', '24-hour front desk', 'Elevator', 'Free parking'],
  Apartment: ['Free WiFi', 'Kitchen', 'Washing machine', 'Elevator', 'Free parking'],
  Resort: ['Free WiFi', 'Swimming pool', 'Restaurant', 'Free parking', 'Family rooms'],
  Villa: ['Free WiFi', 'Kitchen', 'Free parking', 'Garden', 'Family rooms'],
  Hostel: ['Free WiFi', 'Shared kitchen', 'Luggage storage', '24-hour front desk'],
  Lodge: ['Free WiFi', 'Restaurant', 'Free parking', 'Fireplace lounge'],
  'Guest House': ['Free WiFi', 'Family rooms', 'Free parking', 'Non-smoking rooms'],
};

// Default picture per property type.
const IMAGES = {
  Hotel: '/images/hotel-city.jpg',
  Apartment: '/images/hotel-apartment.webp',
  Resort: '/images/hero.jpg',
  Villa: '/images/hotel-villa.jpg',
  Hostel: '/images/hotel-hostel.jpg',
  Lodge: '/images/hotel-lodge.webp',
  'Guest House': '/images/hotel-room-luxury.jpg',
};

// Rooms derived from the nightly price, so every hotel has a
// bookable availability table without writing rooms by hand.
function roomsFor(type, price) {
  const deluxePrice = Math.round((price * 1.4) / 100) * 100;
  if (type === 'Apartment') {
    return [
      { name: 'One-Bedroom Apartment', type: 'Apartment', sizeSqm: 48, bedType: 'Double bed', maxGuests: 3, pricePerNight: price, freeCancellation: true, breakfastIncluded: false },
      { name: 'Two-Bedroom Apartment', type: 'Apartment', sizeSqm: 72, bedType: 'Two double beds', maxGuests: 5, pricePerNight: Math.round((price * 1.5) / 100) * 100, freeCancellation: true, breakfastIncluded: false },
    ];
  }
  if (type === 'Hostel') {
    return [
      { name: 'Bed in Dormitory', type: 'Dorm', sizeSqm: 12, bedType: 'Bunk bed', maxGuests: 1, pricePerNight: price, freeCancellation: true, breakfastIncluded: false },
      { name: 'Private Double Room', type: 'Standard', sizeSqm: 18, bedType: 'Double bed', maxGuests: 2, pricePerNight: price * 2, freeCancellation: true, breakfastIncluded: false },
    ];
  }
  return [
    { name: 'Standard Double Room', type: 'Standard', sizeSqm: 24, bedType: 'Double bed', maxGuests: 2, pricePerNight: price, freeCancellation: true, breakfastIncluded: false },
    { name: 'Deluxe Room', type: 'Deluxe', sizeSqm: 34, bedType: 'King bed', maxGuests: 3, pricePerNight: deluxePrice, freeCancellation: true, breakfastIncluded: true },
  ];
}

// One row per hotel:
// [name, city, type, stars, pricePerNight, dealPercent, distanceKm, description, imageOverride?]
// dealPercent 0 means no deal; otherwise originalPrice is computed
// from it, and the Deals page picks the hotel up automatically.
const hotelTable = [
  ['Seaside Palm Resort', 'Karachi', 'Resort', 5, 18000, 20, 1.2, 'A beachfront resort on Clifton beach with a pool, private beach access and sea-facing rooms.'],
  ['City Center Grand Hotel', 'Lahore', 'Hotel', 4, 12500, 0, 0.8, 'A modern hotel in the heart of Gulberg, minutes from MM Alam Road restaurants and shopping.'],
  ['Old Town Apartments', 'Islamabad', 'Apartment', 4, 9500, 15, 2.5, 'Bright serviced apartments with a kitchen and living area, ideal for families and longer stays.'],
  ['Mountain Lake Lodge', 'Murree', 'Lodge', 3, 7000, 0, 1.0, 'A quiet wooden lodge above the hills with pine views, a fireplace lounge and home-style food.'],
  ['Clifton Beach View Hotel', 'Karachi', 'Hotel', 4, 14000, 25, 0.5, 'Sea-facing rooms on Clifton beach road with a rooftop restaurant and fast wifi.'],
  ['Gulberg Executive Suites', 'Lahore', 'Apartment', 4, 11000, 0, 1.5, 'Executive suites with a kitchen and workspace, made for business trips and families.'],
  ['Margalla Hills Resort', 'Islamabad', 'Resort', 5, 22000, 30, 4.0, 'A hillside resort at the foot of the Margalla Hills with a pool and valley views.'],
  ['Hunza Eagle\'s Nest Lodge', 'Hunza', 'Lodge', 3, 8500, 0, 2.0, 'A peaceful lodge above Karimabad with panoramic views of Rakaposhi and the valley.', '/images/hotel-mountain.jpg'],
  ['Skardu Mountain Retreat', 'Skardu', 'Resort', 4, 16000, 20, 3.5, 'A riverside retreat near Skardu town, a good base for Shangrila and Deosai trips.', '/images/hotel-mountain.jpg'],
  ['Naran Lake View Hotel', 'Naran', 'Hotel', 3, 9000, 0, 0.7, 'A cosy hotel on Naran main bazaar road, close to the Saif-ul-Malook jeep point.', '/images/hotel-mountain.jpg'],
  ['Swat Valley Inn', 'Mingora', 'Guest House', 3, 6500, 0, 1.8, 'A family-run guest house in Mingora with home-style food and a garden.'],
  ['Multan Royal Inn', 'Multan', 'Hotel', 4, 10500, 15, 1.1, 'A comfortable hotel near Ghanta Ghar with spacious rooms and a restaurant.'],
  ['Faisalabad City Hotel', 'Faisalabad', 'Hotel', 3, 8000, 0, 0.9, 'A central hotel on Susan Road, handy for business visitors and shoppers.'],
  ['Rawalpindi Station Hotel', 'Rawalpindi', 'Hotel', 3, 7500, 10, 0.6, 'A budget-friendly hotel minutes from Saddar bazaar and the railway station.'],
  ['Peshawar Heritage Guest House', 'Peshawar', 'Guest House', 3, 6000, 0, 1.4, 'A traditional guest house in University Town with a quiet courtyard.'],
  ['Quetta Pine Lodge', 'Quetta', 'Lodge', 3, 7000, 0, 2.2, 'A pine-surrounded lodge on the outskirts of Quetta with cool evening air.'],
  ['Gwadar Beach Resort', 'Gwadar', 'Resort', 4, 15000, 25, 1.0, 'A new beachfront resort on Gwadar East Bay with sunset views over the water.'],
  ['Murree Pine Villas', 'Murree', 'Villa', 4, 24000, 0, 3.0, 'Private pine villas with kitchens and terraces, made for family holidays.'],
  ['Karachi Backpackers Hostel', 'Karachi', 'Hostel', 2, 3000, 0, 2.0, 'A friendly backpackers hostel near Clifton with dorms and a shared kitchen.'],
  ['Lahore Old City Hostel', 'Lahore', 'Hostel', 2, 2800, 0, 1.3, 'A budget hostel inside the old city, steps from Food Street and Delhi Gate.'],
  ['Islamabad Luxury Apartments', 'Islamabad', 'Apartment', 5, 16500, 20, 1.6, 'High-floor serviced apartments in F-11 with Margalla views and a gym.'],
  ['Hunza Apricot Villa', 'Hunza', 'Villa', 4, 21000, 0, 2.8, 'A stone-and-wood villa among apricot orchards, with a terrace over the valley.'],
  ['Naltar Valley Lodge', 'Naltar', 'Lodge', 3, 7800, 10, 5.0, 'A small lodge in Naltar valley, popular with skiers and jeep-safari groups.', '/images/hotel-mountain.jpg'],
  ['Karachi Marina Apartments', 'Karachi', 'Apartment', 4, 13000, 0, 3.2, 'Marina-facing apartments in DHA with a pool, gym and covered parking.'],
];

// Hotels shown in the "Homes guests love" row on the homepage.
const featuredIndexes = new Set([0, 1, 2, 6, 8, 16]);

// Ratings rotate per hotel so every hotel's score comes from its
// own reviews instead of one shared number.
const ratingPool = [9, 8, 10, 9, 7, 10, 8, 9];

const hotels = hotelTable.map((row, index) => {
  const [name, city, type, stars, price, deal, distance, description, imageOverride] = row;
  const reviewCount = 2 + (index % 3);
  const ratings = Array.from({ length: reviewCount }, (_, j) => ratingPool[(index + j) % ratingPool.length]);
  const reviewScore = Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;

  return {
    _id: new Types.ObjectId(),
    name,
    city,
    country: 'Pakistan',
    address: `${city} city center`,
    type,
    starRating: stars,
    reviewScore,
    reviewCount,
    locationScore: Math.round((8 + ((index % 15) / 10)) * 10) / 10,
    pricePerNight: price,
    originalPrice: deal > 0 ? Math.round((price / (1 - deal / 100)) / 100) * 100 : null,
    distanceFromCenter: distance,
    images: [imageOverride || IMAGES[type]],
    description,
    amenities: AMENITIES[type],
    rooms: roomsFor(type, price),
    featured: featuredIndexes.has(index),
  };
});

// Guest reviews matching the scores above, so a hotel's rating
// never jumps the moment a real guest leaves the first review.
const reviews = hotels.flatMap((hotel, index) => {
  const count = 2 + (index % 3);
  return Array.from({ length: count }, (_, j) => ({
    user: reviewers[(index + j) % reviewers.length]._id,
    hotel: hotel._id,
    rating: ratingPool[(index + j) % ratingPool.length],
    comment: reviewComments[(index + j) % reviewComments.length],
  }));
});

const users = [demoUser, ...reviewers];

// Insert everything. Used by seed.js and by the server's first start.
async function insertDemoData() {
  await User.create(users);
  await Hotel.insertMany(hotels);
  await Review.insertMany(reviews);
}

module.exports = { hotels, users, reviews, insertDemoData };

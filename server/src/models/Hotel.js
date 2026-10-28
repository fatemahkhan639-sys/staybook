const mongoose = require('mongoose');

// One room type inside a hotel, e.g. "Deluxe Double Room".
// Rooms live inside the hotel document because they are never
// listed or booked on their own.
const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'Standard' },
    sizeSqm: { type: Number, default: 20 },
    bedType: { type: String, default: 'Double bed' },
    maxGuests: { type: Number, default: 2 },
    // How many identical units of this room the property can sell
    // for the same night. Bookings count against this.
    totalUnits: { type: Number, default: 5 },
    pricePerNight: { type: Number, required: true },
    freeCancellation: { type: Boolean, default: false },
    breakfastIncluded: { type: Boolean, default: false },
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, default: 'Pakistan' },
    address: { type: String, default: '' },
    // Hotel, Apartment, Resort, Villa, Hostel, Guest House...
    type: { type: String, default: 'Hotel' },
    starRating: { type: Number, min: 1, max: 5, default: 3 },
    // Guest review score out of 10, kept in sync with reviews.
    reviewScore: { type: Number, min: 0, max: 10, default: 0 },
    reviewCount: { type: Number, default: 0 },
    locationScore: { type: Number, min: 0, max: 10, default: 8 },
    // Starting price shown on cards; rooms carry their own prices.
    pricePerNight: { type: Number, required: true },
    // When set higher than pricePerNight, the hotel appears on the
    // Deals page with a discount badge. Null means no deal.
    originalPrice: { type: Number, default: null },
    // Kilometres from the city center, shown on result cards.
    distanceFromCenter: { type: Number, default: null },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    // Coordinates are optional: older listings were seeded without
    // them, and the map just hides when they are missing.
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    nearby: {
      type: [
        {
          name: { type: String, required: true },
          distanceKm: { type: Number, required: true },
          kind: { type: String, default: 'place' },
          _id: false,
        },
      ],
      default: [],
    },
    // Extra rules that do not fit the standard house-rules box,
    // e.g. "No parties" or a damage-deposit note.
    finePrint: { type: String, default: '' },
    // A short note in the owner's own words, shown on the hotel
    // page only when the host actually wrote one.
    hostNote: { type: String, default: '' },
    amenities: { type: [String], default: [] },
    rooms: { type: [roomSchema], default: [] },
    houseRules: {
      checkIn: { type: String, default: '3:00 PM' },
      checkOut: { type: String, default: '11:00 AM' },
      minCheckInAge: { type: Number, default: 18 },
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      quietHours: { type: String, default: '10:00 PM - 7:00 AM' },
    },
    // Shown in the "Homes guests love" section on the homepage.
    featured: { type: Boolean, default: false },
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Fast text-style search for the destination box.
hotelSchema.index({ name: 'text', city: 'text', country: 'text' });

module.exports = mongoose.model('Hotel', hotelSchema);

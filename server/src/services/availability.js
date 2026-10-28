const Booking = require('../models/Booking');

// Two stays overlap when each one starts before the other ends.
// Cancelled bookings free their rooms, so they never count here.
// excludeId is for changing a booking's own dates: the booking
// being moved must not count against its own new dates.
async function bookedUnits(hotelId, roomName, checkIn, checkOut, excludeId) {
  const query = {
    hotel: hotelId,
    roomName,
    status: 'confirmed',
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };
  if (excludeId) query._id = { $ne: excludeId };
  const clashes = await Booking.find(query).select('guests.rooms');

  return clashes.reduce((sum, b) => sum + (b.guests?.rooms || 1), 0);
}

async function availableUnits(hotel, room, checkIn, checkOut) {
  if (!checkIn || !checkOut) return room.totalUnits ?? 5;
  const taken = await bookedUnits(hotel._id, room.name, checkIn, checkOut);
  return Math.max(0, (room.totalUnits ?? 5) - taken);
}

module.exports = { bookedUnits, availableUnits };

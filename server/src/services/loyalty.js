const Booking = require('../models/Booking');

// StayBook Rewards: the tier follows the guest's confirmed stays,
// and the discount applies itself at checkout. Cancelled trips
// never counted — otherwise cancelling would still earn a tier.
const TIERS = [
  { name: 'Bronze', minStays: 0, discountPercent: 0 },
  { name: 'Silver', minStays: 5, discountPercent: 10 },
  { name: 'Gold', minStays: 15, discountPercent: 15 },
];

async function loyaltyFor(userId) {
  if (!userId) {
    return { tier: 'Bronze', stays: 0, discountPercent: 0, nextTier: 'Silver', staysToNext: 5 };
  }

  const stays = await Booking.countDocuments({ user: userId, status: 'confirmed' });
  let tier = TIERS[0];
  let next = null;
  for (const t of TIERS) {
    if (stays >= t.minStays) tier = t;
    else if (!next) next = t;
  }

  return {
    tier: tier.name,
    stays,
    discountPercent: tier.discountPercent,
    nextTier: next ? next.name : null,
    staysToNext: next ? next.minStays - stays : 0,
  };
}

module.exports = { loyaltyFor };

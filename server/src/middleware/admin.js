const User = require('../models/User');
const { requireAuth } = require('./auth');

// Signed-in AND role admin. Runs requireAuth first, then checks the
// stored role — the token itself carries no role, so a tampered
// token cannot promote anyone.
function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    req.user = user;
    return next();
  });
}

module.exports = { requireAdmin };

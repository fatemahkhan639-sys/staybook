const jwt = require('jsonwebtoken');

// Reads the token from `Authorization: Bearer <token>` and
// attaches the user id to the request. Routes that need a
// signed-in guest use this; public routes skip it.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Please sign in first.' });
  }

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

// Same as requireAuth, but lets the request through without a
// user when no token is present (guest checkout uses this).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
  } catch (err) {
    // An invalid guest token is ignored; the booking still works.
  }
  return next();
}

module.exports = { requireAuth, optionalAuth };

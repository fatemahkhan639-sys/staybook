const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// One token per sign-in, valid for 7 days.
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register — create an account and sign in at once.
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  const user = await User.create({ name, email, password });
  return res.status(201).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// POST /api/auth/login — check credentials, return a fresh token.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchesPassword(password))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  return res.json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// GET /api/auth/me — who is signed in right now.
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  return res.json({ id: user._id, name: user.name, email: user.email });
});

module.exports = router;

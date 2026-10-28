const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const {
  makeToken,
  hashToken,
  sendWelcomeMail,
  sendResetMail,
} = require('../services/email');

const router = express.Router();

// Login and registration share one limiter: repeated guessing from
// one address slows down fast, while normal use never notices it.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

// One token per sign-in, valid for 7 days.
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register — create an account and sign in at once.
router.post('/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  const user = await User.create({ name, email, password });

  // Verification mail is best-effort; registration succeeds regardless.
  const token = makeToken();
  user.verificationToken = token.hash;
  await user.save();
  sendWelcomeMail(user, token.plain).catch(() => {});

  return res.status(201).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// POST /api/auth/login — check credentials, return a fresh token.
router.post('/login', authLimiter, async (req, res) => {
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
  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    role: user.role,
  });
});

// GET /api/auth/verify/:token — mark the email verified.
// The link in the welcome mail carries the plain token; only its
// hash is stored, so a leaked database cannot verify accounts.
router.get('/verify/:token', async (req, res) => {
  const user = await User.findOne({ verificationToken: hashToken(req.params.token) });
  if (!user) return res.status(400).json({ message: 'This verification link is invalid.' });

  user.emailVerified = true;
  user.verificationToken = null;
  await user.save();
  return res.json({ message: 'Email verified. Welcome to StayBook.' });
});

// POST /api/auth/forgot — request a password reset link.
// The reply is always the same, so nobody can probe which emails
// have accounts.
router.post('/forgot', authLimiter, async (req, res) => {
  const { email } = req.body;
  const user = email ? await User.findOne({ email }) : null;

  if (user) {
    const token = makeToken();
    user.resetPasswordToken = token.hash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    sendResetMail(user, token.plain).catch(() => {});
  }

  return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
});

// POST /api/auth/reset/:token — set a new password with a reset link.
router.post('/reset/:token', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'A new password is required.' });

  const user = await User.findOne({
    resetPasswordToken: hashToken(req.params.token),
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  return res.json({ message: 'Password updated. You can sign in now.' });
});

module.exports = router;

const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { sendContactMail } = require('../services/email');

const router = express.Router();

// POST /api/contact — the help page's contact form. The message is
// stored first, so it survives even when email is not configured.
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  const saved = await ContactMessage.create({ name, email, message });
  sendContactMail({ name, email, message }).catch(() => {});
  return res.status(201).json({ message: 'Thanks — your message has been received.', id: saved._id });
});

module.exports = router;

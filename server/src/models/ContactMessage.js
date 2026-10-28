const mongoose = require('mongoose');

// Messages from the contact form. Stored first so nothing is lost
// when email is not configured; emailed as well when it is.
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

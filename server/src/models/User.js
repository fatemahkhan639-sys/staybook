const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// A registered guest. Passwords are never stored in plain text:
// the pre-save hook hashes them with bcrypt before writing.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  // Only re-hash when the password itself changed.
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

// Compare a login attempt against the stored hash.
userSchema.methods.matchesPassword = function matchesPassword(plainText) {
  return bcrypt.compare(plainText, this.password);
};

module.exports = mongoose.model('User', userSchema);

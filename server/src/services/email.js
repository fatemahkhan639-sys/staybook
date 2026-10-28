const crypto = require('crypto');

// Email only exists when the SMTP settings are present. Without
// them every send is a log line and a "not configured" answer, so
// booking and registration keep working on a plain deployment.
// TODO: set SMTP_HOST/USER/PASS (and SMTP_FROM) in the Render
// dashboard before expecting real confirmation emails.
let transporter = null;
let checked = false;

function getTransporter() {
  if (checked) return transporter;
  checked = true;

  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  // Lazy require: nodemailer is only needed on servers that send mail.
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] SMTP not configured, skipping mail to ${to}: ${subject}`);
    return { sent: false, reason: 'not_configured' };
  }

  try {
    await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
    return { sent: true };
  } catch (err) {
    console.error(`[email] failed to send to ${to}:`, err.message);
    return { sent: false, reason: 'send_failed' };
  }
}

// Tokens are stored hashed; only the plain value goes in the link.
function makeToken() {
  const plain = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  return { plain, hash };
}

function hashToken(plain) {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

function siteUrl() {
  return process.env.CLIENT_URL || 'http://localhost:5173';
}

function sendBookingConfirmation(booking, hotel) {
  const to = booking.guestDetails?.email;
  if (!to) return Promise.resolve({ sent: false, reason: 'no_recipient' });
  const nights = booking.nights;
  return sendMail({
    to,
    subject: `Your StayBook booking at ${hotel.name} is confirmed`,
    text:
      `Hi ${booking.guestDetails.firstName},\n\n` +
      `Your stay at ${hotel.name}, ${hotel.city} is confirmed.\n` +
      `Check-in: ${new Date(booking.checkIn).toDateString()}\n` +
      `Check-out: ${new Date(booking.checkOut).toDateString()} (${nights} night${nights === 1 ? '' : 's'})\n` +
      `Room: ${booking.roomName} x ${booking.guests.rooms}\n` +
      `Total: Rs ${booking.totalPrice} (includes 16% GST of Rs ${booking.taxAmount})\n\n` +
      `Booking reference: ${booking._id}\n` +
      `You can view or cancel this booking under My trips once signed in.\n`,
  });
}

function sendWelcomeMail(user, plainToken) {
  return sendMail({
    to: user.email,
    subject: 'Welcome to StayBook — please verify your email',
    text:
      `Hi ${user.name},\n\n` +
      `Thanks for joining StayBook. Please verify your email address:\n` +
      `${siteUrl()}/verify/${plainToken}\n\n` +
      `If you did not create this account, you can ignore this email.\n`,
  });
}

function sendResetMail(user, plainToken) {
  return sendMail({
    to: user.email,
    subject: 'Reset your StayBook password',
    text:
      `Hi ${user.name},\n\n` +
      `Use this link to set a new password (valid for one hour):\n` +
      `${siteUrl()}/reset/${plainToken}\n\n` +
      `If you did not ask for this, your password stays unchanged.\n`,
  });
}

function sendContactMail({ name, email, message }) {
  const inbox = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  if (!inbox) return Promise.resolve({ sent: false, reason: 'no_recipient' });
  return sendMail({
    to: inbox,
    subject: `StayBook contact form: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}\n`,
  });
}

module.exports = {
  sendMail,
  makeToken,
  hashToken,
  sendBookingConfirmation,
  sendWelcomeMail,
  sendResetMail,
  sendContactMail,
};

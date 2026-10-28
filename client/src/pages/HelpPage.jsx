import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

// Help Center: the questions guests actually ask, answered in
// plain words. Click a question to open its answer. The wording
// here is deliberately local — how the owner would explain it
// on the phone, not a help-desk template.
const sections = [
  {
    title: 'Stays',
    faqs: [
      {
        question: 'How do I book a stay?',
        answer:
          'Search a city and your dates, open a hotel, pick a room, then follow the three steps: your selection, your details, and finish booking. You pay nothing at reservation time on most stays.',
      },
      {
        question: 'Can I cancel a booking?',
        answer:
          'Yes. Sign in, open My trips, and cancel there. Rooms marked "Free cancellation" cost nothing to cancel; other rates follow the terms shown on the hotel page before you book.',
      },
      {
        question: 'What does the review score mean?',
        answer:
          'It is the average of guest reviews, out of 10. Scores of 9 and above read as Wonderful, 8 and above as Very Good, and 7 and above as Good.',
      },
    ],
  },
  {
    title: 'Payments',
    faqs: [
      {
        question: 'When do I pay?',
        answer:
          'Most stays here are pay-at-the-property: you reserve now and pay at the front desk when you arrive, in cash or by card at the hotel. Some stays also accept JazzCash or Easypaisa — the hotel page says which.',
      },
      {
        question: 'Are there booking fees?',
        answer:
          'No. The price on the room is the price you pay, plus the 16% GST shown separately at checkout. Nothing else is added afterwards.',
      },
      {
        question: 'What is StayBook Rewards?',
        answer:
          'Everyone starts at Bronze. After 5 confirmed stays you move to Silver and get 10% off automatically at checkout; after 15 stays you reach Gold and get 15% off. Your tier shows on your account page.',
      },
    ],
  },
  {
    title: 'Your account',
    faqs: [
      {
        question: 'Do I need an account to book?',
        answer:
          'No. Guest checkout works without an account. Signing in only adds two things: your bookings appear under My trips, and you start earning Rewards stays.',
      },
      {
        question: 'How do I list my property?',
        answer:
          'Sign in and open "List your property" in the top bar. Add the name, city, rooms and photos, and your stay appears in search like any other hotel. You can edit or remove it later from My listings.',
      },
      {
        question: 'I forgot my password. What now?',
        answer:
          'Open the sign-in page and use "Forgot password?" — a reset link goes to your email. If it does not arrive, check spam, then write to us from the Contact page.',
      },
    ],
  },
];

export default function HelpPage() {
  const { t } = useLanguage();

  return (
    <div className="container my-4" style={{ maxWidth: 720 }}>
      <h3>{t('help.title')}</h3>
      <p className="text-muted">{t('help.sub')}</p>

      {sections.map((section) => (
        <div key={section.title} className="mb-4">
          <h5>{section.title}</h5>
          {section.faqs.map((faq) => (
            <details key={faq.question} className="card p-3 mb-2">
              <summary className="fw-semibold">{faq.question}</summary>
              <p className="mb-0 mt-2 small text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      ))}

      <p className="small text-muted">
        {t('help.stuck')}{' '}
        <Link to="/contact">{t('help.contact')}</Link>,{' '}
        <Link to="/">{t('help.searchStays')}</Link> or{' '}
        <Link to="/my-bookings">{t('help.manageTrips')}</Link>.
      </p>
    </div>
  );
}

import { Link } from 'react-router-dom';

// Help Center: the questions guests actually ask, answered in
// plain words. Click a question to open its answer.
const sections = [
  {
    title: 'Stays',
    faqs: [
      {
        question: 'How do I book a stay?',
        answer:
          'Search a destination and dates, open a hotel, pick a room in the availability table, then follow the three booking steps: your selection, your details, and finish booking. You are not charged at reservation time.',
      },
      {
        question: 'Can I cancel a booking?',
        answer:
          'Yes. Sign in, open My trips, and cancel the booking there. Rooms marked "Free cancellation" can be cancelled without a fee; other rates follow the terms shown on the hotel page.',
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
          'Most stays here are pay-at-the-property: you reserve now and pay when you arrive. The hotel page shows the exact terms for each room.',
      },
      {
        question: 'Are there booking fees?',
        answer: 'No. The price you see is the price you pay for the stay.',
      },
    ],
  },
  {
    title: 'Your account',
    faqs: [
      {
        question: 'Do I need an account to book?',
        answer:
          'No. Guest checkout works without an account. Signing in only adds one benefit: your bookings appear under My trips, where you can manage and cancel them.',
      },
      {
        question: 'How do I list my property?',
        answer:
          'Sign in and open "List your property" in the top bar. Fill in the name, city, type and price, and your stay appears in search results like any other hotel.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="container my-4" style={{ maxWidth: 720 }}>
      <h3>Help Center</h3>
      <p className="text-muted">Answers to the questions guests ask most.</p>

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
        Still stuck? <Link to="/">Search stays</Link> or{' '}
        <Link to="/my-bookings">manage your trips</Link>.
      </p>
    </div>
  );
}

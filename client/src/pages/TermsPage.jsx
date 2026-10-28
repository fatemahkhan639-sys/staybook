import { useLanguage } from '../i18n';

// Plain-language terms for a small booking site. Written for
// guests to actually read, not copied from a template.
export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="container my-4" style={{ maxWidth: 720 }}>
      <h3>{t('terms.title')}</h3>
      <p className="text-muted small">Last updated: October 2026</p>

      <h5 className="mt-4">What StayBook is</h5>
      <p className="small text-muted">
        StayBook lists hotels, guest houses, apartments, resorts, villas, hostels and lodges
        across Pakistan, and lets you reserve rooms with the property. StayBook is the booking
        platform; the stay itself is provided by the property you book with.
      </p>

      <h5 className="mt-4">Booking and paying</h5>
      <p className="small text-muted">
        A booking is confirmed when you see a booking reference on screen. Prices are shown
        in Pakistani rupees per night. A 16% GST is shown separately at checkout and is part
        of the total you see before confirming. Most stays are pay-at-the-property: you pay
        the property when you arrive. Where a stay accepts JazzCash or Easypaisa, you send
        the payment yourself and enter the transaction ID; the booking stays pending until
        the property confirms it. Card payments only appear as an option where the site
        owner has connected a payment provider — StayBook never pretends a card payment
        succeeded when it did not.
      </p>

      <h5 className="mt-4">Cancellation</h5>
      <p className="small text-muted">
        Rooms marked “Free cancellation” can be cancelled from My trips without a fee, under
        the terms shown on the hotel page. Other rates follow the property's own terms,
        which are shown before you book. A cancelled booking is not charged again, and a
        wallet payment that was never verified is not treated as paid.
      </p>

      <h5 className="mt-4">Your account</h5>
      <p className="small text-muted">
        You are responsible for keeping your password private and for the details you enter
        at checkout. Guest checkout works without an account, but those bookings cannot be
        recovered or cancelled later — sign in if you want your trips saved. StayBook may
        remove a listing or an account that posts false information or abuses the platform.
      </p>

      <h5 className="mt-4">Reviews and questions</h5>
      <p className="small text-muted">
        Reviews should describe your own stay, honestly. One review per stay per guest.
        Property owners may answer questions about their own listing. StayBook may remove
        reviews that contain abuse, personal information, or advertising.
      </p>

      <h5 className="mt-4">Listings by hosts</h5>
      <p className="small text-muted">
        Hosts who list a property are responsible for its accuracy: price, rooms, photos,
        availability and house rules. StayBook shows what the host entered and does not
        inspect properties in person.
      </p>

      <h5 className="mt-4">Liability</h5>
      <p className="small text-muted">
        StayBook is not liable for the property's service, for changes a property makes to
        its own terms, or for losses from events outside anyone's control. Nothing here
        removes rights you have under Pakistani consumer law.
      </p>

      <h5 className="mt-4">Changes</h5>
      <p className="small text-muted">
        These terms may change as the site grows. The version on this page is the one that
        applies. Questions go through the Contact page.
      </p>
    </div>
  );
}

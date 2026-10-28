import { useLanguage } from '../i18n';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="container my-4" style={{ maxWidth: 720 }}>
      <h3>{t('terms.privacyTitle')}</h3>
      <p className="text-muted small">Last updated: October 2026</p>

      <h5 className="mt-4">What we collect</h5>
      <p className="small text-muted">
        When you book, we store the guest details you enter (name, email, phone, country,
        arrival time, special requests) and the booking itself. When you create an account,
        we store your name, email and a hashed password — the plain password is never kept.
        When you write a review, ask a question, set a price alert or save a wishlist item,
        that content is stored with your account.
      </p>

      <h5 className="mt-4">What we use it for</h5>
      <p className="small text-muted">
        Bookings exist so the property knows you are coming and so you can manage your trips.
        Your email is used for booking confirmations, password resets and replies to your
        messages — only where email delivery is set up; otherwise confirmations stay on
        screen and under My trips. Price alerts are checked against the hotel's current
        price. Nothing here is sold to anyone, and no guest data is used for advertising.
      </p>

      <h5 className="mt-4">Cookies and local storage</h5>
      <p className="small text-muted">
        StayBook keeps a sign-in token, your language choice and your currency choice in
        your browser's local storage, and your compare list too. There are no third-party
        advertising trackers. The map on hotel pages loads tiles from OpenStreetMap, which
        may see your IP address the way any image host does.
      </p>

      <h5 className="mt-4">Who sees your data</h5>
      <p className="small text-muted">
        The property you book with sees the guest details of that booking. Nobody else
        receives your details. Reviews and questions you post are public on the hotel page,
        under the name on your account — do not put phone numbers or addresses in them.
      </p>

      <h5 className="mt-4">Your choices</h5>
      <p className="small text-muted">
        You can sign out any time, which clears the sign-in token. You can delete price
        alerts from your account page and cancel bookings from My trips. For anything else
        — a copy of your data, or an account deletion — write to us from the Contact page
        and we will deal with it by email.
      </p>

      <h5 className="mt-4">Security</h5>
      <p className="small text-muted">
        Passwords are stored hashed, sign-in uses tokens, and the site runs over HTTPS.
        No system is perfect; if you suspect your account was used by someone else, reset
        your password and contact us.
      </p>
    </div>
  );
}

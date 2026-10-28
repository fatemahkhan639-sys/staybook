import { useState } from 'react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../i18n';

// Bookings made without an account are found by the booking
// reference plus the email given at checkout — the same two
// things the confirmation shows. A wrong email gives the same
// "not found" as a wrong reference.
export default function BookingLookupPage() {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');

  async function find(event) {
    event.preventDefault();
    setMessage('');
    try {
      const data = await api.get(
        `/api/bookings/guest/lookup?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(email)}`
      );
      setBooking(data);
    } catch {
      setBooking(null);
      setMessage(t('lookup.notFound'));
    }
  }

  async function cancel() {
    try {
      const updated = await api.post('/api/bookings/guest/cancel', { reference, email });
      setBooking(updated);
      setMessage(t('lookup.cancelled'));
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="container my-4" style={{ maxWidth: 640 }}>
      <h4>{t('lookup.title')}</h4>
      <form className="card p-4" onSubmit={find}>
        <div className="mb-3">
          <label className="form-label small">{t('lookup.reference')}</label>
          <input
            className="form-control"
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label small">{t('lookup.email')}</label>
          <input
            type="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          {t('lookup.find')}
        </button>
        {message && <p className="small text-muted mt-2 mb-0">{message}</p>}
      </form>

      {booking && booking.kind && (
        <div className="card p-4 mt-3">
          <h5 className="mb-1">{booking.title}</h5>
          <p className="small text-muted mb-1">
            {booking.detail} · {booking.travelDate}
          </p>
          <p className="mb-1">
            {t('bookings.total')}: <strong>{format(booking.totalPrice)}</strong>
          </p>
          <p className="small text-muted mb-2">
            {t('bookings.payment')}: {booking.paymentMethod} · {booking.paymentStatus}
          </p>
          <span
            className={`badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}
          >
            {booking.status}
          </span>
          {booking.status === 'confirmed' && (
            <div>
              <button className="btn btn-outline-danger btn-sm mt-2" onClick={cancel}>
                {t('lookup.cancel')}
              </button>
            </div>
          )}
        </div>
      )}

      {booking && !booking.kind && (
        <div className="card p-4 mt-3">
          <h5 className="mb-1">{booking.hotel?.name || 'Stay'}</h5>
          <p className="small text-muted mb-1">
            {booking.roomName} · {new Date(booking.checkIn).toLocaleDateString()} →{' '}
            {new Date(booking.checkOut).toLocaleDateString()} · {booking.nights} night
            {booking.nights > 1 ? 's' : ''}
          </p>
          <p className="mb-1">
            {t('bookings.total')}: <strong>{format(booking.totalPrice)}</strong>
          </p>
          <p className="small text-muted mb-2">
            {t('bookings.payment')}: {booking.paymentMethod} · {booking.paymentStatus}
          </p>
          <span
            className={`badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}
          >
            {booking.status}
          </span>
          {booking.status === 'confirmed' && (
            <div>
              <button className="btn btn-outline-danger btn-sm mt-2" onClick={cancel}>
                {t('lookup.cancel')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../i18n';

// "Manage your trips": the signed-in guest's bookings, with cancel.
export default function MyBookingsPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/api/bookings/mine', true).then(setBookings).catch(() => setBookings([]));
    }
  }, [user]);

  async function cancel(bookingId) {
    const updated = await api.patch(`/api/bookings/${bookingId}/cancel`, {}, true);
    setBookings(bookings.map((b) => (b._id === bookingId ? updated : b)));
  }

  if (!user) {
    return (
      <div className="container my-5">
        <p>
          {t('bookings.signInPrompt')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h3>{t('bookings.title')}</h3>
      {bookings.length === 0 && <p className="text-muted">{t('bookings.none')}</p>}
      {bookings.map((booking) => (
        <div className="card p-3 mb-3" key={booking._id}>
          <div className="d-flex justify-content-between">
            <div>
              <h5 className="mb-1">{booking.hotel?.name || 'Stay'}</h5>
              <p className="small text-muted mb-1">
                {booking.roomName} · {new Date(booking.checkIn).toLocaleDateString()} →{' '}
                {new Date(booking.checkOut).toLocaleDateString()} · {booking.nights} night
                {booking.nights > 1 ? 's' : ''}
              </p>
              <p className="mb-1">
                {t('bookings.total')}: <strong>{format(booking.totalPrice)}</strong>
              </p>
              <p className="small text-muted mb-0">
                {t('bookings.payment')}: {booking.paymentMethod || 'payAtProperty'} ·{' '}
                {booking.paymentStatus || 'unpaid'}
              </p>
            </div>
            <div className="text-end">
              <span
                className={`badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}
              >
                {booking.status}
              </span>
              {booking.status === 'confirmed' && (
                <div>
                  <button
                    className="btn btn-outline-danger btn-sm mt-2"
                    onClick={() => cancel(booking._id)}
                  >
                    {t('bookings.cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

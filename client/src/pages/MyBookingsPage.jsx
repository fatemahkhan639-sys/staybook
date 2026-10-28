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
  const [verticalBookings, setVerticalBookings] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (user) {
      api.get('/api/bookings/mine', true).then(setBookings).catch(() => setBookings([]));
      api
        .get('/api/vertical-bookings/mine', true)
        .then(setVerticalBookings)
        .catch(() => setVerticalBookings([]));
    }
  }, [user]);

  async function cancelVertical(bookingId) {
    const updated = await api.patch(`/api/vertical-bookings/${bookingId}/cancel`, {}, true);
    setVerticalBookings(verticalBookings.map((b) => (b._id === bookingId ? updated : b)));
  }

  async function cancel(bookingId) {
    const updated = await api.patch(`/api/bookings/${bookingId}/cancel`, {}, true);
    setBookings(bookings.map((b) => (b._id === bookingId ? updated : b)));
  }

  async function saveDates(booking) {
    try {
      const updated = await api.patch(
        `/api/bookings/${booking._id}/dates`,
        { checkIn: editing.checkIn, checkOut: editing.checkOut },
        true
      );
      setBookings(bookings.map((b) => (b._id === updated._id ? { ...b, ...updated } : b)));
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  }

  if (!user) {
    return (
      <div className="container my-5">
        <p>
          {t('bookings.signInPrompt')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
        <p>
          {t('bookings.guestLookup')} <Link to="/booking-lookup">{t('bookings.findBooking')}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h3>{t('bookings.title')}</h3>
      {bookings.length === 0 && <p className="text-muted">{t('bookings.none')}</p>}
      {verticalBookings.length > 0 && (
        <>
          <h5 className="mt-4">Flights, cars & activities</h5>
          {verticalBookings.map((booking) => (
            <div className="card p-3 mb-3" key={booking._id}>
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="mb-1">{booking.title}</h5>
                  <p className="small text-muted mb-1">
                    {booking.detail} · {booking.travelDate}
                  </p>
                  <p className="mb-0">
                    {t('bookings.total')}: <strong>{format(booking.totalPrice)}</strong>
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
                        onClick={() => cancelVertical(booking._id)}
                      >
                        {t('bookings.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

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
                  <button
                    className="btn btn-outline-primary btn-sm mt-2 ms-2"
                    onClick={() =>
                      setEditing(
                        editing?._id === booking._id
                          ? null
                          : {
                              _id: booking._id,
                              checkIn: String(booking.checkIn).slice(0, 10),
                              checkOut: String(booking.checkOut).slice(0, 10),
                            }
                      )
                    }
                  >
                    {t('bookings.changeDates')}
                  </button>
                  {editing?._id === booking._id && (
                    <div className="d-flex gap-1 mt-2">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={editing.checkIn}
                        onChange={(e) => setEditing({ ...editing, checkIn: e.target.value })}
                      />
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={editing.checkOut}
                        onChange={(e) => setEditing({ ...editing, checkOut: e.target.value })}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => saveDates(booking)}>
                        {t('bookings.saveDates')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

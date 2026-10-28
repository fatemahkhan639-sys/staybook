import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

// Booking flow in three steps, matching the reference flow:
// 1. Your selection — dates, room, price summary.
// 2. Your details — guest information and special requests.
// 3. Finish booking — confirmation with a booking reference.
export default function CheckoutPage() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Pakistan',
    specialRequests: '',
    arrivalTime: '',
  });

  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');
  const roomName = params.get('roomName');
  const rooms = Number(params.get('rooms')) || 1;

  useEffect(() => {
    api
      .get(`/api/hotels/${params.get('hotelId')}`)
      .then((data) => {
        setHotel(data);
        setRoom(data.rooms.find((r) => r.name === roomName) || null);
      })
      .catch(() => setError('This stay could not be loaded.'));
  }, [params, roomName]);

  function nights() {
    if (!checkIn || !checkOut) return 1;
    const days = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
    return days > 0 ? days : 1;
  }

  function totalPrice() {
    if (!room) return 0;
    return room.pricePerNight * nights() * rooms;
  }

  async function finishBooking(event) {
    event.preventDefault();
    setError('');
    try {
      const created = await api.post('/api/bookings', {
        hotelId: hotel._id,
        roomName: room.name,
        checkIn,
        checkOut,
        guests: {
          adults: Number(params.get('adults')) || 2,
          children: Number(params.get('children')) || 0,
          rooms,
        },
        guestDetails: form,
      });
      setBooking(created);
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !hotel) return <div className="container my-5 alert alert-danger">{error}</div>;
  if (!hotel || !room) return <div className="container my-5">Loading…</div>;

  return (
    <div className="container my-4" style={{ maxWidth: 720 }}>
      <ul className="nav nav-pills mb-4">
        {['1. Your selection', '2. Your details', '3. Finish booking'].map((label, index) => (
          <li className="nav-item" key={label}>
            <span className={`nav-link ${step === index + 1 ? 'active' : 'disabled'}`}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      {step === 1 && (
        <div className="card p-4">
          <h4>Your selection</h4>
          <p className="mb-1">
            <strong>{hotel.name}</strong> — {hotel.city}, {hotel.country}
          </p>
          <p className="mb-1">
            {room.name} · {rooms} room{rooms > 1 ? 's' : ''}
          </p>
          <p className="mb-1">
            {checkIn || 'Dates not chosen'} → {checkOut || 'Dates not chosen'} · {nights()} night
            {nights() > 1 ? 's' : ''}
          </p>
          <p className="mb-1">
            {room.freeCancellation ? 'Free cancellation' : 'Non-refundable'} ·{' '}
            {room.breakfastIncluded ? 'Breakfast included' : 'No breakfast'}
          </p>
          <h5 className="mt-3">Total: Rs {totalPrice().toLocaleString()}</h5>
          <p className="text-muted small">You won&apos;t be charged yet.</p>
          <button className="btn btn-primary" onClick={() => setStep(2)}>
            I&apos;ll reserve
          </button>
        </div>
      )}

      {step === 2 && (
        <form className="card p-4" onSubmit={finishBooking}>
          <h4>Your details</h4>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small">First name *</label>
              <input
                className="form-control"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Last name *</label>
              <input
                className="form-control"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Email *</label>
              <input
                type="email"
                className="form-control"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Phone</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Country / region</label>
              <input
                className="form-control"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Estimated arrival time</label>
              <input
                className="form-control"
                placeholder="e.g. 3:00 PM"
                value={form.arrivalTime}
                onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label small">Special requests</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.specialRequests}
                onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
              />
            </div>
          </div>
          {error && <p className="text-danger small mt-2 mb-0">{error}</p>}
          <button className="btn btn-primary mt-3" type="submit">
            Next: Final details
          </button>
        </form>
      )}

      {step === 3 && booking && (
        <div className="card p-4 text-center">
          <h4>Booking confirmed</h4>
          <p>
            Your stay at <strong>{hotel.name}</strong> is reserved.
          </p>
          <p className="mb-1">
            Booking reference: <code>{booking._id}</code>
          </p>
          <p className="mb-1">
            {room.name} · {nights()} night{nights() > 1 ? 's' : ''} · Rs{' '}
            {booking.totalPrice.toLocaleString()}
          </p>
          <p className="text-muted small">
            A confirmation would be emailed to {booking.guestDetails.email} in production.
          </p>
        </div>
      )}
    </div>
  );
}

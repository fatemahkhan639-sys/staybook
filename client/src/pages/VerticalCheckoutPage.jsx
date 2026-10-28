import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

// One booking page for all four verticals. The item loads from
// the server, the price is shown for reference, and the server
// works the final price out again when the booking is made.
const KIND_LABELS = {
  flight: 'Flight',
  car: 'Car rental',
  activity: 'Activity',
  transfer: 'Airport transfer',
};

export default function VerticalCheckoutPage() {
  const { kind, id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { format } = useCurrency();

  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState(params.get('travelDate') || '');
  const [returnDate, setReturnDate] = useState(params.get('returnDate') || '');
  const [adults, setAdults] = useState(Number(params.get('adults')) || 1);
  const [children, setChildren] = useState(Number(params.get('children')) || 0);
  const [tickets, setTickets] = useState(1);
  const [flightNumber, setFlightNumber] = useState(params.get('flightNumber') || '');

  useEffect(() => {
    api
      .get(`/api/${kind}/${id}`)
      .then(setItem)
      .catch(() => setError('That listing could not be found.'));
  }, [kind, id]); // eslint-disable-line react-hooks/exhaustive-deps

  function days() {
    if (!returnDate || !travelDate) return 1;
    const n = Math.round((new Date(returnDate) - new Date(travelDate)) / 86400000);
    return n > 0 ? n : 1;
  }

  function estimate() {
    if (!item) return 0;
    if (kind === 'flight') return item.price * (adults + children);
    if (kind === 'car') return item.pricePerDay * days();
    if (kind === 'activity') return item.price * tickets;
    return item.price;
  }

  function summary() {
    if (!item) return '';
    if (kind === 'flight') return `${item.airline} ${item.flightNumber} · ${item.from} → ${item.to} · ${item.departAt} → ${item.arriveAt}`;
    if (kind === 'car') return `${item.name} · ${item.city} · ${item.type}`;
    if (kind === 'activity') return `${item.title} · ${item.city}`;
    return `${item.airport} → ${item.destination} · ${item.vehicleType}`;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const created = await api.post(
        '/api/vertical-bookings',
        {
          kind,
          itemId: id,
          travelDate,
          returnDate,
          adults,
          children,
          tickets,
          flightNumber,
          guestDetails: { firstName, lastName, email, phone },
        },
        Boolean(user)
      );
      setBooking(created);
    } catch (err) {
      setError(err.message);
    }
  }

  if (booking) {
    return (
      <div className="container my-4" style={{ maxWidth: 640 }}>
        <div className="card p-4">
          <h4>Booking confirmed</h4>
          <p className="mb-1">{booking.title}</p>
          <p className="small text-muted mb-1">{booking.detail}</p>
          <p className="mb-1">
            Reference: <strong>{booking._id}</strong>
          </p>
          <p className="mb-1">
            Total: <strong>{format(booking.totalPrice)}</strong> · pay on the day
          </p>
          <p className="small text-muted mb-0">
            Keep the reference. Booked without an account? Find it later under My trips → Find your booking.
          </p>
          <Link className="btn btn-primary mt-3" to="/my-bookings">My trips</Link>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="container my-4">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!item) return <div className="container my-4">Loading…</div>;

  return (
    <div className="container my-4" style={{ maxWidth: 640 }}>
      <h4>{KIND_LABELS[kind] || 'Booking'}</h4>
      <div className="card p-3 mb-3">
        <p className="mb-1">{summary()}</p>
        <p className="mb-0">
          Estimated total: <strong>{format(estimate())}</strong>
        </p>
      </div>
      <form className="card p-4" onSubmit={submit}>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label small">First name</label>
            <input className="form-control" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label small">Last name</label>
            <input className="form-control" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label small">Email</label>
          <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label small">Phone</label>
          <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label small">Travel date</label>
          <input type="date" className="form-control" required value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
        </div>
        {kind === 'car' && (
          <div className="mb-3">
            <label className="form-label small">Return date</label>
            <input type="date" className="form-control" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
        )}
        {kind === 'flight' && (
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label small">Adults</label>
              <select className="form-select" value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small">Children</label>
              <select className="form-select" value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {kind === 'activity' && (
          <div className="mb-3">
            <label className="form-label small">Tickets</label>
            <input type="number" min="1" max="20" className="form-control" value={tickets} onChange={(e) => setTickets(Number(e.target.value))} />
          </div>
        )}
        {kind === 'transfer' && (
          <div className="mb-3">
            <label className="form-label small">Flight number (for tracking)</label>
            <input className="form-control" placeholder="PK-302" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
          </div>
        )}
        <button className="btn btn-primary w-100" type="submit">Confirm booking</button>
        {error && <p className="small text-danger mt-2 mb-0">{error}</p>}
      </form>
    </div>
  );
}

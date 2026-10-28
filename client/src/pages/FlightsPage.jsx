import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

// Flights: search by route, pick a daily flight, book it the
// same way a stay is booked — pay on the day, not online.
export default function FlightsPage() {
  const { format } = useCurrency();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [flights, setFlights] = useState(null);

  async function search(event) {
    event.preventDefault();
    const query = new URLSearchParams({ from, to });
    const data = await api.get(`/api/flights?${query.toString()}`);
    setFlights(data);
  }

  function bookLink(f) {
    const q = new URLSearchParams({
      travelDate: date,
      adults: String(adults),
      children: String(children),
    });
    return `/book/flight/${f._id}?${q.toString()}`;
  }

  return (
    <div className="container my-4">
      <h3>Flights</h3>
      <p className="text-muted small">Daily flights. Pay on the day of travel.</p>
      <form className="card p-3 mb-4" onSubmit={search}>
        <div className="row g-2">
          <div className="col-md-3">
            <label className="form-label small">From</label>
            <input className="form-control" placeholder="Lahore" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">To</label>
            <input className="form-control" placeholder="Karachi" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Travel date</label>
            <input type="date" className="form-control" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Passengers</label>
            <div className="d-flex gap-1">
              <select className="form-select form-select-sm" value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} adult{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <select className="form-select form-select-sm" value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} child{n !== 1 ? 'ren' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-primary w-100" type="submit">Search</button>
          </div>
        </div>
      </form>

      {flights && flights.length === 0 && <p className="text-muted">No flights on that route yet.</p>}
      {flights?.map((f) => (
        <div className="card p-3 mb-3" key={f._id}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{f.airline} {f.flightNumber}</h5>
              <p className="mb-1">
                {f.from} <strong>{f.departAt}</strong> → {f.to} <strong>{f.arriveAt}</strong>
              </p>
              <p className="small text-muted mb-0">
                {f.duration} · {f.stops === 0 ? 'Nonstop' : `${f.stops} stop`} · {f.cabin} · {f.seatsLeft} seats left
              </p>
            </div>
            <div className="text-end">
              <h5 className="mb-1">{format(f.price)}</h5>
              <Link className="btn btn-primary btn-sm" to={bookLink(f)}>Book</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

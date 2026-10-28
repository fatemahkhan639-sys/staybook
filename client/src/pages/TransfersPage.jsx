import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

// Airport pickups at a fixed price. The driver tracks the
// flight, so a delayed landing does not cancel the pickup.
export default function TransfersPage() {
  const { format } = useCurrency();
  const [airport, setAirport] = useState('');
  const [date, setDate] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [transfers, setTransfers] = useState(null);

  async function search(event) {
    event.preventDefault();
    const query = new URLSearchParams({ airport });
    const data = await api.get(`/api/transfers?${query.toString()}`);
    setTransfers(data);
  }

  function bookLink(t) {
    const q = new URLSearchParams({ travelDate: date, flightNumber });
    return `/book/transfer/${t._id}?${q.toString()}`;
  }

  return (
    <div className="container my-4">
      <h3>Airport taxis</h3>
      <p className="text-muted small">Fixed price, driver waiting at arrivals. Pay in the car.</p>
      <form className="card p-3 mb-4" onSubmit={search}>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">Airport</label>
            <input className="form-control" placeholder="Lahore" value={airport} onChange={(e) => setAirport(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Pickup date</label>
            <input type="date" className="form-control" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Flight number (optional)</label>
            <input className="form-control" placeholder="PK-302" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-primary w-100" type="submit">Search</button>
          </div>
        </div>
      </form>

      {transfers && transfers.length === 0 && <p className="text-muted">No pickups from that airport yet.</p>}
      {transfers?.map((t) => (
        <div className="card p-3 mb-3" key={t._id}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{t.airport} → {t.destination}</h5>
              <p className="small text-muted mb-0">
                {t.vehicleType} · up to {t.capacity} passengers
                {t.features.length > 0 && ` · ${t.features.join(' · ')}`}
              </p>
            </div>
            <div className="text-end">
              <h5 className="mb-1">{format(t.price)}</h5>
              <Link className="btn btn-primary btn-sm" to={bookLink(t)}>Book</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

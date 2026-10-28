import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

// Rental cars: pick a city and dates, pay per day, pay on pickup.
export default function CarsPage() {
  const { format } = useCurrency();
  const [city, setCity] = useState('');
  const [pickup, setPickup] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cars, setCars] = useState(null);

  async function search(event) {
    event.preventDefault();
    const query = new URLSearchParams({ city });
    const data = await api.get(`/api/cars?${query.toString()}`);
    setCars(data);
  }

  function bookLink(c) {
    const q = new URLSearchParams({ travelDate: pickup, returnDate });
    return `/book/car/${c._id}?${q.toString()}`;
  }

  return (
    <div className="container my-4">
      <h3>Car rental</h3>
      <p className="text-muted small">Priced per day. Pay when you pick the car up.</p>
      <form className="card p-3 mb-4" onSubmit={search}>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">City</label>
            <input className="form-control" placeholder="Lahore" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Pickup date</label>
            <input type="date" className="form-control" required value={pickup} onChange={(e) => setPickup(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Return date</label>
            <input type="date" className="form-control" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-primary w-100" type="submit">Search</button>
          </div>
        </div>
      </form>

      {cars && cars.length === 0 && <p className="text-muted">No cars in that city yet.</p>}
      {cars?.map((c) => (
        <div className="card p-3 mb-3" key={c._id}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{c.name}</h5>
              <p className="small text-muted mb-0">
                {c.type} · {c.city} · {c.seats} seats · {c.transmission} · {c.fuel}
                {c.features.length > 0 && ` · ${c.features.join(' · ')}`}
              </p>
            </div>
            <div className="text-end">
              <h5 className="mb-1">{format(c.pricePerDay)} <small className="text-muted">/ day</small></h5>
              <Link className="btn btn-primary btn-sm" to={bookLink(c)}>Book</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

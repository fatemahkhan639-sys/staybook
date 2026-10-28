import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

// Tours, day trips and experiences, priced per ticket.
export default function ActivitiesPage() {
  const { format } = useCurrency();
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [activities, setActivities] = useState(null);

  async function search(event) {
    event.preventDefault();
    const query = new URLSearchParams({ city, category });
    const data = await api.get(`/api/activities?${query.toString()}`);
    setActivities(data);
  }

  function bookLink(a) {
    const q = new URLSearchParams({ travelDate: date });
    return `/book/activity/${a._id}?${q.toString()}`;
  }

  return (
    <div className="container my-4">
      <h3>Attractions & activities</h3>
      <p className="text-muted small">Tours, day trips and experiences. Pay on the day.</p>
      <form className="card p-3 mb-4" onSubmit={search}>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">City</label>
            <input className="form-control" placeholder="Lahore" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              <option>Tour</option>
              <option>Day trip</option>
              <option>Experience</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small">Date</label>
            <input type="date" className="form-control" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-primary w-100" type="submit">Search</button>
          </div>
        </div>
      </form>

      {activities && activities.length === 0 && <p className="text-muted">Nothing in that city yet.</p>}
      {activities?.map((a) => (
        <div className="card p-3 mb-3" key={a._id}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{a.title}</h5>
              <p className="mb-1 small">{a.description}</p>
              <p className="small text-muted mb-0">
                {a.city} · {a.category} · {a.duration} · ★ {a.rating} ({a.reviewCount} reviews)
              </p>
            </div>
            <div className="text-end">
              <h5 className="mb-1">{format(a.price)}</h5>
              <Link className="btn btn-primary btn-sm" to={bookLink(a)}>Book</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// "List your property": a signed-in guest can add their own stay.
// It appears in search results like any other hotel.
export default function ListPropertyPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    city: '',
    type: 'Hotel',
    starRating: 3,
    pricePerNight: '',
    description: '',
  });

  function set(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    try {
      const created = await api.post(
        '/api/hotels',
        {
          ...form,
          starRating: Number(form.starRating),
          pricePerNight: Number(form.pricePerNight),
          images: ['/images/hero.jpg'],
          rooms: [
            {
              name: 'Standard Double Room',
              pricePerNight: Number(form.pricePerNight),
              freeCancellation: true,
              breakfastIncluded: false,
            },
          ],
        },
        true
      );
      setMessage(`Your property is live! View it here: /hotel/${created._id}`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!user) {
    return (
      <div className="container my-5">
        <p>
          Please <Link to="/login">sign in</Link> to list your property.
        </p>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: 560 }}>
      <h3>List your property</h3>
      <form onSubmit={handleSubmit}>
        <label className="form-label small">Property name</label>
        <input
          className="form-control mb-3"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <label className="form-label small">City</label>
        <input
          className="form-control mb-3"
          required
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
        />
        <div className="row">
          <div className="col-md-6">
            <label className="form-label small">Property type</label>
            <select
              className="form-select mb-3"
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
            >
              <option>Hotel</option>
              <option>Apartment</option>
              <option>Resort</option>
              <option>Villa</option>
              <option>Hostel</option>
              <option>Lodge</option>
              <option>Guest House</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small">Star rating</label>
            <select
              className="form-select mb-3"
              value={form.starRating}
              onChange={(e) => set('starRating', e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="form-label small">Price per night (Rs)</label>
        <input
          type="number"
          className="form-control mb-3"
          required
          value={form.pricePerNight}
          onChange={(e) => set('pricePerNight', e.target.value)}
        />
        <label className="form-label small">Description</label>
        <textarea
          className="form-control mb-3"
          rows="3"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        {message && <p className="small text-muted">{message}</p>}
        <button className="btn btn-primary" type="submit">
          List property
        </button>
      </form>
    </div>
  );
}

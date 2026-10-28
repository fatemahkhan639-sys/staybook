import { useEffect, useState } from 'react';
import HotelCard from '../components/HotelCard';
import { api } from '../services/api';

// Today's deals: every stay whose original price is higher than
// the price guests actually pay, cheapest first.
export default function DealsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/hotels?deals=true&sort=priceAsc&limit=50')
      .then((data) => setHotels(data.hotels))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container my-4">
      <h3>Today&apos;s deals</h3>
      <p className="text-muted">
        Stays with a cut price. The discount is already applied — what you see is what you pay.
      </p>

      {loading && <p>Loading deals…</p>}
      {!loading && hotels.length === 0 && (
        <p className="text-muted">No deals right now. Check back soon.</p>
      )}
      {hotels.map((hotel) => (
        <HotelCard key={hotel._id} hotel={hotel} />
      ))}
    </div>
  );
}

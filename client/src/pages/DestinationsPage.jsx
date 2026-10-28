import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

// Every city in the database with its hotel count, so guests
// can browse by destination instead of typing a search.
export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    api
      .get('/api/hotels/meta/destinations')
      .then(setDestinations)
      .catch(() => setDestinations([]));
  }, []);

  return (
    <div className="container my-4">
      <h3>Browse by destination</h3>
      <p className="text-muted">Pick a city to see every stay there.</p>

      <div className="row mt-3">
        {destinations.map((destination) => (
          <div className="col-md-3 mb-3" key={destination.city}>
            <Link
              to={`/search?destination=${destination.city}`}
              className="text-decoration-none"
            >
              <div className="card">
                <img
                  src={destination.image}
                  className="card-img-top type-img"
                  alt={destination.city}
                />
                <div className="card-body py-2">
                  <strong className="text-dark">{destination.city}</strong>
                  <div className="small text-muted">
                    {destination.count} propert{destination.count === 1 ? 'y' : 'ies'}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

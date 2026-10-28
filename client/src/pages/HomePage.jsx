import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';

// Homepage: hero with search, four selling points, property
// types, today's deals, featured stays, and popular destinations
// — the last two sections come from the live database.
export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    api.get('/api/hotels/featured').then(setFeatured).catch(() => setFeatured([]));
    api
      .get('/api/hotels?deals=true&sort=priceAsc&limit=4')
      .then((data) => setDeals(data.hotels))
      .catch(() => setDeals([]));
    api
      .get('/api/hotels/meta/destinations')
      .then((rows) => setDestinations(rows.slice(0, 8)))
      .catch(() => setDestinations([]));
  }, []);

  const propertyTypes = [
    { name: 'Hotels', type: 'Hotel', image: '/images/hotel-city.jpg' },
    { name: 'Apartments', type: 'Apartment', image: '/images/hotel-apartment.webp' },
    { name: 'Resorts', type: 'Resort', image: '/images/hero.jpg' },
    { name: 'Villas', type: 'Villa', image: '/images/hotel-villa.jpg' },
    { name: 'Hostels', type: 'Hostel', image: '/images/hotel-hostel.jpg' },
    { name: 'Lodges', type: 'Lodge', image: '/images/hotel-lodge.webp' },
  ];

  return (
    <>
      <section className="hero">
        <div className="container py-5">
          <h1 className="text-white fw-bold">Find your next stay</h1>
          <p className="text-white-50 mb-4">
            Search deals on hotels, homes, and much more.
          </p>
          <SearchBar />
        </div>
      </section>

      <div className="container">
        <section className="my-5">
          <h3>Why StayBook?</h3>
          <div className="row mt-3">
            {[
              ['Book now, pay at the property', 'Most stays let you cancel free of charge.'],
              ['No booking fees', 'The price you see is the price you pay.'],
              ['Real guest reviews', 'Scores come from guests who actually stayed.'],
              ['2+ million stays', 'Hotels, apartments, resorts and lodges in one place.'],
            ].map(([title, text]) => (
              <div className="col-md-3 mb-3" key={title}>
                <div className="card h-100 p-3">
                  <h6>{title}</h6>
                  <p className="small text-muted mb-0">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="my-5">
          <h3>Browse by property type</h3>
          <div className="row mt-3">
            {propertyTypes.map((type) => (
              <div className="col-md-3 mb-3" key={type.name}>
                <Link to={`/search?type=${type.type}`} className="text-decoration-none">
                  <div className="card">
                    <img src={type.image} className="card-img-top type-img" alt={type.name} />
                    <div className="card-body py-2">
                      <strong className="text-dark">{type.name}</strong>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {deals.length > 0 && (
          <section className="my-5">
            <div className="d-flex justify-content-between align-items-center">
              <h3>Offers</h3>
              <Link to="/deals" className="small">
                See all deals
              </Link>
            </div>
            <div className="row mt-3">
              {deals.map((hotel) => {
                const percent = Math.round(
                  (1 - hotel.pricePerNight / hotel.originalPrice) * 100
                );
                return (
                  <div className="col-md-3 mb-3" key={hotel._id}>
                    <Link to={`/hotel/${hotel._id}`} className="text-decoration-none">
                      <div className="card h-100">
                        <img
                          src={hotel.images?.[0] || '/images/hero.jpg'}
                          className="card-img-top type-img"
                          alt={hotel.name}
                        />
                        <div className="card-body">
                          <span className="badge bg-danger mb-2">-{percent}%</span>
                          <h6 className="text-dark mb-1">{hotel.name}</h6>
                          <p className="small text-muted mb-1">
                            {hotel.city}, {hotel.country}
                          </p>
                          <p className="mb-0 text-dark">
                            <del className="small text-muted me-2">
                              Rs {hotel.originalPrice.toLocaleString()}
                            </del>
                            <strong>Rs {hotel.pricePerNight.toLocaleString()}</strong>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="my-5">
          <h3>Homes guests love</h3>
          <div className="row mt-3">
            {featured.map((hotel) => (
              <div className="col-md-4 mb-3" key={hotel._id}>
                <Link to={`/hotel/${hotel._id}`} className="text-decoration-none">
                  <div className="card h-100">
                    <img
                      src={hotel.images?.[0] || '/images/hero.jpg'}
                      className="card-img-top type-img"
                      alt={hotel.name}
                    />
                    <div className="card-body">
                      <h6 className="text-dark mb-1">{hotel.name}</h6>
                      <p className="small text-muted mb-1">
                        {hotel.city}, {hotel.country}
                      </p>
                      <span className="badge bg-primary me-2">
                        {hotel.reviewScore.toFixed(1)}
                      </span>
                      <span className="small text-muted">{hotel.reviewCount} reviews</span>
                      <p className="mt-2 mb-0 text-dark">
                        From <strong>Rs {hotel.pricePerNight.toLocaleString()}</strong> per night
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="my-5">
          <div className="d-flex justify-content-between align-items-center">
            <h3>Popular destinations</h3>
            <Link to="/destinations" className="small">
              See all destinations
            </Link>
          </div>
          <div className="row mt-3">
            {destinations.map((destination) => (
              <div className="col-md-3 mb-3" key={destination.city}>
                <Link
                  to={`/search?destination=${destination.city}`}
                  className="btn btn-outline-primary w-100"
                >
                  {destination.city} · {destination.count} stays
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

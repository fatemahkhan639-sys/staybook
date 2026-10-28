import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../i18n';

// Homepage: hero with search, a plain winter note, four selling
// points, property types, deals as one wide banner plus a list,
// featured stays as cards, and destinations as a plain list.
// The sections deliberately do not all look alike — a page of
// identical grids reads like a template.
export default function HomePage() {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [totalHotels, setTotalHotels] = useState(null);

  useEffect(() => {
    api.get('/api/hotels/featured').then(setFeatured).catch(() => setFeatured([]));
    api
      .get('/api/hotels?deals=true&sort=priceAsc&limit=4')
      .then((data) => setDeals(data.hotels))
      .catch(() => setDeals([]));
    api
      .get('/api/hotels/meta/destinations')
      .then((rows) => setDestinations(rows))
      .catch(() => setDestinations([]));
    api
      .get('/api/hotels?limit=1')
      .then((data) => setTotalHotels(data.total))
      .catch(() => setTotalHotels(null));
  }, []);

  const propertyTypes = [
    { name: 'Hotels', type: 'Hotel', image: '/images/hotel-city.jpg' },
    { name: 'Apartments', type: 'Apartment', image: '/images/hotel-apartment.webp' },
    { name: 'Resorts', type: 'Resort', image: '/images/hero.jpg' },
    { name: 'Villas', type: 'Villa', image: '/images/hotel-villa.jpg' },
    { name: 'Hostels', type: 'Hostel', image: '/images/hotel-hostel.jpg' },
    { name: 'Lodges', type: 'Lodge', image: '/images/hotel-lodge.webp' },
  ];

  const whyCards = [
    [t('home.why1Title'), t('home.why1Text')],
    [t('home.why2Title'), t('home.why2Text')],
    [t('home.why3Title'), t('home.why3Text')],
  ];
  if (totalHotels != null && destinations.length > 0) {
    whyCards.push([
      `${totalHotels} ${t('home.staysIn')} · ${destinations.length} cities`,
      t('home.growingText'),
    ]);
  }

  const [topDeal, ...restDeals] = deals;

  return (
    <>
      <section className="hero">
        <div className="container py-5">
          <h1 className="text-white fw-bold">{t('home.heroTitle')}</h1>
          <p className="text-white-50 mb-4">{t('home.heroSub')}</p>
          <SearchBar />
        </div>
      </section>

      <div className="container">
        <p className="alert alert-warning mt-4 mb-0 py-2 small">{t('home.winterNote')}</p>

        <section className="my-5">
          <h3>{t('home.whyTitle')}</h3>
          <div className="row mt-3">
            {whyCards.map(([title, text]) => (
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
          <h3>{t('home.typesTitle')}</h3>
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

        {topDeal && (
          <section className="my-5">
            <div className="d-flex justify-content-between align-items-center">
              <h3>{t('home.dealsTitle')}</h3>
              <Link to="/deals" className="small">
                {t('home.dealsAll')}
              </Link>
            </div>
            <Link to={`/hotel/${topDeal._id}`} className="text-decoration-none">
              <div className="card mt-3 overflow-hidden">
                <div className="row g-0">
                  <div className="col-md-6">
                    <img
                      src={topDeal.images?.[0] || '/images/hero.jpg'}
                      className="img-fluid h-100 w-100"
                      style={{ objectFit: 'cover', minHeight: 220 }}
                      alt={topDeal.name}
                    />
                  </div>
                  <div className="col-md-6 p-4">
                    <span className="badge bg-danger mb-2">
                      -{Math.round((1 - topDeal.pricePerNight / topDeal.originalPrice) * 100)}%
                    </span>
                    <h4 className="text-dark mb-1">{topDeal.name}</h4>
                    <p className="small text-muted mb-2">
                      {topDeal.city}, {topDeal.country}
                    </p>
                    <p className="text-dark mb-0">
                      <del className="small text-muted me-2">{format(topDeal.originalPrice)}</del>
                      <strong>{format(topDeal.pricePerNight)}</strong> {t('common.perNight')}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            <ul className="list-group mt-3">
              {restDeals.map((hotel) => (
                <li className="list-group-item d-flex justify-content-between" key={hotel._id}>
                  <Link to={`/hotel/${hotel._id}`} className="text-decoration-none">
                    {hotel.name} · {hotel.city}
                  </Link>
                  <span>
                    <del className="small text-muted me-2">{format(hotel.originalPrice)}</del>
                    <strong>{format(hotel.pricePerNight)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="my-5">
          <h3>{t('home.featuredTitle')}</h3>
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
                      <span className="small text-muted">
                        {hotel.reviewCount} {t('common.reviews')}
                      </span>
                      <p className="mt-2 mb-0 text-dark">
                        {t('common.from')} <strong>{format(hotel.pricePerNight)}</strong>{' '}
                        {t('common.perNight')}
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
            <h3>{t('home.destTitle')}</h3>
            <Link to="/destinations" className="small">
              {t('home.destAll')}
            </Link>
          </div>
          <ul className="list-unstyled mt-3">
            {destinations.slice(0, 8).map((destination) => (
              <li className="border-bottom py-2" key={destination.city}>
                <Link
                  to={`/search?destination=${destination.city}`}
                  className="text-decoration-none d-flex justify-content-between"
                >
                  <span>{destination.city}</span>
                  <span className="text-muted small">
                    {destination.count} {t('home.staysIn')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

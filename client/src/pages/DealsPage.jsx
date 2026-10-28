import { useEffect, useState } from 'react';
import HotelCard from '../components/HotelCard';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

// Stays with a cut price, cheapest first. The discount is
// already in the nightly rate — there is no code to apply.
export default function DealsPage() {
  const { t } = useLanguage();
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
      <h3>{t('deals.title')}</h3>
      <p className="text-muted">{t('deals.sub')}</p>

      {loading && <p>{t('deals.loading')}</p>}
      {!loading && hotels.length === 0 && <p className="text-muted">{t('deals.none')}</p>}
      {hotels.map((hotel) => (
        <HotelCard key={hotel._id} hotel={hotel} />
      ))}
    </div>
  );
}

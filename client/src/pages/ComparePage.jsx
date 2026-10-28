import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../i18n';

// Side-by-side comparison of up to 3 stays. Only the ids are
// stored locally; the rows are fetched fresh so prices and
// scores are never stale.
export default function ComparePage() {
  const { ids, toggle } = useCompare();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    if (ids.length === 0) {
      setHotels([]);
      return;
    }
    Promise.all(ids.map((id) => api.get(`/api/hotels/${id}`).catch(() => null))).then(
      (rows) => setHotels(rows.filter(Boolean))
    );
  }, [ids]);

  if (hotels.length === 0) {
    return (
      <div className="container my-5">
        <h3>{t('compare.title')}</h3>
        <p className="text-muted">{t('compare.empty')}</p>
      </div>
    );
  }

  const rows = [
    [t('compare.price'), (h) => format(h.pricePerNight)],
    [t('compare.score'), (h) => `${h.reviewScore.toFixed(1)} (${h.reviewCount})`],
    [t('compare.type'), (h) => h.type],
    [t('compare.city'), (h) => h.city],
    [t('compare.amenities'), (h) => h.amenities.join(', ')],
    [t('compare.rooms'), (h) => h.rooms.map((r) => r.name).join(', ')],
  ];

  return (
    <div className="container my-4">
      <h3>{t('compare.title')}</h3>
      <div className="table-responsive">
        <table className="table table-bordered align-top mt-3">
          <thead className="table-light">
            <tr>
              <th></th>
              {hotels.map((hotel) => (
                <th key={hotel._id}>
                  <Link to={`/hotel/${hotel._id}`} className="text-decoration-none">
                    {hotel.name}
                  </Link>
                  <div>
                    <button
                      className="btn btn-link btn-sm text-danger p-0"
                      onClick={() => toggle(hotel._id)}
                    >
                      {t('compare.remove')}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th className="small">{label}</th>
                {hotels.map((hotel) => (
                  <td className="small" key={hotel._id}>
                    {value(hotel)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import HotelCard from '../components/HotelCard';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

// Results page: reads the search from the URL, fetches matching
// hotels, and re-fetches whenever a filter or sort changes.
// Dates and guest counts go to the API too, so rooms that do
// not fit the party never show up in the first place.
export default function SearchPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('top');

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    type: params.get('type') || '',
    minStars: '',
    minScore: '',
    amenities: [],
    freeCancellation: false,
    breakfastIncluded: false,
    bedType: '',
  });

  // The booking query (dates, guests) rides along to the hotel page.
  const bookingQuery = useMemo(() => {
    const keep = ['checkIn', 'checkOut', 'adults', 'children', 'rooms'];
    const out = new URLSearchParams();
    keep.forEach((key) => {
      const value = params.get(key);
      if (value) out.set(key, value);
    });
    const text = out.toString();
    return text ? `?${text}` : '';
  }, [params]);

  const initialSearch = useMemo(
    () => ({
      destination: params.get('destination') || '',
      checkIn: params.get('checkIn') || '',
      checkOut: params.get('checkOut') || '',
      adults: Number(params.get('adults')) || 2,
      children: Number(params.get('children')) || 0,
      rooms: Number(params.get('rooms')) || 1,
    }),
    [params]
  );

  useEffect(() => {
    const query = new URLSearchParams({
      destination: params.get('destination') || '',
      type: filters.type,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minStars: filters.minStars,
      minScore: filters.minScore,
      amenities: filters.amenities.join(','),
      freeCancellation: filters.freeCancellation ? 'true' : '',
      breakfastIncluded: filters.breakfastIncluded ? 'true' : '',
      bedType: filters.bedType,
      adults: params.get('adults') || '',
      children: params.get('children') || '',
      sort: sort === 'distance' ? '' : sort,
    });

    setLoading(true);
    api
      .get(`/api/hotels?${query.toString()}`)
      .then((data) => {
        let rows = data.hotels;
        // Distance sort is done here, not on the server: the
        // field already comes back on every hotel, and sorting
        // a page of results client-side keeps the API simpler.
        if (sort === 'distance') {
          rows = [...rows].sort(
            (a, b) => (a.distanceFromCenter ?? 999) - (b.distanceFromCenter ?? 999)
          );
        }
        setHotels(rows);
        setTotal(data.total);
      })
      .catch(() => {
        setHotels([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [params, filters, sort]);

  return (
    <div className="container my-4">
      <SearchBar initial={initialSearch} />

      <div className="row mt-4">
        <div className="col-md-3">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {loading ? t('common.searching') : `${total} ${t('common.searchResults')}`}
            </h5>
            <select
              className="form-select form-select-sm w-auto"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort results"
            >
              <option value="top">{t('sort.top')}</option>
              <option value="priceAsc">{t('sort.priceAsc')}</option>
              <option value="priceDesc">{t('sort.priceDesc')}</option>
              <option value="rating">{t('sort.rating')}</option>
              <option value="distance">{t('sort.distance')}</option>
            </select>
          </div>

          {hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} query={bookingQuery} />
          ))}

          {!loading && hotels.length === 0 && <p className="text-muted">{t('common.noMatch')}</p>}
        </div>
      </div>
    </div>
  );
}

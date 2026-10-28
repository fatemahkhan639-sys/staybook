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
  const [params, setParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('top');

  const page = Number(params.get('page')) || 1;

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
    petsAllowed: false,
  });

  // The booking query (dates, guests) rides along to the hotel page.
  const bookingQuery = useMemo(() => {
    const keep = ['checkIn', 'checkOut', 'adults', 'children', 'childrenAges', 'rooms'];
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
      childrenAges: params.get('childrenAges') || '',
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
      petsAllowed: filters.petsAllowed ? 'true' : '',
      adults: params.get('adults') || '',
      children: params.get('children') || '',
      sort: sort === 'distance' ? '' : sort,
      page: String(page),
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
        setPages(data.pages || 1);
      })
      .catch(() => {
        setHotels([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [params, filters, sort]);

  // Changing a filter or sort restarts from page 1; the page
  // buttons only change the page.
  function updateFilters(next) {
    setFilters(next);
    const p = new URLSearchParams(params);
    p.delete('page');
    setParams(p);
  }

  function updateSort(next) {
    setSort(next);
    const p = new URLSearchParams(params);
    p.delete('page');
    setParams(p);
  }

  function goPage(n) {
    const p = new URLSearchParams(params);
    p.set('page', String(n));
    setParams(p);
  }

  return (
    <div className="container my-4">
      <SearchBar initial={initialSearch} />

      <div className="row mt-4">
        <div className="col-md-3">
          <FilterSidebar filters={filters} onChange={updateFilters} />
        </div>

        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {loading ? t('common.searching') : `${total} ${t('common.searchResults')}`}
            </h5>
            <select
              className="form-select form-select-sm w-auto"
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
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

          {!loading && pages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
              >
                ←
              </button>
              <span className="small text-muted">
                {page} / {pages}
              </span>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={page >= pages}
                onClick={() => goPage(page + 1)}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

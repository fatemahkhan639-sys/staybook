import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import HotelCard from '../components/HotelCard';
import { api } from '../services/api';

// Results page: reads the search from the URL, fetches matching
// hotels, and re-fetches whenever a filter or sort changes.
export default function SearchPage() {
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
      sort,
    });

    setLoading(true);
    api
      .get(`/api/hotels?${query.toString()}`)
      .then((data) => {
        setHotels(data.hotels);
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
              {loading ? 'Searching…' : `${total} properties found`}
            </h5>
            <select
              className="form-select form-select-sm w-auto"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort results"
            >
              <option value="top">Our top picks</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="rating">Star rating</option>
            </select>
          </div>

          {hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} query={bookingQuery} />
          ))}

          {!loading && hotels.length === 0 && (
            <p className="text-muted">
              No stays match those filters. Try widening the budget or clearing a filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

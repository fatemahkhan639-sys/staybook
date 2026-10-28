// Left-hand filters on the results page. Every control updates
// the parent's filter object, which re-runs the search.
export default function FilterSidebar({ filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function toggleAmenity(amenity) {
    const list = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    set('amenities', list);
  }

  const amenityOptions = ['Free WiFi', 'Swimming pool', 'Restaurant', 'Free parking', 'Family rooms'];

  return (
    <div className="card p-3">
      <h6 className="mb-3">Filter by</h6>

      <label className="form-label small">Your budget (per night)</label>
      <div className="d-flex gap-2 mb-3">
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder="Min"
          value={filters.minPrice}
          onChange={(e) => set('minPrice', e.target.value)}
        />
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder="Max"
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', e.target.value)}
        />
      </div>

      <label className="form-label small">Property type</label>
      <select
        className="form-select form-select-sm mb-3"
        value={filters.type}
        onChange={(e) => set('type', e.target.value)}
      >
        <option value="">All types</option>
        <option>Hotel</option>
        <option>Apartment</option>
        <option>Resort</option>
        <option>Villa</option>
        <option>Hostel</option>
        <option>Lodge</option>
        <option>Guest House</option>
      </select>

      <label className="form-label small">Property rating</label>
      <select
        className="form-select form-select-sm mb-3"
        value={filters.minStars}
        onChange={(e) => set('minStars', e.target.value)}
      >
        <option value="">Any stars</option>
        <option value="3">3 stars or more</option>
        <option value="4">4 stars or more</option>
        <option value="5">5 stars only</option>
      </select>

      <label className="form-label small">Review score</label>
      <select
        className="form-select form-select-sm mb-3"
        value={filters.minScore}
        onChange={(e) => set('minScore', e.target.value)}
      >
        <option value="">Any score</option>
        <option value="9">Wonderful: 9+</option>
        <option value="8">Very Good: 8+</option>
        <option value="7">Good: 7+</option>
        <option value="6">Pleasant: 6+</option>
      </select>

      <label className="form-label small">Amenities</label>
      {amenityOptions.map((amenity) => (
        <div className="form-check" key={amenity}>
          <input
            className="form-check-input"
            type="checkbox"
            checked={filters.amenities.includes(amenity)}
            onChange={() => toggleAmenity(amenity)}
          />
          <label className="form-check-label small">{amenity}</label>
        </div>
      ))}

      <div className="form-check mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={filters.freeCancellation}
          onChange={(e) => set('freeCancellation', e.target.checked)}
        />
        <label className="form-check-label small">Free cancellation</label>
      </div>
    </div>
  );
}

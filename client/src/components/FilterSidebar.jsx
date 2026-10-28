import { useLanguage } from '../i18n';

// Left-hand filters on the results page. Every control updates
// the parent's filter object, which re-runs the search. Room
// filters (breakfast, bed type) match against a hotel's rooms,
// not the hotel itself — a hotel shows up if any room matches.
export default function FilterSidebar({ filters, onChange }) {
  const { t } = useLanguage();

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
  // These are the bed words the listings actually use; the server
  // matches them inside room bed names like "Double bed" or
  // "King bed + double bed".
  const bedOptions = ['Double', 'King', 'Bunk'];

  return (
    <div className="card p-3">
      <h6 className="mb-3">{t('filters.title')}</h6>

      <label className="form-label small">{t('filters.budget')}</label>
      <div className="d-flex gap-2 mb-3">
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder={t('filters.min')}
          value={filters.minPrice}
          onChange={(e) => set('minPrice', e.target.value)}
        />
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder={t('filters.max')}
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', e.target.value)}
        />
      </div>

      <label className="form-label small">{t('filters.type')}</label>
      <select
        className="form-select form-select-sm mb-3"
        value={filters.type}
        onChange={(e) => set('type', e.target.value)}
      >
        <option value="">{t('filters.allTypes')}</option>
        <option>Hotel</option>
        <option>Apartment</option>
        <option>Resort</option>
        <option>Villa</option>
        <option>Hostel</option>
        <option>Lodge</option>
        <option>Guest House</option>
      </select>

      <label className="form-label small">{t('filters.rating')}</label>
      <select
        className="form-select form-select-sm mb-3"
        value={filters.minStars}
        onChange={(e) => set('minStars', e.target.value)}
      >
        <option value="">{t('filters.anyStars')}</option>
        <option value="3">3 {t('filters.starsOrMore')}</option>
        <option value="4">4 {t('filters.starsOrMore')}</option>
        <option value="5">5 {t('filters.starsOnly')}</option>
      </select>

      <label className="form-label small">{t('filters.score')}</label>
      <select
        className="form-select form-select-sm mb-3"
        value={filters.minScore}
        onChange={(e) => set('minScore', e.target.value)}
      >
        <option value="">{t('filters.anyScore')}</option>
        <option value="9">Wonderful: 9+</option>
        <option value="8">Very Good: 8+</option>
        <option value="7">Good: 7+</option>
        <option value="6">Pleasant: 6+</option>
      </select>

      <label className="form-label small">{t('filters.bedType')}</label>
      <select
        className="form-select form-select-sm mb-3"
        value={filters.bedType}
        onChange={(e) => set('bedType', e.target.value)}
      >
        <option value="">{t('filters.anyBed')}</option>
        {bedOptions.map((bed) => (
          <option key={bed} value={bed}>
            {bed}
          </option>
        ))}
      </select>

      <label className="form-label small">{t('filters.amenities')}</label>
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
        <label className="form-check-label small">{t('filters.freeCancel')}</label>
      </div>

      <div className="form-check mt-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={filters.breakfastIncluded}
          onChange={(e) => set('breakfastIncluded', e.target.checked)}
        />
        <label className="form-check-label small">{t('filters.breakfast')}</label>
      </div>

      <div className="form-check mt-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={filters.petsAllowed}
          onChange={(e) => set('petsAllowed', e.target.checked)}
        />
        <label className="form-check-label small">{t('filters.pets')}</label>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';

// The destination / dates / guests form from the homepage hero.
// Submitting it moves to /search with the same values in the URL,
// so results are shareable and bookmarkable.
export default function SearchBar({ initial = {} }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(initial.destination || '');
  const [checkIn, setCheckIn] = useState(initial.checkIn || '');
  const [checkOut, setCheckOut] = useState(initial.checkOut || '');
  const [adults, setAdults] = useState(initial.adults || 2);
  const [children, setChildren] = useState(initial.children || 0);
  const [rooms, setRooms] = useState(initial.rooms || 1);
  const [childrenAges, setChildrenAges] = useState(() =>
    initial.childrenAges ? String(initial.childrenAges).split(',').map(Number) : []
  );

  function changeChildren(n) {
    setChildren(n);
    setChildrenAges((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? 5));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      adults,
      children,
      childrenAges: children > 0 ? childrenAges.join(',') : '',
      rooms,
    });
    navigate(`/search?${params.toString()}`);
  }

  return (
    <form className="search-bar p-3 bg-white rounded shadow" onSubmit={handleSubmit}>
      <div className="row g-2">
        <div className="col-md-4">
          <label className="form-label small mb-1">{t('search.where')}</label>
          <input
            className="form-control"
            placeholder={t('search.placeholder')}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label small mb-1">{t('search.checkIn')}</label>
          <input
            type="date"
            className="form-control"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label small mb-1">{t('search.checkOut')}</label>
          <input
            type="date"
            className="form-control"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label small mb-1">{t('search.guestsRooms')}</label>
          <div className="d-flex gap-1">
            <select
              className="form-select form-select-sm"
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              aria-label="Adults"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? t('search.adultsPlural') : t('search.adults')}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm"
              value={children}
              onChange={(e) => changeChildren(Number(e.target.value))}
              aria-label="Children"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n !== 1 ? t('search.childrenPlural') : t('search.children')}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm"
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
              aria-label="Rooms"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? t('search.roomsPlural') : t('search.room')}
                </option>
              ))}
            </select>
          </div>
        </div>
        {children > 0 && (
          <div className="col-md-12">
            <label className="form-label small mb-1">{t('search.childrenAges')}</label>
            <div className="d-flex gap-1 flex-wrap">
              {childrenAges.map((age, i) => (
                <select
                  key={i}
                  className="form-select form-select-sm"
                  style={{ maxWidth: 110 }}
                  value={age}
                  onChange={(e) => {
                    const next = [...childrenAges];
                    next[i] = Number(e.target.value);
                    setChildrenAges(next);
                  }}
                  aria-label={`Child ${i + 1} age`}
                >
                  {Array.from({ length: 18 }, (_, a) => (
                    <option key={a} value={a}>
                      {a} {t('search.yearsOld')}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}
        <div className="col-md-1 d-flex align-items-end">
          <button className="btn btn-primary w-100" type="submit">
            {t('search.search')}
          </button>
        </div>
      </div>
    </form>
  );
}

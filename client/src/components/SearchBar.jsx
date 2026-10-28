import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// The destination / dates / guests form from the homepage hero.
// Submitting it moves to /search with the same values in the URL,
// so results are shareable and bookmarkable.
export default function SearchBar({ initial = {} }) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(initial.destination || '');
  const [checkIn, setCheckIn] = useState(initial.checkIn || '');
  const [checkOut, setCheckOut] = useState(initial.checkOut || '');
  const [adults, setAdults] = useState(initial.adults || 2);
  const [children, setChildren] = useState(initial.children || 0);
  const [rooms, setRooms] = useState(initial.rooms || 1);

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
    });
    navigate(`/search?${params.toString()}`);
  }

  return (
    <form className="search-bar p-3 bg-white rounded shadow" onSubmit={handleSubmit}>
      <div className="row g-2">
        <div className="col-md-4">
          <label className="form-label small mb-1">Where are you going?</label>
          <input
            className="form-control"
            placeholder="Search by city or hotel name"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label small mb-1">Check-in</label>
          <input
            type="date"
            className="form-control"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label small mb-1">Check-out</label>
          <input
            type="date"
            className="form-control"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label small mb-1">Guests &amp; rooms</label>
          <div className="d-flex gap-1">
            <select
              className="form-select form-select-sm"
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              aria-label="Adults"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} adult{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm"
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              aria-label="Children"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} child{n !== 1 ? 'ren' : ''}
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
                  {n} room{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-1 d-flex align-items-end">
          <button className="btn btn-primary w-100" type="submit">
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

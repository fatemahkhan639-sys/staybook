import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Property detail page: gallery, highlights, amenities, the
// availability table (rooms and prices), house rules, and reviews.
export default function HotelPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [roomCounts, setRoomCounts] = useState({});
  const [reviewForm, setReviewForm] = useState({ rating: 9, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    api
      .get(`/api/hotels/${id}`)
      .then((data) => {
        setHotel(data);
        setReviews(data.reviews || []);
      })
      .catch(() => setError('This stay could not be found.'));
  }, [id]);

  function nights() {
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    if (!checkIn || !checkOut) return 1;
    const days = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
    return days > 0 ? days : 1;
  }

  function checkoutLink(room) {
    const query = new URLSearchParams({
      hotelId: hotel._id,
      roomName: room.name,
      checkIn: params.get('checkIn') || '',
      checkOut: params.get('checkOut') || '',
      adults: params.get('adults') || 2,
      children: params.get('children') || 0,
      rooms: roomCounts[room.name] || 1,
    });
    return `/checkout?${query.toString()}`;
  }

  async function submitReview(event) {
    event.preventDefault();
    setReviewMessage('');
    try {
      const created = await api.post(
        '/api/reviews',
        { hotelId: id, rating: Number(reviewForm.rating), comment: reviewForm.comment },
        true
      );
      setReviews([{ ...created, user: { name: user.name } }, ...reviews]);
      setReviewMessage('Thanks! Your review was saved.');
      setReviewForm({ rating: 9, comment: '' });
    } catch (err) {
      setReviewMessage(err.message);
    }
  }

  if (error) return <div className="container my-5 alert alert-danger">{error}</div>;
  if (!hotel) return <div className="container my-5">Loading…</div>;

  const image = hotel.images?.[0] || '/images/hero.jpg';

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h2 className="mb-1">{hotel.name}</h2>
          <p className="text-muted">
            {hotel.address ? `${hotel.address}, ` : ''}
            {hotel.city}, {hotel.country} · {'★'.repeat(hotel.starRating)}
          </p>
        </div>
        <div className="text-end">
          <span className="badge bg-primary fs-6">{hotel.reviewScore.toFixed(1)}</span>
          <div className="small text-muted">
            {hotel.scoreLabel} · {hotel.reviewCount} reviews
          </div>
        </div>
      </div>

      <img src={image} className="img-fluid rounded hotel-gallery mb-4" alt={hotel.name} />

      <p>{hotel.description}</p>

      <h5 className="mt-4">Most popular amenities</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {hotel.amenities.map((amenity) => (
          <span className="badge bg-light text-dark border" key={amenity}>
            {amenity}
          </span>
        ))}
      </div>

      <h5>Availability</h5>
      <p className="small text-muted">
        Prices are for {nights()} night{nights() > 1 ? 's' : ''}. You won&apos;t be charged yet.
      </p>
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>Accommodation type</th>
            <th>Your choices</th>
            <th>Today&apos;s price</th>
            <th>Select rooms</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hotel.rooms.map((room) => (
            <tr key={room.name}>
              <td>
                <strong>{room.name}</strong>
                <div className="small text-muted">
                  {room.sizeSqm} m² · {room.bedType} · up to {room.maxGuests} guests
                </div>
              </td>
              <td className="small">
                {room.breakfastIncluded ? 'Breakfast included' : 'No breakfast'}
                <br />
                {room.freeCancellation ? 'Free cancellation' : 'Non-refundable'}
              </td>
              <td>
                Rs {(room.pricePerNight * nights()).toLocaleString()}
                <div className="small text-muted">
                  Rs {room.pricePerNight.toLocaleString()} per night
                </div>
              </td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={roomCounts[room.name] || 1}
                  onChange={(e) =>
                    setRoomCounts({ ...roomCounts, [room.name]: Number(e.target.value) })
                  }
                  aria-label={`Rooms of ${room.name}`}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <Link to={checkoutLink(room)} className="btn btn-primary btn-sm">
                  I&apos;ll reserve
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="mt-5">House rules</h5>
      <ul className="small">
        <li>Check-in from {hotel.houseRules.checkIn}, check-out until {hotel.houseRules.checkOut}</li>
        <li>Minimum check-in age: {hotel.houseRules.minCheckInAge}</li>
        <li>Quiet hours: {hotel.houseRules.quietHours}</li>
        <li>{hotel.houseRules.petsAllowed ? 'Pets allowed' : 'Pets not allowed'}</li>
        <li>{hotel.houseRules.smokingAllowed ? 'Smoking allowed' : 'No smoking'}</li>
      </ul>

      <h5 className="mt-5">Guest reviews</h5>
      {reviews.length === 0 && <p className="text-muted">No reviews yet. Be the first.</p>}
      {reviews.map((review) => (
        <div className="card p-3 mb-2" key={review._id}>
          <div className="d-flex justify-content-between">
            <strong>{review.user?.name || 'Guest'}</strong>
            <span className="badge bg-primary">{review.rating}/10</span>
          </div>
          <p className="mb-0 mt-1 small">{review.comment}</p>
        </div>
      ))}

      {user ? (
        <form className="card p-3 mt-3" onSubmit={submitReview}>
          <h6>Write a review</h6>
          <div className="row g-2">
            <div className="col-md-2">
              <label className="form-label small">Rating (1–10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-control"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              />
            </div>
            <div className="col-md-8">
              <label className="form-label small">Your review</label>
              <input
                className="form-control"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="How was your stay?"
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" type="submit">
                Submit
              </button>
            </div>
          </div>
          {reviewMessage && <p className="small text-muted mt-2 mb-0">{reviewMessage}</p>}
        </form>
      ) : (
        <p className="small text-muted mt-3">
          <Link to="/login">Sign in</Link> to write a review.
        </p>
      )}
    </div>
  );
}

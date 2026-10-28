import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../i18n';
import HotelMap from '../components/HotelMap';

// Property detail page: gallery, map, highlights, amenities,
// the availability table (rooms and prices), house rules,
// category scores, nearby places, Q&A, and reviews.
const CATEGORY_LABELS = {
  cleanliness: 'Cleanliness',
  comfort: 'Comfort',
  location: 'Location',
  facilities: 'Facilities',
  staff: 'Staff',
  value: 'Value for money',
};

// Reviews carry category scores either nested or flat; average
// whichever shape arrives, and only show categories guests
// actually scored.
function categoryAverages(reviews) {
  const sums = {};
  const counts = {};
  reviews.forEach((review) => {
    const cats = review.categoryScores || review;
    Object.keys(CATEGORY_LABELS).forEach((key) => {
      const value = Number(cats[key]);
      if (value > 0) {
        sums[key] = (sums[key] || 0) + value;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
  });
  return Object.keys(CATEGORY_LABELS)
    .filter((key) => counts[key])
    .map((key) => ({ key, value: sums[key] / counts[key] }));
}

export default function HotelPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { format } = useCurrency();
  const { ids: compareIds, toggle: toggleCompare } = useCompare();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [roomCounts, setRoomCounts] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 9, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionMessage, setQuestionMessage] = useState('');
  const [answerTexts, setAnswerTexts] = useState({});
  const [alertPrice, setAlertPrice] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Dates and party size ride along so the server can say how
  // many rooms of each type are actually still free.
  useEffect(() => {
    const availability = new URLSearchParams();
    ['checkIn', 'checkOut', 'rooms', 'adults', 'children'].forEach((key) => {
      const value = params.get(key);
      if (value) availability.set(key, value);
    });
    const suffix = availability.toString();
    api
      .get(`/api/hotels/${id}${suffix ? `?${suffix}` : ''}`)
      .then((data) => {
        setHotel(data);
        setReviews(data.reviews || []);
      })
      .catch(() => setError('This stay could not be found.'));
    api
      .get(`/api/hotels/${id}/questions`)
      .then((data) => setQuestions(Array.isArray(data) ? data : data.questions || []))
      .catch(() => setQuestions([]));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function askQuestion(event) {
    event.preventDefault();
    setQuestionMessage('');
    try {
      const created = await api.post(`/api/hotels/${id}/questions`, { question: questionText }, true);
      setQuestions([created, ...questions]);
      setQuestionText('');
    } catch (err) {
      setQuestionMessage(err.message);
    }
  }

  async function answerQuestion(questionId, event) {
    event.preventDefault();
    const answer = answerTexts[questionId];
    if (!answer) return;
    try {
      const updated = await api.post(
        `/api/hotels/${id}/questions/${questionId}/answers`,
        { answer },
        true
      );
      setQuestions(questions.map((q) => (q._id === questionId ? updated : q)));
      setAnswerTexts({ ...answerTexts, [questionId]: '' });
    } catch (err) {
      setQuestionMessage(err.message);
    }
  }

  async function saveAlert(event) {
    event.preventDefault();
    setAlertMessage('');
    try {
      await api.post('/api/alerts', { hotelId: id, targetPrice: Number(alertPrice) }, true);
      setAlertMessage(t('hotel.alertSaved'));
      setAlertPrice('');
    } catch (err) {
      setAlertMessage(err.message);
    }
  }

  if (error) return <div className="container my-5 alert alert-danger">{error}</div>;
  if (!hotel) return <div className="container my-5">{t('common.loading')}</div>;

  const images = hotel.images?.length ? hotel.images : ['/images/hero.jpg'];
  const hostName = hotel.listedBy?.name || null;
  const hostId = hotel.listedBy?._id || hotel.listedBy || null;
  const canAnswer = user && (user.role === 'admin' || (hostId && hostId === user._id));
  const inCompare = compareIds.includes(hotel._id);
  const saved = wishlistIds.has(hotel._id);
  const categories = categoryAverages(reviews);

  return (
    <div className="container my-4">
      <Link to="/search" className="small text-decoration-none">
        ← {t('hotel.backToResults')}
      </Link>

      <div className="d-flex justify-content-between align-items-start mt-2">
        <div>
          <h2 className="mb-1">{hotel.name}</h2>
          <p className="text-muted">
            {hotel.address ? `${hotel.address}, ` : ''}
            {hotel.city}, {hotel.country} · {'★'.repeat(hotel.starRating)}
            {hotel.locationScore != null && (
              <span className="ms-2 badge bg-light text-dark border">
                {t('hotel.locationScore')}: {hotel.locationScore.toFixed(1)}/10
              </span>
            )}
          </p>
        </div>
        <div className="text-end">
          <span className="badge bg-primary fs-6">{hotel.reviewScore.toFixed(1)}</span>
          <div className="small text-muted">
            {hotel.scoreLabel} · {hotel.reviewCount} {t('common.reviews')}
          </div>
          <div className="mt-2">
            <button
              className="btn btn-outline-danger btn-sm me-2"
              onClick={() => {
                if (!user) navigate('/login');
                else toggleWishlist(hotel._id).catch(() => {});
              }}
            >
              {saved ? `♥ ${t('wishlist.saved')}` : `♡ ${t('wishlist.save')}`}
            </button>
            <button
              className={`btn btn-sm ${inCompare ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => {
                if (!toggleCompare(hotel._id) && !inCompare) alert(t('compare.full'));
              }}
            >
              {inCompare ? t('compare.added') : t('compare.add')}
            </button>
          </div>
        </div>
      </div>

      <img
        src={images[selectedImage]}
        className="img-fluid rounded hotel-gallery mb-2"
        alt={hotel.name}
      />
      {images.length > 1 && (
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {images.map((src, index) => (
            <button
              key={src + index}
              className={`p-0 border ${index === selectedImage ? 'border-primary border-2' : ''}`}
              onClick={() => setSelectedImage(index)}
              style={{ background: 'none' }}
            >
              <img src={src} alt="" style={{ width: 96, height: 64, objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      <p>{hotel.description}</p>

      {hotel.hostNote && (
        <blockquote className="host-note p-3 my-4">
          <div className="small text-muted mb-1">{t('hotel.hostNoteTitle')}</div>
          <p className="mb-0">{hotel.hostNote}</p>
          {hostName && <footer className="small text-muted mt-1">— {hostName}</footer>}
        </blockquote>
      )}

      <h5 className="mt-4">{t('hotel.amenities')}</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {hotel.amenities.map((amenity) => (
          <span className="badge bg-light text-dark border" key={amenity}>
            {amenity}
          </span>
        ))}
      </div>

      <h5>{t('hotel.mapTitle')}</h5>
      <HotelMap lat={hotel.lat} lng={hotel.lng} name={hotel.name} />

      {hotel.nearby?.length > 0 && (
        <>
          <h5 className="mt-4">{t('hotel.nearbyTitle')}</h5>
          <ul className="small">
            {hotel.nearby.map((place, index) => (
              <li key={place.name + index}>
                {place.name}
                {place.distanceKm != null && ` — ${place.distanceKm} km`}
                {place.kind ? ` (${place.kind})` : ''}
              </li>
            ))}
          </ul>
        </>
      )}

      <h5>{t('hotel.availability')}</h5>
      <p className="small text-muted">
        {t('hotel.pricesFor')} {nights()} {nights() > 1 ? t('hotel.nights') : t('hotel.night')}.{' '}
        {t('hotel.notChargedYet')}
      </p>
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>{t('hotel.roomType')}</th>
            <th>{t('hotel.choices')}</th>
            <th>{t('hotel.price')}</th>
            <th>{t('hotel.selectRooms')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hotel.rooms.map((room) => {
            const available = room.availableUnits;
            const soldOut = available === 0;
            const maxSelectable = available == null ? 4 : Math.min(4, available);
            return (
              <tr key={room.name}>
                <td>
                  <strong>{room.name}</strong>
                  <div className="small text-muted">
                    {room.sizeSqm} m² · {room.bedType} · up to {room.maxGuests} guests
                  </div>
                  {available != null && available > 0 && available <= 3 && (
                    <div className="small text-danger fw-semibold">
                      {t('hotel.onlyLeft', { n: available })}
                    </div>
                  )}
                  {soldOut && (
                    <div className="small text-danger fw-semibold">{t('hotel.soldOut')}</div>
                  )}
                </td>
                <td className="small">
                  {room.breakfastIncluded ? t('hotel.breakfast') : t('hotel.noBreakfast')}
                  <br />
                  {room.freeCancellation ? t('hotel.freeCancel') : t('hotel.nonRefundable')}
                </td>
                <td>
                  {format(room.pricePerNight * nights())}
                  <div className="small text-muted">
                    {format(room.pricePerNight)} {t('common.perNight')}
                  </div>
                </td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    disabled={soldOut}
                    value={roomCounts[room.name] || 1}
                    onChange={(e) =>
                      setRoomCounts({ ...roomCounts, [room.name]: Number(e.target.value) })
                    }
                    aria-label={`Rooms of ${room.name}`}
                  >
                    {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <Link
                    to={checkoutLink(room)}
                    className={`btn btn-primary btn-sm ${soldOut ? 'disabled' : ''}`}
                    onClick={(e) => soldOut && e.preventDefault()}
                  >
                    {t('hotel.reserve')}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h5 className="mt-5">{t('hotel.houseRules')}</h5>
      <ul className="small">
        <li>
          {t('hotel.checkInFrom')} {hotel.houseRules.checkIn}, {t('hotel.checkOutUntil')}{' '}
          {hotel.houseRules.checkOut}
        </li>
        <li>
          {t('hotel.minAge')}: {hotel.houseRules.minCheckInAge}
        </li>
        <li>
          {t('hotel.quietHours')}: {hotel.houseRules.quietHours}
        </li>
        <li>{hotel.houseRules.petsAllowed ? t('hotel.petsAllowed') : t('hotel.petsNotAllowed')}</li>
        <li>
          {hotel.houseRules.smokingAllowed ? t('hotel.smokingAllowed') : t('hotel.noSmoking')}
        </li>
      </ul>

      {hotel.finePrint && (
        <>
          <h5 className="mt-5">{t('hotel.finePrintTitle')}</h5>
          <p className="small text-muted">{hotel.finePrint}</p>
        </>
      )}

      <p className="small text-muted mt-4">
        {t('hotel.hostTitle')}: {hostName || t('hotel.hostPartner')}
      </p>

      {user && (
        <form className="card p-3 my-4" onSubmit={saveAlert}>
          <h6>{t('hotel.setAlert')}</h6>
          <div className="d-flex gap-2">
            <input
              type="number"
              className="form-control"
              placeholder={t('hotel.targetPrice')}
              required
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
            />
            <button className="btn btn-outline-primary" type="submit">
              {t('hotel.setAlert')}
            </button>
          </div>
          {alertMessage && <p className="small text-muted mt-2 mb-0">{alertMessage}</p>}
        </form>
      )}

      <h5 className="mt-5">{t('hotel.qaTitle')}</h5>
      {questions.length === 0 && (
        <p className="text-muted small">No questions yet.</p>
      )}
      {questions.map((question) => (
        <div className="card p-3 mb-2" key={question._id}>
          <p className="fw-semibold mb-1">Q: {question.question}</p>
          {(question.answers || []).map((answer, index) => (
            <p className="small text-muted mb-1" key={index}>
              A: {answer.answer || answer.text || answer}
            </p>
          ))}
          {canAnswer && (
            <form
              className="d-flex gap-2 mt-2"
              onSubmit={(e) => answerQuestion(question._id, e)}
            >
              <input
                className="form-control form-control-sm"
                placeholder={t('hotel.qaAnswerPlaceholder')}
                value={answerTexts[question._id] || ''}
                onChange={(e) =>
                  setAnswerTexts({ ...answerTexts, [question._id]: e.target.value })
                }
              />
              <button className="btn btn-outline-primary btn-sm" type="submit">
                {t('hotel.qaAnswer')}
              </button>
            </form>
          )}
        </div>
      ))}
      {user ? (
        <form className="d-flex gap-2 mt-2" onSubmit={askQuestion}>
          <input
            className="form-control"
            placeholder={t('hotel.qaPlaceholder')}
            required
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            {t('hotel.qaAsk')}
          </button>
        </form>
      ) : (
        <p className="small text-muted mt-3">
          <Link to="/login">{t('nav.signIn')}</Link> {t('hotel.qaSignIn')}
        </p>
      )}
      {questionMessage && <p className="small text-danger mt-2">{questionMessage}</p>}

      <h5 className="mt-5">{t('hotel.reviews')}</h5>
      {categories.length > 0 && (
        <div className="row mb-3">
          {categories.map((category) => (
            <div className="col-md-4 small mb-1" key={category.key}>
              {CATEGORY_LABELS[category.key]}: <strong>{category.value.toFixed(1)}</strong>/10
            </div>
          ))}
        </div>
      )}
      {reviews.length === 0 && <p className="text-muted">{t('hotel.noReviews')}</p>}
      {reviews.map((review) => (
        <div className="card p-3 mb-2" key={review._id}>
          <div className="d-flex justify-content-between">
            <strong>{review.user?.name || 'Guest'}</strong>
            <span className="badge bg-primary">{review.rating}/10</span>
          </div>
          <p className="mb-0 mt-1 small">{review.comment}</p>
          {review.hostReply && (
            <p className="mb-0 mt-2 small text-muted">
              <em>{t('hotel.hostReply')}: </em>
              {review.hostReply}
            </p>
          )}
        </div>
      ))}

      {user ? (
        <form className="card p-3 mt-3" onSubmit={submitReview}>
          <h6>{t('hotel.writeReview')}</h6>
          <div className="row g-2">
            <div className="col-md-2">
              <label className="form-label small">{t('hotel.rating')}</label>
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
              <label className="form-label small">{t('hotel.yourReview')}</label>
              <input
                className="form-control"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder={t('hotel.reviewPlaceholder')}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" type="submit">
                {t('hotel.submit')}
              </button>
            </div>
          </div>
          {reviewMessage && <p className="small text-muted mt-2 mb-0">{reviewMessage}</p>}
        </form>
      ) : (
        <p className="small text-muted mt-3">
          <Link to="/login">{t('nav.signIn')}</Link> {t('hotel.signInToReview')}
        </p>
      )}
    </div>
  );
}

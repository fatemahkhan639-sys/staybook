import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../i18n';

// One result row: photo, name, stars, review score and the
// starting price, linking to the hotel detail page. The heart
// and Compare buttons sit on the card itself so a guest does
// not have to open the hotel to save or compare it.
export default function HotelCard({ hotel, query = '' }) {
  const { user } = useAuth();
  const { format } = useCurrency();
  const { ids: compareIds, toggle: toggleCompare } = useCompare();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const image = hotel.images?.[0] || '/images/hero.jpg';
  const hasDeal = hotel.originalPrice && hotel.originalPrice > hotel.pricePerNight;
  const dealPercent = hasDeal
    ? Math.round((1 - hotel.pricePerNight / hotel.originalPrice) * 100)
    : 0;
  const inCompare = compareIds.includes(hotel._id);
  const saved = wishlistIds.has(hotel._id);
  // A stay counts as newly listed for its first month, judged
  // from its real creation date rather than a flag.
  const newlyListed =
    hotel.createdAt && Date.now() - new Date(hotel.createdAt).getTime() < 30 * 86400000;
  const anyFreeCancel = hotel.rooms?.some((room) => room.freeCancellation);
  const anyBreakfast = hotel.rooms?.some((room) => room.breakfastIncluded);

  function onCompare() {
    if (!toggleCompare(hotel._id) && !inCompare) {
      alert(t('compare.full'));
    }
  }

  function onWishlist() {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(hotel._id).catch(() => {});
  }

  return (
    <div className="card mb-3 hotel-card">
      <div className="row g-0">
        <div className="col-md-4 position-relative">
          <img src={image} className="img-fluid rounded-start hotel-card-img" alt={hotel.name} />
          {newlyListed && (
            <span className="badge bg-success position-absolute top-0 start-0 m-2">
              {t('hotel.newListing')}
            </span>
          )}
          <button
            className="btn btn-light btn-sm position-absolute top-0 end-0 m-2"
            onClick={onWishlist}
            aria-label={saved ? t('wishlist.saved') : t('wishlist.save')}
            title={saved ? t('wishlist.saved') : t('wishlist.save')}
          >
            {saved ? '♥' : '♡'}
          </button>
        </div>
        <div className="col-md-8">
          <div className="card-body d-flex flex-column h-100">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="card-title mb-1">
                  <Link to={`/hotel/${hotel._id}${query}`} className="text-decoration-none">
                    {hotel.name}
                  </Link>
                </h5>
                <p className="text-muted small mb-1">
                  {hotel.address ? `${hotel.address}, ` : ''}
                  {hotel.city}, {hotel.country} · {'★'.repeat(hotel.starRating)}
                </p>
                <p className="small text-muted mb-0">
                  {hotel.type}
                  {hotel.distanceFromCenter != null &&
                    ` · ${hotel.distanceFromCenter} km from center`}
                </p>
              </div>
              <div className="text-end">
                <span className="badge bg-primary fs-6">{hotel.reviewScore.toFixed(1)}</span>
                <div className="small text-muted">
                  {hotel.scoreLabel || ''} · {hotel.reviewCount} {t('common.reviews')}
                </div>
              </div>
            </div>

            <p className="card-text small flex-grow-1 mt-2">{hotel.description}</p>

            <div className="small text-success mb-2">
              {anyBreakfast && <span className="me-2">{t('hotel.breakfast')}</span>}
              {anyFreeCancel && <span>{t('hotel.freeCancel')}</span>}
            </div>

            <div className="d-flex justify-content-between align-items-end">
              <span className="small text-muted">
                {hotel.amenities.slice(0, 3).join(' · ')}
              </span>
              <div className="text-end">
                {hasDeal && (
                  <>
                    <span className="badge bg-danger me-2">-{dealPercent}%</span>
                    <del className="small text-muted">{format(hotel.originalPrice)}</del>
                  </>
                )}
                <div className="small text-muted">{t('common.from')}</div>
                <strong>{format(hotel.pricePerNight)}</strong>
                <div className="small text-muted">{t('common.perNight')}</div>
                <div className="mt-1">
                  <button
                    className={`btn btn-sm me-2 ${inCompare ? 'btn-warning' : 'btn-outline-secondary'}`}
                    onClick={onCompare}
                  >
                    {inCompare ? t('compare.added') : t('compare.add')}
                  </button>
                  <Link
                    to={`/hotel/${hotel._id}${query}`}
                    className="btn btn-primary btn-sm"
                  >
                    See availability
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

// One result row: photo, name, stars, review score and the
// starting price, linking to the hotel detail page.
export default function HotelCard({ hotel, query = '' }) {
  const image = hotel.images?.[0] || '/images/hero.jpg';
  const hasDeal = hotel.originalPrice && hotel.originalPrice > hotel.pricePerNight;
  const dealPercent = hasDeal
    ? Math.round((1 - hotel.pricePerNight / hotel.originalPrice) * 100)
    : 0;

  return (
    <div className="card mb-3 hotel-card">
      <div className="row g-0">
        <div className="col-md-4">
          <img src={image} className="img-fluid rounded-start hotel-card-img" alt={hotel.name} />
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
                  {hotel.scoreLabel || ''} · {hotel.reviewCount} reviews
                </div>
              </div>
            </div>

            <p className="card-text small flex-grow-1 mt-2">{hotel.description}</p>

            <div className="d-flex justify-content-between align-items-end">
              <span className="small text-muted">
                {hotel.amenities.slice(0, 3).join(' · ')}
              </span>
              <div className="text-end">
                {hasDeal && (
                  <>
                    <span className="badge bg-danger me-2">-{dealPercent}%</span>
                    <del className="small text-muted">
                      Rs {hotel.originalPrice.toLocaleString()}
                    </del>
                  </>
                )}
                <div className="small text-muted">From</div>
                <strong>Rs {hotel.pricePerNight.toLocaleString()}</strong>
                <div className="small text-muted">per night</div>
                <Link
                  to={`/hotel/${hotel._id}${query}`}
                  className="btn btn-primary btn-sm mt-1"
                >
                  See availability
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../i18n';

export default function WishlistPage() {
  const { user } = useAuth();
  const { hotels } = useWishlist();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="container my-5">
        <p>
          {t('wishlist.signInPrompt')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h3>{t('wishlist.title')}</h3>
      {hotels.length === 0 && <p className="text-muted">{t('wishlist.empty')}</p>}
      {hotels.map((hotel) => (
        <HotelCard key={hotel._id} hotel={hotel} />
      ))}
    </div>
  );
}

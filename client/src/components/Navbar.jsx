import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { CURRENCIES, useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';

// Top bar on every page. The two selects (language, currency)
// are plain selects on purpose: Bootstrap's JS dropdown is not
// bundled, and a select works without it.
export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { count: compareCount } = useCompare();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          StayBook
        </Link>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link className="nav-link text-white" to="/">
            {t('nav.stays')}
          </Link>
          <Link className="nav-link text-white" to="/deals">
            {t('nav.deals')}
          </Link>
          <Link className="nav-link text-white" to="/destinations">
            {t('nav.destinations')}
          </Link>
          <Link className="nav-link text-white" to="/list-property">
            {t('nav.listProperty')}
          </Link>

          <select
            className="form-select form-select-sm w-auto"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            <option value="en">English</option>
            <option value="ur">اردو</option>
          </select>

          <select
            className="form-select form-select-sm w-auto"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Currency"
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <Link className="nav-link text-white" to="/compare">
            {t('nav.compare')}
            {compareCount > 0 && (
              <span className="badge bg-warning text-dark ms-1">{compareCount}</span>
            )}
          </Link>

          {user ? (
            <>
              <Link className="nav-link text-white" to="/wishlist">
                {t('nav.wishlist')}
              </Link>
              <Link className="nav-link text-white" to="/my-bookings">
                {t('nav.myTrips')}
              </Link>
              <Link className="nav-link text-white" to="/account">
                {t('nav.account')}
              </Link>
              {user.role === 'admin' && (
                <Link className="nav-link text-white" to="/admin">
                  Admin
                </Link>
              )}
              <span className="text-white-50 small">
                {t('nav.hi')}, {user.name}
              </span>
              <button className="btn btn-light btn-sm" onClick={handleLogout}>
                {t('nav.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/login">
                {t('nav.signIn')}
              </Link>
              <Link className="btn btn-light btn-sm" to="/register">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

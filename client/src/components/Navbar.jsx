import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Top bar on every page: brand, main links, and sign-in state.
export default function Navbar() {
  const { user, logout } = useAuth();
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

        <div className="d-flex align-items-center gap-3">
          <Link className="nav-link text-white" to="/">
            Stays
          </Link>
          <Link className="nav-link text-white" to="/deals">
            Deals
          </Link>
          <Link className="nav-link text-white" to="/destinations">
            Destinations
          </Link>
          <Link className="nav-link text-white" to="/list-property">
            List your property
          </Link>

          {user ? (
            <>
              <Link className="nav-link text-white" to="/my-bookings">
                My trips
              </Link>
              <span className="text-white-50 small">Hi, {user.name}</span>
              <button className="btn btn-light btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/login">
                Sign in
              </Link>
              <Link className="btn btn-light btn-sm" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

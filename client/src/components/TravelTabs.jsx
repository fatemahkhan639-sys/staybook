import { Link, useLocation } from 'react-router-dom';

// The Booking.com-style tabs above the page: stays, flights,
// cars, attractions and airport taxis. The active tab is the
// page the guest is already on.
const TABS = [
  ['Stays', '/'],
  ['Flights', '/flights'],
  ['Car rental', '/cars'],
  ['Attractions', '/activities'],
  ['Airport taxis', '/transfers'],
];

export default function TravelTabs() {
  const { pathname } = useLocation();
  return (
    <div className="bg-white border-bottom">
      <div className="container d-flex gap-1 py-2 overflow-auto">
        {TABS.map(([label, route]) => (
          <Link
            key={route}
            to={route}
            className={`btn btn-sm text-nowrap ${pathname === route ? 'btn-primary' : 'btn-outline-secondary'}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

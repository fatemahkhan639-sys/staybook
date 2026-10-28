// Link footer, grouped the way booking sites group theirs.
// Links with a real page behind them navigate; the rest are
// information labels for now.
import { Link } from 'react-router-dom';

export default function Footer() {
  // [label, route] — route null means plain text, no page yet.
  const groups = {
    Support: [
      ['Contact Customer Service', '/help'],
      ['Manage your trips', '/my-bookings'],
      ['Help Center', '/help'],
    ],
    Discover: [
      ['Destinations', '/destinations'],
      ['Cities', '/destinations'],
      ["Today's deals", '/deals'],
      ['Homes guests love', '/'],
    ],
    'Terms and settings': [
      ['Privacy & cookies', null],
      ['Terms & conditions', null],
    ],
    Partners: [
      ['List your property', '/list-property'],
      ['Partner help', '/help'],
    ],
    About: [['About StayBook', '/help']],
  };

  return (
    <footer className="bg-light border-top mt-5 py-4">
      <div className="container">
        <div className="row">
          {Object.entries(groups).map(([title, links]) => (
            <div className="col-md-2 col-6 mb-3" key={title}>
              <h6 className="small">{title}</h6>
              <ul className="list-unstyled">
                {links.map(([label, route]) => (
                  <li key={label}>
                    {route ? (
                      <Link to={route} className="text-muted small text-decoration-none">
                        {label}
                      </Link>
                    ) : (
                      <span className="text-muted small">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-muted small mb-0">
          StayBook is a demo hotel booking platform. Prices are shown in PKR per night.
        </p>
      </div>
    </footer>
  );
}

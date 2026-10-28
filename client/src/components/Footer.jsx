import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

// Link footer, grouped the way booking sites group theirs.
// Every label here routes to a real page.
export default function Footer() {
  const { t } = useLanguage();

  const groups = {
    [t('footer.support')]: [
      [t('footer.contact'), '/contact'],
      [t('footer.trips'), '/my-bookings'],
      [t('footer.help'), '/help'],
    ],
    [t('footer.discover')]: [
      [t('footer.destinations'), '/destinations'],
      [t('footer.deals'), '/deals'],
      [t('footer.compare'), '/compare'],
      [t('footer.wishlist'), '/wishlist'],
    ],
    [t('footer.terms')]: [
      [t('footer.privacy'), '/privacy'],
      [t('footer.termsCond'), '/terms'],
    ],
    [t('footer.partners')]: [
      [t('footer.listProperty'), '/list-property'],
      [t('footer.myListings'), '/my-listings'],
    ],
    [t('footer.about')]: [
      [t('footer.aboutStayBook'), '/terms'],
      [t('footer.contact'), '/contact'],
    ],
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
                    <Link to={route} className="text-muted small text-decoration-none">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-muted small mb-0">{t('footer.tagline')}</p>
      </div>
    </footer>
  );
}

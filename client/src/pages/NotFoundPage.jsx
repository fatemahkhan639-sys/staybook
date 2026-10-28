import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="container my-5 text-center" style={{ maxWidth: 560 }}>
      <h1 className="display-4 text-muted">404</h1>
      <h3>{t('notFound.title')}</h3>
      <p className="text-muted">{t('notFound.text')}</p>
      <div className="mt-4">
        <Link to="/" className="btn btn-primary me-2">
          {t('notFound.home')}
        </Link>
        <Link to="/search" className="btn btn-outline-primary">
          {t('notFound.search')}
        </Link>
      </div>
    </div>
  );
}

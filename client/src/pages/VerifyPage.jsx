import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

// Visiting an emailed verification link: one GET, then a
// plain answer. Nothing else happens on this page.
export default function VerifyPage() {
  const { token } = useParams();
  const { t } = useLanguage();
  const [state, setState] = useState('checking');

  useEffect(() => {
    api
      .get(`/api/auth/verify/${token}`)
      .then(() => setState('done'))
      .catch(() => setState('failed'));
  }, [token]);

  return (
    <div className="container my-5" style={{ maxWidth: 480 }}>
      {state === 'checking' && <p className="text-muted">{t('auth.verifyChecking')}</p>}
      {state === 'done' && (
        <p>
          {t('auth.verifyDone')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
      )}
      {state === 'failed' && <p className="text-danger">{t('auth.verifyFailed')}</p>}
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post(`/api/auth/reset/${token}`, { password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container my-5" style={{ maxWidth: 420 }}>
      <h3>{t('auth.resetTitle')}</h3>
      {done ? (
        <p>
          {t('auth.resetDone')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="form-label small">{t('auth.newPassword')}</label>
          <input
            type="password"
            className="form-control mb-3"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-danger small">{error}</p>}
          <button className="btn btn-primary w-100" type="submit">
            {t('auth.resetTitle')}
          </button>
        </form>
      )}
    </div>
  );
}

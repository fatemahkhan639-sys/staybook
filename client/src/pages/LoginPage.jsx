import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container my-5" style={{ maxWidth: 420 }}>
      <h3>{t('auth.signIn')}</h3>
      <form onSubmit={handleSubmit}>
        <label className="form-label small">{t('auth.email')}</label>
        <input
          type="email"
          className="form-control mb-3"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="form-label small">{t('auth.password')}</label>
        <input
          type="password"
          className="form-control mb-3"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-danger small">{error}</p>}
        <button className="btn btn-primary w-100" type="submit">
          {t('auth.continueEmail')}
        </button>
      </form>
      <p className="small mt-3 d-flex justify-content-between">
        <span>
          {t('auth.noAccount')} <Link to="/register">{t('nav.register')}</Link>
        </span>
        <Link to="/forgot-password">{t('auth.forgot')}</Link>
      </p>
    </div>
  );
}

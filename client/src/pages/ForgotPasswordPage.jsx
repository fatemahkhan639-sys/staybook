import { useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/auth/forgot', { email });
      // The message stays generic on purpose: confirming
      // whether an email has an account would leak accounts.
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container my-5" style={{ maxWidth: 420 }}>
      <h3>{t('auth.forgotTitle')}</h3>
      {sent ? (
        <p className="text-muted">{t('auth.forgotSent')}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-muted small">{t('auth.forgotText')}</p>
          <label className="form-label small">{t('auth.email')}</label>
          <input
            type="email"
            className="form-control mb-3"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-danger small">{error}</p>}
          <button className="btn btn-primary w-100" type="submit">
            {t('auth.sendLink')}
          </button>
        </form>
      )}
    </div>
  );
}

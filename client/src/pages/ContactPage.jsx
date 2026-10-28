import { useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../i18n';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/contact', form);
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container my-5" style={{ maxWidth: 560 }}>
      <h3>{t('contact.title')}</h3>
      <p className="text-muted">{t('contact.sub')}</p>
      {sent ? (
        <p className="alert alert-success">{t('contact.sent')}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="form-label small">{t('contact.name')}</label>
          <input
            className="form-control mb-3"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="form-label small">{t('contact.email')}</label>
          <input
            type="email"
            className="form-control mb-3"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label className="form-label small">{t('contact.message')}</label>
          <textarea
            className="form-control mb-3"
            rows="4"
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          {error && <p className="text-danger small">{error}</p>}
          <button className="btn btn-primary" type="submit">
            {t('contact.send')}
          </button>
        </form>
      )}
    </div>
  );
}

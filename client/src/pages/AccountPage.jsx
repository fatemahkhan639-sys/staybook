import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../i18n';

// Account overview: Rewards tier and progress, price alerts
// with their triggered state, and payment history.
export default function AccountPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [loyalty, setLoyalty] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/api/loyalty/me', true).then(setLoyalty).catch(() => setLoyalty(null));
    api
      .get('/api/alerts/mine', true)
      .then((data) => setAlerts(Array.isArray(data) ? data : data.alerts || []))
      .catch(() => setAlerts([]));
    api
      .get('/api/payments/mine', true)
      .then((data) => setPayments(Array.isArray(data) ? data : data.payments || []))
      .catch(() => setPayments([]));
  }, [user]);

  async function deleteAlert(id) {
    await api.del(`/api/alerts/${id}`, true).catch(() => {});
    setAlerts(alerts.filter((alert) => alert._id !== id));
  }

  if (!user) {
    return (
      <div className="container my-5">
        <p>
          {t('wishlist.signInPrompt')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h3>{t('account.title')}</h3>
      <p className="text-muted mb-4">
        {user.name} · {user.email}
      </p>

      <div className="card p-3 mb-4">
        <h5>{t('account.tier')}</h5>
        {loyalty ? (
          <>
            <p className="mb-1">
              <strong>{loyalty.tier}</strong> · {loyalty.discountPercent}% off at checkout ·{' '}
              {loyalty.stays} {t('account.stays')}
            </p>
            <p className="small text-muted mb-0">
              {loyalty.nextTier
                ? `${t('account.nextTier')}: ${loyalty.nextTier} — ${loyalty.staysToNext} ${t('account.staysToNext')}`
                : t('account.topTier')}
            </p>
          </>
        ) : (
          <p className="small text-muted mb-0">{t('common.loading')}</p>
        )}
      </div>

      <h5>{t('account.alerts')}</h5>
      {alerts.length === 0 && <p className="text-muted">{t('account.noAlerts')}</p>}
      {alerts.map((alert) => (
        <div className="card p-3 mb-2" key={alert._id}>
          <div className="d-flex justify-content-between">
            <div>
              <Link to={`/hotel/${alert.hotelId?._id || alert.hotelId}`} className="text-decoration-none">
                <strong>{alert.hotelId?.name || 'Stay'}</strong>
              </Link>
              <p className="small text-muted mb-0">
                {t('account.target')}: {format(alert.targetPrice)} · {t('account.currentPrice')}:{' '}
                {format(alert.currentPrice)}
              </p>
              {alert.triggered && (
                <p className="small text-success mb-0 fw-semibold">{t('account.triggered')}</p>
              )}
            </div>
            <button
              className="btn btn-outline-danger btn-sm align-self-start"
              onClick={() => deleteAlert(alert._id)}
            >
              {t('account.delete')}
            </button>
          </div>
        </div>
      ))}

      <h5 className="mt-4">{t('account.payments')}</h5>
      {payments.length === 0 && <p className="text-muted">{t('account.noPayments')}</p>}
      {payments.map((payment) => (
        <div className="card p-3 mb-2 small" key={payment._id}>
          {payment.method} · {payment.status}
          {payment.transactionId ? ` · ${payment.transactionId}` : ''}
        </div>
      ))}
    </div>
  );
}

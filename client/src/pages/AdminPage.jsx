import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

// Back office for the site owner. Plain English on purpose:
// this page is a work tool, not part of the guest-facing site.
export default function AdminPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [message, setMessage] = useState('');
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: 10,
    validFrom: '',
    validUntil: '',
    maxUses: '',
  });

  function load() {
    api.get('/api/admin/bookings', true).then(setBookings).catch(() => setBookings([]));
    api.get('/api/admin/payments', true).then(setPayments).catch(() => setPayments([]));
    api.get('/api/admin/coupons', true).then(setCoupons).catch(() => setCoupons([]));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function verifyPayment(id) {
    try {
      await api.patch(`/api/admin/payments/${id}/verify`, {}, true);
      setMessage('Payment marked as paid.');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function createCoupon(event) {
    event.preventDefault();
    try {
      const body = {
        code: newCoupon.code,
        discountPercent: Number(newCoupon.discountPercent),
        validFrom: newCoupon.validFrom || undefined,
        validUntil: newCoupon.validUntil || undefined,
        maxUses: newCoupon.maxUses ? Number(newCoupon.maxUses) : undefined,
      };
      await api.post('/api/admin/coupons', body, true);
      setNewCoupon({ code: '', discountPercent: 10, validFrom: '', validUntil: '', maxUses: '' });
      setMessage('Coupon created.');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function deleteCoupon(id) {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.del(`/api/admin/coupons/${id}`, true);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!user) {
    return (
      <div className="container my-5">
        <p>
          Please <Link to="/login">sign in</Link> first.
        </p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">This page is for admins only.</div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h4 className="mb-3">Admin</h4>
      {message && <p className="alert alert-info py-2 small">{message}</p>}

      <h5 className="mt-4">Latest bookings</h5>
      {bookings.length === 0 && <p className="text-muted small">No bookings yet.</p>}
      {bookings.map((b) => (
        <div className="card p-3 mb-2" key={b._id}>
          <div className="d-flex justify-content-between">
            <strong>{b.hotel?.name || 'Deleted hotel'}</strong>
            <span className="badge bg-secondary">{b.status}</span>
          </div>
          <p className="mb-0 small text-muted">
            {b.roomName} · {b.checkIn?.slice(0, 10)} → {b.checkOut?.slice(0, 10)} ·{' '}
            {format(b.totalPrice)} · {b.paymentMethod} / {b.paymentStatus}
          </p>
        </div>
      ))}

      <h5 className="mt-4">Payments</h5>
      {payments.length === 0 && <p className="text-muted small">No payments yet.</p>}
      {payments.map((p) => (
        <div className="card p-3 mb-2" key={p._id}>
          <div className="d-flex justify-content-between">
            <strong>
              {p.method} · {format(p.amount)}
            </strong>
            <span className="badge bg-secondary">{p.status}</span>
          </div>
          <p className="mb-1 small text-muted">
            {p.walletProvider ? `${p.walletProvider} ${p.walletNumber || ''} · ` : ''}
            {p.transactionId ? `Txn ${p.transactionId} · ` : ''}
            {p.booking?.roomName || ''} {p.booking?.checkIn?.slice(0, 10) || ''}
          </p>
          {p.method === 'wallet' && p.status === 'pending_verification' && (
            <button className="btn btn-sm btn-outline-success" onClick={() => verifyPayment(p._id)}>
              Mark as paid
            </button>
          )}
        </div>
      ))}

      <h5 className="mt-4">Coupons</h5>
      <form className="card p-3 mb-3" onSubmit={createCoupon}>
        <div className="row g-2">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="CODE"
              required
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="number"
              min="1"
              max="100"
              placeholder="% off"
              required
              value={newCoupon.discountPercent}
              onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="date"
              value={newCoupon.validFrom}
              onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="date"
              value={newCoupon.validUntil}
              onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="number"
              placeholder="Max uses"
              value={newCoupon.maxUses}
              onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
            />
          </div>
          <div className="col-md-1">
            <button className="btn btn-primary w-100" type="submit">
              Add
            </button>
          </div>
        </div>
      </form>
      {coupons.map((c) => (
        <div className="card p-3 mb-2 d-flex flex-row justify-content-between" key={c._id}>
          <span>
            <strong>{c.code}</strong> · {c.discountPercent}% off · used {c.usedCount}
            {c.maxUses ? ` / ${c.maxUses}` : ''}
          </span>
          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCoupon(c._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

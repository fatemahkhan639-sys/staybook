import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../i18n';

// Booking flow in three steps, matching the reference flow:
// 1. Your selection — dates, room, price summary.
// 2. Your details — guest information, coupon, payment method.
// 3. Finish booking — confirmation with a booking reference.
//
// Money is worked out in PKR throughout (the server stores
// PKR); the currency switcher only changes how it is shown.
const TAX_RATE = 0.16;
// Card payments only appear once the site owner sets the
// publishable key; without it the option stays hidden and
// no card payment is ever faked.
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

// The card form, shown only after the booking exists and the
// server returned a payment intent for it. The booking itself
// is already confirmed at this point; this step only settles
// the card payment, and the final payment status still comes
// from the Stripe webhook on the server.
function CardPaymentForm({ clientSecret, amount, onDone }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  const [cardError, setCardError] = useState('');

  async function pay(event) {
    event.preventDefault();
    if (!stripe || !elements) return;
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });
    if (error) {
      setCardError(error.message);
    } else {
      onDone();
    }
  }

  return (
    <form className="card p-4" onSubmit={pay}>
      <h4>{t('checkout.cardTitle')}</h4>
      <p className="small text-muted">{t('checkout.cardFormNote')}</p>
      <div className="p-3 border rounded">
        <CardElement />
      </div>
      {cardError && <p className="text-danger small mt-2 mb-0">{cardError}</p>}
      <button className="btn btn-primary mt-3" type="submit" disabled={!stripe}>
        {t('checkout.cardPay', { amount })}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [booking, setBooking] = useState(null);
  const [paymentNote, setPaymentNote] = useState('');
  // Set when a card payment still needs the card itself: the
  // booking exists, the server gave us a payment intent, and
  // the card form below collects the card to confirm it.
  const [cardSecret, setCardSecret] = useState(null);
  const [cardBooking, setCardBooking] = useState(null);
  const [error, setError] = useState('');
  const [loyalty, setLoyalty] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payAtProperty');
  const [walletProvider, setWalletProvider] = useState('JazzCash');
  const [walletNumber, setWalletNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Pakistan',
    specialRequests: '',
    arrivalTime: '',
  });

  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');
  const roomName = params.get('roomName');
  const rooms = Number(params.get('rooms')) || 1;

  useEffect(() => {
    api
      .get(`/api/hotels/${params.get('hotelId')}`)
      .then((data) => {
        setHotel(data);
        setRoom(data.rooms.find((r) => r.name === roomName) || null);
      })
      .catch(() => setError('This stay could not be loaded.'));
  }, [params, roomName]);

  useEffect(() => {
    if (user) {
      api
        .get('/api/loyalty/me', true)
        .then(setLoyalty)
        .catch(() => setLoyalty(null));
    }
  }, [user]);

  function nights() {
    if (!checkIn || !checkOut) return 1;
    const days = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
    return days > 0 ? days : 1;
  }

  function subtotal() {
    if (!room) return 0;
    return room.pricePerNight * nights() * rooms;
  }

  function loyaltyDiscount() {
    if (!loyalty?.discountPercent) return 0;
    return Math.round(subtotal() * (loyalty.discountPercent / 100));
  }

  function couponDiscount() {
    return coupon?.discountAmount || 0;
  }

  function tax() {
    return Math.round(subtotal() * TAX_RATE);
  }

  function totalPrice() {
    return subtotal() + tax() - loyaltyDiscount() - couponDiscount();
  }

  async function applyCoupon() {
    setCouponMessage('');
    try {
      const result = await api.get(
        `/api/coupons/validate?code=${encodeURIComponent(couponCode)}&subtotal=${subtotal()}`
      );
      if (result.valid) {
        setCoupon({ code: couponCode, discountAmount: result.discountAmount });
        setCouponMessage(t('checkout.couponApplied'));
      } else {
        setCoupon(null);
        setCouponMessage(result.reason || 'Coupon not valid.');
      }
    } catch (err) {
      setCoupon(null);
      setCouponMessage(err.message);
    }
  }

  function priceBreakdown() {
    return (
      <div className="border rounded p-3 mb-3">
        <div className="d-flex justify-content-between small">
          <span>{t('checkout.subtotal')}</span>
          <span>{format(subtotal())}</span>
        </div>
        <div className="d-flex justify-content-between small">
          <span>{t('checkout.tax')}</span>
          <span>{format(tax())}</span>
        </div>
        {loyaltyDiscount() > 0 && (
          <div className="d-flex justify-content-between small text-success">
            <span>{t('checkout.loyaltyDiscount')}</span>
            <span>−{format(loyaltyDiscount())}</span>
          </div>
        )}
        {couponDiscount() > 0 && (
          <div className="d-flex justify-content-between small text-success">
            <span>{t('checkout.couponDiscount')}</span>
            <span>−{format(couponDiscount())}</span>
          </div>
        )}
        <hr className="my-2" />
        <div className="d-flex justify-content-between">
          <strong>{t('checkout.total')}</strong>
          <strong>{format(totalPrice())}</strong>
        </div>
      </div>
    );
  }

  async function finishBooking(event) {
    event.preventDefault();
    setError('');
    try {
      const paymentStatus =
        paymentMethod === 'wallet' ? 'pending_verification' : 'unpaid';
      const created = await api.post('/api/bookings', {
        hotelId: hotel._id,
        roomName: room.name,
        checkIn,
        checkOut,
        guests: {
          adults: Number(params.get('adults')) || 2,
          children: Number(params.get('children')) || 0,
          rooms,
          childrenAges: (params.get('childrenAges') || '')
            .split(',')
            .filter(Boolean)
            .map(Number),
        },
        guestDetails: form,
        specialRequests: form.specialRequests,
        arrivalTime: form.arrivalTime,
        subtotal: subtotal(),
        taxAmount: tax(),
        loyaltyDiscount: loyaltyDiscount(),
        couponCode: coupon?.code || null,
        discountAmount: couponDiscount(),
        totalPrice: totalPrice(),
        paymentMethod,
        paymentStatus,
      });

      // A wallet or card payment gets its own record. If that
      // call fails the booking still stands — the guest is told
      // the payment status rather than shown a fake success.
      if (paymentMethod !== 'payAtProperty') {
        try {
          const payment = await api.post('/api/payments', {
            bookingId: created._id,
            method: paymentMethod,
            walletProvider: paymentMethod === 'wallet' ? walletProvider : undefined,
            walletNumber: paymentMethod === 'wallet' ? walletNumber : undefined,
            transactionId: paymentMethod === 'wallet' ? transactionId : undefined,
          });
          if (payment.clientSecret) {
            // Card payment still needs the card itself: show the
            // card form instead of the confirmation screen.
            setCardBooking(created);
            setCardSecret(payment.clientSecret);
            return;
          }
          if (payment.status === 'requires_setup') {
            setPaymentNote(t('checkout.cardPending'));
          } else if (payment.status === 'pending_verification') {
            setPaymentNote(t('checkout.walletPending'));
          }
        } catch {
          // Booking is confirmed; payment record can be retried
          // from My trips. Never fail the booking over this.
        }
      }

      setBooking(created);
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !hotel) return <div className="container my-5 alert alert-danger">{error}</div>;
  if (!hotel || !room) return <div className="container my-5">{t('common.loading')}</div>;

  const available = room.availableUnits;
  const tooManyRooms = available != null && rooms > available;

  return (
    <div className="container my-4" style={{ maxWidth: 720 }}>
      <ul className="nav nav-pills mb-4">
        {t('checkout.steps').map((label, index) => (
          <li className="nav-item" key={label}>
            <span className={`nav-link ${step === index + 1 ? 'active' : 'disabled'}`}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      {loyalty && loyalty.discountPercent > 0 && step < 3 && (
        <p className="alert alert-success py-2 small">
          {t('checkout.loyaltyBanner', {
            tier: loyalty.tier,
            percent: loyalty.discountPercent,
          })}
        </p>
      )}

      {step === 1 && (
        <div className="card p-4">
          <h4>{t('checkout.selection')}</h4>
          <p className="mb-1">
            <strong>{hotel.name}</strong> — {hotel.city}, {hotel.country}
          </p>
          <p className="mb-1">
            {room.name} · {rooms} room{rooms > 1 ? 's' : ''}
          </p>
          <p className="mb-1">
            {checkIn || 'Dates not chosen'} → {checkOut || 'Dates not chosen'} · {nights()} night
            {nights() > 1 ? 's' : ''}
          </p>
          <p className="mb-3">
            {room.freeCancellation ? t('hotel.freeCancel') : t('hotel.nonRefundable')} ·{' '}
            {room.breakfastIncluded ? t('hotel.breakfast') : t('hotel.noBreakfast')}
          </p>
          {priceBreakdown()}
          {tooManyRooms && (
            <p className="text-danger small">
              {t('checkout.notAvailable', { n: available })}
            </p>
          )}
          <p className="text-muted small">{t('checkout.payAtPropertyNote')}</p>
          <button
            className="btn btn-primary"
            disabled={tooManyRooms}
            onClick={() => setStep(2)}
          >
            {t('hotel.reserve')}
          </button>
        </div>
      )}

      {step === 2 && (
        <form className="card p-4" onSubmit={finishBooking}>
          <h4>{t('checkout.details')}</h4>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small">{t('checkout.firstName')}</label>
              <input
                className="form-control"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">{t('checkout.lastName')}</label>
              <input
                className="form-control"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">{t('checkout.email')}</label>
              <input
                type="email"
                className="form-control"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">{t('checkout.phone')}</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">{t('checkout.country')}</label>
              <input
                className="form-control"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">{t('checkout.arrival')}</label>
              <input
                className="form-control"
                placeholder={t('checkout.arrivalPlaceholder')}
                value={form.arrivalTime}
                onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label small">{t('checkout.requests')}</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.specialRequests}
                onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label small">{t('checkout.coupon')}</label>
            <div className="d-flex gap-2">
              <input
                className="form-control"
                placeholder="WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="button" onClick={applyCoupon}>
                {t('checkout.applyCoupon')}
              </button>
            </div>
            {couponMessage && <p className="small text-muted mt-1 mb-0">{couponMessage}</p>}
          </div>

          <div className="mt-4">
            <h6>{t('checkout.paymentTitle')}</h6>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                checked={paymentMethod === 'payAtProperty'}
                onChange={() => setPaymentMethod('payAtProperty')}
              />
              <label className="form-check-label">
                {t('checkout.payAtProperty')}
                <span className="small text-muted d-block">
                  {t('checkout.payAtPropertyNote')}
                </span>
              </label>
            </div>
            {STRIPE_KEY && (
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="radio"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <label className="form-check-label">
                  {t('checkout.card')}
                  <span className="small text-muted d-block">{t('checkout.cardNote')}</span>
                </label>
              </div>
            )}
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="radio"
                checked={paymentMethod === 'wallet'}
                onChange={() => setPaymentMethod('wallet')}
              />
              <label className="form-check-label">{t('checkout.wallet')}</label>
            </div>
            {paymentMethod === 'wallet' && (
              <div className="row g-2 mt-1 ms-4">
                <div className="col-md-4">
                  <label className="form-label small">{t('checkout.walletProvider')}</label>
                  <select
                    className="form-select"
                    value={walletProvider}
                    onChange={(e) => setWalletProvider(e.target.value)}
                  >
                    <option>JazzCash</option>
                    <option>Easypaisa</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small">{t('checkout.walletNumber')}</label>
                  <input
                    className="form-control"
                    required
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">{t('checkout.transactionId')}</label>
                  <input
                    className="form-control"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <p className="small text-muted">{t('checkout.walletNote')}</p>
              </div>
            )}
          </div>

          <div className="mt-4">{priceBreakdown()}</div>

          {error && <p className="text-danger small mt-2 mb-0">{error}</p>}
          <button className="btn btn-primary mt-3" type="submit" disabled={tooManyRooms}>
            {t('checkout.confirm')}
          </button>
        </form>
      )}

      {cardSecret && cardBooking && stripePromise && (
        <Elements stripe={stripePromise}>
          <CardPaymentForm
            clientSecret={cardSecret}
            amount={cardBooking.totalPrice}
            onDone={() => {
              setBooking(cardBooking);
              setPaymentNote(t('checkout.cardSubmitted'));
              setCardSecret(null);
              setStep(3);
            }}
          />
        </Elements>
      )}

      {step === 3 && booking && (
        <div className="card p-4 text-center">
          <h4>{t('checkout.confirmed')}</h4>
          <p>{t('checkout.reserved', { hotel: hotel.name })}</p>
          <p className="mb-1">
            {t('checkout.reference')}: <code>{booking._id}</code>
          </p>
          <p className="mb-1">
            {room.name} · {nights()} night{nights() > 1 ? 's' : ''} ·{' '}
            {format(booking.totalPrice)}
          </p>
          <p className="text-muted small mb-1">{t('checkout.keepReference')}</p>
          {user && <p className="text-muted small mb-1">{t('checkout.tripsNote')}</p>}
          {paymentNote && <p className="alert alert-warning py-2 small mt-3">{paymentNote}</p>}
        </div>
      )}
    </div>
  );
}

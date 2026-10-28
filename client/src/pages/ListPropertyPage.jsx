import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';

// "List your property": a signed-in guest can add their own stay.
// It appears in search results like any other hotel. The form
// covers what a hotel page actually shows, so a listing does
// not arrive half-empty: rooms, house rules, photos, and the
// amenities guests filter on.
const AMENITY_CHOICES = [
  'Free WiFi',
  'Swimming pool',
  'Restaurant',
  'Free parking',
  'Family rooms',
  'Fitness center',
  'Airport shuttle',
  'Spa and wellness center',
  'Room service',
  'Tea/Coffee maker',
];
const BED_CHOICES = ['Single bed', 'Double bed', 'Queen bed', 'King bed', 'Twin beds', 'Bunk bed'];

function emptyRoom() {
  return {
    name: '',
    sizeSqm: 24,
    bedType: 'Double bed',
    maxGuests: 2,
    pricePerNight: '',
    breakfastIncluded: false,
    freeCancellation: true,
    totalUnits: 1,
  };
}

export default function ListPropertyPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [createdId, setCreatedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    type: 'Hotel',
    starRating: 3,
    pricePerNight: '',
    originalPrice: '',
    description: '',
    lat: '',
    lng: '',
    hostNote: '',
  });
  const [amenities, setAmenities] = useState([]);
  const [rules, setRules] = useState({
    checkIn: '3:00 PM',
    checkOut: '11:00 AM',
    minCheckInAge: 18,
    quietHours: '10:00 PM - 7:00 AM',
    petsAllowed: false,
    smokingAllowed: false,
  });
  const [rooms, setRooms] = useState([emptyRoom()]);
  const [images, setImages] = useState(['']);

  function set(key, value) {
    setForm({ ...form, [key]: value });
  }

  function toggleAmenity(amenity) {
    setAmenities(
      amenities.includes(amenity)
        ? amenities.filter((a) => a !== amenity)
        : [...amenities, amenity]
    );
  }

  function setRoom(index, key, value) {
    setRooms(rooms.map((room, i) => (i === index ? { ...room, [key]: value } : room)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setCreatedId(null);
    try {
      const created = await api.post(
        '/api/hotels',
        {
          ...form,
          starRating: Number(form.starRating),
          pricePerNight: Number(form.pricePerNight),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          lat: form.lat ? Number(form.lat) : undefined,
          lng: form.lng ? Number(form.lng) : undefined,
          amenities,
          houseRules: {
            ...rules,
            minCheckInAge: Number(rules.minCheckInAge),
          },
          rooms: rooms.map((room) => ({
            ...room,
            sizeSqm: Number(room.sizeSqm),
            maxGuests: Number(room.maxGuests),
            pricePerNight: Number(room.pricePerNight),
            totalUnits: Number(room.totalUnits),
          })),
          images: images.map((url) => url.trim()).filter(Boolean),
        },
        true
      );
      setCreatedId(created._id);
      setMessage(t('listProperty.live'));
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!user) {
    return (
      <div className="container my-5">
        <p>
          {t('listProperty.signInPrompt')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: 720 }}>
      <h3>{t('listProperty.title')}</h3>
      <form onSubmit={handleSubmit}>
        <label className="form-label small">{t('listProperty.name')}</label>
        <input
          className="form-control mb-3"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <div className="row">
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.city')}</label>
            <input
              className="form-control mb-3"
              required
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.address')}</label>
            <input
              className="form-control mb-3"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.type')}</label>
            <select
              className="form-select mb-3"
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
            >
              <option>Hotel</option>
              <option>Apartment</option>
              <option>Resort</option>
              <option>Villa</option>
              <option>Hostel</option>
              <option>Lodge</option>
              <option>Guest House</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.stars')}</label>
            <select
              className="form-select mb-3"
              value={form.starRating}
              onChange={(e) => set('starRating', e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.price')}</label>
            <input
              type="number"
              className="form-control mb-3"
              required
              value={form.pricePerNight}
              onChange={(e) => set('pricePerNight', e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.originalPrice')}</label>
            <input
              type="number"
              className="form-control mb-3"
              value={form.originalPrice}
              onChange={(e) => set('originalPrice', e.target.value)}
            />
          </div>
        </div>
        <label className="form-label small">{t('listProperty.description')}</label>
        <textarea
          className="form-control mb-3"
          rows="3"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <label className="form-label small">{t('listProperty.hostNote')}</label>
        <textarea
          className="form-control mb-3"
          rows="2"
          placeholder="e.g. Breakfast is served on the roof from 7 to 10."
          value={form.hostNote}
          onChange={(e) => set('hostNote', e.target.value)}
        />

        <h6 className="mt-4">{t('listProperty.amenities')}</h6>
        <div className="row mb-3">
          {AMENITY_CHOICES.map((amenity) => (
            <div className="col-md-4" key={amenity}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <label className="form-check-label small">{amenity}</label>
              </div>
            </div>
          ))}
        </div>

        <h6 className="mt-4">{t('listProperty.rooms')}</h6>
        {rooms.map((room, index) => (
          <div className="card p-3 mb-3" key={index}>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label small">{t('listProperty.roomName')}</label>
                <input
                  className="form-control"
                  required
                  value={room.name}
                  onChange={(e) => setRoom(index, 'name', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">{t('listProperty.size')}</label>
                <input
                  type="number"
                  className="form-control"
                  value={room.sizeSqm}
                  onChange={(e) => setRoom(index, 'sizeSqm', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">{t('listProperty.maxGuests')}</label>
                <input
                  type="number"
                  className="form-control"
                  value={room.maxGuests}
                  onChange={(e) => setRoom(index, 'maxGuests', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">{t('listProperty.bed')}</label>
                <select
                  className="form-select"
                  value={room.bedType}
                  onChange={(e) => setRoom(index, 'bedType', e.target.value)}
                >
                  {BED_CHOICES.map((bed) => (
                    <option key={bed}>{bed}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">{t('listProperty.roomPrice')}</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  value={room.pricePerNight}
                  onChange={(e) => setRoom(index, 'pricePerNight', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">{t('listProperty.totalUnits')}</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={room.totalUnits}
                  onChange={(e) => setRoom(index, 'totalUnits', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={room.breakfastIncluded}
                    onChange={(e) => setRoom(index, 'breakfastIncluded', e.target.checked)}
                  />
                  <label className="form-check-label small">{t('listProperty.breakfast')}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={room.freeCancellation}
                    onChange={(e) => setRoom(index, 'freeCancellation', e.target.checked)}
                  />
                  <label className="form-check-label small">{t('listProperty.freeCancel')}</label>
                </div>
              </div>
            </div>
            {rooms.length > 1 && (
              <button
                className="btn btn-link btn-sm text-danger p-0 mt-2"
                type="button"
                onClick={() => setRooms(rooms.filter((_, i) => i !== index))}
              >
                {t('listProperty.removeRoom')}
              </button>
            )}
          </div>
        ))}
        <button
          className="btn btn-outline-secondary btn-sm mb-4"
          type="button"
          onClick={() => setRooms([...rooms, emptyRoom()])}
        >
          {t('listProperty.addRoom')}
        </button>

        <h6>{t('listProperty.houseRules')}</h6>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.checkIn')}</label>
            <input
              className="form-control mb-3"
              value={rules.checkIn}
              onChange={(e) => setRules({ ...rules, checkIn: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.checkOut')}</label>
            <input
              className="form-control mb-3"
              value={rules.checkOut}
              onChange={(e) => setRules({ ...rules, checkOut: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.minAge')}</label>
            <input
              type="number"
              className="form-control mb-3"
              value={rules.minCheckInAge}
              onChange={(e) => setRules({ ...rules, minCheckInAge: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.quietHours')}</label>
            <input
              className="form-control mb-3"
              value={rules.quietHours}
              onChange={(e) => setRules({ ...rules, quietHours: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={rules.petsAllowed}
                onChange={(e) => setRules({ ...rules, petsAllowed: e.target.checked })}
              />
              <label className="form-check-label small">{t('listProperty.pets')}</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={rules.smokingAllowed}
                onChange={(e) => setRules({ ...rules, smokingAllowed: e.target.checked })}
              />
              <label className="form-check-label small">{t('listProperty.smoking')}</label>
            </div>
          </div>
        </div>

        <h6>{t('listProperty.images')}</h6>
        {images.map((url, index) => (
          <input
            key={index}
            className="form-control mb-2"
            placeholder="https://…"
            value={url}
            onChange={(e) =>
              setImages(images.map((old, i) => (i === index ? e.target.value : old)))
            }
          />
        ))}
        {images.length < 4 && (
          <button
            className="btn btn-outline-secondary btn-sm mb-3"
            type="button"
            onClick={() => setImages([...images, ''])}
          >
            Add another photo URL
          </button>
        )}

        <div className="row">
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.lat')}</label>
            <input
              className="form-control mb-3"
              value={form.lat}
              onChange={(e) => set('lat', e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">{t('listProperty.lng')}</label>
            <input
              className="form-control mb-3"
              value={form.lng}
              onChange={(e) => set('lng', e.target.value)}
            />
          </div>
        </div>

        {message && <p className="small text-muted">{message}</p>}
        {createdId && (
          <p>
            <Link to={`/hotel/${createdId}`}>{t('listProperty.viewIt')}</Link>
          </p>
        )}
        <button className="btn btn-primary" type="submit">
          {t('listProperty.submit')}
        </button>
      </form>
    </div>
  );
}

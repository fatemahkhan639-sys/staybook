import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../i18n';

// A host's own listings, with edit and delete. The list is
// filtered client-side from the search endpoint: the admin
// list endpoint is admin-only, and a host is not an admin.
export default function MyListingsPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  function load() {
    if (!user) return;
    api
      .get('/api/hotels?limit=100')
      .then((data) => {
        const mine = (data.hotels || []).filter((hotel) => {
          const owner = hotel.listedBy?._id || hotel.listedBy;
          return owner && String(owner) === String(user._id);
        });
        setListings(mine);
      })
      .catch(() => setListings([]));
  }

  useEffect(load, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function remove(id) {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.del(`/api/hotels/${id}`, true);
      setListings(listings.filter((hotel) => hotel._id !== id));
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveEdit(event) {
    event.preventDefault();
    try {
      const updated = await api.patch(
        `/api/hotels/${editing._id}`,
        {
          name: editing.name,
          pricePerNight: Number(editing.pricePerNight),
          description: editing.description,
        },
        true
      );
      setListings(listings.map((hotel) => (hotel._id === updated._id ? updated : hotel)));
      setEditing(null);
      setMessage(t('listProperty.saved'));
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
    <div className="container my-4">
      <h3>{t('listProperty.myListings')}</h3>
      {message && <p className="small text-muted">{message}</p>}
      {listings.length === 0 && <p className="text-muted">{t('listProperty.noListings')}</p>}

      {listings.map((hotel) => (
        <div className="card p-3 mb-3" key={hotel._id}>
          {editing?._id === hotel._id ? (
            <form onSubmit={saveEdit}>
              <input
                className="form-control mb-2"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <input
                type="number"
                className="form-control mb-2"
                value={editing.pricePerNight}
                onChange={(e) => setEditing({ ...editing, pricePerNight: e.target.value })}
              />
              <textarea
                className="form-control mb-2"
                rows="2"
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <button className="btn btn-primary btn-sm me-2" type="submit">
                {t('listProperty.saved')}
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => setEditing(null)}
              >
                {t('common.back')}
              </button>
            </form>
          ) : (
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="mb-1">
                  <Link to={`/hotel/${hotel._id}`} className="text-decoration-none">
                    {hotel.name}
                  </Link>
                </h5>
                <p className="small text-muted mb-0">
                  {hotel.city} · {format(hotel.pricePerNight)} {t('common.perNight')}
                </p>
              </div>
              <div>
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => setEditing(hotel)}
                >
                  {t('listProperty.edit')}
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => remove(hotel._id)}
                >
                  {t('listProperty.delete')}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

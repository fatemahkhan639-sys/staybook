import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

// Wishlist lives on the server so it follows the guest between
// devices. The backend answers in one of two shapes (a bare
// array, or an object holding one), so both are handled here
// rather than trusting a single shape.
function normalize(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.wishlist || payload?.hotels || [];
  return rows.map((row) => row.hotel || row).filter(Boolean);
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);

  function refresh() {
    if (!user) {
      setHotels([]);
      return;
    }
    api
      .get('/api/wishlist', true)
      .then((data) => setHotels(normalize(data)))
      .catch(() => setHotels([]));
  }

  useEffect(refresh, [user]);

  const ids = new Set(hotels.map((h) => h._id));

  async function toggle(hotelId) {
    if (ids.has(hotelId)) {
      await api.del(`/api/wishlist/${hotelId}`, true);
    } else {
      await api.post('/api/wishlist', { hotelId }, true);
    }
    refresh();
  }

  return (
    <WishlistContext.Provider value={{ hotels, ids, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

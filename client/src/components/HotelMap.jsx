import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useLanguage } from '../i18n';

// Leaflet map for the hotel page, using the plain Leaflet API
// instead of a React wrapper — one less dependency for a map
// that only ever shows a single pin. OpenStreetMap tiles need
// no key, which is why they were picked over Google Maps.
// Vite rewrites the marker image URLs, so the default icon
// paths break unless they are set explicitly like this.
const pin = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function HotelMap({ lat, lng, name }) {
  const { t } = useLanguage();
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current || lat == null || lng == null) return undefined;
    const map = L.map(divRef.current).setView([lat, lng], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    L.marker([lat, lng], { icon: pin }).addTo(map).bindPopup(name).openPopup();
    // A soft circle reads as "somewhere around here" rather
    // than a precise doorstep, which is the honest claim for
    // host-supplied coordinates.
    L.circle([lat, lng], { radius: 500, color: '#0d6efd', fillOpacity: 0.1 }).addTo(map);
    return () => map.remove();
  }, [lat, lng, name]);

  if (lat == null || lng == null) return null;

  return (
    <div className="mb-4">
      <div ref={divRef} className="hotel-map rounded" />
      <p className="small text-muted mt-1">{t('hotel.mapNote')}</p>
    </div>
  );
}

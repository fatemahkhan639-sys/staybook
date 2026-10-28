import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './styles/main.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/index.jsx';
import { CurrencyProvider } from './context/CurrencyContext';
import { CompareProvider } from './context/CompareContext';
import { WishlistProvider } from './context/WishlistContext';

// Wishlist needs the signed-in user, so AuthProvider stays
// outermost; the rest only read localStorage on first render.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <CompareProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </CompareProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HotelPage from './pages/HotelPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ListPropertyPage from './pages/ListPropertyPage';
import DealsPage from './pages/DealsPage';
import DestinationsPage from './pages/DestinationsPage';
import HelpPage from './pages/HelpPage';

// Route map — one route per page of the site.
export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/hotel/:id" element={<HotelPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/list-property" element={<ListPropertyPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<div className="container my-5">Page not found.</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

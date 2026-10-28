import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container my-5" style={{ maxWidth: 420 }}>
      <h3>Sign in</h3>
      <p className="text-muted small">Demo account: demo@staybook.local / demo1234</p>
      <form onSubmit={handleSubmit}>
        <label className="form-label small">Email address</label>
        <input
          type="email"
          className="form-control mb-3"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="form-label small">Password</label>
        <input
          type="password"
          className="form-control mb-3"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-danger small">{error}</p>}
        <button className="btn btn-primary w-100" type="submit">
          Continue with email
        </button>
      </form>
      <p className="small mt-3">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

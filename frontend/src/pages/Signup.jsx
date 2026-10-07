// pages/Signup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-logo">💪</div>
        <h1>FitnessTracker</h1>
        <p>Log your walks, water, and sleep — see your week at a glance.</p>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Start tracking in under a minute.</p>

          {error && <div className="form-error">{error}</div>}

          <label>
            Name
            <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign up'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
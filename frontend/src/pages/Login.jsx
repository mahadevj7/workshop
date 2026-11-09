import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, UserCheck, Users, AlertCircle, ArrowRight } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed. Make sure backend is running and database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <div className="login-brand-icon">
            <GraduationCap size={36} />
          </div>
          <h1 className="login-title">EduPortal Classroom</h1>
          <p className="login-subtitle">Unified School Management for Teachers, Students & Parents</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. teacher@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>

          <div className="login-register-prompt">
            <span>New Faculty Member? </span>
            <NavLink to="/register" className="register-now-link">Register Teacher Account</NavLink>
          </div>
        </form>

        <div className="demo-accounts-box">
          <p className="demo-title">⚡ Instant Demo Login (Click to Sign In)</p>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="demo-btn demo-teacher"
              onClick={() => handleDemoFill('teacher@school.edu', 'password123')}
            >
              <ShieldCheck size={18} />
              <div className="demo-btn-text">
                <span className="demo-role">Teacher Portal</span>
                <span className="demo-email">teacher@school.edu</span>
              </div>
            </button>

            <button
              type="button"
              className="demo-btn demo-student"
              onClick={() => handleDemoFill('student@school.edu', 'password123')}
            >
              <UserCheck size={18} />
              <div className="demo-btn-text">
                <span className="demo-role">Student Portal</span>
                <span className="demo-email">student@school.edu</span>
              </div>
            </button>

            <button
              type="button"
              className="demo-btn demo-parent"
              onClick={() => handleDemoFill('parent@school.edu', 'password123')}
            >
              <Users size={18} />
              <div className="demo-btn-text">
                <span className="demo-role">Parent Portal</span>
                <span className="demo-email">parent@school.edu</span>
              </div>
            </button>
          </div>
          <p className="demo-hint">Default password for all demo accounts: <code>password123</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;


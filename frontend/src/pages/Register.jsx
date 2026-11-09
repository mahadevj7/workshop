import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { GraduationCap, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../styles/Register.css';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Mathematics',
    designation: 'Senior Faculty & Coordinator',
    phone: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest('/auth/register', 'POST', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'teacher',
        department: form.department,
        designation: form.designation,
        phone: form.phone
      });

      if (res.success) {
        setSuccess('Teacher account registered successfully! Logging you in...');
        // Automatically login the teacher
        setTimeout(async () => {
          try {
            await login(form.email, form.password);
            navigate('/dashboard');
          } catch (loginErr) {
            navigate('/login');
          }
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <div className="register-header">
          <div className="register-brand-icon">
            <GraduationCap size={36} />
          </div>
          <h1 className="register-title">Teacher Registration</h1>
          <p className="register-subtitle">Create a verified educator account to manage classes, attendance, and students</p>
        </div>

        {error && (
          <div className="register-alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="register-alert alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Prof. Alan Turing"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Official Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              required
              placeholder="e.g. turing@school.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="department">Academic Department</label>
              <input
                id="department"
                type="text"
                className="form-input"
                placeholder="e.g. Mathematics & Physics"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="designation">Designation / Title</label>
              <input
                id="designation"
                type="text"
                className="form-input"
                placeholder="e.g. Senior Lecturer"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number (Optional)</label>
            <input
              id="phone"
              type="tel"
              className="form-input"
              placeholder="+1-555-0199"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                required
                minLength={6}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                required
                minLength={6}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="role-confirmation-pill">
            <ShieldCheck size={16} />
            <span>Account Role: <strong>Faculty / Teacher</strong></span>
          </div>

          <button type="submit" className="btn btn-primary register-submit-btn" disabled={loading}>
            {loading ? 'Creating Faculty Account...' : 'Complete Teacher Registration'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <NavLink to="/login" className="register-link">Sign In here</NavLink></p>
        </div>
      </div>
    </div>
  );
};

export default Register;


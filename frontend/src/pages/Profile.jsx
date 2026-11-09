import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { User, Mail, Phone, ShieldCheck, KeyRound, Save, GraduationCap, Users, Hash } from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
  const { user, login } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    designation: user?.designation || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        designation: user.designation || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone
      };

      if (user.role === 'teacher') {
        payload.department = profileForm.department;
        payload.designation = profileForm.designation;
      }

      if (passwordForm.newPassword) {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (!passwordForm.currentPassword) {
          throw new Error('Please enter current password to set a new password');
        }
        payload.currentPassword = passwordForm.currentPassword;
        payload.newPassword = passwordForm.newPassword;
      }

      const res = await apiRequest('/auth/profile', 'PUT', payload);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Profile details updated successfully!' });
        // Update stored user
        localStorage.setItem('user', JSON.stringify(res.data));
        // Reset password fields
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Reload after 1 sec to refresh global navbar
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account Profile</h1>
          <p className="page-subtitle">Manage your personal credentials, contact details, and role specifications</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="profile-grid">
        {/* LEFT COLUMN: IDENTITY SUMMARY */}
        <div className="profile-summary-card">
          <div className="profile-avatar-circle">
            <User size={48} />
          </div>
          <h2 className="profile-user-name">{user?.name}</h2>
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          <p className="profile-email-text">{user?.email}</p>

          <div className="profile-info-divider"></div>

          <div className="profile-details-list">
            <div className="profile-detail-row">
              <Mail size={16} className="detail-icon" />
              <div>
                <span className="detail-label">Email Address</span>
                <span className="detail-val">{user?.email}</span>
              </div>
            </div>

            <div className="profile-detail-row">
              <Phone size={16} className="detail-icon" />
              <div>
                <span className="detail-label">Phone</span>
                <span className="detail-val">{user?.phone || 'Not configured'}</span>
              </div>
            </div>

            {/* TEACHER METADATA */}
            {user?.role === 'teacher' && (
              <>
                <div className="profile-detail-row">
                  <GraduationCap size={16} className="detail-icon" />
                  <div>
                    <span className="detail-label">Department</span>
                    <span className="detail-val">{user?.department || 'General Education'}</span>
                  </div>
                </div>
                <div className="profile-detail-row">
                  <ShieldCheck size={16} className="detail-icon" />
                  <div>
                    <span className="detail-label">Designation</span>
                    <span className="detail-val">{user?.designation || 'Teacher'}</span>
                  </div>
                </div>
              </>
            )}

            {/* STUDENT METADATA */}
            {user?.role === 'student' && (
              <>
                <div className="profile-detail-row">
                  <Hash size={16} className="detail-icon" />
                  <div>
                    <span className="detail-label">Roll Number</span>
                    <span className="detail-val">{user?.rollNumber || 'CS-101'}</span>
                  </div>
                </div>
                <div className="profile-detail-row">
                  <Users size={16} className="detail-icon" />
                  <div>
                    <span className="detail-label">Class</span>
                    <span className="detail-val">{user?.gradeClass || 'Class 10-A'}</span>
                  </div>
                </div>
                {user?.parentRef && (
                  <div className="profile-detail-row">
                    <Users size={16} className="detail-icon" />
                    <div>
                      <span className="detail-label">Linked Parent</span>
                      <span className="detail-val">{user.parentRef.name} ({user.parentRef.email})</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PARENT METADATA */}
            {user?.role === 'parent' && (
              <div className="profile-detail-row">
                <Users size={16} className="detail-icon" />
                <div>
                  <span className="detail-label">Associated Student</span>
                  <span className="detail-val">
                    {user?.studentRef ? `${user.studentRef.name} (${user.studentRef.rollNumber || 'Roll N/A'})` : 'No child linked yet'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PROFILE FORM */}
        <div className="profile-edit-card card">
          <h2 className="card-title">Edit Profile Information</h2>
          <p className="card-subtitle-desc">Update your display name, contact phone, and security credentials</p>

          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Email</label>
              <input
                type="email"
                className="form-input"
                disabled
                value={user?.email || ''}
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
              <span className="form-help-text">Email address is managed by the system administrator.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 555-0100"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            {/* TEACHER-SPECIFIC EDITABLE FIELDS */}
            {user?.role === 'teacher' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="profile-password-section">
              <div className="section-header-row">
                <KeyRound size={18} className="key-icon" />
                <h3 className="section-heading">Change Password (Leave blank to keep current)</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    minLength={6}
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    minLength={6}
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary profile-save-btn" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;


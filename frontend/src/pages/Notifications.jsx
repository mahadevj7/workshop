import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { Bell, Plus, AlertCircle, Trash2, Calendar, UserCheck } from 'lucide-react';
import '../styles/Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'normal'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/notifications', 'POST', form);
      setStatusMsg({ type: 'success', text: 'Announcement published successfully!' });
      setIsCreateOpen(false);
      setForm({ title: '', content: '', targetAudience: 'all', priority: 'normal' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await apiRequest(`/notifications/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: 'Announcement removed' });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="notifs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notice Board & Announcements</h1>
          <p className="page-subtitle">Official notifications, circulars, and departmental updates</p>
        </div>
        {user.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="notifs-grid">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Announcements Posted</h3>
            <p className="empty-state-desc">New notices and circulars will appear here as soon as they are published.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className={`notice-card priority-${n.priority}`}>
              <div className="notice-card-header">
                <div className="notice-tags">
                  <span className={`priority-badge badge-prio-${n.priority}`}>
                    {n.priority.toUpperCase()}
                  </span>
                  <span className="badge badge-neutral">Audience: {n.targetAudience}</span>
                </div>
                {user.role === 'teacher' && (
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDelete(n._id)}
                    title="Delete Notice"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 className="notice-title">{n.title}</h3>
              <p className="notice-content">{n.content}</p>

              <div className="notice-footer">
                <span className="notice-author">
                  <UserCheck size={14} /> {n.authorRef?.name || 'Faculty Office'}
                </span>
                <span className="notice-date">
                  <Calendar size={14} /> {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: POST NOTICE */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Announcement">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Notice Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Science Fair Registration Deadline"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              >
                <option value="all">Everyone (All)</option>
                <option value="students">Students Only</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Alert</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Content</label>
            <textarea
              className="form-textarea"
              rows="5"
              required
              placeholder="Enter full announcement details, guidelines, or notices..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Publish Notice
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Notifications;


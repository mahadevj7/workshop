import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { Users2, Plus, Calendar, Clock, MapPin, FileText, Trash2 } from 'lucide-react';
import '../styles/PTAMeetings.css';

const PTAMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    meetingDate: '',
    time: '10:00 AM',
    venue: 'School Auditorium / Google Meet',
    agenda: '',
    minutesOfMeeting: '',
    gradeClass: 'Class 10-A'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/pta');
      setMeetings(res.data || []);
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
      await apiRequest('/pta', 'POST', form);
      setStatusMsg({ type: 'success', text: 'PTA Conference scheduled successfully!' });
      setIsCreateOpen(false);
      setForm({ title: '', meetingDate: '', time: '10:00 AM', venue: 'School Auditorium / Google Meet', agenda: '', minutesOfMeeting: '', gradeClass: 'Class 10-A' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this PTA meeting announcement?')) {
      try {
        await apiRequest(`/pta/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: 'Meeting entry removed' });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="pta-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parent-Teacher Association (PTA)</h1>
          <p className="page-subtitle">Schedule conferences, publish meeting agendas, and review deliberations</p>
        </div>
        {user.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Schedule PTA Meeting
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="pta-grid">
        {meetings.length === 0 ? (
          <div className="empty-state">
            <Users2 size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No PTA Meetings Scheduled</h3>
            <p className="empty-state-desc">Upcoming parent-teacher conferences and agendas will be posted here.</p>
          </div>
        ) : (
          meetings.map((m) => (
            <div key={m._id} className="pta-card">
              <div className="pta-card-header">
                <span className="badge badge-info">{m.gradeClass || 'All Classes'}</span>
                {user.role === 'teacher' && (
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDelete(m._id)}
                    title="Delete Meeting"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 className="pta-card-title">{m.title}</h3>

              <div className="pta-logistics-box">
                <div className="pta-logistics-item">
                  <Calendar size={16} className="pta-icon" />
                  <span>Date: <strong>{new Date(m.meetingDate).toLocaleDateString()}</strong></span>
                </div>
                <div className="pta-logistics-item">
                  <Clock size={16} className="pta-icon" />
                  <span>Time: <strong>{m.time}</strong></span>
                </div>
                <div className="pta-logistics-item">
                  <MapPin size={16} className="pta-icon" />
                  <span>Venue: <strong>{m.venue}</strong></span>
                </div>
              </div>

              <div className="pta-section">
                <h4 className="pta-section-heading">
                  <FileText size={15} /> Agenda & Discussion Points
                </h4>
                <p className="pta-agenda-text">{m.agenda}</p>
              </div>

              {m.minutesOfMeeting && (
                <div className="pta-section minutes-section">
                  <h4 className="pta-section-heading">Meeting Minutes / Resolutions</h4>
                  <p className="pta-minutes-text">{m.minutesOfMeeting}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: SCHEDULE PTA MEETING */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Schedule Parent-Teacher Conference">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Meeting Title / Purpose</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Q2 Academic Progress Evaluation & Exam Guidance"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={form.meetingDate}
                onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="10:00 AM - 12:00 PM"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Venue / Meeting Link</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auditorium Hall / Google Meet link"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <input
                type="text"
                className="form-input"
                value={form.gradeClass}
                onChange={(e) => setForm({ ...form, gradeClass: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Agenda</label>
            <textarea
              className="form-textarea"
              rows="4"
              required
              placeholder="1. Review of internal test scores&#10;2. Attendance tracking discussion&#10;3. Upcoming annual sports meet..."
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Schedule Conference
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PTAMeetings;


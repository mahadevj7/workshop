import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { Clock, Plus, MapPin, GraduationCap, Trash2 } from 'lucide-react';
import '../styles/Timetable.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const Timetable = () => {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState('Monday');
  const [slots, setSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    day: 'Monday',
    timeSlot: '09:00 AM - 10:00 AM',
    subjectRef: '',
    teacherRef: '',
    room: 'Room 201',
    gradeClass: 'Class 10-A'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ttRes, subRes] = await Promise.all([
        apiRequest('/timetable'),
        apiRequest('/subjects')
      ]);

      const ttData = ttRes.data || [];
      const subData = subRes.data || [];
      setSlots(ttData);
      setSubjects(subData);

      if (subData.length > 0) {
        setForm(prev => ({
          ...prev,
          subjectRef: subData[0]._id,
          teacherRef: subData[0].teacherRef?._id || ''
        }));
      }

      if (user.role === 'teacher') {
        const tRes = await apiRequest('/users/teachers');
        setTeachers(tRes.data || []);
      }
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

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/timetable', 'POST', form);
      setStatusMsg({ type: 'success', text: 'Timetable lecture slot added successfully!' });
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Remove this lecture slot from the timetable?')) {
      try {
        await apiRequest(`/timetable/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: 'Lecture slot removed' });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  const daySlots = slots.filter(s => s.day === activeDay);

  return (
    <div className="timetable-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Class Timetable</h1>
          <p className="page-subtitle">Official lecture routine, assigned classrooms, and faculty schedules</p>
        </div>
        {user.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Add Lecture Slot
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      {/* DAY SELECTOR TABS */}
      <div className="day-tabs-bar">
        {DAYS.map((day) => (
          <button
            key={day}
            className={`day-tab-btn ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      {/* TIMETABLE SLOTS LIST */}
      <div className="timetable-slots-grid">
        {daySlots.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Lectures on {activeDay}</h3>
            <p className="empty-state-desc">No class sessions are scheduled for this day.</p>
          </div>
        ) : (
          daySlots.map((slot) => (
            <div key={slot._id} className="slot-card">
              <div className="slot-time-header">
                <Clock size={16} />
                <span>{slot.timeSlot}</span>
              </div>

              <div className="slot-body">
                <h3 className="slot-subject">{slot.subjectRef?.name || 'Class Subject'}</h3>
                <span className="slot-code">{slot.subjectRef?.code}</span>

                <div className="slot-meta-group">
                  <div className="slot-meta-item">
                    <GraduationCap size={15} />
                    <span>{slot.teacherRef?.name || 'Assigned Faculty'}</span>
                  </div>
                  <div className="slot-meta-item">
                    <MapPin size={15} />
                    <span>{slot.room}</span>
                  </div>
                </div>
              </div>

              {user.role === 'teacher' && (
                <div className="slot-actions">
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDeleteSlot(slot._id)}
                    title="Remove Slot"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD TIMETABLE SLOT */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Lecture Slot">
        <form onSubmit={handleAddSlot}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select
                className="form-select"
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. 09:00 AM - 10:00 AM"
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              required
              value={form.subjectRef}
              onChange={(e) => {
                const sub = subjects.find(s => s._id === e.target.value);
                setForm({
                  ...form,
                  subjectRef: e.target.value,
                  teacherRef: sub?.teacherRef?._id || form.teacherRef
                });
              }}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teacher</label>
              <select
                className="form-select"
                value={form.teacherRef}
                onChange={(e) => setForm({ ...form, teacherRef: e.target.value })}
              >
                <option value="">Default Faculty</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Room / Hall</label>
              <input
                type="text"
                className="form-input"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="Room 201"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Save Timetable Slot
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Timetable;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { MessageSquare, Plus, GraduationCap, Calendar, Trash2, Tag, ThumbsUp, AlertTriangle } from 'lucide-react';
import '../styles/Remarks.css';

const Remarks = () => {
  const { user } = useAuth();
  const [remarks, setRemarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    studentRef: '',
    category: 'Academic',
    type: 'Positive',
    remarkText: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      if (user.role === 'teacher') {
        const [remRes, studRes] = await Promise.all([
          apiRequest('/remarks/all'),
          apiRequest('/users/students')
        ]);
        setRemarks(remRes.data || []);
        const studs = studRes.data || [];
        setStudents(studs);
        if (studs.length > 0) setForm(prev => ({ ...prev, studentRef: studs[0]._id }));
      } else {
        let endpoint = '/remarks/my-remarks';
        if (user.role === 'parent') {
          const childId = user.studentRef?._id || user.studentRef;
          endpoint = childId ? `/remarks/student/${childId}` : '/remarks/my-remarks';
        }
        const res = await apiRequest(endpoint);
        setRemarks(res.data || []);
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
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/remarks', 'POST', form);
      setStatusMsg({ type: 'success', text: 'Student feedback and remark published successfully!' });
      setIsAddOpen(false);
      setForm({ studentRef: students[0]?._id || '', category: 'Academic', type: 'Positive', remarkText: '' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this teacher remark?')) {
      try {
        await apiRequest(`/remarks/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: 'Remark deleted' });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="remarks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Remarks & Qualitative Feedback</h1>
          <p className="page-subtitle">
            {user.role === 'teacher' && 'Document observations regarding academic development and classroom behavior'}
            {user.role === 'parent' && `Review teachers' observations, behavioral feedback, and commendations`}
            {user.role === 'student' && 'Read constructive feedback and commendations from your subject teachers'}
          </p>
        </div>
        {user.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Add Student Remark
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="remarks-list">
        {remarks.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Remarks Recorded Yet</h3>
            <p className="empty-state-desc">Teacher remarks and behavioral appraisals will appear here.</p>
          </div>
        ) : (
          remarks.map((r) => (
            <div key={r._id} className="remark-card">
              <div className="remark-card-top">
                <div className="remark-student-info">
                  <strong>{r.studentRef?.name}</strong>
                  {r.studentRef?.rollNumber && (
                    <span className="roll-badge">{r.studentRef.rollNumber}</span>
                  )}
                  <span className={`badge ${r.type === 'Positive' ? 'badge-success' : r.type === 'Needs Improvement' ? 'badge-warning' : 'badge-neutral'}`}>
                    {r.type}
                  </span>
                  <span className="badge badge-info">
                    <Tag size={12} /> {r.category}
                  </span>
                </div>

                <div className="remark-top-actions">
                  <span className="remark-date">
                    <Calendar size={14} /> {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  {user.role === 'teacher' && (
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(r._id)}
                      title="Delete Remark"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="remark-body-text">"{r.remarkText}"</p>

              <div className="remark-footer">
                <div className="remark-author-meta">
                  <GraduationCap size={16} className="author-icon" />
                  <span>By <strong>{r.teacherRef?.name || 'Faculty Member'}</strong> {r.teacherRef?.department && `(${r.teacherRef.department})`}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD REMARK */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Student Remark & Feedback">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <select
              className="form-select"
              required
              value={form.studentRef}
              onChange={(e) => setForm({ ...form, studentRef: e.target.value })}
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Academic">Academic Performance</option>
                <option value="Behavioral">Behavioral / Discipline</option>
                <option value="Achievement">Achievement / Commendation</option>
                <option value="Attendance">Attendance Consistency</option>
                <option value="General">General Classroom Feedback</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tone / Assessment</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Positive">Positive / Praiseworthy</option>
                <option value="Needs Improvement">Needs Improvement</option>
                <option value="Neutral">Neutral Note</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remark Details</label>
            <textarea
              className="form-textarea"
              rows="4"
              required
              placeholder="e.g. Shows exceptional dedication in practical programming assignments and assists peers."
              value={form.remarkText}
              onChange={(e) => setForm({ ...form, remarkText: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Publish Remark
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Remarks;


import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { BookOpen, Plus, UserCheck, Trash2, GraduationCap } from 'lucide-react';
import '../styles/SubjectManagement.css';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Forms
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    gradeClass: 'Class 10-A',
    teacherRef: ''
  });

  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [subRes, tRes] = await Promise.all([
        apiRequest('/subjects'),
        apiRequest('/users/teachers')
      ]);
      setSubjects(subRes.data || []);
      setTeachers(tRes.data || []);
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

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/subjects', 'POST', subjectForm);
      setStatusMsg({ type: 'success', text: 'Subject created successfully!' });
      setIsAddOpen(false);
      setSubjectForm({ name: '', code: '', description: '', gradeClass: 'Class 10-A', teacherRef: '' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const openAssignModal = (subject) => {
    setSelectedSubject(subject);
    setAssignTeacherId(subject.teacherRef?._id || '');
    setIsAssignOpen(true);
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/subjects/${selectedSubject._id}/assign`, 'PUT', { teacherId: assignTeacherId });
      setStatusMsg({ type: 'success', text: `Assigned faculty to ${selectedSubject.name}` });
      setIsAssignOpen(false);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (window.confirm(`Delete subject ${name}?`)) {
      try {
        await apiRequest(`/subjects/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: 'Subject deleted' });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="subjects-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subject & Faculty Management</h1>
          <p className="page-subtitle">Configure curriculum courses and assign specialized subject teachers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="subjects-grid">
        {subjects.map((sub) => (
          <div key={sub._id} className="subject-card">
            <div className="subject-card-top">
              <span className="subject-code-pill">{sub.code}</span>
              <span className="badge badge-info">{sub.gradeClass}</span>
            </div>

            <h3 className="subject-card-title">{sub.name}</h3>
            <p className="subject-card-desc">{sub.description || 'Core academic curriculum syllabus.'}</p>

            <div className="assigned-teacher-box">
              <GraduationCap size={18} className="teacher-icon" />
              <div className="teacher-meta">
                <span className="teacher-label">Assigned Teacher</span>
                <strong className="teacher-name">{sub.teacherRef ? sub.teacherRef.name : 'Unassigned'}</strong>
                {sub.teacherRef?.department && (
                  <span className="teacher-dept">{sub.teacherRef.department}</span>
                )}
              </div>
            </div>

            <div className="subject-card-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openAssignModal(sub)}
              >
                <UserCheck size={14} /> Assign Faculty
              </button>
              <button
                className="btn-icon btn-icon-danger"
                onClick={() => handleDeleteSubject(sub._id, sub.name)}
                title="Delete Subject"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE SUBJECT MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Subject">
        <form onSubmit={handleCreateSubject}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Chemistry"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="CHEM101"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Class</label>
              <input
                type="text"
                className="form-input"
                value={subjectForm.gradeClass}
                onChange={(e) => setSubjectForm({ ...subjectForm, gradeClass: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign Faculty Member</label>
            <select
              className="form-select"
              value={subjectForm.teacherRef}
              onChange={(e) => setSubjectForm({ ...subjectForm, teacherRef: e.target.value })}
            >
              <option value="">-- Choose Teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.name} ({t.department || 'General'})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description / Syllabus</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Key concepts covered in this course..."
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Save Subject
          </button>
        </form>
      </Modal>

      {/* ASSIGN TEACHER MODAL */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={`Assign Faculty to ${selectedSubject?.name}`}>
        <form onSubmit={handleAssignTeacher}>
          <div className="form-group">
            <label className="form-label">Select Teacher to Assign</label>
            <select
              className="form-select"
              required
              value={assignTeacherId}
              onChange={(e) => setAssignTeacherId(e.target.value)}
            >
              <option value="">-- Choose Teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} — {t.department || 'Faculty'} ({t.email})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Update Assigned Faculty
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectManagement;


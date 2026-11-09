import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { Users, UserPlus, Link as LinkIcon, Trash2, Mail, Phone, Hash, Search, GraduationCap, ShieldCheck } from 'lucide-react';
import '../styles/StudentManagement.css';

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  // Forms
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    rollNumber: '',
    phone: '',
    gradeClass: 'Class 10-A'
  });

  const [parentForm, setParentForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    studentRef: ''
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    department: 'General Education',
    designation: 'Subject Teacher',
    phone: ''
  });

  const [linkForm, setLinkForm] = useState({
    parentId: '',
    studentId: ''
  });

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes, tRes] = await Promise.all([
        apiRequest('/users/students'),
        apiRequest('/users/parents'),
        apiRequest('/users/teachers')
      ]);
      setStudents(sRes.data || []);
      setParents(pRes.data || []);
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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/users/students', 'POST', studentForm);
      setStatusMsg({ type: 'success', text: 'Student registered successfully!' });
      setIsAddStudentOpen(false);
      setStudentForm({ name: '', email: '', password: 'password123', rollNumber: '', phone: '', gradeClass: 'Class 10-A' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleAddParent = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/users/parents', 'POST', parentForm);
      setStatusMsg({ type: 'success', text: 'Parent registered successfully!' });
      setIsAddParentOpen(false);
      setParentForm({ name: '', email: '', password: 'password123', phone: '', studentRef: '' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/users/teachers', 'POST', teacherForm);
      setStatusMsg({ type: 'success', text: 'Faculty / Teacher registered successfully!' });
      setIsAddTeacherOpen(false);
      setTeacherForm({ name: '', email: '', password: 'password123', department: 'General Education', designation: 'Subject Teacher', phone: '' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleLink = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/users/link-parent-student', 'POST', linkForm);
      setStatusMsg({ type: 'success', text: 'Parent and Student successfully linked!' });
      setIsLinkOpen(false);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id, name, role) => {
    if (window.confirm(`Are you sure you want to delete ${role || 'user'} "${name}"?`)) {
      try {
        await apiRequest(`/users/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: `${name} removed successfully` });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredParents = parents.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users & Classroom Directory</h1>
          <p className="page-subtitle">Add and manage Students, Teachers, and Parents with parent-child linking</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setIsLinkOpen(true)}>
            <LinkIcon size={16} /> Link Parent-Student
          </button>
          {activeTab === 'students' && (
            <button className="btn btn-primary" onClick={() => setIsAddStudentOpen(true)}>
              <UserPlus size={16} /> Add Student
            </button>
          )}
          {activeTab === 'parents' && (
            <button className="btn btn-primary" onClick={() => setIsAddParentOpen(true)}>
              <UserPlus size={16} /> Add Parent
            </button>
          )}
          {activeTab === 'teachers' && (
            <button className="btn btn-primary" onClick={() => setIsAddTeacherOpen(true)}>
              <ShieldCheck size={16} /> Add Faculty
            </button>
          )}
        </div>
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students Directory ({students.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'parents' ? 'active' : ''}`}
          onClick={() => setActiveTab('parents')}
        >
          Parents Directory ({parents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          Teachers Directory ({teachers.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="search-bar-wrap">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="form-input search-input"
          placeholder={
            activeTab === 'students' ? "Search student by name, roll no, or email..." :
            activeTab === 'parents' ? "Search parent by name or email..." :
            "Search teacher by name, department, or email..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Linked Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-cell">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s._id}>
                    <td><span className="roll-badge">{s.rollNumber || 'N/A'}</span></td>
                    <td><strong>{s.name}</strong></td>
                    <td><span className="badge badge-info">{s.gradeClass || 'Class 10-A'}</span></td>
                    <td>{s.email}</td>
                    <td>{s.phone || '—'}</td>
                    <td>
                      {s.parentRef ? (
                        <span className="linked-tag">{s.parentRef.name}</span>
                      ) : (
                        <span className="unlinked-tag">Not Linked</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(s._id, s.name, 'Student')}
                        title="Delete student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PARENTS TAB */}
      {activeTab === 'parents' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parent Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Associated Child</th>
                <th>Child's Roll No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-cell">No parents found.</td>
                </tr>
              ) : (
                filteredParents.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.email}</td>
                    <td>{p.phone || '—'}</td>
                    <td>
                      {p.studentRef ? (
                        <span className="linked-tag">{p.studentRef.name}</span>
                      ) : (
                        <span className="unlinked-tag">No Student Linked</span>
                      )}
                    </td>
                    <td>{p.studentRef?.rollNumber || '—'}</td>
                    <td>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(p._id, p.name, 'Parent')}
                        title="Delete parent"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-cell">No teachers found.</td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="teacher-name-cell">
                        <GraduationCap size={16} className="teacher-row-icon" />
                        <strong>{t.name}</strong>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{t.department || 'General'}</span></td>
                    <td>{t.designation || 'Teacher'}</td>
                    <td>{t.email}</td>
                    <td>{t.phone || '—'}</td>
                    <td>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(t._id, t.name, 'Teacher')}
                        title="Delete teacher"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} title="Register New Student">
        <form onSubmit={handleAddStudent}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                className="form-input"
                required
                value={studentForm.rollNumber}
                onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                placeholder="e.g. CS-105"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <input
                type="text"
                className="form-input"
                value={studentForm.gradeClass}
                onChange={(e) => setStudentForm({ ...studentForm, gradeClass: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              placeholder="student@school.edu"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-input"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                placeholder="+1 555-0199"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register Student
          </button>
        </form>
      </Modal>

      {/* MODAL: ADD PARENT */}
      <Modal isOpen={isAddParentOpen} onClose={() => setIsAddParentOpen(false)} title="Register New Parent">
        <form onSubmit={handleAddParent}>
          <div className="form-group">
            <label className="form-label">Parent Full Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={parentForm.name}
              onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })}
              placeholder="e.g. Mark Doe"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              value={parentForm.email}
              onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
              placeholder="parent@example.com"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={parentForm.password}
                onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-input"
                value={parentForm.phone}
                onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                placeholder="+1 555-0144"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Link to Child (Student)</label>
            <select
              className="form-select"
              value={parentForm.studentRef}
              onChange={(e) => setParentForm({ ...parentForm, studentRef: e.target.value })}
            >
              <option value="">-- Select Child (Optional) --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register Parent
          </button>
        </form>
      </Modal>

      {/* MODAL: ADD TEACHER */}
      <Modal isOpen={isAddTeacherOpen} onClose={() => setIsAddTeacherOpen(false)} title="Register New Faculty / Teacher">
        <form onSubmit={handleAddTeacher}>
          <div className="form-group">
            <label className="form-label">Faculty Full Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={teacherForm.name}
              onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
              placeholder="e.g. Dr. Jane Smith"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              value={teacherForm.email}
              onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
              placeholder="teacher@school.edu"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={teacherForm.department}
                onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                placeholder="e.g. Computer Science"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-input"
                value={teacherForm.designation}
                onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                placeholder="e.g. Assistant Professor"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={teacherForm.password}
                onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-input"
                value={teacherForm.phone}
                onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                placeholder="+1 555-0188"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register Faculty Member
          </button>
        </form>
      </Modal>

      {/* MODAL: LINK PARENT & STUDENT */}
      <Modal isOpen={isLinkOpen} onClose={() => setIsLinkOpen(false)} title="Link Parent to Student">
        <form onSubmit={handleLink}>
          <div className="form-group">
            <label className="form-label">Select Parent</label>
            <select
              className="form-select"
              required
              value={linkForm.parentId}
              onChange={(e) => setLinkForm({ ...linkForm, parentId: e.target.value })}
            >
              <option value="">-- Choose Parent --</option>
              {parents.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Select Student (Child)</label>
            <select
              className="form-select"
              required
              value={linkForm.studentId}
              onChange={(e) => setLinkForm({ ...linkForm, studentId: e.target.value })}
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} - Roll {s.rollNumber}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Save Pairing
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentManagement;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Save, Filter } from 'lucide-react';
import '../styles/Attendance.css';

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Teacher State
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSheet, setAttendanceSheet] = useState({}); // { studentId: 'Present' | 'Absent' | 'Late' }

  // Student / Parent State
  const [studentStats, setStudentStats] = useState({
    summary: { total: 0, present: 0, absent: 0, late: 0, percentage: 100 },
    records: []
  });

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const [studRes, subRes] = await Promise.all([
        apiRequest('/users/students'),
        apiRequest('/subjects')
      ]);

      const studs = studRes.data || [];
      const subs = subRes.data || [];
      setStudents(studs);
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubject(subs[0]._id);

      // Default sheet
      const initialSheet = {};
      studs.forEach(s => { initialSheet[s._id] = 'Present'; });
      setAttendanceSheet(initialSheet);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentOrParentData = async () => {
    try {
      setLoading(true);
      let endpoint = '/attendance/my-attendance';
      if (user.role === 'parent') {
        const childId = user.studentRef?._id || user.studentRef;
        endpoint = childId ? `/attendance/student/${childId}` : '/attendance/my-attendance';
      }

      const res = await apiRequest(endpoint);
      if (res.success) {
        setStudentStats(res.data);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === 'teacher') {
      loadTeacherData();
    } else {
      loadStudentOrParentData();
    }
  }, [user]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      const records = students.map(s => ({
        studentRef: s._id,
        status: attendanceSheet[s._id] || 'Present'
      }));

      await apiRequest('/attendance/mark', 'POST', {
        date: selectedDate,
        subjectRef: selectedSubject || null,
        records
      });

      setStatusMsg({ type: 'success', text: `Attendance successfully saved for ${records.length} students on ${selectedDate}!` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Tracking</h1>
          <p className="page-subtitle">
            {user.role === 'teacher' && 'Mark student roll call, manage class absence logs, and export records'}
            {user.role === 'student' && 'View your attendance percentage and detailed daily lecture status'}
            {user.role === 'parent' && `Review your child's attendance track record and consistency metrics`}
          </p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      {/* TEACHER INTERFACE */}
      {user.role === 'teacher' ? (
        <div className="attendance-teacher-view">
          <div className="card">
            <div className="filter-controls-row">
              <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                <label className="form-label">Attendance Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0, minWidth: '220px' }}>
                <label className="form-label">Course / Subject</label>
                <select
                  className="form-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">General Class Attendance</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>

              <div className="batch-actions-box">
                <span className="batch-label">Quick Set All:</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleMarkAll('Present')}>
                  All Present
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleMarkAll('Absent')}>
                  All Absent
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveAttendance}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Status Selection</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const currentStatus = attendanceSheet[student._id] || 'Present';
                    return (
                      <tr key={student._id}>
                        <td><span className="roll-badge">{student.rollNumber || 'N/A'}</span></td>
                        <td><strong>{student.name}</strong></td>
                        <td>{student.email}</td>
                        <td>
                          <div className="status-toggle-group">
                            <button
                              type="button"
                              className={`status-chip chip-present ${currentStatus === 'Present' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(student._id, 'Present')}
                            >
                              <CheckCircle2 size={16} /> Present
                            </button>
                            <button
                              type="button"
                              className={`status-chip chip-absent ${currentStatus === 'Absent' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(student._id, 'Absent')}
                            >
                              <XCircle size={16} /> Absent
                            </button>
                            <button
                              type="button"
                              className={`status-chip chip-late ${currentStatus === 'Late' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(student._id, 'Late')}
                            >
                              <Clock size={16} /> Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="save-bar">
              <button type="submit" className="btn btn-primary save-btn">
                <Save size={18} /> Save Attendance Records
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* STUDENT & PARENT VIEW */
        <div className="attendance-student-view">
          <div className="attendance-summary-cards">
            <div className="summary-metric-card metric-primary">
              <span className="metric-title">Overall Percentage</span>
              <h2 className="metric-val">{studentStats.summary.percentage}%</h2>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${studentStats.summary.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="summary-metric-card metric-green">
              <span className="metric-title">Present Days</span>
              <h2 className="metric-val">{studentStats.summary.present}</h2>
              <span className="metric-sub">Attended Lectures</span>
            </div>

            <div className="summary-metric-card metric-amber">
              <span className="metric-title">Late Arrivals</span>
              <h2 className="metric-val">{studentStats.summary.late}</h2>
              <span className="metric-sub">Partial Credit</span>
            </div>

            <div className="summary-metric-card metric-red">
              <span className="metric-title">Absent Days</span>
              <h2 className="metric-val">{studentStats.summary.absent}</h2>
              <span className="metric-sub">Missed Lectures</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Daily Attendance Log</h2>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course / Subject</th>
                    <th>Status</th>
                    <th>Verified By</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.records.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table-cell">No attendance records logged yet.</td>
                    </tr>
                  ) : (
                    studentStats.records.map((rec) => (
                      <tr key={rec._id}>
                        <td><strong>{new Date(rec.date).toLocaleDateString()}</strong></td>
                        <td>{rec.subjectRef?.name || 'General Class'}</td>
                        <td>
                          <span className={`badge ${
                            rec.status === 'Present' ? 'badge-success' :
                            rec.status === 'Absent' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td>{rec.markedBy?.name || 'Class Faculty'}</td>
                        <td>{rec.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;


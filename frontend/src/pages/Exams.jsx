import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { Award, Plus, Calendar, Clock, MapPin, UploadCloud, Trash2, CheckCircle2, Printer } from 'lucide-react';
import '../styles/Exams.css';

const Exams = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' or 'marks'
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  const [studentMarksData, setStudentMarksData] = useState({ summary: {}, marks: [] });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Modals
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isUploadMarkOpen, setIsUploadMarkOpen] = useState(false);

  // Forms
  const [examForm, setExamForm] = useState({
    title: '',
    examType: 'Internal 1',
    subjectRef: '',
    examDate: '',
    startTime: '09:30 AM',
    endTime: '12:30 PM',
    roomNumber: 'Hall A',
    maxMarks: 50
  });

  const [markForm, setMarkForm] = useState({
    studentRef: '',
    examRef: '',
    subjectRef: '',
    marksObtained: '',
    maxMarks: 50,
    remarks: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [examRes, subRes] = await Promise.all([
        apiRequest('/exams'),
        apiRequest('/subjects')
      ]);

      const examList = examRes.data || [];
      const subList = subRes.data || [];
      setExams(examList);
      setSubjects(subList);

      if (subList.length > 0) {
        setExamForm(prev => ({ ...prev, subjectRef: subList[0]._id }));
      }

      if (user.role === 'teacher') {
        const [studRes, markRes] = await Promise.all([
          apiRequest('/users/students'),
          apiRequest('/exams/marks/all')
        ]);
        setStudents(studRes.data || []);
        setAllMarks(markRes.data || []);

        if (studRes.data?.length > 0 && examList.length > 0) {
          setMarkForm(prev => ({
            ...prev,
            studentRef: studRes.data[0]._id,
            examRef: examList[0]._id,
            subjectRef: examList[0].subjectRef?._id || subList[0]?._id
          }));
        }
      } else {
        // Student or Parent
        let endpoint = '/exams/marks/my-marks';
        if (user.role === 'parent') {
          const childId = user.studentRef?._id || user.studentRef;
          endpoint = childId ? `/exams/marks/student/${childId}` : '/exams/marks/my-marks';
        }
        const markRes = await apiRequest(endpoint);
        setStudentMarksData(markRes.data || { summary: {}, marks: [] });
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

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/exams', 'POST', examForm);
      setStatusMsg({ type: 'success', text: 'Exam schedule published successfully!' });
      setIsCreateExamOpen(false);
      setExamForm({
        title: '',
        examType: 'Internal 1',
        subjectRef: subjects[0]?._id || '',
        examDate: '',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        roomNumber: 'Hall A',
        maxMarks: 50
      });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleUploadMark = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/exams/marks/upload', 'POST', markForm);
      setStatusMsg({ type: 'success', text: 'Student mark uploaded and grade calculated successfully!' });
      setIsUploadMarkOpen(false);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteExam = async (id, title) => {
    if (window.confirm(`Delete exam "${title}"?`)) {
      try {
        await apiRequest(`/exams/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: 'Exam deleted' });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="exams-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams & Grade Records</h1>
          <p className="page-subtitle">
            {user.role === 'teacher' && 'Manage examination timetable and record internal & semester exam scores'}
            {user.role === 'student' && 'View your examination schedule and official grade transcripts'}
            {user.role === 'parent' && `Review your child's academic examination performance and grade sheet`}
          </p>
        </div>
        {user.role === 'teacher' && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => setIsUploadMarkOpen(true)}>
              <UploadCloud size={16} /> Upload Mark
            </button>
            <button className="btn btn-primary" onClick={() => setIsCreateExamOpen(true)}>
              <Plus size={16} /> Schedule Exam
            </button>
          </div>
        )}
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
          className={`tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          Exam Timetable ({exams.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveTab('marks')}
        >
          {user.role === 'teacher' ? `Uploaded Marks (${allMarks.length})` : 'My Academic Report Card'}
        </button>
      </div>

      {/* TAB 1: EXAM TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="exams-grid">
          {exams.length === 0 ? (
            <div className="empty-state">
              <Award size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">No Exams Scheduled</h3>
              <p className="empty-state-desc">Upcoming internal assessments and term exams will be posted here.</p>
            </div>
          ) : (
            exams.map((exam) => (
              <div key={exam._id} className="exam-card">
                <div className="exam-card-header">
                  <span className="exam-type-tag">{exam.examType}</span>
                  <span className="exam-marks-tag">{exam.maxMarks} Max Marks</span>
                </div>

                <h3 className="exam-card-title">{exam.title}</h3>
                <span className="exam-subject-name">{exam.subjectRef?.name || 'General Subject'}</span>

                <div className="exam-details-list">
                  <div className="exam-detail-item">
                    <Calendar size={16} className="detail-icon" />
                    <span>Date: <strong>{new Date(exam.examDate).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="exam-detail-item">
                    <Clock size={16} className="detail-icon" />
                    <span>Time: <strong>{exam.startTime} - {exam.endTime}</strong></span>
                  </div>
                  <div className="exam-detail-item">
                    <MapPin size={16} className="detail-icon" />
                    <span>Venue: <strong>{exam.roomNumber}</strong></span>
                  </div>
                </div>

                {user.role === 'teacher' && (
                  <div className="exam-card-footer">
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDeleteExam(exam._id, exam.title)}
                      title="Delete Exam"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MARKS / REPORT CARD */}
      {activeTab === 'marks' && (
        <div>
          {user.role === 'teacher' ? (
            /* TEACHER ALL MARKS TABLE */
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Exam Title</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Max</th>
                    <th>Grade</th>
                    <th>Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {allMarks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-table-cell">No marks recorded yet. Click "Upload Mark" above.</td>
                    </tr>
                  ) : (
                    allMarks.map((m) => (
                      <tr key={m._id}>
                        <td><span className="roll-badge">{m.studentRef?.rollNumber || '—'}</span></td>
                        <td><strong>{m.studentRef?.name}</strong></td>
                        <td>{m.examRef?.title || 'Exam'}</td>
                        <td>{m.subjectRef?.name}</td>
                        <td><strong>{m.marksObtained}</strong></td>
                        <td>{m.maxMarks}</td>
                        <td><span className={`grade-pill grade-${m.grade}`}>{m.grade}</span></td>
                        <td>{m.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* STUDENT & PARENT REPORT CARD */
            <div className="report-card-view">
              <div className="report-header-action-row">
                <span className="transcript-meta">Official Student Grade Record & Progress Transcript</span>
                <button type="button" className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>
                  <Printer size={15} /> Print / Export PDF Transcript
                </button>
              </div>

              <div className="report-summary-bar">
                <div className="summary-stat-box">
                  <span className="stat-label">Total Tests Taken</span>
                  <strong className="stat-number">{studentMarksData.summary?.totalExams || 0}</strong>
                </div>
                <div className="summary-stat-box">
                  <span className="stat-label">Total Marks Obtained</span>
                  <strong className="stat-number">{studentMarksData.summary?.totalObtained || 0} / {studentMarksData.summary?.totalMax || 0}</strong>
                </div>
                <div className="summary-stat-box">
                  <span className="stat-label">Aggregate Score</span>
                  <strong className="stat-number stat-highlight">{studentMarksData.summary?.overallPercentage || 0}%</strong>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Exam / Assessment</th>
                      <th>Subject</th>
                      <th>Exam Date</th>
                      <th>Marks Obtained</th>
                      <th>Max Marks</th>
                      <th>Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentMarksData.marks?.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-table-cell">No grades published for this student yet.</td>
                      </tr>
                    ) : (
                      studentMarksData.marks?.map((m) => (
                        <tr key={m._id}>
                          <td><strong>{m.examRef?.title}</strong></td>
                          <td>{m.subjectRef?.name}</td>
                          <td>{m.examRef?.examDate ? new Date(m.examRef.examDate).toLocaleDateString() : '—'}</td>
                          <td><span className="marks-highlight">{m.marksObtained}</span></td>
                          <td>{m.maxMarks}</td>
                          <td><span className={`grade-pill grade-${m.grade}`}>{m.grade}</span></td>
                          <td>{m.remarks || 'Satisfactory academic performance'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE EXAM */}
      <Modal isOpen={isCreateExamOpen} onClose={() => setIsCreateExamOpen(false)} title="Schedule New Examination">
        <form onSubmit={handleCreateExam}>
          <div className="form-group">
            <label className="form-label">Exam Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Unit Test 2 - Mathematics"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Exam Category</label>
              <select
                className="form-select"
                value={examForm.examType}
                onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
              >
                <option value="Internal 1">Internal 1</option>
                <option value="Internal 2">Internal 2</option>
                <option value="Mid Term">Mid Term</option>
                <option value="Final Semester">Final Semester</option>
                <option value="Class Test">Class Test</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                required
                value={examForm.subjectRef}
                onChange={(e) => setExamForm({ ...examForm, subjectRef: e.target.value })}
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={examForm.examDate}
                onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input
                type="number"
                className="form-input"
                required
                min="1"
                value={examForm.maxMarks}
                onChange={(e) => setExamForm({ ...examForm, maxMarks: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-input"
                value={examForm.startTime}
                onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                placeholder="10:00 AM"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="form-input"
                value={examForm.endTime}
                onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                placeholder="01:00 PM"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Exam Hall / Room</label>
            <input
              type="text"
              className="form-input"
              value={examForm.roomNumber}
              onChange={(e) => setExamForm({ ...examForm, roomNumber: e.target.value })}
              placeholder="Hall A"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Publish Examination
          </button>
        </form>
      </Modal>

      {/* MODAL: UPLOAD MARKS */}
      <Modal isOpen={isUploadMarkOpen} onClose={() => setIsUploadMarkOpen(false)} title="Upload Student Exam Mark">
        <form onSubmit={handleUploadMark}>
          <div className="form-group">
            <label className="form-label">Select Student</label>
            <select
              className="form-select"
              required
              value={markForm.studentRef}
              onChange={(e) => setMarkForm({ ...markForm, studentRef: e.target.value })}
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Exam</label>
            <select
              className="form-select"
              required
              value={markForm.examRef}
              onChange={(e) => {
                const ex = exams.find(x => x._id === e.target.value);
                setMarkForm({
                  ...markForm,
                  examRef: e.target.value,
                  subjectRef: ex?.subjectRef?._id || markForm.subjectRef,
                  maxMarks: ex?.maxMarks || markForm.maxMarks
                });
              }}
            >
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>{ex.title} ({ex.examType})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marks Obtained</label>
              <input
                type="number"
                className="form-input"
                required
                min="0"
                max={markForm.maxMarks}
                value={markForm.marksObtained}
                onChange={(e) => setMarkForm({ ...markForm, marksObtained: e.target.value })}
                placeholder="e.g. 45"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input
                type="number"
                className="form-input"
                readOnly
                value={markForm.maxMarks}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teacher Evaluation / Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Excellent critical thinking and calculation accuracy."
              value={markForm.remarks}
              onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Record & Calculate Grade
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Exams;


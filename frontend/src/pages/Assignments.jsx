import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { FileSpreadsheet, Plus, Upload, CheckCircle2, Clock, Award, Eye, Trash2 } from 'lucide-react';
import '../styles/Assignments.css';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmissionsListOpen, setIsSubmissionsListOpen] = useState(false);
  const [isGradeOpen, setIsGradeOpen] = useState(false);

  // Selected items
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);

  // Forms
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subjectRef: '',
    description: '',
    dueDate: '',
    maxMarks: 50,
    gradeClass: 'Class 10-A'
  });

  const [submissionForm, setSubmissionForm] = useState({
    content: '',
    fileAttachment: ''
  });

  const [gradeForm, setGradeForm] = useState({
    marksObtained: '',
    feedback: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [asgRes, subRes] = await Promise.all([
        apiRequest('/assignments'),
        apiRequest('/subjects')
      ]);
      setAssignments(asgRes.data || []);
      setSubjects(subRes.data || []);
      if (subRes.data?.length > 0) {
        setAssignmentForm(prev => ({ ...prev, subjectRef: subRes.data[0]._id }));
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

  // Teacher: Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/assignments', 'POST', assignmentForm);
      setStatusMsg({ type: 'success', text: 'Assignment created successfully!' });
      setIsCreateOpen(false);
      setAssignmentForm({ title: '', subjectRef: subjects[0]?._id || '', description: '', dueDate: '', maxMarks: 50, gradeClass: 'Class 10-A' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // Student: Open Submit Modal
  const openSubmitModal = (asg) => {
    setActiveAssignment(asg);
    setSubmissionForm({
      content: asg.submission?.content || '',
      fileAttachment: asg.submission?.fileAttachment || ''
    });
    setIsSubmitOpen(true);
  };

  // Student: Submit Work
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/assignments/${activeAssignment._id}/submit`, 'POST', submissionForm);
      setStatusMsg({ type: 'success', text: 'Assignment submitted successfully!' });
      setIsSubmitOpen(false);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // Teacher: View Submissions
  const openSubmissionsList = async (asg) => {
    setActiveAssignment(asg);
    try {
      const res = await apiRequest(`/assignments/${asg._id}/submissions`);
      setSubmissionsList(res.data || []);
      setIsSubmissionsListOpen(true);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // Teacher: Open Grade Modal
  const openGradeModal = (sub) => {
    setActiveSubmission(sub);
    setGradeForm({
      marksObtained: sub.marksObtained ?? '',
      feedback: sub.feedback || ''
    });
    setIsGradeOpen(true);
  };

  // Teacher: Grade Submission
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/assignments/submissions/${activeSubmission._id}/grade`, 'PUT', gradeForm);
      setStatusMsg({ type: 'success', text: 'Grade and feedback recorded!' });
      setIsGradeOpen(false);
      // refresh submissions
      const res = await apiRequest(`/assignments/${activeAssignment._id}/submissions`);
      setSubmissionsList(res.data || []);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // Teacher: Delete Assignment
  const handleDeleteAssignment = async (id, title) => {
    if (window.confirm(`Delete assignment "${title}"?`)) {
      try {
        await apiRequest(`/assignments/${id}`, 'DELETE');
        setStatusMsg({ type: 'success', text: 'Assignment deleted' });
        loadData();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="assignments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments & Coursework</h1>
          <p className="page-subtitle">
            {user.role === 'teacher' && 'Publish coursework, review student submissions, and grade deliverables'}
            {user.role === 'student' && 'Complete your homework, submit deliverables, and review grading feedback'}
            {user.role === 'parent' && `Track your child's assignment submissions and grades`}
          </p>
        </div>
        {user.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Create Assignment
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="assignments-grid">
        {assignments.length === 0 ? (
          <div className="empty-state">
            <FileSpreadsheet size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Assignments Found</h3>
            <p className="empty-state-desc">There are no assignments posted for this classroom yet.</p>
          </div>
        ) : (
          assignments.map((asg) => {
            const isDueSoon = new Date(asg.dueDate) < new Date(Date.now() + 3 * 86400000);
            return (
              <div key={asg._id} className="assignment-card">
                <div className="asg-header">
                  <span className="badge badge-info">{asg.subjectRef?.name || 'General'}</span>
                  <span className="max-marks-pill">{asg.maxMarks} Marks</span>
                </div>

                <h3 className="asg-title">{asg.title}</h3>
                <p className="asg-desc">{asg.description}</p>

                <div className="asg-meta-row">
                  <div className="asg-due-info">
                    <Clock size={15} />
                    <span>Due: <strong>{new Date(asg.dueDate).toLocaleDateString()}</strong></span>
                  </div>
                  <span className="asg-teacher">By {asg.teacherRef?.name || 'Faculty'}</span>
                </div>

                {/* STUDENT SUBMISSION STATUS BADGE */}
                {user.role === 'student' && (
                  <div className="student-asg-status">
                    {asg.submission ? (
                      <div className="submission-status-box status-submitted">
                        <CheckCircle2 size={16} />
                        <div>
                          <span>Status: <strong>{asg.submission.status}</strong></span>
                          {asg.submission.marksObtained !== null && (
                            <span className="grade-scored">
                              Score: <strong>{asg.submission.marksObtained} / {asg.maxMarks}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="submission-status-box status-pending">
                        <Clock size={16} />
                        <span>Not Submitted Yet</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="asg-footer">
                  {user.role === 'teacher' && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openSubmissionsList(asg)}
                      >
                        <Eye size={15} /> View Submissions
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDeleteAssignment(asg._id, asg.title)}
                        title="Delete Assignment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}

                  {user.role === 'student' && (
                    <button
                      className={`btn ${asg.submission ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      onClick={() => openSubmitModal(asg)}
                      style={{ width: '100%' }}
                    >
                      <Upload size={15} /> {asg.submission ? 'Resubmit / Edit Work' : 'Submit Assignment'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: CREATE ASSIGNMENT */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Assignment">
        <form onSubmit={handleCreateAssignment}>
          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Linear Algebra Problem Set 3"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                required
                value={assignmentForm.subjectRef}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, subjectRef: e.target.value })}
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input
                type="number"
                className="form-input"
                required
                min="1"
                value={assignmentForm.maxMarks}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <input
                type="text"
                className="form-input"
                value={assignmentForm.gradeClass}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, gradeClass: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructions & Details</label>
            <textarea
              className="form-textarea"
              rows="4"
              required
              placeholder="Describe assignment instructions, questions, reading materials..."
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Publish Assignment
          </button>
        </form>
      </Modal>

      {/* MODAL: STUDENT SUBMISSION */}
      <Modal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} title={`Submit Work: ${activeAssignment?.title}`}>
        <form onSubmit={handleSubmitWork}>
          <div className="asg-modal-info">
            <p><strong>Subject:</strong> {activeAssignment?.subjectRef?.name}</p>
            <p><strong>Max Score:</strong> {activeAssignment?.maxMarks} marks</p>
            <p><strong>Due:</strong> {activeAssignment?.dueDate && new Date(activeAssignment.dueDate).toLocaleDateString()}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Your Solution / Text Answer</label>
            <textarea
              className="form-textarea"
              rows="5"
              required
              placeholder="Write your answer, explanations, calculations, or report summary here..."
              value={submissionForm.content}
              onChange={(e) => setSubmissionForm({ ...submissionForm, content: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Attachment Link / GitHub / Drive URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://drive.google.com/... or https://github.com/..."
              value={submissionForm.fileAttachment}
              onChange={(e) => setSubmissionForm({ ...submissionForm, fileAttachment: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Turn In Assignment
          </button>
        </form>
      </Modal>

      {/* MODAL: TEACHER VIEW SUBMISSIONS */}
      <Modal
        isOpen={isSubmissionsListOpen}
        onClose={() => setIsSubmissionsListOpen(false)}
        title={`Submissions: ${activeAssignment?.title}`}
      >
        <div className="submissions-modal-content">
          {submissionsList.length === 0 ? (
            <p className="no-data-text">No students have submitted work for this assignment yet.</p>
          ) : (
            <div className="submissions-list">
              {submissionsList.map((sub) => (
                <div key={sub._id} className="submission-row-card">
                  <div className="sub-user-meta">
                    <strong>{sub.studentRef?.name}</strong>
                    <span className="roll-badge">{sub.studentRef?.rollNumber || 'No Roll'}</span>
                    <span className="sub-date">Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                  </div>

                  <div className="sub-content-preview">
                    <p>{sub.content}</p>
                    {sub.fileAttachment && (
                      <a href={sub.fileAttachment} target="_blank" rel="noreferrer" className="attachment-link">
                        📎 View Attached Document
                      </a>
                    )}
                  </div>

                  <div className="sub-grading-bar">
                    {sub.status === 'Graded' ? (
                      <div className="graded-badge-box">
                        <span className="badge badge-success">Graded: {sub.marksObtained} / {activeAssignment?.maxMarks}</span>
                        {sub.feedback && <p className="sub-feedback-text">"{sub.feedback}"</p>}
                      </div>
                    ) : (
                      <span className="badge badge-warning">Pending Review</span>
                    )}

                    <button className="btn btn-secondary btn-sm" onClick={() => openGradeModal(sub)}>
                      <Award size={14} /> {sub.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL: GRADE SUBMISSION */}
      <Modal isOpen={isGradeOpen} onClose={() => setIsGradeOpen(false)} title={`Grade Student: ${activeSubmission?.studentRef?.name}`}>
        <form onSubmit={handleGradeSubmission}>
          <div className="form-group">
            <label className="form-label">Marks Awarded (Out of {activeAssignment?.maxMarks})</label>
            <input
              type="number"
              className="form-input"
              required
              min="0"
              max={activeAssignment?.maxMarks || 100}
              value={gradeForm.marksObtained}
              onChange={(e) => setGradeForm({ ...gradeForm, marksObtained: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teacher Feedback & Remarks</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Well researched, neat diagrams. Revise question 4 derivation."
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Submit Grade & Feedback
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;


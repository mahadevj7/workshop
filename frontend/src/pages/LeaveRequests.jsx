import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { Send, Plus, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import '../styles/LeaveRequests.css';

const LeaveRequests = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Modals
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeLeave, setActiveLeave] = useState(null);

  // Forms
  const [applyForm, setApplyForm] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    adminRemarks: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/leave');
      setLeaves(res.data || []);
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

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/leave/apply', 'POST', applyForm);
      setStatusMsg({ type: 'success', text: 'Leave application submitted for teacher review!' });
      setIsApplyOpen(false);
      setApplyForm({ fromDate: '', toDate: '', reason: '' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const openReviewModal = (leave) => {
    setActiveLeave(leave);
    setReviewForm({
      status: 'Approved',
      adminRemarks: leave.adminRemarks || ''
    });
    setIsReviewOpen(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/leave/${activeLeave._id}/review`, 'PUT', reviewForm);
      setStatusMsg({ type: 'success', text: `Leave application ${reviewForm.status}!` });
      setIsReviewOpen(false);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="leave-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Applications</h1>
          <p className="page-subtitle">
            {user.role === 'student' && 'Apply for temporary absence from class and check approval status'}
            {user.role === 'teacher' && 'Review and authorize pending student absence requests'}
            {user.role === 'parent' && `Monitor your child's leave requests and teacher approvals`}
          </p>
        </div>
        {user.role === 'student' && (
          <button className="btn btn-primary" onClick={() => setIsApplyOpen(true)}>
            <Plus size={16} /> Apply for Leave
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="leave-cards-list">
        {leaves.length === 0 ? (
          <div className="empty-state">
            <Send size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Leave Requests</h3>
            <p className="empty-state-desc">There are currently no active or historical leave applications.</p>
          </div>
        ) : (
          leaves.map((l) => (
            <div key={l._id} className="leave-card">
              <div className="leave-card-top">
                <div className="leave-user-meta">
                  <strong className="leave-student-name">{l.studentRef?.name}</strong>
                  <span className="roll-badge">{l.studentRef?.rollNumber || 'CS-101'}</span>
                  <span className="leave-class">{l.studentRef?.gradeClass || 'Class 10-A'}</span>
                </div>

                <span className={`badge ${
                  l.status === 'Approved' ? 'badge-success' :
                  l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {l.status === 'Approved' && <CheckCircle size={13} />}
                  {l.status === 'Rejected' && <XCircle size={13} />}
                  {l.status === 'Pending' && <Clock size={13} />}
                  {l.status}
                </span>
              </div>

              <div className="leave-duration-box">
                <Calendar size={16} className="calendar-icon" />
                <span>
                  From: <strong>{new Date(l.fromDate).toLocaleDateString()}</strong> &nbsp;—&nbsp;
                  To: <strong>{new Date(l.toDate).toLocaleDateString()}</strong>
                </span>
              </div>

              <p className="leave-reason-text">"{l.reason}"</p>

              {l.adminRemarks && (
                <div className="admin-remarks-box">
                  <span className="remarks-author">Reviewed by {l.reviewedBy?.name || 'Class Teacher'}:</span>
                  <p>{l.adminRemarks}</p>
                </div>
              )}

              {user.role === 'teacher' && l.status === 'Pending' && (
                <div className="leave-actions-bar">
                  <button className="btn btn-primary btn-sm" onClick={() => openReviewModal(l)}>
                    Review Application
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: APPLY FOR LEAVE */}
      <Modal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} title="Submit Leave Application">
        <form onSubmit={handleApply}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={applyForm.fromDate}
                onChange={(e) => setApplyForm({ ...applyForm, fromDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={applyForm.toDate}
                onChange={(e) => setApplyForm({ ...applyForm, toDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Absence</label>
            <textarea
              className="form-textarea"
              rows="4"
              required
              placeholder="State the medical, academic, or personal reason for absence..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Submit Application
          </button>
        </form>
      </Modal>

      {/* MODAL: REVIEW LEAVE */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title={`Review Leave: ${activeLeave?.studentRef?.name}`}>
        <form onSubmit={handleReview}>
          <div className="form-group">
            <label className="form-label">Decision</label>
            <select
              className="form-select"
              value={reviewForm.status}
              onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
            >
              <option value="Approved">Approve Leave</option>
              <option value="Rejected">Reject Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Feedback / Conditions (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ensure missed homework is submitted upon return."
              value={reviewForm.adminRemarks}
              onChange={(e) => setReviewForm({ ...reviewForm, adminRemarks: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Confirm Decision
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveRequests;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import Modal from '../components/Modal';
import { MailQuestion, Send, Reply, CheckCircle2, Clock, User, GraduationCap } from 'lucide-react';
import '../styles/Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Modals
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);

  // Forms
  const [sendForm, setSendForm] = useState({
    recipientRef: '',
    subject: '',
    message: ''
  });

  const [replyText, setReplyText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/messages');
      setMessages(res.data || []);

      if (user.role !== 'teacher') {
        const tRes = await apiRequest('/users/teachers');
        const teachs = tRes.data || [];
        setTeachers(teachs);
        if (teachs.length > 0) {
          setSendForm(prev => ({ ...prev, recipientRef: teachs[0]._id }));
        }
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/messages/send', 'POST', sendForm);
      setStatusMsg({ type: 'success', text: 'Message delivered to teacher!' });
      setIsSendOpen(false);
      setSendForm({ recipientRef: teachers[0]?._id || '', subject: '', message: '' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const openReplyModal = (msg) => {
    setActiveMessage(msg);
    setReplyText(msg.reply || '');
    setIsReplyOpen(true);
  };

  const handleReplyMessage = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/messages/${activeMessage._id}/reply`, 'PUT', { reply: replyText });
      setStatusMsg({ type: 'success', text: 'Reply sent successfully!' });
      setIsReplyOpen(false);
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="messages-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Direct Inquiries & Faculty Communication</h1>
          <p className="page-subtitle">
            {user.role === 'teacher' && 'Read inquiries and questions submitted by students & parents and reply'}
            {user.role !== 'teacher' && 'Send direct academic questions or inquiries to your class teachers'}
          </p>
        </div>
        {user.role !== 'teacher' && (
          <button className="btn btn-primary" onClick={() => setIsSendOpen(true)}>
            <Send size={16} /> Contact Teacher
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div className={`status-banner ${statusMsg.type === 'error' ? 'status-error' : 'status-success'}`}>
          {statusMsg.text}
          <button className="status-close" onClick={() => setStatusMsg({ type: '', text: '' })}>&times;</button>
        </div>
      )}

      <div className="messages-stream">
        {messages.length === 0 ? (
          <div className="empty-state">
            <MailQuestion size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Inquiries Found</h3>
            <p className="empty-state-desc">Direct communications between students, parents, and teachers will appear here.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m._id} className="message-thread-card">
              <div className="thread-top">
                <div className="thread-sender-box">
                  <User size={18} className="sender-avatar" />
                  <div>
                    <strong className="sender-name">{m.senderRef?.name}</strong>
                    <span className="sender-role">({m.senderRef?.role})</span>
                    {m.studentRef && m.senderRef?.role === 'parent' && (
                      <span className="linked-child-sub">Parent of {m.studentRef.name}</span>
                    )}
                  </div>
                </div>

                <div className="thread-top-right">
                  <span className={`badge ${m.status === 'Replied' ? 'badge-success' : 'badge-warning'}`}>
                    {m.status === 'Replied' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {m.status}
                  </span>
                  <span className="thread-time">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="thread-content-box">
                <h4 className="thread-subject">{m.subject}</h4>
                <p className="thread-body">{m.message}</p>
                <div className="recipient-tag">
                  To: <strong>{m.recipientRef?.name || 'Class Teacher'}</strong>
                </div>
              </div>

              {/* REPLY SECTION */}
              {m.reply ? (
                <div className="thread-reply-box">
                  <div className="reply-header">
                    <GraduationCap size={16} className="reply-icon" />
                    <span>Response from {m.recipientRef?.name || 'Teacher'}</span>
                    {m.repliedAt && <span className="reply-date">• {new Date(m.repliedAt).toLocaleDateString()}</span>}
                  </div>
                  <p className="reply-content">{m.reply}</p>
                </div>
              ) : null}

              {user.role === 'teacher' && (
                <div className="thread-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openReplyModal(m)}>
                    <Reply size={14} /> {m.reply ? 'Edit Reply' : 'Send Reply'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: CONTACT TEACHER */}
      <Modal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} title="Contact Teacher / Send Inquiry">
        <form onSubmit={handleSendMessage}>
          <div className="form-group">
            <label className="form-label">Select Faculty Member</label>
            <select
              className="form-select"
              required
              value={sendForm.recipientRef}
              onChange={(e) => setSendForm({ ...sendForm, recipientRef: e.target.value })}
            >
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.department || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Question on Mathematics homework problem #4"
              value={sendForm.subject}
              onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message Details</label>
            <textarea
              className="form-textarea"
              rows="5"
              required
              placeholder="Explain your inquiry, request, or doubt in detail..."
              value={sendForm.message}
              onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Deliver Message
          </button>
        </form>
      </Modal>

      {/* MODAL: REPLY */}
      <Modal isOpen={isReplyOpen} onClose={() => setIsReplyOpen(false)} title={`Reply to ${activeMessage?.senderRef?.name}`}>
        <form onSubmit={handleReplyMessage}>
          <div className="original-inquiry-quote">
            <span className="quote-label">Inquiry:</span>
            <strong>{activeMessage?.subject}</strong>
            <p>"{activeMessage?.message}"</p>
          </div>

          <div className="form-group">
            <label className="form-label">Your Response</label>
            <textarea
              className="form-textarea"
              rows="5"
              required
              placeholder="Write your answer or instructions for the student/parent..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
            Send Response
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Messages;


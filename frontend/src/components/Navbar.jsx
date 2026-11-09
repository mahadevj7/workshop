import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Clock,
  Send,
  Bell,
  Users2,
  MessageSquare,
  LogOut,
  Menu,
  X,
  FileCheck2,
  MailQuestion,
  User
} from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  if (!user) return null;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/dashboard" className="brand-logo" onClick={closeMobile}>
            <GraduationCap className="brand-icon" size={28} />
            <span className="brand-name">EduPortal</span>
          </NavLink>
          <span className={`role-badge role-${user.role}`}>
            {user.role}
          </span>
        </div>

        <button 
          className="mobile-toggle-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            Dashboard
          </NavLink>

          {/* TEACHER LINKS */}
          {user.role === 'teacher' && (
            <>
              <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Users size={16} /> Students & Parents
              </NavLink>
              <NavLink to="/subjects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <BookOpen size={16} /> Subjects
              </NavLink>
              <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <CalendarCheck size={16} /> Attendance
              </NavLink>
              <NavLink to="/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <FileSpreadsheet size={16} /> Assignments
              </NavLink>
              <NavLink to="/exams" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Award size={16} /> Exams & Marks
              </NavLink>
              <NavLink to="/timetable" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Clock size={16} /> Timetable
              </NavLink>
              <NavLink to="/leave-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <FileCheck2 size={16} /> Leave
              </NavLink>
              <NavLink to="/pta" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Users2 size={16} /> PTA
              </NavLink>
              <NavLink to="/remarks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <MessageSquare size={16} /> Remarks
              </NavLink>
              <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <MailQuestion size={16} /> Inquiries
              </NavLink>
            </>
          )}

          {/* STUDENT LINKS */}
          {user.role === 'student' && (
            <>
              <NavLink to="/timetable" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Clock size={16} /> Timetable
              </NavLink>
              <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <CalendarCheck size={16} /> Attendance
              </NavLink>
              <NavLink to="/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <FileSpreadsheet size={16} /> Assignments
              </NavLink>
              <NavLink to="/exams" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Award size={16} /> Exams & Marks
              </NavLink>
              <NavLink to="/leave-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Send size={16} /> Request Leave
              </NavLink>
              <NavLink to="/remarks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <MessageSquare size={16} /> Feedback
              </NavLink>
              <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <MailQuestion size={16} /> Contact Teacher
              </NavLink>
            </>
          )}

          {/* PARENT LINKS */}
          {user.role === 'parent' && (
            <>
              <NavLink to="/exams" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Award size={16} /> Student Marks
              </NavLink>
              <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <CalendarCheck size={16} /> Attendance
              </NavLink>
              <NavLink to="/pta" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Users2 size={16} /> PTA Meetings
              </NavLink>
              <NavLink to="/remarks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <MessageSquare size={16} /> Remarks & Feedback
              </NavLink>
              <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <MailQuestion size={16} /> Contact Teacher
              </NavLink>
            </>
          )}

          <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <Bell size={16} /> Notices
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <User size={16} /> My Profile
          </NavLink>

          <div className="navbar-user-section">
            <NavLink to="/profile" className="user-info user-info-link" onClick={closeMobile} title="View & Edit Profile">
              <span className="user-name">{user.name}</span>
              {user.rollNumber && <span className="user-sub">Roll: {user.rollNumber}</span>}
              {user.gradeClass && !user.rollNumber && <span className="user-sub">{user.gradeClass}</span>}
            </NavLink>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;


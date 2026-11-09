import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  FileText,
  Bell,
  MessageSquare,
  Award,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users2,
  Clock,
  TrendingUp,
  Zap,
  Star,
  CheckCircle
} from 'lucide-react';
import '../styles/Home.css';

const FEATURES = [
  {
    icon: <ShieldCheck size={24} />,
    color: 'feature-icon-purple',
    title: 'Role-Based Access',
    desc: 'Separate portals for Teachers, Students, and Parents — each with personalised views, permissions, and dashboards.'
  },
  {
    icon: <CalendarCheck size={24} />,
    color: 'feature-icon-blue',
    title: 'Attendance Tracking',
    desc: 'Teachers mark daily attendance per subject. Students and parents see real-time attendance percentages.'
  },
  {
    icon: <FileText size={24} />,
    color: 'feature-icon-orange',
    title: 'Assignments & Submissions',
    desc: 'Assign homework with due dates, receive student submissions, and provide graded feedback instantly.'
  },
  {
    icon: <Award size={24} />,
    color: 'feature-icon-pink',
    title: 'Exam & Marks Manager',
    desc: 'Schedule exams, upload marks, track performance trends, and generate grade reports for each student.'
  },
  {
    icon: <Clock size={24} />,
    color: 'feature-icon-teal',
    title: 'Class Timetable',
    desc: 'Visual weekly schedule for each class with subject, teacher, room, and time-slot assignment.'
  },
  {
    icon: <MessageSquare size={24} />,
    color: 'feature-icon-green',
    title: 'Parent–Teacher Messaging',
    desc: 'Secure direct messaging channel between parents and class teachers with thread history.'
  },
  {
    icon: <Bell size={24} />,
    color: 'feature-icon-blue',
    title: 'Notifications & Alerts',
    desc: 'Broadcast important announcements to all students, only parents, or the entire school community.'
  },
  {
    icon: <Users size={24} />,
    color: 'feature-icon-purple',
    title: 'PTA Meetings',
    desc: 'Schedule Parent-Teacher Association meetings with agenda, venue, timing and minutes of meeting.'
  },
  {
    icon: <TrendingUp size={24} />,
    color: 'feature-icon-orange',
    title: 'Leave Management',
    desc: 'Students submit leave applications; teachers review, approve or decline with recorded remarks.'
  }
];

const TEACHER_PERKS = [
  'Add & manage students and parents',
  'Mark daily subject-wise attendance',
  'Create assignments and grade submissions',
  'Schedule exams and upload marks',
  'Broadcast notifications',
  'Reply to parent messages'
];

const STUDENT_PERKS = [
  'View personal attendance summary',
  'Submit homework and check grades',
  'See upcoming exams and timetable',
  'Apply for leave requests',
  'Read notifications from teachers',
  'Track academic performance'
];

const PARENT_PERKS = [
  "Monitor child's attendance live",
  "View exam marks and grade reports",
  "Message class teacher directly",
  "Confirm PTA meeting attendance",
  "Receive school-wide announcements",
  "Track leave approvals"
];

const Home = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');

  const handleDemoLogin = async (email, password, role) => {
    setError('');
    setLoadingRole(role);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="home-page">

      {/* ── Navbar ── */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <a href="#" className="home-nav-brand">
            <div className="home-nav-logo">
              <GraduationCap size={22} />
            </div>
            <span className="home-nav-name">Edu<span>Portal</span></span>
          </a>
          <div className="home-nav-links">
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#roles" className="home-nav-link">Roles</a>
            <NavLink to="/register" className="home-nav-link">Register</NavLink>
            <NavLink to="/login" className="home-nav-link home-nav-cta">Sign In</NavLink>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-badge">
            <Zap size={13} />
            Classroom Management System
          </div>

          <h1 className="home-hero-title">
            The Smart Portal for<br />
            <span className="highlight">Every Classroom</span>
          </h1>

          <p className="home-hero-subtitle">
            EduPortal brings teachers, students, and parents onto one unified platform —
            attendance, assignments, exams, marks, timetables, and direct messaging, all in one place.
          </p>

          <div className="home-hero-actions">
            <NavLink to="/register" className="hero-btn-primary">
              Register Teacher Account
              <ArrowRight size={18} />
            </NavLink>
            <NavLink to="/login" className="hero-btn-secondary">
              <ShieldCheck size={18} />
              Sign In
            </NavLink>
          </div>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="home-demo-section">
          <p className="home-demo-label">⚡ Try a live demo — click to sign in instantly</p>
          <div className="home-demo-cards">

            <div
              className="home-demo-card teacher-card"
              onClick={() => handleDemoLogin('teacher@school.edu', 'password123', 'teacher')}
            >
              <div className="demo-card-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="demo-card-info">
                <div className="demo-card-role">👩‍🏫 Teacher Portal</div>
                <div className="demo-card-email">teacher@school.edu</div>
                <div className="demo-card-pass">Pass: password123</div>
              </div>
              {loadingRole === 'teacher'
                ? <span className="demo-card-loading">Signing in…</span>
                : <ArrowRight size={16} color="#94a3b8" />
              }
            </div>

            <div
              className="home-demo-card student-card"
              onClick={() => handleDemoLogin('student@school.edu', 'password123', 'student')}
            >
              <div className="demo-card-icon">
                <UserCheck size={22} />
              </div>
              <div className="demo-card-info">
                <div className="demo-card-role">🎒 Student Portal</div>
                <div className="demo-card-email">student@school.edu</div>
                <div className="demo-card-pass">Pass: password123</div>
              </div>
              {loadingRole === 'student'
                ? <span className="demo-card-loading">Signing in…</span>
                : <ArrowRight size={16} color="#94a3b8" />
              }
            </div>

            <div
              className="home-demo-card parent-card"
              onClick={() => handleDemoLogin('parent@school.edu', 'password123', 'parent')}
            >
              <div className="demo-card-icon">
                <Users2 size={22} />
              </div>
              <div className="demo-card-info">
                <div className="demo-card-role">👨‍👩‍👧 Parent Portal</div>
                <div className="demo-card-email">parent@school.edu</div>
                <div className="demo-card-pass">Pass: password123</div>
              </div>
              {loadingRole === 'parent'
                ? <span className="demo-card-loading">Signing in…</span>
                : <ArrowRight size={16} color="#94a3b8" />
              }
            </div>
          </div>

          {error && (
            <div className="home-error-alert">
              <Bell size={16} />
              {error}
            </div>
          )}
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="home-stats">
        <div className="home-stats-inner">
          <div className="home-stat-item">
            <div className="home-stat-number">3</div>
            <div className="home-stat-label">User Roles</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">12+</div>
            <div className="home-stat-label">Management Modules</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">100%</div>
            <div className="home-stat-label">Responsive Design</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">Live</div>
            <div className="home-stat-label">Real-Time Updates</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-features" id="features">
        <div className="home-section-header">
          <div className="home-section-eyebrow">Platform Features</div>
          <h2 className="home-section-title">Everything a modern school needs</h2>
          <p className="home-section-desc">
            All essential academic operations in one place — built to save teachers' time and keep parents informed.
          </p>
        </div>
        <div className="home-features-grid">
          {FEATURES.map((f, i) => (
            <div className="home-feature-card" key={i}>
              <div className={`feature-icon-wrap ${f.color}`}>{f.icon}</div>
              <h3 className="home-feature-title">{f.title}</h3>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="home-roles" id="roles">
        <div className="home-section-header">
          <div className="home-section-eyebrow">Three Roles, One System</div>
          <h2 className="home-section-title">Who is EduPortal for?</h2>
          <p className="home-section-desc">
            Each role gets a dedicated portal, tailored features, and controlled access to relevant data.
          </p>
        </div>

        <div className="home-roles-grid">
          {/* Teacher */}
          <div className="home-role-card role-teacher">
            <div className="home-role-icon"><ShieldCheck size={34} /></div>
            <h3 className="home-role-name">Teacher</h3>
            <p className="home-role-desc">
              Full control over classroom operations, student management, grades, and parent communication.
            </p>
            <ul className="home-role-perks">
              {TEACHER_PERKS.map((p, i) => (
                <li key={i}><span className="perk-dot" />{p}</li>
              ))}
            </ul>
            <button
              className="home-role-btn"
              onClick={() => handleDemoLogin('teacher@school.edu', 'password123', 'teacher')}
            >
              {loadingRole === 'teacher' ? 'Signing in…' : '🚀 Launch Teacher Demo'}
            </button>
          </div>

          {/* Student */}
          <div className="home-role-card role-student">
            <div className="home-role-icon"><UserCheck size={34} /></div>
            <h3 className="home-role-name">Student</h3>
            <p className="home-role-desc">
              Personal academic dashboard with attendance, assignments, grades and timetable at a glance.
            </p>
            <ul className="home-role-perks">
              {STUDENT_PERKS.map((p, i) => (
                <li key={i}><span className="perk-dot" />{p}</li>
              ))}
            </ul>
            <button
              className="home-role-btn"
              onClick={() => handleDemoLogin('student@school.edu', 'password123', 'student')}
            >
              {loadingRole === 'student' ? 'Signing in…' : '🎒 Launch Student Demo'}
            </button>
          </div>

          {/* Parent */}
          <div className="home-role-card role-parent">
            <div className="home-role-icon"><Users2 size={34} /></div>
            <h3 className="home-role-name">Parent</h3>
            <p className="home-role-desc">
              Stay connected with your child's academic progress, attendance, and upcoming school events.
            </p>
            <ul className="home-role-perks">
              {PARENT_PERKS.map((p, i) => (
                <li key={i}><span className="perk-dot" />{p}</li>
              ))}
            </ul>
            <button
              className="home-role-btn"
              onClick={() => handleDemoLogin('parent@school.edu', 'password123', 'parent')}
            >
              {loadingRole === 'parent' ? 'Signing in…' : '👨‍👩‍👧 Launch Parent Demo'}
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="home-cta-banner">
        <h2 className="home-cta-title">Ready to get started?</h2>
        <p className="home-cta-sub">
          Register your teacher account today and invite your students and parents within minutes.
          No setup required — just sign up and start teaching.
        </p>
        <div className="home-cta-actions">
          <NavLink to="/register" className="cta-btn-white">
            <Star size={18} />
            Create Teacher Account
          </NavLink>
          <NavLink to="/login" className="cta-btn-outline">
            Sign In to Portal
          </NavLink>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <p>
          © {new Date().getFullYear()} <strong style={{ color: '#94a3b8' }}>EduPortal</strong> — Classroom Management System.
          &nbsp; Built with React + Node.js + MongoDB Atlas.
          &nbsp;<span>Deployed on Red Hat OpenShift.</span>
        </p>
      </footer>
    </div>
  );
};

export default Home;

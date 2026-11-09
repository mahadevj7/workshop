import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import StudentManagement from './pages/StudentManagement';
import SubjectManagement from './pages/SubjectManagement';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import Timetable from './pages/Timetable';
import LeaveRequests from './pages/LeaveRequests';
import Notifications from './pages/Notifications';
import PTAMeetings from './pages/PTAMeetings';
import Remarks from './pages/Remarks';
import Messages from './pages/Messages';

import './styles/App.css';

// Inner component so useLocation works inside BrowserRouter context
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show spinner while checking auth token (prevents incorrect redirects)
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  // Public pages that render full-screen without any wrapper
  const isPublicFullscreen = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <>
      {/* Navbar only visible when authenticated */}
      {isAuthenticated && !isPublicFullscreen && <Navbar />}

      {/* Conditional layout wrapper */}
      <div className={
        isAuthenticated && !isPublicFullscreen
          ? 'main-content'
          : location.pathname === '/login' || location.pathname === '/register'
            ? 'auth-content'
            : undefined          /* Home: no wrapper — it has its own layout */
      }>
        <Routes>

          {/* ── Landing Home ── */}
          <Route
            path="/"
            element={!isAuthenticated ? <Home /> : <Navigate to="/dashboard" replace />}
          />

          {/* ── Auth ── */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
          />

          {/* ── Authenticated ── */}
          <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/students"       element={<ProtectedRoute allowedRoles={['teacher']}><StudentManagement /></ProtectedRoute>} />
          <Route path="/subjects"       element={<ProtectedRoute allowedRoles={['teacher']}><SubjectManagement /></ProtectedRoute>} />
          <Route path="/attendance"     element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/assignments"    element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/exams"          element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/timetable"      element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
          <Route path="/leave-requests" element={<ProtectedRoute><LeaveRequests /></ProtectedRoute>} />
          <Route path="/notifications"  element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/pta"            element={<ProtectedRoute><PTAMeetings /></ProtectedRoute>} />
          <Route path="/remarks"        element={<ProtectedRoute><Remarks /></ProtectedRoute>} />
          <Route path="/messages"       element={<ProtectedRoute><Messages /></ProtectedRoute>} />

          {/* ── Catch-all ── */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="app-container">
      <AppRoutes />
    </div>
  );
}

export default App;

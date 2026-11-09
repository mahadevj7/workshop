import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  // Home page renders outside the auth-content / main-content wrapper
  // so it fills the full viewport with its own layout
  return (
    <div className="app-container">
      <Routes>
        {/* ── Public Landing ── */}
        <Route
          path="/"
          element={!isAuthenticated ? <Home /> : <Navigate to="/dashboard" replace />}
        />

        {/* ── Auth routes (centered card layout) ── */}
        <Route
          path="/login"
          element={
            !isAuthenticated
              ? <div className="auth-content"><Login /></div>
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated
              ? <div className="auth-content"><Register /></div>
              : <Navigate to="/dashboard" replace />
          }
        />

        {/* ── Authenticated routes (Navbar + main-content wrapper) ── */}
        <Route
          path="/*"
          element={
            isAuthenticated
              ? (
                <>
                  <Navbar />
                  <main className="main-content">
                    <Routes>
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
                      <Route path="*"               element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </>
              )
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;


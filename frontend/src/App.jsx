import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
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
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? "main-content" : "auth-content"}>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Teacher Only Routes */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <SubjectManagement />
              </ProtectedRoute>
            }
          />

          {/* Multi-role Accessible Modules */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <Exams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-requests"
            element={
              <ProtectedRoute>
                <LeaveRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pta"
            element={
              <ProtectedRoute>
                <PTAMeetings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/remarks"
            element={
              <ProtectedRoute>
                <Remarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;


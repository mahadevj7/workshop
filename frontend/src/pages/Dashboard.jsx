import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Clock,
  Bell,
  Users2,
  Send,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentsCount: 0,
    subjectsCount: 0,
    assignmentsCount: 0,
    attendanceRate: 95,
    notifications: [],
    recentExams: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const notifRes = await apiRequest('/notifications');
        const notifs = notifRes.data || [];

        const examRes = await apiRequest('/exams');
        const exams = examRes.data || [];

        if (user.role === 'teacher') {
          const [studRes, subRes, asgRes] = await Promise.all([
            apiRequest('/users/students'),
            apiRequest('/subjects'),
            apiRequest('/assignments')
          ]);

          setStats({
            studentsCount: studRes.data ? studRes.data.length : 0,
            subjectsCount: subRes.data ? subRes.data.length : 0,
            assignmentsCount: asgRes.data ? asgRes.data.length : 0,
            attendanceRate: 94,
            notifications: notifs.slice(0, 3),
            recentExams: exams.slice(0, 3)
          });
        } else if (user.role === 'student') {
          const [attRes, asgRes] = await Promise.all([
            apiRequest('/attendance/my-attendance'),
            apiRequest('/assignments')
          ]);

          const percentage = attRes.data?.summary?.percentage ?? 95;
          setStats({
            attendanceRate: percentage,
            assignmentsCount: asgRes.data ? asgRes.data.length : 0,
            subjectsCount: 4,
            notifications: notifs.slice(0, 3),
            recentExams: exams.slice(0, 3)
          });
        } else if (user.role === 'parent') {
          const childId = user.studentRef?._id || user.studentRef;
          let percentage = 95;
          let marksCount = 0;

          if (childId) {
            try {
              const [attRes, markRes] = await Promise.all([
                apiRequest(`/attendance/student/${childId}`),
                apiRequest(`/exams/marks/student/${childId}`)
              ]);
              percentage = attRes.data?.summary?.percentage ?? 95;
              marksCount = markRes.data?.summary?.overallPercentage ?? 88;
            } catch (e) {
              console.warn(e);
            }
          }

          setStats({
            attendanceRate: percentage,
            studentScore: marksCount,
            notifications: notifs.slice(0, 3),
            recentExams: exams.slice(0, 3)
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  return (
    <div className="dashboard-page">
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1 className="welcome-title">Welcome back, {user.name}!</h1>
          <p className="welcome-subtitle">
            {user.role === 'teacher' && `Manage your classroom, monitor academic milestones and communicate with parents.`}
            {user.role === 'student' && `Track your daily timetable, review attendance, and submit active assignments.`}
            {user.role === 'parent' && `Review your child's academic report card, attendance records, and PTA meetings.`}
          </p>
        </div>
        <div className="welcome-badge">
          Role: <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="stats-grid">
        {user.role === 'teacher' && (
          <>
            <StatCard title="Total Enrolled Students" value={stats.studentsCount} subtitle="Active in Class 10-A" icon={Users} color="blue" />
            <StatCard title="Managed Subjects" value={stats.subjectsCount} subtitle="Curriculum courses" icon={BookOpen} color="purple" />
            <StatCard title="Active Assignments" value={stats.assignmentsCount} subtitle="Pending & graded" icon={FileSpreadsheet} color="amber" />
            <StatCard title="Class Attendance" value={`${stats.attendanceRate}%`} subtitle="Average attendance" icon={TrendingUp} color="green" />
          </>
        )}

        {user.role === 'student' && (
          <>
            <StatCard title="My Attendance Rate" value={`${stats.attendanceRate}%`} subtitle="Minimum required: 75%" icon={CalendarCheck} color="green" />
            <StatCard title="Assignments" value={stats.assignmentsCount} subtitle="Total coursework" icon={FileSpreadsheet} color="blue" />
            <StatCard title="Enrolled Subjects" value="4" subtitle="Core curriculum" icon={BookOpen} color="purple" />
            <StatCard title="Class Standing" value="Rank #1" subtitle="Grade 10-A" icon={Award} color="amber" />
          </>
        )}

        {user.role === 'parent' && (
          <>
            <StatCard title="Student Attendance" value={`${stats.attendanceRate}%`} subtitle="Consistent attendance" icon={CalendarCheck} color="green" />
            <StatCard title="Overall Score" value={`${stats.studentScore || 88}%`} subtitle="Across internal tests" icon={Award} color="blue" />
            <StatCard title="Student" value={user.studentRef?.name || 'Alex Johnson'} subtitle={`Roll: ${user.studentRef?.rollNumber || 'CS-101'}`} icon={Users} color="purple" />
            <StatCard title="PTA Status" value="Active" subtitle="Quarterly Conference" icon={Users2} color="amber" />
          </>
        )}
      </div>

      {/* QUICK ACCESS ACTION CARDS */}
      <h2 className="section-title">Quick Navigation</h2>
      <div className="quick-actions-grid">
        {user.role === 'teacher' && (
          <>
            <NavLink to="/attendance" className="action-card">
              <CalendarCheck size={22} className="action-icon text-blue" />
              <div className="action-info">
                <h3>Mark Attendance</h3>
                <p>Record daily student presence and generate attendance reports</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/assignments" className="action-card">
              <FileSpreadsheet size={22} className="action-icon text-green" />
              <div className="action-info">
                <h3>Assignments & Grading</h3>
                <p>Create assignments, view student uploads, and assign marks</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/exams" className="action-card">
              <Award size={22} className="action-icon text-amber" />
              <div className="action-info">
                <h3>Exams & Mark Uploads</h3>
                <p>Schedule internal tests, term exams, and upload scorecards</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/students" className="action-card">
              <Users size={22} className="action-icon text-purple" />
              <div className="action-info">
                <h3>Manage Students & Parents</h3>
                <p>Register students, assign roll numbers, and link parents</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>
          </>
        )}

        {user.role === 'student' && (
          <>
            <NavLink to="/timetable" className="action-card">
              <Clock size={22} className="action-icon text-blue" />
              <div className="action-info">
                <h3>Class Timetable</h3>
                <p>Review daily lecture schedules, room numbers, and teachers</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/assignments" className="action-card">
              <FileSpreadsheet size={22} className="action-icon text-green" />
              <div className="action-info">
                <h3>Submit Assignments</h3>
                <p>Upload your homework answers and view teacher grading</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/leave-requests" className="action-card">
              <Send size={22} className="action-icon text-amber" />
              <div className="action-info">
                <h3>Request Leave</h3>
                <p>Submit leave applications and check teacher approval status</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/messages" className="action-card">
              <MessageSquare size={22} className="action-icon text-purple" />
              <div className="action-info">
                <h3>Contact Teacher</h3>
                <p>Send questions or clarify academic doubts directly</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>
          </>
        )}

        {user.role === 'parent' && (
          <>
            <NavLink to="/exams" className="action-card">
              <Award size={22} className="action-icon text-blue" />
              <div className="action-info">
                <h3>Academic Marks & Progress</h3>
                <p>View test results, internal marks, and subject grading</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/attendance" className="action-card">
              <CalendarCheck size={22} className="action-icon text-green" />
              <div className="action-info">
                <h3>Attendance Log</h3>
                <p>Monitor your child's daily presence and percentage</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/pta" className="action-card">
              <Users2 size={22} className="action-icon text-amber" />
              <div className="action-info">
                <h3>PTA Meetings</h3>
                <p>Read parent-teacher conference schedules and agendas</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>

            <NavLink to="/remarks" className="action-card">
              <MessageSquare size={22} className="action-icon text-purple" />
              <div className="action-info">
                <h3>Teacher Feedback</h3>
                <p>Read teachers' qualitative remarks on behavior & studies</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </NavLink>
          </>
        )}
      </div>

      {/* RECENT NOTIFICATIONS FEED */}
      <div className="dashboard-split-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Latest Announcements</h2>
            <NavLink to="/notifications" className="btn btn-secondary btn-sm">View All</NavLink>
          </div>
          {stats.notifications.length === 0 ? (
            <p className="no-data-text">No announcements published yet.</p>
          ) : (
            <div className="notif-list">
              {stats.notifications.map((n) => (
                <div key={n._id} className="notif-item">
                  <div className="notif-bullet"></div>
                  <div className="notif-body">
                    <h4>{n.title}</h4>
                    <p>{n.content}</p>
                    <span className="notif-meta">
                      Posted by {n.authorRef?.name || 'Faculty'} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Exams</h2>
            <NavLink to="/exams" className="btn btn-secondary btn-sm">Timetable</NavLink>
          </div>
          {stats.recentExams.length === 0 ? (
            <p className="no-data-text">No upcoming exams scheduled.</p>
          ) : (
            <div className="exam-quick-list">
              {stats.recentExams.map((e) => (
                <div key={e._id} className="exam-quick-item">
                  <div className="exam-date-badge">
                    <span className="exam-day">{new Date(e.examDate).getDate()}</span>
                    <span className="exam-month">{new Date(e.examDate).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="exam-quick-info">
                    <h4>{e.title}</h4>
                    <p>{e.subjectRef?.name || 'General Subject'} • {e.startTime} - {e.endTime}</p>
                    <span className="exam-room">Location: {e.roomNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


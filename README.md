# 🎓 EduPortal - Unified Classroom Management System

EduPortal is a modern, full-stack classroom web application built with **React (Frontend)**, **Node.js/Express (Backend)**, and **MongoDB (Database)**. It features role-based access for **Teachers**, **Students**, and **Parents**, complete with separated external stylesheets for every page and component.

---

## 📁 1. Project Directory Structure

```text
workshop_project/
├── backend/                       # Node.js + Express REST API & MongoDB
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection handler
│   ├── controllers/               # Business logic & database operations
│   │   ├── assignmentController.js# Assignment creation, submissions & grading
│   │   ├── attendanceController.js# Daily roll-call, statistics & percentage
│   │   ├── authController.js      # JWT registration, login & profile
│   │   ├── examController.js      # Exam timetable, internal & term mark uploads
│   │   ├── leaveController.js     # Student leave applications & teacher review
│   │   ├── messageController.js   # Student/Parent inquiries & teacher replies
│   │   ├── notificationController.js # Target-audience notice announcements
│   │   ├── ptaController.js       # PTA conference schedules & agendas
│   │   ├── remarkController.js    # Qualitative behavioral & academic feedback
│   │   ├── subjectController.js   # Subject creation & faculty assignment
│   │   ├── timetableController.js # Weekly class routine slots
│   │   └── userController.js      # Student & Parent directory & linking
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token authentication verification
│   │   └── roleMiddleware.js      # Role-based authorization guard
│   ├── models/                    # 13 Mongoose Database Schemas
│   │   ├── Assignment.js
│   │   ├── Attendance.js
│   │   ├── Exam.js
│   │   ├── LeaveRequest.js
│   │   ├── Mark.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── PTAMeeting.js
│   │   ├── Remark.js
│   │   ├── Subject.js
│   │   ├── Submission.js
│   │   ├── Timetable.js
│   │   └── User.js
│   ├── routes/                    # Express routing endpoints
│   ├── .env                       # Environment configuration
│   ├── .env.example               # Sample environment settings
│   ├── package.json               # Backend dependencies
│   ├── seed.js                    # Pre-populates sample data for all 3 roles
│   └── server.js                  # Express application entrypoint
│
└── frontend/                      # React (Vite) Single Page Application
    ├── public/
    ├── src/
    │   ├── components/            # Reusable UI components
    │   │   ├── Modal.jsx          # Reusable popup dialog
    │   │   ├── Navbar.jsx         # Role-based navigation header
    │   │   ├── ProtectedRoute.jsx # Client-side route protection
    │   │   └── StatCard.jsx       # Metric overview cards
    │   ├── context/
    │   │   └── AuthContext.jsx    # Authentication & user session state
    │   ├── pages/                 # Full-feature module pages
    │   │   ├── Assignments.jsx    # Coursework deliverables & grading
    │   │   ├── Attendance.jsx     # Roll-call & attendance logs
    │   │   ├── Dashboard.jsx      # Role-tailored dashboards
    │   │   ├── Exams.jsx          # Exam timetable & report cards
    │   │   ├── LeaveRequests.jsx  # Absence requests & approvals
    │   │   ├── Login.jsx          # Login & 1-click demo switcher
    │   │   ├── Messages.jsx       # Direct teacher messaging
    │   │   ├── Notifications.jsx  # Notice board & announcements
    │   │   ├── PTAMeetings.jsx    # Parent-Teacher Association conferences
    │   │   ├── Remarks.jsx        # Teacher feedback & commendations
    │   │   ├── StudentManagement.jsx # Student & parent directory
    │   │   ├── SubjectManagement.jsx # Subjects & faculty assignment
    │   │   └── Timetable.jsx      # Weekly schedule routine
    │   ├── services/
    │   │   └── api.js             # HTTP client with automatic JWT injection
    │   ├── styles/                # 🎨 Dedicated External CSS Files (No inline CSS)
    │   │   ├── App.css
    │   │   ├── Assignments.css
    │   │   ├── Attendance.css
    │   │   ├── Dashboard.css
    │   │   ├── Exams.css
    │   │   ├── LeaveRequests.css
    │   │   ├── Login.css
    │   │   ├── Messages.css
    │   │   ├── Modal.css
    │   │   ├── Navbar.css
    │   │   ├── Notifications.css
    │   │   ├── PTAMeetings.css
    │   │   ├── Remarks.css
    │   │   ├── StatCard.css
    │   │   ├── StudentManagement.css
    │   │   ├── SubjectManagement.css
    │   │   ├── Timetable.css
    │   │   └── index.css
    │   ├── App.jsx                # Application router configuration
    │   └── main.jsx               # React DOM entrypoint
    ├── index.html                 # HTML template
    ├── package.json               # Frontend dependencies
    └── vite.config.js             # Vite build & backend proxy config
```

---

## 👥 2. Role Modules & Capabilities

| Module | 👨‍🏫 Teacher | 👨‍🎓 Student | 👨‍👩‍👧 Parent |
| :--- | :--- | :--- | :--- |
| **User Management** | Register students/parents, assign roll numbers, pair parent-child | View own profile | View linked child info |
| **Subjects** | Create subjects, assign/reassign other teachers | View enrolled subjects | View child's subjects |
| **Attendance** | Mark daily roll-call (Present/Absent/Late), bulk-set | View attendance %, daily log | View child's attendance rate & log |
| **Assignments** | Create tasks, view submissions, award marks & feedback | Submit work (text/file), view scores | View submission status & grades |
| **Exams & Marks** | Schedule exams, upload internal & semester marks | View exam timetable & report card | Check child's test marks & report card |
| **Timetable** | Add/delete weekly lecture slots, rooms & faculty | View Monday–Friday schedule | View daily routine & timings |
| **Leave Requests** | Review pending requests, Approve/Reject with notes | Apply for leave (dates + reason) | View student's leave approvals |
| **Notice Board** | Post announcements targeting All/Students/Parents | View school circulars | View announcements |
| **PTA Meetings** | Schedule meetings, publish agendas & minutes | View meeting notices | View PTA schedule & agendas |
| **Remarks** | Add academic, behavioral, and general feedback | View teacher commendations | View teacher remarks on child |
| **Inquiries** | View questions from students/parents & reply | Send questions to teacher | Send questions regarding child |

---

## 🔌 3. Step-by-Step MongoDB Connection Process (Manual Guide)

You can connect either using **Local MongoDB** or **MongoDB Atlas (Free Cloud)**:

### Option A: Local MongoDB (Default)
1. **Ensure MongoDB is Installed:**
   - Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community) if not already installed.
2. **Start the MongoDB Service:**
   - Open PowerShell or Command Prompt as Administrator and run:
     ```powershell
     net start MongoDB
     ```
   - Or start `mongod.exe` manually.
3. **Verify Port 27017:**
   - The default connection string is already configured in `backend/.env`:
     ```env
     MONGO_URI=mongodb://127.0.0.1:27017/classroom_db
     ```

### Option B: MongoDB Atlas (Cloud Database - Free)
If you do not want to install MongoDB locally:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for free.
2. Create a **Shared Free Cluster (M0)**.
3. Under **Security -> Database Access**, create a user (e.g., `dbAdmin` with a password).
4. Under **Security -> Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (0.0.0.0/0)**.
5. In your Cluster dashboard, click **Connect** -> **Drivers (Node.js)**.
6. Copy the connection string and replace `<username>` and `<password>`.
7. Paste it into `d:\MCA\workshop_project\backend\.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/classroom_db?retryWrites=true&w=majority
   ```

---

## 🚀 4. How to Seed Data & Run the Project

### Step 1: Pre-populate Demo Data (Seed)
Once your MongoDB is running or your Atlas URI is set:
```powershell
cd d:\MCA\workshop_project\backend
npm run seed
```
*This instantly generates sample teachers, students, parents, subjects, timetable, attendance history, assignments, submissions, exams, marks, notifications, PTA meetings, and remarks!*

### Step 2: Start the Backend Server
```powershell
cd d:\MCA\workshop_project\backend
npm run dev
# Or: npm start
```
*Backend runs on `http://localhost:5000`*

### Step 3: Start the Frontend React App
In a new terminal window:
```powershell
cd d:\MCA\workshop_project\frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 5. Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Teacher** | `teacher@school.edu` | `password123` | Prof. Sarah Jenkins (Coordinator) |
| **Student** | `student@school.edu` | `password123` | Alex Johnson (Roll: `CS-101`) |
| **Parent** | `parent@school.edu` | `password123` | David Johnson (Parent of Alex) |

*(The login page also has 1-click **Instant Demo Login** buttons so you can sign into any role with a single click!)*


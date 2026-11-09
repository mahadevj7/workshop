const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Exam = require('./models/Exam');
const Mark = require('./models/Mark');
const Timetable = require('./models/Timetable');
const LeaveRequest = require('./models/LeaveRequest');
const Notification = require('./models/Notification');
const PTAMeeting = require('./models/PTAMeeting');
const Remark = require('./models/Remark');
const Message = require('./models/Message');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/classroom_db';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Attendance.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Exam.deleteMany({}),
      Mark.deleteMany({}),
      Timetable.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Notification.deleteMany({}),
      PTAMeeting.deleteMany({}),
      Remark.deleteMany({}),
      Message.deleteMany({})
    ]);

    console.log('Seeding initial users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Teacher
    const teacher = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'teacher@school.edu',
      password: passwordHash,
      role: 'teacher',
      phone: '+1-555-0100',
      department: 'Computer Science & Mathematics',
      designation: 'Head Teacher & Class Coordinator'
    });

    const teacher2 = await User.create({
      name: 'Dr. Robert Miller',
      email: 'miller@school.edu',
      password: passwordHash,
      role: 'teacher',
      phone: '+1-555-0105',
      department: 'Physics & Natural Sciences',
      designation: 'Senior Faculty'
    });

    // 2. Create Students
    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'student@school.edu',
      password: passwordHash,
      role: 'student',
      rollNumber: 'CS-101',
      gradeClass: 'Class 10-A',
      phone: '+1-555-0101'
    });

    const student2 = await User.create({
      name: 'Alice Cooper',
      email: 'alice@school.edu',
      password: passwordHash,
      role: 'student',
      rollNumber: 'CS-102',
      gradeClass: 'Class 10-A',
      phone: '+1-555-0102'
    });

    // 3. Create Parents
    const parent1 = await User.create({
      name: 'David Johnson',
      email: 'parent@school.edu',
      password: passwordHash,
      role: 'parent',
      phone: '+1-555-0103',
      studentRef: student1._id
    });

    const parent2 = await User.create({
      name: 'Clara Cooper',
      email: 'parent2@school.edu',
      password: passwordHash,
      role: 'parent',
      phone: '+1-555-0104',
      studentRef: student2._id
    });

    // Link student to parent
    await User.findByIdAndUpdate(student1._id, { parentRef: parent1._id });
    await User.findByIdAndUpdate(student2._id, { parentRef: parent2._id });

    // 4. Create Subjects
    console.log('Seeding subjects...');
    const sub1 = await Subject.create({
      name: 'Mathematics',
      code: 'MATH101',
      teacherRef: teacher._id,
      gradeClass: 'Class 10-A',
      description: 'Algebra, Geometry, and Trigonometry'
    });

    const sub2 = await Subject.create({
      name: 'Physics',
      code: 'PHYS101',
      teacherRef: teacher2._id,
      gradeClass: 'Class 10-A',
      description: 'Mechanics, Optics, and Thermodynamics'
    });

    const sub3 = await Subject.create({
      name: 'Computer Science',
      code: 'CS101',
      teacherRef: teacher._id,
      gradeClass: 'Class 10-A',
      description: 'Data Structures and Web Technologies'
    });

    const sub4 = await Subject.create({
      name: 'English Literature',
      code: 'ENG101',
      teacherRef: teacher._id,
      gradeClass: 'Class 10-A',
      description: 'Grammar, Prose, and Communication Skills'
    });

    // 5. Timetable
    console.log('Seeding timetable...');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = [
      { timeSlot: '09:00 AM - 10:00 AM', sub: sub1, teacher: teacher, room: 'Room 201' },
      { timeSlot: '10:15 AM - 11:15 AM', sub: sub2, teacher: teacher2, room: 'Lab 1' },
      { timeSlot: '11:30 AM - 12:30 PM', sub: sub3, teacher: teacher, room: 'Computer Lab B' },
      { timeSlot: '01:30 PM - 02:30 PM', sub: sub4, teacher: teacher, room: 'Room 201' }
    ];

    for (const d of days) {
      for (const s of slots) {
        await Timetable.create({
          day: d,
          timeSlot: s.timeSlot,
          subjectRef: s.sub._id,
          teacherRef: s.teacher._id,
          room: s.room,
          gradeClass: 'Class 10-A'
        });
      }
    }

    // 6. Attendance records
    console.log('Seeding attendance...');
    const today = new Date();
    for (let i = 10; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      // Student 1 (mostly present)
      await Attendance.create({
        studentRef: student1._id,
        subjectRef: sub1._id,
        date: d,
        status: i === 3 ? 'Absent' : i === 7 ? 'Late' : 'Present',
        markedBy: teacher._id,
        remarks: i === 3 ? 'Sick leave granted' : ''
      });

      // Student 2 (100% present)
      await Attendance.create({
        studentRef: student2._id,
        subjectRef: sub1._id,
        date: d,
        status: 'Present',
        markedBy: teacher._id
      });
    }

    // 7. Assignments & Submissions
    console.log('Seeding assignments & submissions...');
    const dueNextWeek = new Date();
    dueNextWeek.setDate(dueNextWeek.getDate() + 7);

    const asg1 = await Assignment.create({
      title: 'Polynomials & Quadratic Equations Exercise',
      subjectRef: sub1._id,
      teacherRef: teacher._id,
      description: 'Solve problems 1 through 20 on page 142. Write clear step-by-step proofs.',
      dueDate: dueNextWeek,
      maxMarks: 50,
      gradeClass: 'Class 10-A'
    });

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const asg2 = await Assignment.create({
      title: 'Newtonian Laws of Motion Case Study',
      subjectRef: sub2._id,
      teacherRef: teacher2._id,
      description: 'Write a 500-word analysis of momentum conservation with real-life friction examples.',
      dueDate: pastDate,
      maxMarks: 100,
      gradeClass: 'Class 10-A'
    });

    // Submission for student1
    await Submission.create({
      assignmentRef: asg2._id,
      studentRef: student1._id,
      content: 'Here is my complete submission with diagram representations and calculated momentum tables.',
      fileAttachment: 'https://example.com/alex-momentum-paper.pdf',
      submittedAt: new Date(Date.now() - 6 * 86400000),
      status: 'Graded',
      marksObtained: 92,
      feedback: 'Excellent explanation and accurate mathematical formulation! Keep up the brilliant work.',
      gradedBy: teacher2._id
    });

    // 8. Exams and Marks
    console.log('Seeding exams and marks...');
    const examDate1 = new Date();
    examDate1.setDate(examDate1.getDate() - 14);

    const exam1 = await Exam.create({
      title: 'Internal Assessment 1 - Mathematics',
      examType: 'Internal 1',
      subjectRef: sub1._id,
      examDate: examDate1,
      startTime: '09:30 AM',
      endTime: '11:00 AM',
      roomNumber: 'Hall 3',
      maxMarks: 50,
      createdBy: teacher._id
    });

    const examDate2 = new Date();
    examDate2.setDate(examDate2.getDate() - 10);

    const exam2 = await Exam.create({
      title: 'Internal Assessment 1 - Physics',
      examType: 'Internal 1',
      subjectRef: sub2._id,
      examDate: examDate2,
      startTime: '09:30 AM',
      endTime: '11:00 AM',
      roomNumber: 'Hall 3',
      maxMarks: 50,
      createdBy: teacher2._id
    });

    const examUpcoming = new Date();
    examUpcoming.setDate(examUpcoming.getDate() + 12);

    await Exam.create({
      title: 'Mid Term Semester Examination - Computer Science',
      examType: 'Mid Term',
      subjectRef: sub3._id,
      examDate: examUpcoming,
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      roomNumber: 'Auditorium Main',
      maxMarks: 100,
      createdBy: teacher._id
    });

    // Marks for student1
    await Mark.create({
      studentRef: student1._id,
      examRef: exam1._id,
      subjectRef: sub1._id,
      marksObtained: 46,
      maxMarks: 50,
      grade: 'A+',
      remarks: 'Outstanding performance in algebra and proofs.',
      uploadedBy: teacher._id
    });

    await Mark.create({
      studentRef: student1._id,
      examRef: exam2._id,
      subjectRef: sub2._id,
      marksObtained: 42,
      maxMarks: 50,
      grade: 'A',
      remarks: 'Good grasp of kinematics.',
      uploadedBy: teacher2._id
    });

    // 9. Leave Requests
    console.log('Seeding leave requests...');
    const leaveFrom = new Date();
    leaveFrom.setDate(leaveFrom.getDate() + 2);
    const leaveTo = new Date();
    leaveTo.setDate(leaveTo.getDate() + 3);

    await LeaveRequest.create({
      studentRef: student1._id,
      fromDate: leaveFrom,
      toDate: leaveTo,
      reason: 'Attending regional robotics science convention and coding exhibition.',
      status: 'Approved',
      adminRemarks: 'Approved. Congratulations on representing the school!',
      reviewedBy: teacher._id
    });

    // 10. Notifications
    console.log('Seeding notifications...');
    await Notification.create({
      title: 'Upcoming Mid-Term Examination Schedule Released',
      content: 'The complete timetable for the upcoming Mid-Term examinations has been published in the portal. Please review the timings and hall allocations.',
      targetAudience: 'all',
      priority: 'high',
      authorRef: teacher._id
    });

    await Notification.create({
      title: 'Parent-Teacher Conference Registration Open',
      content: 'Parents can now view the meeting agenda and confirm their availability for the semester progress evaluation meeting.',
      targetAudience: 'parents',
      priority: 'normal',
      authorRef: teacher._id
    });

    await Notification.create({
      title: 'Computer Science Practical Lab Submission Deadline',
      content: 'Students must verify all GitHub repository links for project submissions by this Friday 5:00 PM.',
      targetAudience: 'students',
      priority: 'normal',
      authorRef: teacher._id
    });

    // 11. PTA Meetings
    console.log('Seeding PTA meeting...');
    const ptaDate = new Date();
    ptaDate.setDate(ptaDate.getDate() + 5);

    await PTAMeeting.create({
      title: 'Quarter 1 Academic Progress & Career Guidance Session',
      meetingDate: ptaDate,
      time: '10:30 AM - 12:30 PM',
      venue: 'Main School Auditorium & Google Meet Stream',
      agenda: '1. Review of Class 10 Internal Assessment performance\n2. Preparation plan for board examinations\n3. Student wellbeing and extracurricular balance\n4. Q&A session with Subject Teachers',
      minutesOfMeeting: 'Previous meeting minutes approved unanimously. High emphasis on attendance consistency.',
      gradeClass: 'Class 10-A',
      createdBy: teacher._id
    });

    // 12. Remarks
    console.log('Seeding remarks...');
    await Remark.create({
      studentRef: student1._id,
      teacherRef: teacher._id,
      category: 'Academic',
      type: 'Positive',
      remarkText: 'Alex demonstrates sharp problem-solving skills in algorithmic logic and active class participation.'
    });

    await Remark.create({
      studentRef: student1._id,
      teacherRef: teacher2._id,
      category: 'Behavioral',
      type: 'Positive',
      remarkText: 'Very respectful and collaborates effectively with lab partners in physics experiments.'
    });

    // 13. Messages
    console.log('Seeding messages...');
    await Message.create({
      senderRef: parent1._id,
      recipientRef: teacher._id,
      studentRef: student1._id,
      subject: 'Inquiry regarding additional study materials for Mathematics',
      message: 'Hello Prof. Sarah, could you kindly recommend reference problem sets for Alex to practice for the upcoming olympiad?',
      reply: 'Hello Mr. David, absolutely! I will provide Alex with the advanced enrichment problem set in tomorrow morning class.',
      repliedAt: new Date(),
      status: 'Replied'
    });

    console.log(`
✅ Database seeding completed successfully!
Demo Accounts Created:
1. Teacher: teacher@school.edu / password123
2. Student: student@school.edu / password123 (Alex Johnson, Roll: CS-101)
3. Parent:  parent@school.edu  / password123 (David Johnson - Parent of Alex)
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();


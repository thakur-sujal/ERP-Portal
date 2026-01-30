require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Student, Faculty, Course, Timetable, Attendance, Grade } = require('../models');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

// Utility functions for random data generation
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Calculate grade from percentage
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B+';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    return 'F';
};

// Grade to grade point mapping
const gradePoints = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0
};

// Semester-wise course definitions (realistic B.Tech CSE curriculum)
const semesterCourses = {
    1: [
        { courseCode: '21MAB101T', courseName: 'Calculus and Linear Algebra', credits: 4 },
        { courseCode: '21PHY101T', courseName: 'Engineering Physics', credits: 3 },
        { courseCode: '21CHE101T', courseName: 'Engineering Chemistry', credits: 3 },
        { courseCode: '21CSC101T', courseName: 'Problem Solving using C', credits: 3 },
        { courseCode: '21ENG101T', courseName: 'Technical English', credits: 2 },
        { courseCode: '21PHY101L', courseName: 'Physics Laboratory', credits: 1 },
        { courseCode: '21CSC101L', courseName: 'C Programming Laboratory', credits: 1 },
        { courseCode: '21LEM101T', courseName: 'Life Skills', credits: 1 }
    ],
    2: [
        { courseCode: '21MAB102T', courseName: 'Differential Equations and Transforms', credits: 4 },
        { courseCode: '21EEE101T', courseName: 'Basic Electrical and Electronics Engineering', credits: 3 },
        { courseCode: '21CSC102T', courseName: 'Data Structures', credits: 3 },
        { courseCode: '21PHY102T', courseName: 'Semiconductor Physics', credits: 3 },
        { courseCode: '21MEE101T', courseName: 'Engineering Graphics', credits: 2 },
        { courseCode: '21CSC102L', courseName: 'Data Structures Laboratory', credits: 1 },
        { courseCode: '21EEE101L', courseName: 'Electrical Engineering Laboratory', credits: 1 },
        { courseCode: '21ENG102T', courseName: 'Employability Skills', credits: 1 }
    ],
    3: [
        { courseCode: '21MAB201T', courseName: 'Discrete Mathematics', credits: 4 },
        { courseCode: '21CSC201T', courseName: 'Digital Logic Design', credits: 3 },
        { courseCode: '21CSC202T', courseName: 'Object Oriented Programming', credits: 3 },
        { courseCode: '21CSC203T', courseName: 'Computer Organization and Architecture', credits: 3 },
        { courseCode: '21CSC204T', courseName: 'Database Management Systems', credits: 3 },
        { courseCode: '21CSC201L', courseName: 'Digital Logic Laboratory', credits: 1 },
        { courseCode: '21CSC202L', courseName: 'OOP Laboratory', credits: 1 },
        { courseCode: '21LEM201T', courseName: 'Environmental Science', credits: 2 }
    ],
    4: [
        { courseCode: '21MAB202T', courseName: 'Probability and Statistics', credits: 4 },
        { courseCode: '21CSC301T', courseName: 'Operating Systems', credits: 3 },
        { courseCode: '21CSC302T', courseName: 'Design and Analysis of Algorithms', credits: 3 },
        { courseCode: '21CSC303T', courseName: 'Computer Networks', credits: 3 },
        { courseCode: '21CSC304T', courseName: 'Theory of Computation', credits: 3 },
        { courseCode: '21CSC301L', courseName: 'OS Laboratory', credits: 1 },
        { courseCode: '21CSC303L', courseName: 'Networks Laboratory', credits: 1 },
        { courseCode: '21GNP301T', courseName: 'Universal Human Values', credits: 2 }
    ],
    5: [
        { courseCode: '21CSC401T', courseName: 'Machine Learning', credits: 3 },
        { courseCode: '21CSC402T', courseName: 'Web Technologies', credits: 3 },
        { courseCode: '21CSC403T', courseName: 'Artificial Intelligence', credits: 3 },
        { courseCode: '21CSC404T', courseName: 'Cryptography and Network Security', credits: 3 },
        { courseCode: '21CSE401T', courseName: 'Cloud Computing', credits: 3 },
        { courseCode: '21CSC401L', courseName: 'ML Laboratory', credits: 1 },
        { courseCode: '21CSC402L', courseName: 'Web Technologies Laboratory', credits: 1 },
        { courseCode: '21LEM301T', courseName: 'Indian Constitution', credits: 2 }
    ],
    6: [
        { courseCode: '21CSS303T', courseName: 'Data Science', credits: 2 },
        { courseCode: '21CSC303J', courseName: 'Software Engineering and Project Management', credits: 3 },
        { courseCode: '21CSC304J', courseName: 'Compiler Design', credits: 3 },
        { courseCode: '21CSE355T', courseName: 'Data Mining and Analytics', credits: 3 },
        { courseCode: '21CSE358T', courseName: 'Network Security and Cryptography', credits: 3 },
        { courseCode: '21CSE356T', courseName: 'Natural Language Processing', credits: 3 },
        { courseCode: '21EEO304T', courseName: 'Energy Efficient Practices', credits: 3 },
        { courseCode: '21CSP302L', courseName: 'Project', credits: 3 },
        { courseCode: '21LEM302T', courseName: 'Indian Traditional Knowledge', credits: 1 }
    ]
};

// Academic years for each semester
const academicYears = {
    1: '2023-24', 2: '2023-24',
    3: '2024-25', 4: '2024-25',
    5: '2025-26', 6: '2025-26'
};

// Generate realistic attendance for a student-course
const generateAttendanceData = (studentId, courseId, facultyId, semester, credits) => {
    const weeksPerSemester = 15;
    const hoursPerWeek = credits; // Simplified: 1 credit = 1 hour/week
    const maxHours = weeksPerSemester * hoursPerWeek;

    // Random attendance percentage between 65% and 98%
    const attendancePercent = parseFloat(randomFloat(65, 98));
    const attendedHours = Math.round((attendancePercent / 100) * maxHours);
    const absentHours = maxHours - attendedHours;

    const records = [];
    const startDate = new Date(semester <= 2 ? '2023-08-01' : semester <= 4 ? '2024-08-01' : '2025-08-01');

    // Generate individual attendance records
    for (let week = 0; week < maxHours; week++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + Math.floor(week / hoursPerWeek) * 7 + (week % hoursPerWeek));

        const isPresent = Math.random() < (attendancePercent / 100);
        records.push({
            student: studentId,
            course: courseId,
            date: date,
            status: isPresent ? 'present' : 'absent',
            markedBy: facultyId
        });
    }

    return {
        records,
        summary: {
            maxHours,
            attendedHours,
            absentHours,
            percentage: attendancePercent,
            status: attendancePercent >= 75 ? 'PASS' : 'DETAINED'
        }
    };
};

// Generate realistic grades for a student-course
const generateGradeData = (studentId, courseId, facultyId, semester, credits, studentTier) => {
    // studentTier: 'excellent' (80-98), 'good' (65-85), 'average' (50-75), 'weak' (35-60)
    const ranges = {
        excellent: { min: 80, max: 98 },
        good: { min: 65, max: 85 },
        average: { min: 50, max: 75 },
        weak: { min: 35, max: 60 }
    };

    const range = ranges[studentTier];
    const basePercentage = randomBetween(range.min, range.max);

    // Add some variation for different exam types
    const internal1Percent = Math.min(100, Math.max(0, basePercentage + randomBetween(-10, 10)));
    const internal2Percent = Math.min(100, Math.max(0, basePercentage + randomBetween(-8, 12)));
    const finalPercent = Math.min(100, Math.max(0, basePercentage + randomBetween(-5, 8)));

    return [
        {
            student: studentId,
            course: courseId,
            examType: 'internal1',
            marks: Math.round(internal1Percent * 0.5), // Out of 50
            maxMarks: 50,
            semester,
            academicYear: academicYears[semester],
            uploadedBy: facultyId
        },
        {
            student: studentId,
            course: courseId,
            examType: 'internal2',
            marks: Math.round(internal2Percent * 0.5), // Out of 50
            maxMarks: 50,
            semester,
            academicYear: academicYears[semester],
            uploadedBy: facultyId
        },
        {
            student: studentId,
            course: courseId,
            examType: 'final',
            marks: Math.round(finalPercent), // Out of 100
            maxMarks: 100,
            semester,
            academicYear: academicYears[semester],
            uploadedBy: facultyId
        }
    ];
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Student.deleteMany({}),
            Faculty.deleteMany({}),
            Course.deleteMany({}),
            Timetable.deleteMany({}),
            Attendance.deleteMany({}),
            Grade.deleteMany({})
        ]);
        console.log('✓ Cleared existing data');

        // Create Admin - Sujal Meena
        const adminUser = await User.create({
            email: 'admin@test.com',
            password: 'password123',
            firstName: 'Sujal',
            lastName: 'Meena',
            role: 'admin',
            phone: '+91 9876543210'
        });
        console.log('✓ Created admin: Sujal Meena');

        // Create Faculty
        const facultyData = [
            { email: 'faculty1@test.com', firstName: 'Ambuja', lastName: 'Kulshreshtha', empId: 'FAC001', designation: 'Assistant Professor', specialization: 'Software Engineering' },
            { email: 'faculty2@test.com', firstName: 'Rahul', lastName: 'Sharma', empId: 'FAC002', designation: 'Associate Professor', specialization: 'Data Science' },
            { email: 'faculty3@test.com', firstName: 'Priya', lastName: 'Singh', empId: 'FAC003', designation: 'Assistant Professor', specialization: 'Machine Learning' },
            { email: 'faculty4@test.com', firstName: 'Vikram', lastName: 'Patel', empId: 'FAC004', designation: 'Professor', specialization: 'Networks' }
        ];

        const facultyUsers = [];
        const facultyProfiles = [];

        for (const fd of facultyData) {
            const user = await User.create({
                email: fd.email,
                password: 'password123',
                firstName: fd.firstName,
                lastName: fd.lastName,
                role: 'faculty',
                phone: '+91 98765432' + facultyUsers.length
            });
            facultyUsers.push(user);

            const faculty = await Faculty.create({
                user: user._id,
                employeeId: fd.empId,
                department: 'Computer Science',
                designation: fd.designation,
                specialization: fd.specialization
            });
            facultyProfiles.push(faculty);
        }
        console.log('✓ Created 4 faculty members');

        // Create all courses for semesters 1-6
        const allCourses = {};
        for (let sem = 1; sem <= 6; sem++) {
            allCourses[sem] = [];
            for (const courseData of semesterCourses[sem]) {
                const course = await Course.create({
                    ...courseData,
                    department: 'Computer Science',
                    semester: sem,
                    faculty: randomChoice(facultyProfiles)._id
                });
                allCourses[sem].push(course);
            }
        }
        console.log('✓ Created courses for all 6 semesters');

        // Create Students with detailed profiles
        const studentData = [
            { email: 'student1@test.com', firstName: 'Archita', lastName: 'Shrivastava', roll: 'RA2311003030010', tier: 'excellent', dob: '2004-05-15' },
            { email: 'student2@test.com', firstName: 'Hardik', lastName: 'Shrivastava', roll: 'RA2311003030015', tier: 'good', dob: '2004-08-22' },
            { email: 'student3@test.com', firstName: 'Poorvi', lastName: 'Mathur', roll: 'RA2311003030020', tier: 'excellent', dob: '2004-03-10' },
            { email: 'student4@test.com', firstName: 'Suryansh', lastName: 'Agarwal', roll: 'RA2311003030011', tier: 'good', dob: '2004-11-28' },
            { email: 'student5@test.com', firstName: 'Divya', lastName: 'Barnwal', roll: 'RA2311003030007', tier: 'average', dob: '2004-07-03' }
        ];

        const students = [];
        for (const sd of studentData) {
            const user = await User.create({
                email: sd.email,
                password: 'password123',
                firstName: sd.firstName,
                lastName: sd.lastName,
                role: 'student'
            });

            // Enroll in current semester (6) courses
            const student = await Student.create({
                user: user._id,
                rollNumber: sd.roll,
                department: 'Computer Science',
                semester: 6,
                batch: '2023-2027',
                enrolledCourses: allCourses[6].map(c => c._id),
                dateOfBirth: new Date(sd.dob),
                parentName: `Mr. ${sd.lastName}`,
                parentPhone: '+91 98' + randomBetween(10000000, 99999999)
            });
            students.push({ ...student.toObject(), tier: sd.tier, userId: user._id });
        }
        console.log('✓ Created 5 students');

        // Generate attendance and grades for all students across all 6 semesters
        let totalAttendance = 0;
        let totalGrades = 0;

        for (const student of students) {
            console.log(`\n  Generating data for ${student.rollNumber}...`);

            for (let sem = 1; sem <= 6; sem++) {
                const semCourses = allCourses[sem];

                for (const course of semCourses) {
                    // Generate attendance
                    const attendanceData = generateAttendanceData(
                        student._id,
                        course._id,
                        course.faculty,
                        sem,
                        course.credits
                    );

                    // Insert attendance records in batches
                    if (attendanceData.records.length > 0) {
                        await Attendance.insertMany(attendanceData.records);
                        totalAttendance += attendanceData.records.length;
                    }

                    // Generate grades
                    const gradeData = generateGradeData(
                        student._id,
                        course._id,
                        course.faculty,
                        sem,
                        course.credits,
                        student.tier
                    );

                    for (const grade of gradeData) {
                        try {
                            await Grade.create(grade);
                            totalGrades++;
                        } catch (err) {
                            // Skip duplicates
                        }
                    }
                }
            }
            console.log(`    ✓ Completed data generation`);
        }

        // Create Timetable for current semester (6)
        const sem6Courses = allCourses[6];
        await Timetable.insertMany([
            // MONDAY
            { course: sem6Courses[0]._id, faculty: sem6Courses[0].faculty, dayOfWeek: 'monday', startTime: '9:30 AM', endTime: '10:20 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[1]._id, faculty: sem6Courses[1].faculty, dayOfWeek: 'monday', startTime: '10:20 AM', endTime: '11:10 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[2]._id, faculty: sem6Courses[2].faculty, dayOfWeek: 'monday', startTime: '11:20 AM', endTime: '12:10 PM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[3]._id, faculty: sem6Courses[3].faculty, dayOfWeek: 'monday', startTime: '2:10 PM', endTime: '3:00 PM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            // TUESDAY
            { course: sem6Courses[4]._id, faculty: sem6Courses[4].faculty, dayOfWeek: 'tuesday', startTime: '9:30 AM', endTime: '10:20 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[5]._id, faculty: sem6Courses[5].faculty, dayOfWeek: 'tuesday', startTime: '10:20 AM', endTime: '11:10 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[6]._id, faculty: sem6Courses[6].faculty, dayOfWeek: 'tuesday', startTime: '11:20 AM', endTime: '12:10 PM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            // WEDNESDAY
            { course: sem6Courses[7]._id, faculty: sem6Courses[7].faculty, dayOfWeek: 'wednesday', startTime: '9:30 AM', endTime: '11:10 AM', room: 'Lab C-4', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[8]._id, faculty: sem6Courses[8].faculty, dayOfWeek: 'wednesday', startTime: '11:20 AM', endTime: '12:10 PM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            // THURSDAY
            { course: sem6Courses[0]._id, faculty: sem6Courses[0].faculty, dayOfWeek: 'thursday', startTime: '9:30 AM', endTime: '10:20 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[1]._id, faculty: sem6Courses[1].faculty, dayOfWeek: 'thursday', startTime: '10:20 AM', endTime: '11:10 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[2]._id, faculty: sem6Courses[2].faculty, dayOfWeek: 'thursday', startTime: '11:20 AM', endTime: '1:00 PM', room: 'Lab C-12', department: 'Computer Science', semester: 6 },
            // FRIDAY
            { course: sem6Courses[3]._id, faculty: sem6Courses[3].faculty, dayOfWeek: 'friday', startTime: '9:30 AM', endTime: '10:20 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[4]._id, faculty: sem6Courses[4].faculty, dayOfWeek: 'friday', startTime: '10:20 AM', endTime: '11:10 AM', room: 'LH 415', department: 'Computer Science', semester: 6 },
            { course: sem6Courses[5]._id, faculty: sem6Courses[5].faculty, dayOfWeek: 'friday', startTime: '11:20 AM', endTime: '12:10 PM', room: 'LH 415', department: 'Computer Science', semester: 6 }
        ]);
        console.log('\n✓ Created timetable for Semester 6');

        // Summary
        console.log('\n' + '═'.repeat(60));
        console.log('              DATABASE SEEDED SUCCESSFULLY!');
        console.log('═'.repeat(60));
        console.log('\n📊 DATA SUMMARY:');
        console.log(`   • Students: 5`);
        console.log(`   • Faculty: 4`);
        console.log(`   • Courses: ${Object.values(allCourses).flat().length} (across 6 semesters)`);
        console.log(`   • Attendance Records: ${totalAttendance}`);
        console.log(`   • Grade Records: ${totalGrades}`);

        console.log('\n🔐 LOGIN CREDENTIALS:');
        console.log('   Admin: admin@test.com / password123');
        console.log('   Faculty: faculty1@test.com / password123');
        console.log('   Student: student1@test.com / password123');

        console.log('\n📚 SEMESTERS DATA:');
        for (let sem = 1; sem <= 6; sem++) {
            console.log(`   Semester ${sem}: ${semesterCourses[sem].length} courses (${academicYears[sem]})`);
        }

        console.log('\n🎓 STUDENTS:');
        studentData.forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.firstName} ${s.lastName} (${s.roll}) - ${s.tier} performer`);
        });

        console.log('\n' + '═'.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();

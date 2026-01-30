# 🎓 College ERP Portal

A comprehensive Enterprise Resource Planning system for educational institutions built with the **MERN Stack** (MongoDB, Express.js, React, Node.js).

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 👤 Student Portal
- View personal profile and enrolled courses
- Check attendance records with percentage
- View grades and CGPA calculation
- Access class timetable

### 👨‍🏫 Faculty Portal
- Manage assigned courses
- Mark student attendance
- Upload and manage grades
- View teaching schedule

### 🛡️ Admin Dashboard
- User management (CRUD operations)
- Course management
- Timetable scheduling
- Analytics and reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd "smart campus "
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment**
   ```bash
   # In server folder, update .env file
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/college_erp
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRE=7d
   ```

5. **Seed the database** (optional but recommended)
   ```bash
   cd server
   npm run seed
   ```

6. **Start the application**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 Test Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | password123 |
| Faculty | faculty1@test.com | password123 |
| Student | student1@test.com | password123 |

## 📁 Project Structure

```
college-erp/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main App
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── config/            # Database config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & error handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── seeds/             # Database seeders
│   ├── server.js          # Entry point
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id/attendance` - Get attendance
- `GET /api/students/:id/grades` - Get grades

### Faculty
- `GET /api/faculty` - Get all faculty
- `GET /api/faculty/:id/courses` - Get courses
- `POST /api/attendance/mark` - Mark attendance
- `POST /api/grades/upload` - Upload grades

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course

### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable` - Create schedule (Admin)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Redux Toolkit |
| Styling | CSS (Dark Theme with Glassmorphism) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Charts | Recharts |

## 📄 License

This project is licensed under the MIT License.

---

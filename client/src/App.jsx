import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import MarkAttendance from './pages/faculty/Attendance';
import UploadGrades from './pages/faculty/Grades';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';

// Common Pages
import Timetable from './pages/common/Timetable';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="students" element={<UserManagement />} />
            <Route path="faculty" element={<UserManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="timetable" element={<Timetable role="admin" />} />
            <Route path="analytics" element={<AdminDashboard />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="courses" element={<FacultyDashboard />} />
            <Route path="attendance" element={<MarkAttendance />} />
            <Route path="grades" element={<UploadGrades />} />
            <Route path="timetable" element={<Timetable role="faculty" />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentDashboard />} />
            <Route path="grades" element={<StudentDashboard />} />
            <Route path="timetable" element={<Timetable role="student" />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
        success: { iconTheme: { primary: 'var(--color-success)', secondary: 'white' } },
        error: { iconTheme: { primary: 'var(--color-error)', secondary: 'white' } }
      }} />
    </Provider>
  );
}

export default App;

import api from './api';

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    updateDetails: (data) => api.put('/auth/updatedetails', data),
    updatePassword: (data) => api.put('/auth/updatepassword', data)
};

export const studentService = {
    getAll: (params) => api.get('/students', { params }),
    getById: (id) => api.get(`/students/${id}`),
    getByUserId: (userId) => api.get(`/students/user/${userId}`),
    update: (id, data) => api.put(`/students/${id}`, data),
    getAttendance: (id, params) => api.get(`/students/${id}/attendance`, { params }),
    getGrades: (id, params) => api.get(`/students/${id}/grades`, { params }),
    enroll: (id, courseIds) => api.post(`/students/${id}/enroll`, { courseIds })
};

export const facultyService = {
    getAll: (params) => api.get('/faculty', { params }),
    getById: (id) => api.get(`/faculty/${id}`),
    getByUserId: (userId) => api.get(`/faculty/user/${userId}`),
    getCourses: (id) => api.get(`/faculty/${id}/courses`),
    getStudents: (id) => api.get(`/faculty/${id}/students`),
    assignCourses: (id, courseIds) => api.post(`/faculty/${id}/assign-courses`, { courseIds })
};

export const courseService = {
    getAll: (params) => api.get('/courses', { params }),
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
    getStudents: (id) => api.get(`/courses/${id}/students`),
    addMaterial: (id, data) => api.post(`/courses/${id}/materials`, data)
};

export const attendanceService = {
    mark: (data) => api.post('/attendance/mark', data),
    getByCourse: (courseId, params) => api.get(`/attendance/course/${courseId}`, { params }),
    getByStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
    getSummary: (courseId) => api.get(`/attendance/summary/${courseId}`),
    update: (id, data) => api.put(`/attendance/${id}`, data)
};

export const gradeService = {
    upload: (data) => api.post('/grades/upload', data),
    getByCourse: (courseId, params) => api.get(`/grades/course/${courseId}`, { params }),
    getByStudent: (studentId, params) => api.get(`/grades/student/${studentId}`, { params }),
    update: (id, data) => api.put(`/grades/${id}`, data)
};

export const timetableService = {
    getAll: (params) => api.get('/timetable', { params }),
    create: (data) => api.post('/timetable', data),
    update: (id, data) => api.put(`/timetable/${id}`, data),
    delete: (id) => api.delete(`/timetable/${id}`)
};

export const analyticsService = {
    getOverview: () => api.get('/analytics/overview'),
    getAttendance: () => api.get('/analytics/attendance'),
    getGrades: () => api.get('/analytics/grades')
};

export const userService = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    toggleStatus: (id) => api.put(`/users/${id}/toggle-status`)
};

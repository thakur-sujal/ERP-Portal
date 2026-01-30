/**
 * API Client - Fetch wrapper with JWT authentication
 */

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Make an authenticated API request
 */
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * API methods
 */
export const api = {
    get: (endpoint, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return request(url, { method: 'GET' });
    },

    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),

    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),

    delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

/**
 * Service functions matching React services
 */
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me')
};

export const studentService = {
    getAll: (params) => api.get('/students', params),
    getById: (id) => api.get(`/students/${id}`),
    getAttendance: (id, params) => api.get(`/students/${id}/attendance`, params),
    getGrades: (id, params) => api.get(`/students/${id}/grades`, params)
};

export const facultyService = {
    getAll: (params) => api.get('/faculty', params),
    getById: (id) => api.get(`/faculty/${id}`),
    getCourses: (id) => api.get(`/faculty/${id}/courses`),
    getStudents: (id) => api.get(`/faculty/${id}/students`)
};

export const courseService = {
    getAll: (params) => api.get('/courses', params),
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
    getStudents: (id) => api.get(`/courses/${id}/students`)
};

export const attendanceService = {
    mark: (data) => api.post('/attendance/mark', data),
    getByCourse: (courseId, params) => api.get(`/attendance/course/${courseId}`, params),
    getByStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, params),
    getSummary: (courseId) => api.get(`/attendance/summary/${courseId}`)
};

export const gradeService = {
    upload: (data) => api.post('/grades/upload', data),
    getByCourse: (courseId, params) => api.get(`/grades/course/${courseId}`, params),
    getByStudent: (studentId, params) => api.get(`/grades/student/${studentId}`, params)
};

export const timetableService = {
    getAll: (params) => api.get('/timetable', params),
    create: (data) => api.post('/timetable', data),
    update: (id, data) => api.put(`/timetable/${id}`, data),
    delete: (id) => api.delete(`/timetable/${id}`)
};

export const analyticsService = {
    getOverview: () => api.get('/analytics/overview')
};

export const userService = {
    getAll: (params) => api.get('/users', params),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
};

/**
 * Reusable Component Rendering Functions
 */

import { icons, icon } from './icons.js';
import { getUser, logout } from './auth.js';

/**
 * Render sidebar navigation
 */
export function renderSidebar(role, activePage = 'dashboard') {
    const user = getUser();

    const navItems = {
        admin: [
            { id: 'dashboard', label: 'Dashboard', icon: 'layoutDashboard', href: '/admin/dashboard.html' },
            { id: 'users', label: 'User Management', icon: 'users', href: '/admin/users.html' },
            { id: 'courses', label: 'Courses', icon: 'bookOpen', href: '/admin/courses.html' },
            { id: 'attendance', label: 'Attendance', icon: 'clipboardList', href: '/admin/attendance.html' },
            { id: 'timetable', label: 'Timetable', icon: 'calendar', href: '/timetable.html' }
        ],
        faculty: [
            { id: 'dashboard', label: 'Dashboard', icon: 'layoutDashboard', href: '/faculty/dashboard.html' },
            { id: 'attendance', label: 'Mark Attendance', icon: 'clipboardList', href: '/faculty/attendance.html' },
            { id: 'grades', label: 'Upload Grades', icon: 'award', href: '/faculty/grades.html' },
            { id: 'timetable', label: 'Timetable', icon: 'calendar', href: '/timetable.html' }
        ],
        student: [
            { id: 'dashboard', label: 'Dashboard', icon: 'layoutDashboard', href: '/student/dashboard.html' },
            { id: 'attendance', label: 'My Attendance', icon: 'clipboardList', href: '/student/attendance.html' },
            { id: 'grades', label: 'My Grades', icon: 'award', href: '/student/grades.html' },
            { id: 'timetable', label: 'Timetable', icon: 'calendar', href: '/timetable.html' }
        ]
    };

    const items = navItems[role] || navItems.student;

    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <span class="logo-icon">${icon('graduationCap', 28)}</span>
                    <span class="logo-text">EduERP</span>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <ul class="nav-list">
                    ${items.map(item => `
                        <li>
                            <a href="${item.href}" class="nav-link ${activePage === item.id ? 'active' : ''}">
                                ${icon(item.icon)}
                                <span>${item.label}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        ${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}
                    </div>
                    <div class="user-details">
                        <span class="user-name">${user?.firstName || ''} ${user?.lastName || ''}</span>
                        <span class="user-role">${user?.role || ''}</span>
                    </div>
                </div>
                <button class="logout-btn" onclick="window.appLogout()">
                    ${icon('logOut')}
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    `;
}

// Make logout accessible globally
window.appLogout = logout;

/**
 * Render stat card
 */
export function renderStatCard(title, value, iconName, color = 'primary') {
    return `
        <div class="stat-card glass-card">
            <div class="stat-icon ${color}">
                ${icon(iconName, 24)}
            </div>
            <div class="stat-content">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${title}</div>
            </div>
        </div>
    `;
}

/**
 * Render card with title
 */
export function renderCard(title, content, actions = '') {
    return `
        <div class="card glass-card">
            <div class="card-header">
                <h3 class="card-title">${title}</h3>
                ${actions}
            </div>
            <div class="card-content">
                ${content}
            </div>
        </div>
    `;
}

/**
 * Render modal
 */
export function renderModal(id, title, content, size = 'medium') {
    return `
        <div id="${id}" class="modal-overlay hidden">
            <div class="modal-content ${size}">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="closeModal('${id}')">
                        ${icon('x')}
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

/**
 * Show/hide modal
 */
export function showModal(id) {
    document.getElementById(id)?.classList.remove('hidden');
}

export function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
}

// Make modal functions global
window.showModal = showModal;
window.closeModal = closeModal;

/**
 * Render loading spinner
 */
export function renderLoader() {
    return `
        <div class="page-loader">
            <div class="spinner"></div>
        </div>
    `;
}

/**
 * Render empty state
 */
export function renderEmptyState(message = 'No data available') {
    return `
        <div class="empty-state">
            <p>${message}</p>
        </div>
    `;
}

/**
 * Render badge
 */
export function renderBadge(text, type = 'primary') {
    return `<span class="badge badge-${type}">${text}</span>`;
}

/**
 * Render data table
 */
export function renderTable(headers, rows, emptyMessage = 'No data available') {
    if (!rows || rows.length === 0) {
        return renderEmptyState(emptyMessage);
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.join('')}
            </tbody>
        </table>
    `;
}

/**
 * Render input field
 */
export function renderInput(label, name, type = 'text', placeholder = '', value = '', required = false) {
    return `
        <div class="input-group">
            <label class="input-label" for="${name}">${label}</label>
            <div class="input-wrapper">
                <input 
                    type="${type}" 
                    id="${name}" 
                    name="${name}" 
                    class="input-field" 
                    placeholder="${placeholder}"
                    value="${value}"
                    ${required ? 'required' : ''}
                >
            </div>
        </div>
    `;
}

/**
 * Render select field
 */
export function renderSelect(label, name, options, selectedValue = '', required = false) {
    return `
        <div class="input-group">
            <label class="input-label" for="${name}">${label}</label>
            <select id="${name}" name="${name}" class="select-field" ${required ? 'required' : ''}>
                <option value="">Select ${label}</option>
                ${options.map(opt => `
                    <option value="${opt.value}" ${opt.value === selectedValue ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
}

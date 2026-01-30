/**
 * Authentication Module
 * Handles user state, login, logout, and route protection
 */

import { authService } from './api.js';
import { showToast } from './toast.js';

/**
 * Get current user from localStorage
 */
export function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

/**
 * Get token from localStorage
 */
export function getToken() {
    return localStorage.getItem('token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getToken() && !!getUser();
}

/**
 * Login user
 */
export async function login(email, password) {
    try {
        const data = await authService.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Register user
 */
export async function register(userData) {
    try {
        const data = await authService.register(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Logout user
 */
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

/**
 * Get current user's full profile (including student/faculty data)
 */
export async function getProfile() {
    try {
        const data = await authService.getMe();
        return data;
    } catch (error) {
        console.error('Failed to get profile:', error);
        return null;
    }
}

/**
 * Check authentication and redirect if not logged in
 * Call this at the top of protected pages
 */
export function requireAuth(allowedRoles = []) {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }

    const user = getUser();
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        showToast('Access denied', 'error');
        window.location.href = `/${user.role}/dashboard.html`;
        return false;
    }

    return true;
}

/**
 * Redirect to appropriate dashboard based on role
 */
export function redirectToDashboard() {
    const user = getUser();
    if (user) {
        window.location.href = `/${user.role}/dashboard.html`;
    } else {
        window.location.href = '/login.html';
    }
}

/**
 * Check if already logged in and redirect (for auth pages)
 */
export function redirectIfLoggedIn() {
    if (isAuthenticated()) {
        redirectToDashboard();
        return true;
    }
    return false;
}

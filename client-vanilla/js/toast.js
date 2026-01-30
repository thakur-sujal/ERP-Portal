/**
 * Toast Notification System
 */

let toastContainer = null;

/**
 * Initialize toast container
 */
function initToastContainer() {
    if (toastContainer) return;

    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    `;
    document.body.appendChild(toastContainer);
}

/**
 * Show a toast notification
 */
export function showToast(message, type = 'info', duration = 3000) {
    initToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const colors = {
        success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', icon: '✓' },
        error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', icon: '✕' },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', icon: '⚠' },
        info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', icon: 'ℹ' }
    };

    const color = colors[type] || colors.info;

    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--bg-secondary, #1e293b);
        border: 1px solid ${color.border};
        border-radius: 8px;
        color: var(--text-primary, #f8fafc);
        font-size: 0.875rem;
        animation: slideIn 0.3s ease-out;
        min-width: 280px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    toast.innerHTML = `
        <span style="
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${color.bg};
            border-radius: 50%;
            color: ${color.border};
            font-size: 0.75rem;
        ">${color.icon}</span>
        <span style="flex: 1;">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Add slide animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    if (!document.getElementById('toast-styles')) {
        style.id = 'toast-styles';
        document.head.appendChild(style);
    }

    // Remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Convenience methods
export const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    warning: (msg) => showToast(msg, 'warning'),
    info: (msg) => showToast(msg, 'info')
};

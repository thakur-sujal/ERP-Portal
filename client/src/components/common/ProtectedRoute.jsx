import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to={`/${user?.role}`} replace />;
    }

    return children;
}

export function PublicRoute({ children }) {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    if (isAuthenticated) {
        return <Navigate to={`/${user?.role}`} replace />;
    }

    return children;
}

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Wrap a route element to restrict access to specific roles.
 * Usage: <RoleRoute roles={[ROLES.ADMIN]}><Component /></RoleRoute>
 */
const RoleRoute = ({ roles, children, fallback = '/' }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to={fallback} replace />;
    }

    return children;
};

export default RoleRoute;

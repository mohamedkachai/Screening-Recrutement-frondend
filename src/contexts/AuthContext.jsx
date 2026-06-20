import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { getCurrentUser } from "../api/auth";
import { ROLES } from "../constants/enums";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('auth-token') || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(localStorage.getItem('auth-token')));

    const refreshUser = useCallback(async () => {
        try {
            const response = await getCurrentUser();
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            console.log(error?.response?.data?.message);
            return null;
        }
    }, []);

    useEffect(() => {
        async function fetchMe() {
            await refreshUser();
            setLoading(false);
        }
        if (token) {
            setLoading(true);
            localStorage.setItem('auth-token', token);
            fetchMe();
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [token, refreshUser]);

    const logout = useCallback(() => {
        localStorage.removeItem('auth-token');
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback((newToken) => {
        // Set localStorage immediately so axios interceptor can read it before useEffect runs
        localStorage.setItem('auth-token', newToken);
        // Batch both updates: loading=true prevents RoleRoute from redirecting to /login
        // before the user fetch completes
        setLoading(true);
        setToken(newToken);
    }, []);

    const value = useMemo(() => {
        const role = user?.role || null;
        const hasRole = (...roles) => Boolean(role) && roles.includes(role);
        return {
            token,
            setToken,
            user,
            setUser,
            loading,
            role,
            isAdmin: role === ROLES.ADMIN,
            isHR: role === ROLES.HR,
            isReviewer: role === ROLES.REVIEWER,
            isCandidate: role === ROLES.CANDIDATE,
            hasRole,
            refreshUser,
            login,
            logout,
        };
    }, [token, user, loading, refreshUser, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

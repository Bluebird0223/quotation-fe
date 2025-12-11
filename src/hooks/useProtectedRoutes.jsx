import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Redirect to login or handle unauthorized access
            console.log('User not authenticated');
        }
    }, [isAuthenticated, loading]);

    return { isAuthenticated, loading };
};
import React, { createContext, useState, useContext, useEffect, useLayoutEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('quotationToken');
        const userDetails = localStorage.getItem('userDetails');

        if (token && userDetails) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userDetails)); // Parse the user details
        }
        setLoading(false);
    }, []);

    const login = (responseData) => {
        localStorage.setItem('quotationToken', responseData?.token);
        localStorage.setItem('userDetails', JSON.stringify(responseData?.userDetails));
        setIsAuthenticated(true);
        setUser(responseData.userDetails);
    };

    const logout = () => {
        localStorage.removeItem('quotationToken');
        localStorage.removeItem('userDetails');
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if the token exists in local storage
    const token = localStorage.getItem('token');

    // If there is no token, redirect to login page. Otherwise, render the child routes (Outlet).
    return token ? <Outlet /> : <Navigate to="/user-login" replace />;
};

export default ProtectedRoute;
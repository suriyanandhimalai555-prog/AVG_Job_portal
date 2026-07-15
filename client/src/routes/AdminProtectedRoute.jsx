import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
    // Check if the admin token exists in local storage
    const adminToken = localStorage.getItem('adminToken');

    // If there is no token, redirect to the admin login page. Otherwise, render the child routes (Outlet).
    return adminToken ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminProtectedRoute;
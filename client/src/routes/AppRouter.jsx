import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public & User Auth Imports
import Index from "../pages/website/Index";

// User Dashboard Imports
import UserLayout from "../layouts/UserLayout";
import UserDashboard from "../pages/user/UserDashboard";
import UserDirectory from "../pages/user/UserDirectory";
import UserJobs from "../pages/user/UserJobs";
import UserAcademy from "../pages/user/UserAcademy";
import UserReferral from "../pages/user/UserReferral";
import UserProfile from "../pages/user/UserProfile";
import ProtectedRoute from "./ProtectedRoute";
import UserLogin from "../pages/auth/UserLogin";
import UserRegister from "../pages/auth/UserRegister";

// Admin Dashboard Imports
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminJobs from "../pages/admin/AdminJobs";
import AdminDirectory from "../pages/admin/AdminDirectory";
import AdminAcademy from "../pages/admin/AdminAcademy";
import AdminLogin from "../pages/auth/AdminLogin";
import AdminProtectedRoute from "./AdminProtectedRoute";


const AppRouter = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />

                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/user-login" element={<UserLogin />} />
                <Route path="/user-register" element={<UserRegister />} />

                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/user-dashboard" element={<UserLayout />}>
                        <Route index element={<UserDashboard />} />
                        <Route path="directory" element={<UserDirectory />} />
                        <Route path="jobs" element={<UserJobs />} />
                        <Route path="academy" element={<UserAcademy />} />
                        <Route path="refer" element={<UserReferral />} />
                        <Route path="profile" element={<UserProfile />} />
                    </Route>
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin-dashboard" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="jobs" element={<AdminJobs />} />
                        <Route path="directory" element={<AdminDirectory />} />
                        <Route path="academy" element={<AdminAcademy />} />
                        {/* Add settings route if needed */}
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;
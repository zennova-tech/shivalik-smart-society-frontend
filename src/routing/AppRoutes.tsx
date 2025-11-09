import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { BuildingDetailsPage } from '../pages/BuildingDetailsPage';
import { FloorsPage } from '../pages/building-details/FloorsPage';
import { BlocksPage } from '../pages/building-details/BlocksPage';
import { UnitsPage } from '../pages/building-details/UnitsPage';
import { NoticeBoardPage } from '../pages/building-details/NoticeBoardPage';
import SocietyManagement from '../pages/society-management/SocietyManagement';
import { MembersPage } from '../pages/users/MembersPage';
import CommitteeMembersPage from '../pages/users/CommitteeMembersPage';
import EmployeesPage from '../pages/employees/EmployeesPage';

/* current user roles */
const getUserRoles = (): string => {
  try {
    const info = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
    return info.role;
  } catch {
    return "Guest";
  }
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const role = getUserRoles();

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== "/" && location.pathname !== "") {
    return null; // let the child route render
  }

  // Find the first matching default route
  const defaultRoute = role?.toLowerCase() === "superadmin" 
    ? "/society-management" 
    : "/dashboard";
  return <Navigate to={defaultRoute} replace />;
};

/* ────── Main router ────── */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/otp"
        element={
          <PublicRoute>
            <OtpPage />
          </PublicRoute>
        }
      />

      {/* Private Route */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Default entry point – decides where to go based on current role */}
        <Route index element={<RedirectByRole />} />

        {/* All private pages  */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="society-management" element={<SocietyManagement />} />
        
        {/* Building Settings Routes */}
        <Route path="building-settings/building-details" element={<BuildingDetailsPage />} />
        <Route path="building-settings/floors" element={<FloorsPage />} />
        <Route path="building-settings/blocks" element={<BlocksPage />} />
        <Route path="building-settings/units" element={<UnitsPage />} />
        <Route path="building-settings/notice-board" element={<NoticeBoardPage />} />
        
        {/* Users Routes */}
        <Route path="users/members" element={<MembersPage />} />
        
        {/* Employees Routes */}
        <Route path="users/society-employee" element={<EmployeesPage />} />
        <Route path="users/committee-member" element={<CommitteeMembersPage />} />
        
        {/* Legacy routes for backward compatibility - redirect to new paths */}
        <Route path="building-details" element={<Navigate to="/building-settings/building-details" replace />} />
        <Route path="floors" element={<Navigate to="/building-settings/floors" replace />} />
        <Route path="blocks" element={<Navigate to="/building-settings/blocks" replace />} />
        <Route path="units" element={<Navigate to="/building-settings/units" replace />} />
        <Route path="notice-board" element={<Navigate to="/building-settings/notice-board" replace />} />

        {/* Catch-all inside private area (keeps the layout) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

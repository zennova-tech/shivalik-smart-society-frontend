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
import { AmenitiesPage } from '../pages/building-details/AmenitiesPage';
import { ParkingPage } from '../pages/building-details/ParkingPage';
import SocietyManagement from '../pages/society-management/SocietyManagement';

/* current user roles */
const getUserRoles = (): string => {
  try {
    const info = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
    // Check for role in multiple formats: role, userRoles array, or roles array
    if (info.role) {
      return info.role;
    }
    if (Array.isArray(info.userRoles) && info.userRoles.length > 0) {
      return info.userRoles[0]; // Return first role from array
    }
    if (Array.isArray(info.roles) && info.roles.length > 0) {
      return info.roles[0]; // Return first role from array
    }
    return "Guest";
  } catch {
    return "Guest";
  }
};

/* Component that decides where to redirect based on role */
const getDefaultRouteByRole = (): string => {
  const role = getUserRoles();
  // Handle both "superadmin" and "SuperAdmin" formats
  const normalizedRole = role?.toLowerCase() || "";
  return normalizedRole === "superadmin" || normalizedRole.includes("superadmin")
    ? "/society-management" 
    : "/dashboard";
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== "/" && location.pathname !== "") {
    return null; // let the child route render
  }

  // Check if a society is selected
  try {
    const selectedSociety = localStorage.getItem("selectedSociety");
    if (selectedSociety) {
      // If society is selected, go to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  } catch (error) {
    console.error("Error checking selected society:", error);
  }

  // If no society is selected, redirect to society-management to select one
  return <Navigate to="/society-management" replace />;
};

/* Component that redirects unmatched routes within private area */
const CatchAllRedirect = () => {
  const defaultRoute = getDefaultRouteByRole();
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
        <Route path="building-settings/amenities" element={<AmenitiesPage />} />
        <Route path="building-settings/parking" element={<ParkingPage />} />
        
        {/* Legacy routes for backward compatibility - redirect to new paths */}
        <Route path="building-details" element={<Navigate to="/building-settings/building-details" replace />} />
        <Route path="floors" element={<Navigate to="/building-settings/floors" replace />} />
        <Route path="blocks" element={<Navigate to="/building-settings/blocks" replace />} />
        <Route path="units" element={<Navigate to="/building-settings/units" replace />} />
        <Route path="notice-board" element={<Navigate to="/building-settings/notice-board" replace />} />
        <Route path="amenities" element={<Navigate to="/building-settings/amenities" replace />} />
        <Route path="parking" element={<Navigate to="/building-settings/parking" replace />} />
        
        {/* <Route path="users" element={<PeoplePage />} /> */}

        {/* Catch-all inside private area (keeps the layout) - redirect based on role */}
        <Route path="*" element={<CatchAllRedirect />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

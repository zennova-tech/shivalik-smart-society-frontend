import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { ProtectedSocietyRoute } from './ProtectedSocietyRoute';
import { ProtectedDashboardRoute } from './ProtectedDashboardRoute';
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
import { MembersPage } from '../pages/users/MembersPage';
import {CommitteeMembersPage} from '../pages/users/CommitteeMembersPage';
import {EmployeesPage} from '../pages/users/EmployeesPage';
import { UserRequestPage } from '../pages/users/UserRequestPage';
import { SelectTypePage } from '../pages/user-registration/SelectTypePage';
import { SelectSocietyPage } from '../pages/user-registration/SelectSocietyPage';
import { SelectBlockPage } from '../pages/user-registration/SelectBlockPage';
import { SelectUnitPage } from '../pages/user-registration/SelectUnitPage';
import { RegistrationFormPage } from '../pages/user-registration/RegistrationFormPage';
import { AddBillPage } from '../pages/maintenance-bill/AddBillPage';
import { ViewBillsPage } from '../pages/maintenance-bill/ViewBillsPage';
import { ComplaintsPage } from '../pages/complaints/ComplaintsPage';
import { AddComplaintPage } from '../pages/complaints/AddComplaintPage';

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
  // SuperAdmin always goes to society-management, others go to dashboard
  return normalizedRole === "superadmin" || normalizedRole.includes("superadmin")
    ? "/society-management" 
    : "/dashboard";
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const role = getUserRoles();
  const normalizedRole = role?.toLowerCase() || "";

  console.log("RedirectByRole - Pathname:", location.pathname, "Role:", role);

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== "/" && location.pathname !== "") {
    console.log("RedirectByRole - Already on a valid path, staying there");
    return null; // let the child route render
  }

  // Only superadmin needs to select a society
  // SuperAdmin always goes to society-management page first
  // Managers and other roles are assigned to a society by admin, so go directly to dashboard
  if (normalizedRole === "superadmin" || normalizedRole.includes("superadmin")) {
    // SuperAdmin always redirected to society-management page first
    console.log("RedirectByRole - Redirecting SuperAdmin to society-management");
    return <Navigate to="/society-management" replace />;
  }

  // For all other roles (manager, member, etc.), go directly to dashboard
  // They don't need to select a society as admin assigns them to one
  console.log("RedirectByRole - Redirecting non-superadmin to dashboard");
  return <Navigate to="/dashboard" replace />;
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

      {/* User Registration Routes - Public */}
      <Route
        path="/user/register/type"
        element={
          <PublicRoute>
            <SelectTypePage />
          </PublicRoute>
        }
      />
      <Route
        path="/user/register/society"
        element={
          <PublicRoute>
            <SelectSocietyPage />
          </PublicRoute>
        }
      />
      <Route
        path="/user/register/block"
        element={
          <PublicRoute>
            <SelectBlockPage />
          </PublicRoute>
        }
      />
      <Route
        path="/user/register/unit"
        element={
          <PublicRoute>
            <SelectUnitPage />
          </PublicRoute>
        }
      />
      <Route
        path="/user/register/details"
        element={
          <PublicRoute>
            <RegistrationFormPage />
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
        <Route
          path="dashboard"
          element={
            <ProtectedDashboardRoute>
              <DashboardPage />
            </ProtectedDashboardRoute>
          }
        />
        <Route
          path="society-management"
          element={
            <ProtectedSocietyRoute>
              <SocietyManagement />
            </ProtectedSocietyRoute>
          }
        />
        
        {/* Building Settings Routes */}
        <Route path="building-settings/building-details" element={<BuildingDetailsPage />} />
        <Route path="building-settings/floors" element={<FloorsPage />} />
        <Route path="building-settings/blocks" element={<BlocksPage />} />
        <Route path="building-settings/units" element={<UnitsPage />} />
        <Route path="building-settings/notice-board" element={<NoticeBoardPage />} />
        <Route path="building-settings/amenities" element={<AmenitiesPage />} />
        <Route path="building-settings/parking" element={<ParkingPage />} />
        
        {/* Users Routes */}
        <Route path="users" element={<Navigate to="/users/members" replace />} />
        <Route path="users/members" element={<MembersPage />} />
        <Route path="users/society-employee" element={<EmployeesPage />} />
        <Route path="users/committee-member" element={<CommitteeMembersPage />} />
        <Route path="users/user-request" element={<UserRequestPage />} />
        
        {/* Maintenance & Bills Routes */}
        <Route path="maintenance-bill/add-bill" element={<AddBillPage />} />
        <Route path="maintenance-bill/view" element={<ViewBillsPage />} />
        
        {/* Complaints Routes */}
        <Route path="maintenance-bill/complaints" element={<ComplaintsPage />} />
        <Route path="maintenance-bill/complaints/add" element={<AddComplaintPage />} />
        
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

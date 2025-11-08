import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { OtpPage } from "../pages/auth/OtpPage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { BuildingDetailsPage } from "../pages/BuildingDetailsPage";
import SocietyManagement from "@/pages/society-management/SocietyManagement";
import { ROLE_DEFAULTS } from "./route.config";

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
  if (ROLE_DEFAULTS[role]) {
    return <Navigate to={ROLE_DEFAULTS[role]} replace />;
  }

  // Fallback for unknown / Guest
  return <Navigate to="/dashboard" replace />;
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
        <Route path="building-details" element={<BuildingDetailsPage />} />
        {/* <Route path="users" element={<PeoplePage />} /> */}

        {/* Catch-all inside private area (keeps the layout) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

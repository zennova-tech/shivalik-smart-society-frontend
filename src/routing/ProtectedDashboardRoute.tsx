import { Navigate } from 'react-router-dom';

/* Get user roles from localStorage */
const getUserRoles = (): string => {
  try {
    const info = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
    if (info.role) {
      return info.role;
    }
    if (Array.isArray(info.userRoles) && info.userRoles.length > 0) {
      return info.userRoles[0];
    }
    if (Array.isArray(info.roles) && info.roles.length > 0) {
      return info.roles[0];
    }
    return "Guest";
  } catch {
    return "Guest";
  }
};

/* Protected Dashboard Route - Redirects SuperAdmin to society-management if no society selected */
export const ProtectedDashboardRoute = ({ children }: { children: React.ReactElement }) => {
  const role = getUserRoles();
  const normalizedRole = role?.toLowerCase() || "";

  console.log("ProtectedDashboardRoute - Role:", role, "Normalized:", normalizedRole);

  // SuperAdmin should go to society-management if no society is selected
  if (normalizedRole === "superadmin" || normalizedRole.includes("superadmin")) {
    try {
      const selectedSociety = localStorage.getItem("selectedSociety");
      console.log("ProtectedDashboardRoute - Selected Society:", selectedSociety);
      
      // If no society is selected, redirect to society-management
      if (!selectedSociety) {
        console.log("ProtectedDashboardRoute - Redirecting SuperAdmin to society-management (no society selected)");
        return <Navigate to="/society-management" replace />;
      }
      // If society is selected, allow access to dashboard
      console.log("ProtectedDashboardRoute - Allowing SuperAdmin to access dashboard (society selected)");
      return children;
    } catch (error) {
      console.error("Error checking selected society:", error);
      // On error, redirect to society-management
      return <Navigate to="/society-management" replace />;
    }
  }

  // Other roles can access dashboard
  console.log("ProtectedDashboardRoute - Allowing non-superadmin to access dashboard");
  return children;
};


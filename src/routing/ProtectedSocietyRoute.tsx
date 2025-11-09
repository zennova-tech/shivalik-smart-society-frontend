import { Navigate } from 'react-router-dom';

/* Get user roles from localStorage */
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

/* Protected Route Component - Only allows SuperAdmin to access Society Management */
export const ProtectedSocietyRoute = ({ children }: { children: React.ReactElement }) => {
  const role = getUserRoles();
  const normalizedRole = role?.toLowerCase() || "";

  console.log("ProtectedSocietyRoute - Role:", role, "Normalized:", normalizedRole);

  // Only SuperAdmin can access Society Management
  if (normalizedRole === "superadmin" || normalizedRole.includes("superadmin")) {
    console.log("ProtectedSocietyRoute - Allowing SuperAdmin access to society-management");
    return children;
  }

  // Redirect non-superadmin users to dashboard
  console.log("ProtectedSocietyRoute - Blocking non-superadmin, redirecting to dashboard");
  return <Navigate to="/dashboard" replace />;
};


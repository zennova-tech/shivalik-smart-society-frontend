import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Also check localStorage for immediate authentication check (after login)
  const token = localStorage.getItem('auth_token');
  const userInfo = localStorage.getItem('userInfo');
  const isAuthenticatedFromStorage = !!(token && userInfo);
  const effectiveAuth = isAuthenticated || isAuthenticatedFromStorage;

  // Don't redirect if we're already on a public route and processing login
  const currentPath = location.pathname;
  const isPublicRoute = 
    currentPath === '/login' || 
    currentPath === '/otp' ||
    currentPath.startsWith('/user/register');

  if (effectiveAuth) {
    // Get user role to determine redirect destination
    const role = getUserRoles();
    const normalizedRole = role?.toLowerCase() || "";
    

    // Only redirect if we're on a public route (login/otp)
    // This prevents infinite redirect loops
    // Don't redirect from registration pages - allow users to complete registration
    if (isPublicRoute && !currentPath.startsWith('/user/register')) {
      // SuperAdmin always goes to society-management
      if (normalizedRole === "superadmin" || normalizedRole.includes("superadmin")) {
        return <Navigate to="/society-management" replace />;
      }
      
      // Other roles go to dashboard
      return <Navigate to="/dashboard" replace />;
    }
    
    // If not on a public route, check if there's a 'from' state
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login' && from !== '/otp') {
      return <Navigate to={from} replace />;
    }
  }

  return <>{children}</>;
};

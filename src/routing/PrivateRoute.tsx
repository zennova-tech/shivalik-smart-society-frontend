import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_ROUTES } from './route.config';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  const currentPath = location.pathname;
  
  // Check authentication from localStorage as fallback (for immediate checks after login)
  const token = localStorage.getItem('auth_token');
  const userInfo = localStorage.getItem('userInfo');
  const isAuthenticatedFromStorage = !!(token && userInfo);
  
  // Use auth context if available, otherwise fallback to localStorage
  const effectiveAuth = isAuthenticated || isAuthenticatedFromStorage;
  
  if (!effectiveAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Get user role from context or localStorage
  let userRole = user?.role?.toLowerCase() || '';
  if (!userRole && userInfo) {
    try {
      const parsedUser = JSON.parse(userInfo);
      userRole = (parsedUser.role || parsedUser.userRoles?.[0] || '').toLowerCase();
    } catch (e) {
      console.error('Error parsing userInfo:', e);
    }
  }
  
  const isSuperAdmin = userRole === 'superadmin' || userRole.includes('superadmin');
  const userPermissions = isSuperAdmin ? ROLE_ROUTES.SuperAdmin : ROLE_ROUTES.Manager;
  
  // Allow access if path is in permissions, or if it's root path, or if it's society-management for superadmin
  const hasAccess = userPermissions.includes(currentPath) || 
                    currentPath === '/' || 
                    (currentPath === '/society-management' && isSuperAdmin);

  if (!hasAccess) {
    // For SuperAdmin trying to access unauthorized route, redirect to society-management
    if (isSuperAdmin) {
      return <Navigate to="/society-management" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

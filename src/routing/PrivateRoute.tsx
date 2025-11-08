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
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Normalize role comparison (handle case-insensitive and different formats)
  const userRole = user?.role?.toLowerCase() || '';
  const isSuperAdmin = userRole === 'superadmin' || userRole.includes('superadmin');
  const userPermissions = isSuperAdmin ? ROLE_ROUTES.SuperAdmin : ROLE_ROUTES.Manager;
  
  // Check if path matches any allowed route (including dynamic routes)
  const hasAccess = userPermissions.some(route => {
    // Exact match
    if (currentPath === route) return true;
    // Check if current path starts with an allowed route (for dynamic routes like /society-management/:id)
    // This allows /society-management/123 to match /society-management
    return currentPath.startsWith(route + '/');
  }) || currentPath === '/';


  if (false && !hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

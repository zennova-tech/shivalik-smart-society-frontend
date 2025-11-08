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
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const userPermissions = user.role == "superadmin" ? ROLE_ROUTES.SuperAdmin : ROLE_ROUTES.Manager;
  const currentPath = location.pathname;
  console.log("userPermissions", userPermissions);
  console.log("currentPath", currentPath);
  
  const hasAccess = userPermissions.includes(currentPath);
  console.log("has access", hasAccess);
  

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { isRoleAuthorized } from "@/shared/utils/roleRoutes";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

/**
 * Standard enterprise route guard.
 * Blocks unauthenticated users and redirects them to /login with backlink state.
 * Enforces role-based authorization when allowedRoles is specified.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  // If user is not authenticated, always redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const authorized = isRoleAuthorized(role, allowedRoles);
    if (!authorized) {
      return <Navigate to="/403" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

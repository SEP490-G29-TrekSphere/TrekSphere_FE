import { Navigate, useLocation } from 'react-router-dom';
import { canAccessPath, PATHS, ROLES, type Role } from '@/constants';
import { getPrimaryRole } from '@/constants/roles';
import { useAuthCheck } from '@/shared/hooks/useAuthCheck';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

interface RequireRoleProps {
  children: React.ReactNode;
  /**
   * List of roles authorized to access this route.
   * Default: `[ROLES.ADMIN]`
   */
  allowedRoles?: Role[];
}

/**
 * Route guard component for role-based access control (RBAC).
 * - Unauthenticated users are redirected to login with their intended location preserved.
 * - Authenticated users with mismatched roles are redirected to their appropriate portal dashboard.
 */
export default function RequireRole({ children, allowedRoles = [ROLES.ADMIN] }: RequireRoleProps) {
  const { isAuthenticated, isLoading } = useAuthCheck();
  const location = useLocation();
  const user = useAppStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // Determine primary role by precedence (admin > vendor > trekker)
  const primaryRole = getPrimaryRole(user.roles);
  const hasAccess = primaryRole !== null && allowedRoles.includes(primaryRole);
  const pathAllowed = primaryRole !== null && canAccessPath(primaryRole, location.pathname);

  if (!hasAccess && !pathAllowed) {
    const redirectPath =
      primaryRole === ROLES.TREKKER
        ? PATHS.TREKKER
        : primaryRole === ROLES.VENDOR
          ? PATHS.VENDOR
          : primaryRole === ROLES.ADMIN
            ? PATHS.ADMIN
            : PATHS.LOGIN;

    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

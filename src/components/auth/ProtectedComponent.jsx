import { usePermissions } from '../../hooks/usePermissions'

/**
 * Conditionally render children based on permissions
 *
 * Usage:
 *   <ProtectedComponent permission={PERMISSIONS.DELETE_CATEGORY}>
 *     <button>Delete Category</button>
 *   </ProtectedComponent>
 *
 *   <ProtectedComponent role={ROLES.ADMIN}>
 *     <AdminPanel />
 *   </ProtectedComponent>
 *
 *   <ProtectedComponent anyPermission={[PERMISSIONS.EDIT_POST, PERMISSIONS.DELETE_POST]}>
 *     <PostActions />
 *   </ProtectedComponent>
 *
 *   <ProtectedComponent fallback={<div>Access Denied</div>} permission={PERMISSIONS.ADMIN}>
 *     <SecretContent />
 *   </ProtectedComponent>
 */
export function ProtectedComponent({
  children,
  permission,
  anyPermission,
  role,
  anyRole,
  fallback = null,
}) {
  const { hasPermission, hasAnyPermission, hasRole } = usePermissions()

  // Check permission-based access
  if (permission !== undefined) {
    if (!hasPermission(permission)) {
      return fallback
    }
  }

  if (anyPermission !== undefined) {
    if (!hasAnyPermission(anyPermission)) {
      return fallback
    }
  }

  // Check role-based access
  if (role !== undefined) {
    if (!hasRole(role)) {
      return fallback
    }
  }

  if (anyRole !== undefined) {
    if (!hasRole(anyRole)) {
      return fallback
    }
  }

  return <>{children}</>
}

import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { getPermissionsForRoles, PERMISSIONS, ROLES } from '../config/permissions'

/**
 * Hook for checking user permissions
 *
 * Usage:
 *   const { hasPermission, hasAnyPermission, hasRole, permissions, roles } = usePermissions()
 *
 *   // Check single permission
 *   if (hasPermission(PERMISSIONS.DELETE_CATEGORY)) {
 *     // Show delete button
 *   }
 *
 *   // Check multiple permissions (AND)
 *   if (hasPermission([PERMISSIONS.EDIT_POST, PERMISSIONS.DELETE_POST])) {
 *     // User has both permissions
 *   }
 *
 *   // Check multiple permissions (OR)
 *   if (hasAnyPermission([PERMISSIONS.ADMIN, PERMISSIONS.CLASSIFIER])) {
 *     // User has at least one permission
 *   }
 *
 *   // Check role
 *   if (hasRole(ROLES.ADMIN)) {
 *     // Show admin panel
 *   }
 */
export function usePermissions() {
  const { roles, isAdmin, isAuthenticated } = useAuth()

  // Calculate user's permissions based on their roles
  const permissions = useMemo(() => {
    return getPermissionsForRoles(roles)
  }, [roles])

  // Check if user has a specific permission (or all of multiple permissions)
  const hasPermission = useMemo(() => {
    return (permission) => {
      if (!isAuthenticated) return false

      // Admin has all permissions
      if (isAdmin) return true

      // Check single permission
      if (typeof permission === 'string') {
        return permissions.includes(permission)
      }

      // Check multiple permissions (all required)
      if (Array.isArray(permission)) {
        return permission.every(p => permissions.includes(p))
      }

      return false
    }
  }, [permissions, isAdmin, isAuthenticated])

  // Check if user has any of the specified permissions
  const hasAnyPermission = useMemo(() => {
    return (permissionArray) => {
      if (!isAuthenticated) return false
      if (isAdmin) return true

      if (!Array.isArray(permissionArray)) {
        return hasPermission(permissionArray)
      }

      return permissionArray.some(p => permissions.includes(p))
    }
  }, [permissions, isAdmin, isAuthenticated, hasPermission])

  // Check if user has a specific role
  const hasRole = useMemo(() => {
    return (role) => {
      if (!isAuthenticated) return false

      if (typeof role === 'string') {
        return roles.includes(role)
      }

      if (Array.isArray(role)) {
        return role.some(r => roles.includes(r))
      }

      return false
    }
  }, [roles, isAuthenticated])

  // Check if user has all specified roles
  const hasAllRoles = useMemo(() => {
    return (roleArray) => {
      if (!isAuthenticated) return false

      if (!Array.isArray(roleArray)) {
        return hasRole(roleArray)
      }

      return roleArray.every(r => roles.includes(r))
    }
  }, [roles, isAuthenticated, hasRole])

  return {
    roles,
    permissions,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAllRoles,
  }
}

// Re-export for convenience
export { PERMISSIONS, ROLES }

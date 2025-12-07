import { useAuth0 } from '@auth0/auth0-react'
import { useMemo } from 'react'

/**
 * Custom auth hook that extracts roles from Auth0 user
 *
 * Auth0 stores roles in the user object. The exact location depends on your Auth0 setup:
 * - Custom namespace: user['https://yourapp.com/roles']
 * - Direct property: user.roles
 * - App metadata: user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
 *
 * This hook checks common locations and returns the roles array.
 */
export function useAuth() {
  const auth0 = useAuth0()
  const { user, isAuthenticated, isLoading } = auth0

  const roles = useMemo(() => {
    if (!isAuthenticated || !user) {
      return []
    }

    // Check multiple possible locations for roles
    // 1. Custom namespace (recommended by Auth0)
    const customNamespace = import.meta.env.VITE_AUTH0_ROLES_NAMESPACE || 'https://nahuelviera.dev/roles'
    if (user[customNamespace]) {
      return Array.isArray(user[customNamespace]) ? user[customNamespace] : []
    }

    // 2. Direct roles property
    if (user.roles) {
      return Array.isArray(user.roles) ? user.roles : []
    }

    // 3. Microsoft claims format
    const msftClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    if (user[msftClaim]) {
      return Array.isArray(user[msftClaim]) ? user[msftClaim] : [user[msftClaim]]
    }

    // 4. Check user_metadata (if exposed)
    if (user.user_metadata?.roles) {
      return Array.isArray(user.user_metadata.roles) ? user.user_metadata.roles : []
    }

    console.warn('No roles found in Auth0 user object. Checked locations:', {
      customNamespace,
      directRoles: 'user.roles',
      msftClaim,
      userMetadata: 'user.user_metadata.roles'
    })

    return []
  }, [user, isAuthenticated])

  return {
    ...auth0,
    roles,
    isAdmin: roles.some(role => role === 'Admin' || role === 'Sys Admin'),
  }
}

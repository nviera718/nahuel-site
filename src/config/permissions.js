/**
 * Centralized permissions configuration
 *
 * To add a new permission:
 * 1. Add it to the PERMISSIONS object
 * 2. Add it to the appropriate roles in ROLE_PERMISSIONS
 *
 * To add a new role:
 * 1. Add it to the ROLES object
 * 2. Define its permissions in ROLE_PERMISSIONS
 */

export const ROLES = {
  ADMIN: 'Admin',
  SYS_ADMIN: 'Sys Admin',
  CLASSIFIER: 'Classifier',
  DELETE_CATEGORY: 'DeleteCategory',
  DELETE_PROFILE: 'DeleteProfile',
  POST_PROCESSING: 'PostProcessing',
  PRODUCTION: 'Production',
  SCRAPE: 'Scrape',
}

export const PERMISSIONS = {
  // Navigation
  VIEW_CLASSIFIER: 'view:classifier',
  VIEW_POST_PROCESSING: 'view:post-processing',
  VIEW_PRODUCTION: 'view:production',

  // Categories
  CREATE_CATEGORY: 'create:category',
  EDIT_CATEGORY: 'edit:category',
  DELETE_CATEGORY: 'delete:category',

  // Profiles
  CREATE_PROFILE: 'create:profile',
  EDIT_PROFILE: 'edit:profile',
  DELETE_PROFILE: 'delete:profile',

  // Scraping
  START_SCRAPE: 'start:scrape',
  VIEW_SCRAPE_QUEUE: 'view:scrape-queue',
  MANAGE_SCRAPE_QUEUE: 'manage:scrape-queue',

  // Posts/Videos
  CLASSIFY_VIDEO: 'classify:video',
  EDIT_POST: 'edit:post',
  DELETE_POST: 'delete:post',
  CLIP_VIDEO: 'clip:video',
}

/**
 * Maps roles to their permissions
 * Admin automatically gets all permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.SYS_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.CLASSIFIER]: [
    PERMISSIONS.VIEW_CLASSIFIER,
    PERMISSIONS.VIEW_SCRAPE_QUEUE,
    PERMISSIONS.CLASSIFY_VIDEO,
    PERMISSIONS.CLIP_VIDEO,
  ],

  [ROLES.DELETE_CATEGORY]: [
    PERMISSIONS.DELETE_CATEGORY,
  ],

  [ROLES.DELETE_PROFILE]: [
    PERMISSIONS.DELETE_PROFILE,
  ],

  [ROLES.POST_PROCESSING]: [
    PERMISSIONS.VIEW_POST_PROCESSING,
  ],

  [ROLES.PRODUCTION]: [
    PERMISSIONS.VIEW_PRODUCTION,
  ],

  [ROLES.SCRAPE]: [
    PERMISSIONS.START_SCRAPE,
    PERMISSIONS.MANAGE_SCRAPE_QUEUE,
  ],
}

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role) {
  return role === ROLES.ADMIN || role === ROLES.SYS_ADMIN
}

/**
 * Get all permissions for a set of roles
 */
export function getPermissionsForRoles(roles = []) {
  if (!Array.isArray(roles) || roles.length === 0) {
    return []
  }

  // If user has any admin role, return all permissions
  if (roles.some(isAdminRole)) {
    return Object.values(PERMISSIONS)
  }

  // Collect permissions from all roles (deduplicated via Set)
  const permissions = new Set()
  roles.forEach(role => {
    const rolePerms = ROLE_PERMISSIONS[role] || []
    rolePerms.forEach(perm => permissions.add(perm))
  })

  return Array.from(permissions)
}

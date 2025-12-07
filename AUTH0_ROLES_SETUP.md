# Auth0 Roles Setup Guide

This document explains how to configure Auth0 roles for the Content Farm application.

## Overview

The application uses a role-based access control (RBAC) system where users can have multiple roles, and each role grants specific permissions. The roles are managed in Auth0 and automatically synced to the frontend application.

## Auth0 Configuration

### Step 1: Create Roles in Auth0

1. Go to your Auth0 Dashboard
2. Navigate to **User Management → Roles**
3. Create the following roles (must match names exactly):

| Role Name | Description |
|-----------|-------------|
| `Admin` | Full access to all features |
| `Sys Admin` | System administrator with full access |
| `Classifier` | Can view and classify videos, manage profiles |
| `DeleteCategory` | Can delete categories |
| `DeleteProfile` | Can delete profiles |
| `PostProcessing` | Access to post-processing section |
| `Production` | Access to production section |
| `Scrape` | Can start scraper and manage scrape queue |

### Step 2: Add Roles to User Tokens

To make roles available in the frontend, you need to add them to the Access Token using an Auth0 Action:

1. Go to **Actions → Flows → Login**
2. Click **Custom** and create a new Action called "Add Roles to Token"
3. Add the following code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://nahuelviera.dev/roles';

  if (event.authorization) {
    api.accessToken.setCustomClaim(namespace, event.authorization.roles);
    api.idToken.setCustomClaim(namespace, event.authorization.roles);
  }
};
```

4. Click **Deploy**
5. Add the action to the Login flow by dragging it into the flow diagram
6. Apply the changes

### Step 3: Assign Roles to Users

1. Go to **User Management → Users**
2. Select a user
3. Go to the **Roles** tab
4. Click **Assign Roles**
5. Select the appropriate roles for the user
6. Click **Assign**

**Note:** Users can have multiple roles. For example, a user might have both `Classifier` and `Scrape` roles.

## Permissions Mapping

Each role grants specific permissions. Here's what each role can do:

### Admin / Sys Admin
- Full access to all features
- All permissions granted

### Classifier
- View the Classification section
- View scrape queue
- Classify videos
- Clip videos
- View profiles and posts

### DeleteCategory
- Delete categories

### DeleteProfile
- Delete profiles

### PostProcessing
- Access Post Processing section

### Production
- Access Production section

### Scrape
- Start scraper
- Manage scrape queue (add/remove items)

## Testing Roles

To test that roles are working correctly:

1. **Check User Roles:**
   - Log in to the application
   - Click on your profile picture in the top right
   - Open browser DevTools Console
   - Type: `JSON.parse(localStorage.getItem('@@auth0spajs@@::' + import.meta.env.VITE_AUTH0_CLIENT_ID + '::https://nahuelviera.dev/api::openid profile email'))`
   - Look for the roles in the token

2. **Test UI Permissions:**
   - **Scrape button:** Should only appear if user has `Scrape` role
   - **Delete Category button:** Should only appear if user has `DeleteCategory` or `Admin` role
   - **Delete Profile button:** Should only appear if user has `DeleteProfile` or `Admin` role
   - **Navigation cards:** Only sections the user has permission for should appear on the dashboard

3. **Test with Different Roles:**
   - Create test users with different role combinations
   - Verify that each user sees only the features they should have access to

## Adding New Roles

To add a new role to the system:

1. **Create the role in Auth0** (see Step 1 above)

2. **Add to permissions config** (`src/config/permissions.js`):
   ```javascript
   export const ROLES = {
     // ... existing roles
     NEW_ROLE: 'NewRole',  // Add your new role here
   }
   ```

3. **Define permissions for the role:**
   ```javascript
   export const ROLE_PERMISSIONS = {
     // ... existing role permissions
     [ROLES.NEW_ROLE]: [
       PERMISSIONS.SOME_PERMISSION,
       PERMISSIONS.ANOTHER_PERMISSION,
     ],
   }
   ```

4. **Use in components:**
   ```javascript
   import { usePermissions, PERMISSIONS, ROLES } from '../hooks/usePermissions'

   function MyComponent() {
     const { hasRole, hasPermission } = usePermissions()

     // Check by role
     if (hasRole(ROLES.NEW_ROLE)) {
       // Show something
     }

     // Or check by permission
     if (hasPermission(PERMISSIONS.SOME_PERMISSION)) {
       // Show something
     }
   }
   ```

## Adding New Permissions

To add a new permission:

1. **Add to PERMISSIONS object** (`src/config/permissions.js`):
   ```javascript
   export const PERMISSIONS = {
     // ... existing permissions
     NEW_FEATURE: 'action:feature',  // Format: action:resource
   }
   ```

2. **Assign to appropriate roles:**
   ```javascript
   export const ROLE_PERMISSIONS = {
     [ROLES.ADMIN]: Object.values(PERMISSIONS),  // Admins get all
     [ROLES.SOME_ROLE]: [
       // ... existing permissions
       PERMISSIONS.NEW_FEATURE,  // Add to role
     ],
   }
   ```

3. **Use in UI components:**
   ```javascript
   import { ProtectedComponent } from '../components/auth'
   import { PERMISSIONS } from '../hooks/usePermissions'

   function MyComponent() {
     return (
       <ProtectedComponent permission={PERMISSIONS.NEW_FEATURE}>
         <button>New Feature Button</button>
       </ProtectedComponent>
     )
   }
   ```

## Environment Variables

Make sure you have the following environment variables set in `.env`:

```bash
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://nahuelviera.dev/api  # Optional, for API calls
VITE_AUTH0_ROLES_NAMESPACE=https://nahuelviera.dev/roles  # Optional, defaults to this
```

## Troubleshooting

### Roles not appearing in the frontend

1. **Check Auth0 Action is deployed:**
   - Go to Actions → Flows → Login
   - Verify the "Add Roles to Token" action is in the flow and active

2. **Check namespace matches:**
   - The namespace in the Auth0 Action must match `VITE_AUTH0_ROLES_NAMESPACE` in `.env`
   - Default is `https://nahuelviera.dev/roles`

3. **Check user has roles assigned:**
   - Go to Auth0 Dashboard → Users
   - Select the user
   - Verify roles are assigned in the Roles tab

4. **Clear cache and re-login:**
   - Log out of the application
   - Clear browser cache and localStorage
   - Log in again

### UI elements not hiding/showing correctly

1. **Check console for warnings:**
   - Open browser DevTools Console
   - Look for warnings from `useAuth.js` about missing roles

2. **Verify permission mapping:**
   - Check `src/config/permissions.js`
   - Ensure role has the required permissions assigned

3. **Check component implementation:**
   - Verify the component is using `hasPermission()` or `ProtectedComponent`
   - Ensure correct permission constant is being checked

## Backend Integration (Future)

When implementing backend role validation:

1. Verify JWT token signatures
2. Extract roles from the custom namespace
3. Check permissions on each API endpoint
4. Return 403 Forbidden for unauthorized requests

Example middleware pattern:
```javascript
function requirePermission(permission) {
  return (req, res, next) => {
    const roles = req.user?.['https://nahuelviera.dev/roles'] || []
    const userPermissions = getPermissionsForRoles(roles)

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}
```

# Auth0 Integration Setup Guide

## Overview

Auth0 has been integrated into your nahuel-site project to protect all routes starting with `/content-farm`. The welcome page (`/`) remains publicly accessible.

## Protected Routes

The following routes require authentication:
- `/content-farm` - Content Farm landing page
- `/content-farm/categories` - Categories page
- `/content-farm/post-processing` - Post processing page
- `/content-farm/production` - Production page
- `/content-farm/categories/:categorySlug` - Category profiles
- `/content-farm/categories/:categorySlug/:profileId` - Profile videos
- `/content-farm/categories/:categorySlug/:profileId/classify/:postId` - Video classifier
- `/content-farm/categories/:categorySlug/:profileId/classify/:postId/clip` - Clip video

## Public Routes

- `/` - Welcome page (publicly accessible)

## Setup Instructions

### Step 1: Create Auth0 Account & Application

1. Go to [Auth0](https://auth0.com/) and sign up for a free account (if you don't have one)

2. Once logged in, go to the [Auth0 Dashboard](https://manage.auth0.com/dashboard/)

3. Create a new application:
   - Click **Applications** → **Applications** in the left sidebar
   - Click **Create Application**
   - Name it something like "Nahuel Site" or "Content Farm"
   - Select **Single Page Web Applications**
   - Click **Create**

### Step 2: Configure Application Settings

In your newly created Auth0 application settings:

1. **Allowed Callback URLs**: Add these URLs (comma-separated):
   ```
   http://localhost:5173,
   https://nahuelviera.dev
   ```

2. **Allowed Logout URLs**: Add these URLs (comma-separated):
   ```
   http://localhost:5173,
   https://nahuelviera.dev
   ```

3. **Allowed Web Origins**: Add these URLs (comma-separated):
   ```
   http://localhost:5173,
   https://nahuelviera.dev
   ```

4. Scroll down and click **Save Changes**

### Step 3: Get Your Auth0 Credentials

From your Auth0 application settings page, copy:
- **Domain** (e.g., `your-app-name.us.auth0.com`)
- **Client ID** (e.g., a long alphanumeric string)

### Step 4: Update Environment Variables

Update your `.env` file in the project root with your Auth0 credentials:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-app-name.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_AUTH0_AUDIENCE=
```

**Note**: `VITE_AUTH0_AUDIENCE` is optional and only needed if you're using Auth0 APIs.

### Step 5: Test Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/`
   - You should see the welcome page (no authentication required)

3. Navigate to `http://localhost:5173/content-farm`
   - You should be redirected to Auth0 login page
   - After logging in, you'll be redirected back to `/content-farm`

### Step 6: Deploy to Production

#### Option A: Environment Variables in GitHub Actions

Add your Auth0 credentials to GitHub Actions secrets:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `VITE_AUTH0_DOMAIN` = your-app-name.us.auth0.com
   - `VITE_AUTH0_CLIENT_ID` = your-client-id

4. Update your `.github/workflows/deploy.yml` to use these secrets during build:
   ```yaml
   - name: Build
     env:
       VITE_AUTH0_DOMAIN: ${{ secrets.VITE_AUTH0_DOMAIN }}
       VITE_AUTH0_CLIENT_ID: ${{ secrets.VITE_AUTH0_CLIENT_ID }}
     run: npm run build
   ```

#### Option B: Build-Time Environment File

Create a production `.env.production` file (DO NOT commit this):

```env
VITE_AUTH0_DOMAIN=your-app-name.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

When building for production:
```bash
npm run build
```

Vite will automatically use `.env.production` if it exists.

## Available Auth Components

The integration includes several reusable components in `src/components/auth/`:

### LoginButton
```jsx
import { LoginButton } from '@/components/auth'

<LoginButton className="custom-styles" />
```

### LogoutButton
```jsx
import { LogoutButton } from '@/components/auth'

<LogoutButton className="custom-styles" />
```

### UserProfile
```jsx
import { UserProfile } from '@/components/auth'

<UserProfile className="custom-styles" />
```

Displays the logged-in user's name, email, and profile picture.

### ProtectedRoute
```jsx
import { ProtectedRoute } from '@/components/auth'

<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

## Using Auth0 Hook in Your Components

You can use the `useAuth0` hook in any component to access authentication state and methods:

```jsx
import { useAuth0 } from '@auth0/auth0-react'

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <button onClick={() => loginWithRedirect()}>Log In</button>
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={() => logout()}>Log Out</button>
    </div>
  )
}
```

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use GitHub Secrets** for production deployments
3. **Rotate credentials** periodically in Auth0 dashboard
4. **Enable MFA** in Auth0 for your admin account
5. **Review Auth0 logs** regularly in the Auth0 dashboard

## Customization

### Redirect After Login

The `ProtectedRoute` component automatically saves the URL the user was trying to access and redirects them back after login. No additional configuration needed!

### Custom Login Page

To customize the Auth0 login experience:
1. Go to Auth0 Dashboard → Branding → Universal Login
2. Customize the login page design
3. Add your logo and brand colors

### Social Logins

To add social login providers (Google, GitHub, etc.):
1. Go to Auth0 Dashboard → Authentication → Social
2. Click the provider you want to enable
3. Follow the setup instructions for each provider

## Troubleshooting

### "Invalid state" error
- Check that your Allowed Callback URLs are correctly configured
- Clear browser cache and cookies

### Infinite redirect loop
- Verify that `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` are set correctly
- Check that the domain doesn't include `https://` prefix (just the domain)

### "Callback URL mismatch" error
- Make sure your callback URL exactly matches what's configured in Auth0
- Include the protocol (`http://` or `https://`)

### User redirected to Auth0 on every page refresh
- This is expected during development if you haven't logged in yet
- Once logged in, the session should persist across refreshes
- Check browser console for any Auth0 errors

## Additional Resources

- [Auth0 React SDK Documentation](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 Dashboard](https://manage.auth0.com/dashboard/)
- [Auth0 Community](https://community.auth0.com/)

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Review Auth0 logs in the dashboard (Monitoring → Logs)
3. Verify all environment variables are set correctly
4. Ensure your Auth0 application settings match the URLs you're using

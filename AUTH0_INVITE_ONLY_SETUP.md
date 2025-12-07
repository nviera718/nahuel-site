# Auth0 Invite-Only Access Setup

## Overview

This guide shows you how to configure your Auth0 application to be **invite-only**, meaning only users you explicitly invite can sign up and access your content farm.

## Option 1: Disable Public Signups (Recommended - Free)

This is the simplest approach and works with the free Auth0 tier.

### Step 1: Disable Database Signups

1. Go to [Auth0 Dashboard](https://manage.auth0.com/dashboard/)
2. Navigate to **Authentication** → **Database** in the left sidebar
3. Click on **Username-Password-Authentication** (or your database name)
4. Go to the **Settings** tab
5. Scroll down to **Disable Sign Ups** toggle
6. **Enable** "Disable Sign Ups"
7. Click **Save**

✅ **Result**: Users can no longer sign up themselves. Only you can create accounts.

### Step 2: Manually Create User Accounts

When you want to invite someone:

1. Go to **User Management** → **Users**
2. Click **Create User**
3. Fill in:
   - **Email**: The user's email
   - **Password**: Set a temporary password
   - **Connection**: Select your database (usually "Username-Password-Authentication")
4. Click **Create**
5. Send the user their credentials via secure channel (encrypted email, password manager, etc.)

**Recommended**: Enable "Require password change on first login" so users set their own password.

### Step 3: Enable Password Reset Email

1. Go to **Authentication** → **Database** → **Username-Password-Authentication**
2. Go to **Password Policy** tab
3. Ensure **Enable password reset email** is ON
4. Customize the email template in **Branding** → **Email Templates** → **Change Password**

## Option 2: Auto-Block Signups with Auth0 Actions (Free)

If you want a programmatic approach that blocks all signups except specific email domains:

### Step 1: Create a Pre-Registration Action

1. Go to **Actions** → **Library** in the left sidebar
2. Click **Build Custom**
3. Name it: `Block Public Signups`
4. Select **Trigger**: `Pre User Registration`
5. Add this code:

```javascript
/**
 * Handler that will be called during the execution of a PreUserRegistration flow.
 *
 * @param {Event} event - Details about the context and user that is attempting to register.
 * @param {PreUserRegistrationAPI} api - Interface whose methods can be used to change the behavior of the signup.
 */
exports.onExecutePreUserRegistration = async (event, api) => {
  // List of allowed email domains
  const allowedDomains = ['yourdomain.com', 'yourcompany.com'];

  // List of specific allowed emails (for individual invites)
  const allowedEmails = [
    'friend@gmail.com',
    'colleague@outlook.com'
  ];

  const userEmail = event.user.email.toLowerCase();
  const emailDomain = userEmail.split('@')[1];

  // Check if email or domain is allowed
  const isAllowed =
    allowedEmails.includes(userEmail) ||
    allowedDomains.includes(emailDomain);

  if (!isAllowed) {
    api.access.deny('signup_not_allowed', 'Signups are invite-only. Please contact the administrator.');
  }
};
```

6. Click **Deploy**

### Step 2: Add Action to Flow

1. Go to **Actions** → **Flows**
2. Click on **Pre User Registration**
3. Drag your `Block Public Signups` action from the right sidebar into the flow
4. Click **Apply**

✅ **Result**: Only emails/domains you specify can sign up.

### Managing the Whitelist

To add new users, update the action code:

```javascript
const allowedEmails = [
  'friend@gmail.com',
  'colleague@outlook.com',
  'newuser@example.com', // Add new emails here
];
```

Then click **Deploy** again.

## Option 3: Email Verification Required (Extra Security Layer)

Add an additional verification step to ensure users have access to the email:

### Step 1: Enable Email Verification

1. Go to **Authentication** → **Database** → **Username-Password-Authentication**
2. Scroll to **Authentication** section
3. Enable **Require Email Verification**
4. Click **Save**

### Step 2: Customize Verification Email

1. Go to **Branding** → **Email Templates**
2. Click **Verification Email**
3. Customize the template
4. Enable and click **Save**

✅ **Result**: Users must verify their email before accessing the app.

## Option 4: Manual Approval Workflow (Most Control)

For maximum control, require admin approval for all new accounts:

### Step 1: Add Custom User Metadata for Approval Status

Create a Post-Registration Action:

1. Go to **Actions** → **Library**
2. Create new action: `Mark User as Pending Approval`
3. Trigger: `Post User Registration`
4. Code:

```javascript
exports.onExecutePostUserRegistration = async (event, api) => {
  // Set user as pending approval
  api.user.setAppMetadata('approved', false);
  api.user.setAppMetadata('status', 'pending_approval');
};
```

5. Deploy and add to **Post User Registration** flow

### Step 2: Block Unapproved Users from Logging In

Create a Login Action:

1. Create new action: `Block Unapproved Users`
2. Trigger: `Login / Post Login`
3. Code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const approved = event.user.app_metadata?.approved || false;

  if (!approved) {
    api.access.deny('Account pending approval. An administrator will review your request.');
  }
};
```

4. Deploy and add to **Login** flow

### Step 3: Manually Approve Users

When you want to approve a user:

1. Go to **User Management** → **Users**
2. Click on the pending user
3. Scroll to **Metadata** section
4. Edit **app_metadata**:
```json
{
  "approved": true,
  "status": "active"
}
```
5. Click **Save**

## Recommended Setup for Your Use Case

For an invite-only content farm, I recommend:

**Combination Approach:**
1. ✅ Disable public signups (Option 1)
2. ✅ Enable email verification (Option 3)
3. ✅ Manually create accounts for invited users

This gives you:
- Complete control over who can access
- Email verification for security
- Simple management
- Works on free tier

## Setting Up Invitations

### Create an Invitation Process

1. **Collect Interest**: Have a contact form or email where people can request access
2. **Create Account**: Use Auth0 dashboard to create user with their email
3. **Send Welcome Email**:
   - Include the site URL: `https://nahuelviera.dev/content-farm`
   - Mention they'll need to set a password on first login
   - Or send them the password reset link from Auth0

### Streamline with Auth0 Management API (Advanced)

You can automate user creation with a script:

```javascript
// Example: Create user via Auth0 Management API
const axios = require('axios');

async function inviteUser(email) {
  const token = 'YOUR_MANAGEMENT_API_TOKEN';

  const response = await axios.post(
    'https://dev-qe31rvlaxfeb3lv7.us.auth0.com/api/v2/users',
    {
      email: email,
      connection: 'Username-Password-Authentication',
      email_verified: false,
      verify_email: true, // Sends verification email
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
  );

  console.log(`User ${email} invited successfully!`);
}

inviteUser('newuser@example.com');
```

## Testing Your Setup

### Test 1: Try to Sign Up (Should Fail)
1. Open incognito browser
2. Go to `http://localhost:5173/content-farm`
3. Click "Sign up" on Auth0 login screen
4. Should show error or no signup option

### Test 2: Invited User Login (Should Work)
1. Create a test user in Auth0 dashboard
2. Try logging in with those credentials
3. Should successfully access `/content-farm`

## Monitoring Access

### View Active Users
1. Go to **User Management** → **Users**
2. See all registered users
3. Filter by last login, email verification status, etc.

### View Login Logs
1. Go to **Monitoring** → **Logs**
2. See all login attempts, successes, and failures
3. Set up log streaming for security monitoring

## Removing Access

To revoke someone's access:

1. Go to **User Management** → **Users**
2. Find the user
3. Click the three dots (⋮)
4. Select **Block User**

Blocked users cannot log in but their account remains (can be unblocked later).

To permanently delete:
- Click **Delete User** instead

## Production Considerations

### Rate Limiting
Auth0 has rate limits on free tier:
- 7,000 free active users per month
- After that, $35/month per 1,000 additional users

For a small invite-only site, you'll likely stay well within limits.

### Backup User List
Periodically export your user list:
1. Go to **User Management** → **Users**
2. Click **Export Users**
3. Store safely

### Security Best Practices
1. ✅ Enable Multi-Factor Authentication (MFA) for admin account
2. ✅ Use strong passwords for manually created accounts
3. ✅ Require password change on first login
4. ✅ Enable email verification
5. ✅ Monitor logs regularly for suspicious activity
6. ✅ Set up brute-force protection (enabled by default)

## Next Steps

1. Choose your invite-only approach (I recommend Option 1)
2. Configure Auth0 accordingly
3. Test with a dummy user account
4. Create real user accounts for your initial invites
5. Document your invitation process

You're now running a secure, invite-only content farm! 🔒

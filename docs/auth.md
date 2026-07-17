# Authentication

## Why Better-Auth?

We chose **Better-Auth** because it provides phone-based OTP authentication out of the box (for customers, kitchen partners, and delivery partners) AND email/password with mandatory TOTP 2FA for admin accounts — all in a single library. It also handles session management, rate limiting, and account lockout automatically.

## How Auth Works

### Phone OTP Flow

The user enters their phone number → `POST /api/auth/twilio/send` generates a 6-digit OTP, stores it in the `otp_codes` table with a 5-minute expiry, and sends it via Twilio SMS. Previous unused OTPs for that number are invalidated to prevent confusion.

When the user enters the OTP → `POST /api/auth/twilio/verify` checks it against Twilio Verify (if configured) or our database. On success, it either finds or creates a `User` record, generates a UUID session token, signs it with HMAC-SHA256, and sets it as a secure HTTP-only cookie (`__Secure-better-auth.session_token` in production). The session lasts 7 days.

### Why HMAC-SHA256 signing?

The session token is stored in a cookie where the user could potentially modify it. Signing the token with HMAC-SHA256 using `BETTER_AUTH_SECRET` means any tampering is detected — the server recomputes the signature and rejects mismatched tokens.

### Admin 2FA Flow

Admin login requires email/password first, then a TOTP challenge (6-digit code from Google Authenticator/Authy, 30-second window). We use the 2FA plugin with:
- 10 backup codes (10 characters each) printed during setup
- Account lockout after 10 failed attempts for 15 minutes
- `allowPasswordless: true` — admins must have 2FA, there's no fallback

### Role-Based Authorization

Server-side auth guards (`lib/auth-guards.ts`) protect admin routes:
- `requireAdmin()` — checks session exists, admin profile is active, 2FA is enabled. Returns 404 (not redirect) to hide admin existence from non-admins.
- `requirePermission()` — checks granular permissions from `AdminProfile.permissions` bitfield. Available permissions: `MANAGE_ORDERS`, `MANAGE_MENU`, `APPROVE_KYC`, `VIEW_FINANCIALS`, `MANAGE_COUPONS`, `MANAGE_PAYOUTS`, `BAN_USERS`, `MANAGE_SUPPORT`, `MANAGE_CMS`, `MANAGE_ADMINS`, `MANAGE_CATALOG`
- `getPostLoginRedirect()` — checks user role hierarchy: Admin → Kitchen Partner → Delivery Partner → Home

Client-side: `PermissionGate` component wraps children and shows a loading skeleton or "Access Restricted" fallback based on permission check via `getCurrentAdminPermissions`.

### Twilio SMS Strategy

We try three SMS strategies in order:
1. **Content Template** (pre-approved for Indian DLT regulations) — uses `contentSid` with variable `{1}` for the OTP
2. **Twilio Verify Service** — managed OTP generation and verification
3. **Plain SMS** — last resort, may be blocked by Indian carriers

The service gracefully degrades: if one strategy fails, it tries the next.

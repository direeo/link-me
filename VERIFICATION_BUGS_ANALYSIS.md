# Email & Google Auth Verification Bugs - Complete Analysis

## 🔴 CRITICAL BUG FOUND: 6-Digit Code Generation

### The Problem
In `src/lib/auth.ts`, the `generateVerificationCode()` function:
```typescript
const code = Math.floor(100000 + Math.random() * 900000).toString();
```

**Issue**: When the random number is less than 100,000 (e.g., 23456), JavaScript's `toString()` removes the leading zero, storing "023456" as "23456" in the database!

**Example**:
- Generated: `023456`
- Stored in DB: `23456` (5 digits)
- User sees: `023456` in email
- User enters: `023456` 
- Lookup finds: Nothing (`token: "023456"` doesn't exist)
- Result: ❌ "Code is wrong" error

### Why This Happens
```
Math.floor(100000 + Math.random() * 900000) generates 100000-999999
String conversion on 123456 = "123456" ✓
String conversion on 023456 = "23456" ✗ (leading zero removed!)
```

### The Fix
Use `.padStart()` to ensure 6 digits:
```typescript
const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
```

---

## 🟠 SECONDARY ISSUES

### 1. Google OAuth - TOTP Window Too Small
**File**: `src/lib/two-factor.ts` line 38
```typescript
window: 1, // Only allows 1 time step before/after
```

**Problem**: If server clock is skewed, valid TOTP codes get rejected. TOTP uses 30-second time windows, so `window: 1` only covers current + 1 step.

**Fix**: Increase to `window: 2` for better clock drift tolerance:
```typescript
window: 2, // Allows ±2 time steps for clock skew
```

### 2. Dual Email Verification Endpoints
Your code has TWO email verification endpoints with slightly different logic:

| Endpoint | Input | Behavior |
|----------|-------|----------|
| `/api/auth/verify` | `{email, code}` | Validates token belongs to user |
| `/api/verify/email` | `{token}` | Standalone token lookup |

**Problem**: Confusing maintenance, duplicate code, different error messages

**Fix**: Consolidate to single endpoint or clearly document the use case for each

### 3. Frontend-Backend Parameter Mismatch
**File**: `src/app/verify/page.tsx` line 57
```typescript
body: JSON.stringify({ email, code: fullCode, token: fullCode }),
```

Sends both `code` and `token`, but backend expects only `code`. The extra `token` param is harmless but confusing.

**Fix**: Send only what's needed:
```typescript
body: JSON.stringify({ email, code: fullCode }),
```

### 4. Unused Constant
**File**: `src/lib/auth.ts` line 15
```typescript
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24; // UNUSED!
```

The code actually uses 15 minutes. This constant is misleading.

**Fix**: Delete it or update to 0.25 (15 minutes = 0.25 hours)

### 5. Poor Error Messages
When verification fails, users can't tell if:
- Code is expired
- Code is wrong
- Code was never sent
- Wrong email

**Current message**: "Invalid verification code"

**Better**: 
```typescript
if (isTokenExpired(tokenEntry.expiresAt)) {
    return "Code expired. Click 'Resend' for a new one.";
}
if (tokenEntry.userId !== user.id) {
    return "This code doesn't match your email.";
}
return "Invalid code. Double-check and try again.";
```

---

## 🟢 GOOGLE OAUTH - FLOW WORKS BUT HAS ISSUES

The OAuth flow itself is solid:
1. ✓ Correct state validation (base64 encoded userId)
2. ✓ Proper token exchange with Google
3. ✓ Secure token storage in database

**Issues**:
- Token refresh fails silently (no user notification)
- TOTP window too small (see above)
- No manual token refresh button
- No error logging for failed refreshes

---

## 📧 SWITCHING TO EMAILJS - MIGRATION PLAN

### Why EmailJS?
- **No backend email setup needed** - managed service
- **Better reliability** - Email delivery infrastructure
- **Easy limits** - Free tier: 200/month, Paid: unlimited
- **Simple API** - Just one function call
- **No SMTP secrets** - No credentials to manage

### Migration Steps

#### 1. Install EmailJS
```bash
npm install @emailjs/browser
```

#### 2. Create EmailJS Service
- Go to [EmailJS](https://www.emailjs.com)
- Create free account
- Add Email Service (Gmail, Outlook, SMTP, etc.)
- Create Email Template
- Get: Service ID, Template ID, Public Key

#### 3. Create a new email utility file
```typescript
// src/lib/send-email.ts
import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

// Initialize (call once on app load)
export function initializeEmailJS() {
  emailjs.init(PUBLIC_KEY);
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      user_email: email,
      user_name: name || 'User',
      verification_code: code,
      expiry_minutes: 15,
    });
    
    return {
      success: true,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('EmailJS error:', error);
    return {
      success: false,
      message: 'Failed to send email'
    };
  }
}
```

#### 4. Update .env.local
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=public_xxx
```

#### 5. Update signup/login routes
Replace `sendVerificationEmail()` calls - they work the same way but now use EmailJS

#### 6. Add initialization to layout
```typescript
// src/app/layout.tsx
'use client';
import { useEffect } from 'react';
import { initializeEmailJS } from '@/lib/send-email';

export default function RootLayout({ children }) {
  useEffect(() => {
    initializeEmailJS();
  }, []);
  
  return <>{children}</>;
}
```

### Advantages Over Current SMTP
| Aspect | Current | EmailJS |
|--------|---------|---------|
| Setup | Configure SMTP env vars | Sign up + copy keys |
| Reliability | Depends on your SMTP | Professional service |
| Costs | Potentially free SMTP | Free + 200/month, then paid |
| Maintenance | You manage SMTP | EmailJS manages |
| Development | Console logs | Actually sends from dev |
| Deliverability | Medium | High (professional infrastructure) |
| Troubleshooting | Check server logs | Check EmailJS dashboard |

---

## 📋 SUMMARY - What To Fix NOW

1. **URGENT**: Add `.padStart(6, '0')` to code generation
2. **HIGH**: Increase TOTP window from 1 to 2
3. **MEDIUM**: Consolidate verification endpoints
4. **MEDIUM**: Remove unused `VERIFICATION_TOKEN_EXPIRY_HOURS` constant
5. **MEDIUM**: Improve error messages for verification failures
6. **LOW**: Remove extra `token` parameter from frontend

## 📋 SUMMARY - EmailJS Migration

**Time**: ~2 hours for full setup
**Complexity**: Low - just replacing email sending function
**Benefit**: Better reliability + no SMTP setup needed
**Recommendation**: Do AFTER fixing the 6-digit code bug

---


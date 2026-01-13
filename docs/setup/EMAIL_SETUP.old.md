# Email Setup Guide for Password Reset

This guide explains how to integrate email sending for the password reset feature.

## Development Mode

In development, the password reset URL is:
- Logged to the console
- Returned in the API response (visible in browser network tab)
- Can be copied manually for testing

## Production Email Integration

### Recommended Email Service: Resend

Resend is recommended for Next.js applications and offers a generous free tier.

#### 1. Install Resend

```bash
npm install resend
```

#### 2. Get API Key

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to your `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

#### 3. Update `/app/api/reset-password/route.js`

Replace the TODO comment with:

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In the POST handler, after generating resetURL:
if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
        from: 'Rice Events <noreply@yourdomain.com>',
        to: email,
        subject: 'Reset Your Password - Rice Events Hub',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request</h2>
                <p>Hi there,</p>
                <p>You requested to reset your password for Rice Events Hub. Click the button below to reset it:</p>
                <a href="${resetURL}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
                <p>Or copy and paste this URL into your browser:</p>
                <p style="color: #666; font-size: 14px;">${resetURL}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This link will expire in 1 hour.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        `
    });
}
```

### Alternative: Nodemailer (for custom SMTP)

#### 1. Install Nodemailer

```bash
npm install nodemailer
```

#### 2. Environment Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

#### 3. Update API Route

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// In the POST handler:
if (process.env.SMTP_HOST) {
    await transporter.sendMail({
        from: '"Rice Events Hub" <noreply@yourdomain.com>',
        to: email,
        subject: 'Reset Your Password - Rice Events Hub',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request</h2>
                <p>Hi there,</p>
                <p>You requested to reset your password. Click the button below:</p>
                <a href="${resetURL}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Reset Password</a>
                <p>Or copy this URL: ${resetURL}</p>
                <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
            </div>
        `
    });
}
```

## Vercel Environment Variables

Add these to your Vercel project settings:

1. Go to Project Settings → Environment Variables
2. Add:
   - `RESEND_API_KEY` (or SMTP credentials)
   - `NEXT_PUBLIC_BASE_URL` = `https://your-domain.vercel.app`

## Testing

### Development Testing
1. Go to `/forgot-password`
2. Enter an email
3. Check console for reset URL
4. Copy URL and paste in browser

### Production Testing
1. Ensure email service is configured
2. Submit email on forgot password page
3. Check inbox (and spam folder)
4. Click link and reset password

## Security Best Practices

✅ **Current Implementation:**
- Tokens are cryptographically secure (32 random bytes)
- Tokens stored as SHA-256 hashes
- 1-hour expiration
- Doesn't reveal if email exists
- Tokens cleared after use

✅ **Additional Recommendations:**
- Use HTTPS in production (Vercel does this automatically)
- Consider rate limiting (prevent spam)
- Log failed reset attempts
- Monitor for suspicious activity

## Troubleshooting

**Email not sending?**
- Check API key is in environment variables
- Verify domain is verified (for Resend)
- Check spam folder
- Look at server logs for errors

**Reset link not working?**
- Check token hasn't expired (1 hour limit)
- Verify BASE_URL is correct
- Ensure database connection is working

**Development testing?**
- Reset URL is logged to console
- Check network tab in browser DevTools
- Copy URL manually to test flow

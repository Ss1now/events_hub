# Email System Setup

Configuration guide for email notifications and password recovery.

## Overview

Rice Events uses Resend for email delivery with the following features:

- Password reset emails
- Event reminder notifications (24h and 1h before)
- Event update notifications
- Platform announcements

## Email Service: Resend

### Why Resend?

- Simple API and great documentation
- Free tier: 3,000 emails/month, 100 emails/day
- Professional HTML email templates
- High deliverability rates
- No credit card required for free tier

### Account Setup

1. **Create Account**
   - Visit resend.com
   - Sign up with your email
   - Verify your email address

2. **Get API Key**
   - Dashboard → API Keys
   - Click "Create API Key"
   - Name it "Rice Events Production"
   - Copy the key (starts with `re_`)

3. **Add to Environment**

```env
# .env.local
RESEND_API_KEY=re_your_api_key_here
```

### Domain Configuration (Optional)

For production, verify your domain for better deliverability:

1. **Add Domain**
   - Resend Dashboard → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., events.rice.edu)

2. **DNS Records**
   - Add provided DNS records to your domain
   - Wait for verification (can take up to 48 hours)

3. **Update From Address**
   - Change `from: 'onboarding@resend.dev'`
   - To: `from: 'noreply@yourdomain.com'`

## Email Templates

### Password Reset Email

Located in: `app/api/reset-password/route.js`

```javascript
const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #000000 0%, #00205B 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">Rice Events</h1>
    </div>
    
    <div style="padding: 40px 30px; background: #f9f9f9;">
      <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
      
      <p style="color: #666; font-size: 16px; line-height: 1.6;">
        You requested to reset your password for your Rice Events account.
        Click the button below to create a new password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" 
           style="background: #00205B; color: white; padding: 14px 30px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;
                  font-weight: bold;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        This link will expire in 1 hour for security.
      </p>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        If you did not request this reset, please ignore this email.
        Your password will remain unchanged.
      </p>
    </div>
    
    <div style="padding: 20px; text-align: center; background: #333; color: #999; font-size: 12px;">
      <p style="margin: 0;">Rice Events - Rice University</p>
    </div>
  </div>
`;
```

## Development Mode

### Without Resend (Console Logging)

If `RESEND_API_KEY` is not set, emails are logged to console:

```javascript
if (!process.env.RESEND_API_KEY) {
  console.log('Email would be sent to:', email);
  console.log('Reset URL:', resetURL);
  return NextResponse.json({
    success: true,
    msg: 'Password reset link sent',
    resetURL // Only in development
  });
}
```

### Testing Email Flow

1. **Request Password Reset**
   - Go to `/forgot-password`
   - Enter email address
   - Check console for reset URL

2. **Use Reset Link**
   - Copy URL from console
   - Paste in browser
   - Create new password

3. **Verify Success**
   - Log in with new password
   - Confirm access works

## Production Setup

### Required Environment Variables

```env
# .env.local (production)
RESEND_API_KEY=re_your_production_key
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### Vercel Configuration

1. **Add Environment Variable**
   - Vercel Dashboard → Project
   - Settings → Environment Variables
   - Add `RESEND_API_KEY`
   - Add `NEXT_PUBLIC_BASE_URL`

2. **Redeploy**
   - Trigger new deployment
   - Verify environment variables loaded

### Email Sending Function

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(email, resetURL) {
  try {
    await resend.emails.send({
      from: 'Rice Events <onboarding@resend.dev>',
      to: email,
      subject: 'Rice Events - Password Reset',
      html: emailHtmlTemplate
    });
    
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
```

## GitHub Actions Email Automation

For scheduled email notifications, see `docs/setup/GITHUB_ACTIONS_SETUP.md`

## Alternative: Nodemailer

If you prefer SMTP:

### Install Package

```bash
npm install nodemailer
```

### Configuration

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: '"Rice Events" <noreply@yourdomain.com>',
    to,
    subject,
    html
  });
}
```

### Gmail Setup

1. Enable 2-factor authentication
2. Generate app password
3. Add to .env.local:

```env
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Email Best Practices

### Design Guidelines

- **Mobile-First**
  - Use responsive tables
  - Test on mobile devices
  - Keep width under 600px

- **Clear Call-to-Action**
  - Single prominent button
  - High contrast colors
  - Descriptive text

- **Branding**
  - Include logo in header
  - Use consistent colors
  - Add footer with contact info

### Content Guidelines

- **Subject Lines**
  - Keep under 50 characters
  - Be specific and clear
  - Avoid spam trigger words

- **Body Text**
  - Short paragraphs
  - Clear, simple language
  - Include next steps

- **Security**
  - Include expiration times
  - Warn about phishing
  - Never ask for passwords in email

## Troubleshooting

### Emails Not Sending

**Check API Key**
```bash
# Verify key is set
echo $RESEND_API_KEY

# Check in code
console.log('API Key exists:', !!process.env.RESEND_API_KEY);
```

**Check Logs**
```javascript
try {
  const result = await resend.emails.send({...});
  console.log('Email sent:', result);
} catch (error) {
  console.error('Email error:', error);
}
```

**Common Issues**
- API key invalid or expired
- Email address format incorrect
- Free tier limit reached
- Domain not verified (for custom domains)

### Emails Going to Spam

**Solutions**
- Verify your sending domain
- Add SPF and DKIM records
- Avoid spam trigger words
- Include unsubscribe link
- Maintain good sending reputation

### Rate Limiting

**Free Tier Limits**
- 3,000 emails/month
- 100 emails/day
- 10 emails/second

**Handling Limits**
```javascript
// Add delay between emails
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

for (const user of users) {
  await sendEmail(user.email);
  await delay(100); // 100ms between emails
}
```

## Monitoring

### Email Delivery

Resend Dashboard shows:
- Delivery status
- Open rates
- Click rates
- Bounce rates

### Error Handling

```javascript
async function sendEmailWithRetry(to, subject, html, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await resend.emails.send({ to, subject, html });
      return { success: true };
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

## Security Considerations

### API Key Protection

- Never commit API keys to git
- Use environment variables only
- Rotate keys periodically
- Use different keys for dev/prod

### Email Content

- Sanitize user input in emails
- Escape HTML to prevent XSS
- Validate email addresses
- Rate limit password reset requests

### Token Security

- Use cryptographically secure tokens
- Hash tokens before storing
- Set short expiration times
- Invalidate after single use

## Support

For additional help:
- Resend Documentation: resend.com/docs
- Nodemailer Documentation: nodemailer.com
- Check DEVELOPER_GUIDE.md for code examples

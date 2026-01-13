# Security Policy

Security best practices and guidelines for Rice Events.

## Environment Variables

CRITICAL: Never commit sensitive credentials to version control.

#### Protected Files
- `.env.local` - Contains your actual production/development secrets (NEVER commit)
- `.env` - Contains your actual environment-specific secrets (NEVER commit)
- `.env.production` - Production secrets (NEVER commit)

#### Safe Files
- `.env.example` - Template with placeholder values (safe to commit)

#### Verification Before Commits

Always check before committing:
```bash
# Verify .env files are in .gitignore
cat .gitignore | grep ".env"
# Should show: .env*

# Check what you're about to commit
git status
git diff --staged

# NEVER stage these files
git add .env.local    # WRONG
git add .env          # WRONG
```

### Required Environment Variables

```env
# MongoDB Connection - Use your actual connection string
MONGODB_URI=your-mongodb-connection-string-here

# JWT Secret - Generate with command below
JWT_SECRET=your-secure-random-string-here
```

#### Documentation Safety Rules

When writing documentation or examples:
1. NEVER include real credentials in examples
2. NEVER copy actual connection strings to documentation
3. ALWAYS use placeholders like `your-mongodb-connection-string-here`
4. ALWAYS use generic examples like `username:password` not real usernames
5. Review all documentation for credentials before committing

Examples of SAFE documentation:
```env
# SAFE - Generic placeholder
MONGODB_URI=your-mongodb-connection-string-here

# SAFE - Obviously fake example
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

Examples of UNSAFE documentation:
```env
# UNSAFE - Real cluster name visible
MONGODB_URI=mongodb+srv://user:pass@REAL-CLUSTER-NAME.mongodb.net/db

# UNSAFE - Project-specific username pattern
MONGODB_URI=mongodb+srv://PROJECT-USER:YOUR_PASSWORD@cluster.mongodb.net/database
```

#### Generating Secure JWT_SECRET

```bash
# Generate a cryptographically secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### MongoDB Security

#### 1. **Credential Management**
- Never hardcode MongoDB URIs in source code
- Always use environment variables (`process.env.MONGODB_URI`)
- Rotate credentials immediately if exposed

#### 2. **MongoDB Atlas Configuration**
- Enable IP Access List (whitelist only your server IPs)
- Use strong passwords (minimum 16 characters, mix of letters/numbers/symbols)
- Enable database authentication
- Use least-privilege user accounts

#### 3. Connection String Security
```javascript
// NEVER DO THIS
const MONGODB_URI = "mongodb+srv://user:pass@cluster.mongodb.net/db";

// ALWAYS DO THIS
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}
```

### Authentication Security

#### 1. **Password Hashing**
- Passwords are hashed using bcryptjs with salt rounds
- Never store plain text passwords
- Minimum password length: 6 characters (consider increasing)

#### 2. **JWT Tokens**
- Tokens expire after 7 days
- Stored in httpOnly cookies (preferred) or localStorage
- Rotate JWT_SECRET regularly

#### 3. **Session Management**
- Implement token refresh mechanism
- Clear tokens on logout
- Validate tokens on every protected route

### API Security

#### 1. **Route Protection**
```javascript
// Verify JWT token before processing
const token = request.cookies.get('token')?.value;
if (!token) {
  return NextResponse.json({ success: false, msg: "Unauthorized" });
}
```

#### 2. **Input Validation**
- Validate all user inputs
- Sanitize data before database operations
- Use Mongoose schema validation

#### 3. **Rate Limiting**
Consider implementing rate limiting for:
- Login attempts
- Registration
- Password reset
- API endpoints

### File Upload Security

#### 1. **Image Uploads**
- Validate file types (only allow specific image formats)
- Check file size limits
- Sanitize file names
- Store in public/images/ directory
- Consider using cloud storage (Cloudinary, S3) for production

### Admin Access

#### 1. **Admin User Creation**
- Never create admin users through public APIs
- Use MongoDB Compass or shell for initial admin setup
- Implement admin approval workflow for new admins
- See ADMIN_SETUP.md for detailed instructions

#### 2. **Admin Route Protection**
```javascript
// Verify user is admin
const user = await userModel.findById(userId);
if (!user?.isAdmin) {
  return NextResponse.json({ success: false, msg: "Access denied" });
}
```

## If Credentials Are Exposed

### Immediate Actions

1. **Rotate MongoDB Credentials**
   - Log into MongoDB Atlas
   - Database Access → Edit User → Change Password
   - Update `.env.local` with new password
   - Restart your application

2. **Rotate JWT_SECRET**
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Update .env.local
   # All existing tokens will be invalidated
   ```

3. **Check Database**
   - Review MongoDB Atlas access logs
   - Check for unauthorized database access
   - Review user collections for suspicious accounts
   - Consider restoring from backup if compromised

4. **Update Git History**
   ```bash
   # If credentials were committed, they remain in git history
   # Consider using git-filter-repo or BFG Repo-Cleaner
   # Or create a new repository with clean history
   ```

5. **Enable MongoDB Atlas Alerts**
   - Set up email alerts for unusual activity
   - Enable IP access list
   - Review security settings

## Security Checklist

### Before Every Commit
- [ ] Run `git status` and review staged files
- [ ] Verify `.env.local` is NOT staged
- [ ] Check documentation for real credentials
- [ ] Review `git diff --staged` for sensitive data
- [ ] Confirm examples use placeholders only
- [ ] Search for patterns: `mongodb+srv://` with real credentials

### Before Deployment
- [ ] All `.env*` files except `.env.example` are in `.gitignore`
- [ ] No hardcoded credentials in source code
- [ ] JWT_SECRET is cryptographically secure (32+ bytes)
- [ ] MongoDB uses strong password (16+ characters)
- [ ] MongoDB Atlas IP access list is configured
- [ ] Admin users are created through secure method
- [ ] File upload validation is implemented
- [ ] API routes have proper authentication
- [ ] CORS is properly configured
- [ ] Error messages don't leak sensitive information

### Regular Maintenance
- [ ] Rotate credentials every 90 days
- [ ] Review MongoDB Atlas access logs monthly
- [ ] Update dependencies regularly (`npm audit`)
- [ ] Review user permissions quarterly
- [ ] Test backup and restore procedures
- [ ] Monitor for security vulnerabilities
- [ ] Review all documentation for exposed credentials

## Additional Resources

- MongoDB Security Checklist: https://www.mongodb.com/docs/manual/administration/security-checklist/
- Next.js Security Headers: https://nextjs.org/docs/app/building-your-application/configuring/security-headers
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

## Reporting Security Issues

If you discover a security vulnerability, please email the project maintainers directly. Do not open public issues for security vulnerabilities.

## Security Advisories

### Past Security Incidents

#### January 12, 2026 - MongoDB Credentials in Documentation (Resolved in v0.5.8)

**Issue:** GitHub Secret Scanning detected MongoDB connection strings with credential patterns in documentation files.

**Affected Files:** 
- `docs/QUICK_START.md`
- `DEVELOPER_GUIDE.md`

**Resolution:**
- All credential examples removed from documentation
- Replaced with generic placeholders
- Updated to v0.5.8
- See `SECURITY_ADVISORY_2026-01-12.md` for full details

**Lessons Learned:**
1. Always use obviously fake placeholders in documentation
2. Never include real connection string patterns
3. Review all documentation before commits
4. Respond immediately to security scanning alerts
5. Rotate credentials as a precaution

**Action Items for Users:**
- If you cloned before v0.5.8, rotate your credentials
- Update to v0.5.8 or later
- Review your own .env.local file
- Never commit .env files to version control

---

Security is an ongoing process. Regularly review and update your security practices.

# Security Checklist

Quick reference for developers to ensure security best practices.

## First-Time Setup

### Install Pre-Commit Hook (Recommended)

Automate security checks before every commit:

```bash
# Copy the pre-commit hook
cp docs/pre-commit.sh .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit

# Test it (should show "✅ Pre-commit security checks passed!")
.git/hooks/pre-commit
```

The pre-commit hook will automatically:
- Block commits of .env files (except .env.example)
- Detect MongoDB connection strings with credentials
- Warn about potential API keys or secrets
- Check documentation for real cluster names

**Without the hook**, you must manually run through the checklist below before every commit.

## Before Every Commit

Run through this checklist before committing any code:

```bash
# 1. Check what you're about to commit
git status
git diff --staged

# 2. Verify .env files are NOT staged
# If you see .env.local or .env in the list, DO NOT COMMIT
# Remove them with: git reset HEAD .env.local

# 3. Search for exposed credentials in staged files
git diff --staged | grep -i "mongodb+srv://"
git diff --staged | grep -i "JWT_SECRET"
git diff --staged | grep -i "password"

# 4. Verify .gitignore is protecting sensitive files
cat .gitignore | grep ".env"
# Should show: .env*
```

### Documentation Safety

When writing or updating documentation:

- [ ] No real MongoDB connection strings
- [ ] No real usernames or passwords (even in examples)
- [ ] Use placeholders like `your-mongodb-uri-here`
- [ ] Use generic examples like `username:password` not project-specific names
- [ ] No cluster names from MongoDB Atlas
- [ ] No API keys or secrets (even fake ones that look real)

### Safe Example Patterns

✅ **SAFE:**
```env
MONGODB_URI=your-mongodb-connection-string-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-jwt-secret-here
```

❌ **UNSAFE:**
```env
MONGODB_URI=mongodb+srv://PROJECT-NAME:pass@REAL-CLUSTER.mongodb.net/db
MONGODB_URI=mongodb+srv://user:pass@cluster123.abc.mongodb.net/rice-events
JWT_SECRET=a1b2c3d4e5f6...
```

## Before Deployment

- [ ] All `.env*` files (except `.env.example`) are in `.gitignore`
- [ ] No hardcoded credentials anywhere in source code
- [ ] JWT_SECRET is 64+ characters (generated with crypto.randomBytes)
- [ ] MongoDB password is 20+ characters with mixed case, numbers, symbols
- [ ] MongoDB Atlas IP access list is configured (not 0.0.0.0/0 in production)
- [ ] Admin users created through secure method (not hardcoded)
- [ ] File upload validation is active
- [ ] API routes have authentication checks
- [ ] CORS is configured for your domain only
- [ ] Error messages don't reveal system details

## Regular Maintenance

### Weekly
- [ ] Run `npm audit` and review vulnerabilities
- [ ] Check MongoDB Atlas for unusual activity

### Monthly
- [ ] Review user permissions and admin access
- [ ] Check application logs for suspicious patterns
- [ ] Verify backup procedures work

### Quarterly (Every 90 Days)
- [ ] Rotate MongoDB credentials
- [ ] Rotate JWT_SECRET (invalidates all sessions)
- [ ] Review and update dependencies
- [ ] Security audit of new features
- [ ] Review all documentation for exposed credentials

## Emergency Response

If credentials are ever exposed (committed to git, shared publicly, etc.):

### Immediate Actions (Within 1 Hour)

1. **Rotate ALL credentials immediately**
   ```bash
   # Generate new JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Change MongoDB password in Atlas dashboard
   # Update .env.local with new credentials
   ```

2. **Update production environment**
   - Deploy with new credentials
   - Verify application still works
   - All user sessions will be invalidated (expected)

3. **Check for unauthorized access**
   - MongoDB Atlas → Data Access → Activity Feed
   - Look for suspicious queries or connections
   - Review user collection for unknown accounts

4. **Document the incident**
   - When credentials were exposed
   - How long they were exposed
   - What actions were taken
   - Create security advisory if public repository

### Follow-Up Actions (Within 24 Hours)

5. **Clean git history** (optional but recommended)
   ```bash
   # Option 1: Use git-filter-repo
   git filter-repo --path-rename .env.local:
   
   # Option 2: Create new repository
   # Export clean code, create fresh repo
   ```

6. **Review and improve**
   - How did credentials get exposed?
   - Update documentation to prevent recurrence
   - Add pre-commit hooks if needed
   - Train team on security practices

7. **Monitor for 30 days**
   - Watch for unusual activity
   - Check access logs regularly
   - Enable MongoDB Atlas alerts

## Tools and Commands

### Generate Secure Secrets

```bash
# JWT Secret (64 bytes = 128 hex characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cron Secret (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check for Exposed Credentials

```bash
# Search entire codebase for connection strings
grep -r "mongodb+srv://" . --exclude-dir=node_modules

# Search for JWT secrets (look for patterns)
grep -r "JWT_SECRET.*=" . --exclude-dir=node_modules

# Check what's in git history
git log --all --full-history --source --grep="mongodb"
```

### Verify .gitignore Protection

```bash
# List all .env files
ls -la | grep ".env"

# Check which are tracked by git (should be empty except .env.example)
git ls-files | grep ".env"

# If .env.local shows up, it's being tracked (BAD!)
# Remove it from git:
git rm --cached .env.local
```

## Resources

- [SECURITY.md](../SECURITY.md) - Full security policy
- [SECURITY_ADVISORY_2026-01-12.md](../SECURITY_ADVISORY_2026-01-12.md) - Recent incident report
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Remember:** Security is not a one-time setup. It's an ongoing practice. Review this checklist regularly and stay vigilant.

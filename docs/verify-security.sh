#!/bin/bash
#
# Security Verification Script for v0.5.8
# Run this to verify all security issues are resolved
#

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔒 Rice Events v0.5.8 Security Verification"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Test 1: Check for .env files in git
echo -e "${BLUE}Test 1: Checking for .env files in version control...${NC}"
ENV_IN_GIT=$(git ls-files | grep "^\.env" | grep -v ".env.example")
if [ -z "$ENV_IN_GIT" ]; then
    echo -e "${GREEN}✅ PASS: No .env files in git (except .env.example)${NC}"
else
    echo -e "${RED}❌ FAIL: Found .env files in git:${NC}"
    echo "$ENV_IN_GIT"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 2: Check .gitignore for .env pattern
echo -e "${BLUE}Test 2: Checking .gitignore for .env* pattern...${NC}"
if grep -q "^\.env\*" .gitignore; then
    echo -e "${GREEN}✅ PASS: .gitignore contains .env* pattern${NC}"
else
    echo -e "${RED}❌ FAIL: .gitignore missing .env* pattern${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 3: Search for MongoDB credentials in documentation
echo -e "${BLUE}Test 3: Searching for MongoDB credentials in documentation...${NC}"
CREDS=$(grep -r "mongodb+srv://[^:]*:[^@:]*@" --include="*.md" . | grep -v "username:password" | grep -v "user:pass" | grep -v "PROJECT-USER" | grep -v "PROJECT-NAME" | grep -v ".old.md" | grep -v "SECURITY_CHECKLIST" | grep -v "SECURITY_ADVISORY" | grep -v "V0.5.8_RELEASE_SUMMARY" | grep -v "shown here for reference only")
if [ -z "$CREDS" ]; then
    echo -e "${GREEN}✅ PASS: No MongoDB credentials found in documentation${NC}"
else
    echo -e "${RED}❌ FAIL: Found potential MongoDB credentials:${NC}"
    echo "$CREDS"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 4: Check for specific cluster names in documentation
echo -e "${BLUE}Test 4: Checking for specific MongoDB cluster names...${NC}"
CLUSTERS=$(grep -r "cluster[0-9]\+\.[a-z0-9]\+\.mongodb\.net" --include="*.md" . | grep -v ".old.md" | grep -v "REAL-CLUSTER" | grep -v "cluster123")
if [ -z "$CLUSTERS" ]; then
    echo -e "${GREEN}✅ PASS: No specific cluster names in documentation${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Found specific cluster names:${NC}"
    echo "$CLUSTERS"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 5: Check for JWT secrets that look real (long hex strings)
echo -e "${BLUE}Test 5: Checking for potential JWT secrets in documentation...${NC}"
JWT_SECRETS=$(grep -rE "JWT_SECRET.*=.*[a-f0-9]{32,}" --include="*.md" . | grep -v ".old.md")
if [ -z "$JWT_SECRETS" ]; then
    echo -e "${GREEN}✅ PASS: No JWT secrets found in documentation${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Found potential JWT secrets:${NC}"
    echo "$JWT_SECRETS"
    echo -e "${YELLOW}Please verify these are placeholders, not real secrets${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 6: Verify security documentation exists
echo -e "${BLUE}Test 6: Checking for security documentation files...${NC}"
MISSING_DOCS=""
[ ! -f "SECURITY.md" ] && MISSING_DOCS="$MISSING_DOCS SECURITY.md"
[ ! -f "SECURITY_ADVISORY_2026-01-12.md" ] && MISSING_DOCS="$MISSING_DOCS SECURITY_ADVISORY_2026-01-12.md"
[ ! -f "docs/SECURITY_CHECKLIST.md" ] && MISSING_DOCS="$MISSING_DOCS docs/SECURITY_CHECKLIST.md"
[ ! -f "docs/pre-commit.sh" ] && MISSING_DOCS="$MISSING_DOCS docs/pre-commit.sh"

if [ -z "$MISSING_DOCS" ]; then
    echo -e "${GREEN}✅ PASS: All security documentation files present${NC}"
else
    echo -e "${RED}❌ FAIL: Missing security documentation:${NC}"
    echo "$MISSING_DOCS"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 7: Verify version numbers
echo -e "${BLUE}Test 7: Checking version numbers...${NC}"
VERSION_FILES="README.md DEVELOPER_GUIDE.md docs/README.md"
VERSION_MISMATCHES=""
for FILE in $VERSION_FILES; do
    if [ -f "$FILE" ]; then
        if ! grep -q "0\.5\.8" "$FILE"; then
            VERSION_MISMATCHES="$VERSION_MISMATCHES $FILE"
        fi
    fi
done

if [ -z "$VERSION_MISMATCHES" ]; then
    echo -e "${GREEN}✅ PASS: All files show version 0.5.8${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: These files may need version update:${NC}"
    echo "$VERSION_MISMATCHES"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 8: Check if pre-commit hook is installed
echo -e "${BLUE}Test 8: Checking if pre-commit hook is installed...${NC}"
if [ -f ".git/hooks/pre-commit" ]; then
    echo -e "${GREEN}✅ PASS: Pre-commit hook is installed${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Pre-commit hook not installed${NC}"
    echo -e "${YELLOW}Install with: cp docs/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 9: Verify .env.local is not tracked
echo -e "${BLUE}Test 9: Checking if .env.local exists and is ignored...${NC}"
if [ -f ".env.local" ]; then
    if git ls-files --error-unmatch .env.local 2>/dev/null; then
        echo -e "${RED}❌ FAIL: .env.local is tracked by git!${NC}"
        echo -e "${RED}Remove with: git rm --cached .env.local${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ PASS: .env.local exists and is properly ignored${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  INFO: .env.local does not exist yet (expected for fresh clone)${NC}"
fi
echo ""

# Test 10: Search for "ricevents" username in documentation
echo -e "${BLUE}Test 10: Checking for project-specific usernames in docs...${NC}"
USERNAMES=$(grep -r "ricevents" --include="*.md" . | grep -v "Rice Events" | grep -v "rice-events" | grep -v ".old.md" | grep -v "CHANGELOG" | grep -v "RELEASE_SUMMARY" | grep -v "SECURITY_ADVISORY" | grep -v "project-specific" | grep -v "PROJECT-")
if [ -z "$USERNAMES" ]; then
    echo -e "${GREEN}✅ PASS: No problematic username references in documentation${NC}"
else
    echo -e "${YELLOW}⚠️  INFO: Found 'ricevents' references:${NC}"
    echo "$USERNAMES" | head -n 3
    echo -e "${YELLOW}Verify these are legitimate references (project name, not credentials)${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}Verification Summary${NC}"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical security tests passed!${NC}"
else
    echo -e "${RED}❌ $ERRORS critical issue(s) found${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) to review${NC}"
fi

echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Version 0.5.8 is secure and ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. git add ."
    echo "  2. git commit -m 'v0.5.8: Security fix - Remove exposed credentials'"
    echo "  3. git tag -a v0.5.8 -m 'Version 0.5.8 - Security Fix'"
    echo "  4. git push origin main --tags"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Review warnings above before deploying${NC}"
    exit 0
else
    echo -e "${RED}❌ Please fix errors above before deploying${NC}"
    exit 1
fi

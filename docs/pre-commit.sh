#!/bin/bash
#
# Pre-commit hook to prevent accidentally committing sensitive files
# 
# Installation:
#   cp docs/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# This hook will:
# 1. Prevent committing .env files (except .env.example)
# 2. Warn if MongoDB connection strings are found
# 3. Warn if potential secrets are found
#

# ANSI color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔒 Running pre-commit security checks..."

# Check for .env files (except .env.example)
ENV_FILES=$(git diff --cached --name-only | grep -E '^\.env' | grep -v '.env.example')
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}❌ ERROR: Attempting to commit .env files!${NC}"
    echo -e "${RED}These files should NEVER be committed:${NC}"
    echo "$ENV_FILES"
    echo ""
    echo -e "${YELLOW}To fix this:${NC}"
    echo "  git reset HEAD .env.local .env .env.production"
    echo ""
    echo -e "${YELLOW}Then add them to .gitignore if not already:${NC}"
    echo "  echo '.env*' >> .gitignore"
    echo "  echo '!.env.example' >> .gitignore"
    exit 1
fi

# Check for MongoDB connection strings with credentials
MONGODB_STRINGS=$(git diff --cached | grep -i 'mongodb+srv://[^:]*:[^@]*@')
if [ -n "$MONGODB_STRINGS" ]; then
    echo -e "${RED}❌ ERROR: Found MongoDB connection string with credentials!${NC}"
    echo -e "${RED}Connection strings should use placeholders, not real credentials:${NC}"
    echo ""
    echo -e "${YELLOW}Found:${NC}"
    echo "$MONGODB_STRINGS" | head -n 5
    echo ""
    echo -e "${YELLOW}Replace with:${NC}"
    echo "  MONGODB_URI=your-mongodb-connection-string-here"
    echo "  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    echo ""
    echo -e "${YELLOW}Review these files:${NC}"
    git diff --cached --name-only
    exit 1
fi

# Check for potential JWT secrets (long hex strings that look like secrets)
JWT_PATTERNS=$(git diff --cached | grep -E 'JWT_SECRET.*=.*[a-f0-9]{32,}')
if [ -n "$JWT_PATTERNS" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found potential JWT secret!${NC}"
    echo -e "${YELLOW}Make sure this is a placeholder, not a real secret:${NC}"
    echo ""
    echo "$JWT_PATTERNS" | head -n 3
    echo ""
    echo -e "${YELLOW}Safe examples:${NC}"
    echo "  JWT_SECRET=your-jwt-secret-here"
    echo "  JWT_SECRET=generate-with-crypto-randomBytes"
    echo ""
    read -p "Is this a placeholder (not a real secret)? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Commit aborted. Please replace with a placeholder.${NC}"
        exit 1
    fi
fi

# Check for common credential patterns in documentation files
DOC_FILES=$(git diff --cached --name-only | grep -E '\.(md|txt)$')
if [ -n "$DOC_FILES" ]; then
    for FILE in $DOC_FILES; do
        # Check for real-looking cluster names
        CLUSTERS=$(git diff --cached "$FILE" | grep -E '\+.*cluster[0-9]+\.[a-z0-9]+\.mongodb\.net')
        if [ -n "$CLUSTERS" ]; then
            echo -e "${YELLOW}⚠️  WARNING: Found specific MongoDB cluster name in documentation!${NC}"
            echo -e "${YELLOW}File: $FILE${NC}"
            echo -e "${YELLOW}Consider using generic examples instead:${NC}"
            echo "  mongodb+srv://username:password@cluster.mongodb.net/database"
            echo ""
            read -p "Continue anyway? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${RED}❌ Commit aborted.${NC}"
                exit 1
            fi
        fi
    done
fi

# Check for API keys (common patterns)
API_KEYS=$(git diff --cached | grep -iE '(api[_-]?key|api[_-]?secret).*=.*[a-zA-Z0-9]{20,}')
if [ -n "$API_KEYS" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found potential API key!${NC}"
    echo -e "${YELLOW}Make sure this is a placeholder, not a real key:${NC}"
    echo ""
    echo "$API_KEYS" | head -n 3
    echo ""
    read -p "Is this a placeholder (not a real key)? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Commit aborted. Please replace with a placeholder.${NC}"
        exit 1
    fi
fi

# All checks passed
echo -e "${GREEN}✅ Pre-commit security checks passed!${NC}"
echo ""

exit 0

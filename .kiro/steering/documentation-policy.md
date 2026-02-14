# Documentation Policy

## Core Principle
**DO NOT create new markdown files in the root directory for every change or update.**

## Allowed Root Documentation Files (ONLY 3)

1. **README.md** - Project overview and quick start
2. **DEPLOYMENT_SOP.md** - Complete deployment guide
3. **PRODUCT_REQUIREMENTS.md** - Product features and roadmap

## What to Do Instead

### When Making Changes
- ✅ Update existing documentation files (README.md, DEPLOYMENT_SOP.md)
- ✅ Update steering files in `.kiro/steering/` if needed
- ✅ Add comments in code for complex logic
- ❌ DO NOT create new root-level markdown files like:
  - CLEANUP_SUMMARY.md
  - FINAL_STATE.md
  - QUESTIONS_ANSWERED.md
  - ARCHITECTURE_UPDATE.md
  - CHANGES_LOG.md
  - etc.

### When Documenting Architecture Changes
- ✅ Update the relevant section in DEPLOYMENT_SOP.md
- ✅ Update `.kiro/steering/tech.md` or `.kiro/steering/deployment.md`
- ❌ DO NOT create ARCHITECTURE_V2.md, NEW_ARCHITECTURE.md, etc.

### When Documenting New Features
- ✅ Update PRODUCT_REQUIREMENTS.md
- ✅ Update `.kiro/steering/features.md`
- ❌ DO NOT create FEATURE_X_DOCS.md

### When Cleaning Up Code
- ✅ Just do the cleanup
- ✅ Mention in git commit message
- ❌ DO NOT create CLEANUP_SUMMARY.md

### When Answering Questions
- ✅ Answer directly in conversation
- ✅ Update existing docs if the answer should be permanent
- ❌ DO NOT create QUESTIONS_ANSWERED.md

## Steering Files (In .kiro/steering/)

These are the ONLY places for detailed documentation:

- `tech.md` - Technology stack and configuration
- `structure.md` - Project structure and organization
- `product.md` - Product overview and business model
- `features.md` - Feature documentation and patterns
- `development.md` - Development best practices
- `deployment.md` - Deployment procedures
- `mentor-assignment.md` - Mentor assignment system
- `documentation-policy.md` - This file

**Update these files when needed, don't create new ones.**

## Git Repository Cleanliness

### Root Directory Should Only Have:
```
codementee/
├── deploy.sh                    # Deployment script
├── CHECK_STATUS.sh              # Status checker
├── start-local-dev.sh           # Local dev
├── README.md                    # Overview
├── DEPLOYMENT_SOP.md            # Deployment guide
├── PRODUCT_REQUIREMENTS.md      # Product docs
├── backend/                     # Backend code
├── frontend/                    # Frontend code
├── systemd/                     # Service files
├── .kiro/                       # Kiro config
└── tests/                       # Tests
```

**Total root files: 6 (3 scripts + 3 docs)**

## Examples

### ❌ BAD: Creating New Files
```bash
# User asks about architecture
# Agent creates: CURRENT_ARCHITECTURE.md

# User asks about cleanup
# Agent creates: CLEANUP_SUMMARY.md

# User asks questions
# Agent creates: QUESTIONS_ANSWERED.md

# Result: Repository cluttered with 10+ markdown files
```

### ✅ GOOD: Updating Existing Files
```bash
# User asks about architecture
# Agent updates: DEPLOYMENT_SOP.md (Architecture section)

# User asks about cleanup
# Agent: Just does cleanup, no new file

# User asks questions
# Agent: Answers in conversation, updates docs if needed

# Result: Clean repository with only essential files
```

## When to Create New Files

### ONLY create new files for:
1. **New application code** (backend/frontend)
2. **New scripts** (if absolutely necessary)
3. **New steering files** (very rare, only for major new patterns)

### NEVER create new files for:
1. Documenting changes
2. Answering questions
3. Explaining decisions
4. Summarizing work
5. Tracking cleanup
6. Recording history

## Summary

**Remember:** 
- Keep root directory clean (6 files only)
- Update existing docs, don't create new ones
- Use steering files for detailed patterns
- Answer questions in conversation
- Let git commits track history

**The goal is a clean, maintainable repository that doesn't accumulate documentation debt.**

#!/bin/bash

# Cleanup script - removes all old deployment scripts and docs
# Keep only essential files

echo "Cleaning up old deployment files..."

# Remove old deployment scripts
rm -f FRESH_DEPLOY.sh COMPLETE_FIX.sh FIX_MONGO_CONNECTION.sh TEST_DEPLOYMENT.sh
rm -f FINAL_FIX.sh EMERGENCY_FIX.sh DEPLOY_NOW.sh RELIABLE_DEPLOY.sh
rm -f FIX_BACKEND_STARTUP.sh PERMANENT_DEPLOYMENT_FIX.sh FINAL_LOADING_FIX.sh
rm -f DEPLOY_MOBILE_FIX.sh DEPLOY_WITH_ERROR_CHECK.sh SIMPLE_DEPLOY.sh
rm -f FIX_JS_LOADING_FAILURE.sh vps-fix-first-load.sh FIX_FIRST_LOAD_ISSUE.sh
rm -f bypass-docker-deploy.sh debug-deployment-issue.sh force-deploy-latest.sh
rm -f complete-diagnosis.sh DEFINITIVE_LOADING_FIX.sh PERMANENT_LOADING_FIX.sh
rm -f diagnose-loading-issue.sh quick-deploy-fix.sh fix-deployment-permissions.sh
rm -f deploy-website-fixes.sh fix-website-loading.sh vps-diagnose-js-loading.sh
rm -f fix-mobile-and-payment-issues.sh fix-frontend-build.sh setup-domain.sh
rm -f production-setup.sh deploy-codementee.sh vps-setup-domain.sh
rm -f vps-rebuild-frontend.sh deploy-frontend-update.sh vps-optimize-frontend.sh
rm -f setup-domain-access.sh setup-ssl-certificate.sh FIX_EVERYTHING_NOW.sh
rm -f COMPLETE_PRODUCTION_FIX.sh EMERGENCY_NGINX_FIX.sh

# Remove old documentation
rm -f BACKEND_STARTUP_FIXED.md VPS_COMMANDS.md DEPLOYMENT_PROCESS.md
rm -f TOMORROW_DEPLOYMENT_CHECKLIST.md FIX_MOBILE_LOADING.md QUICK_FIX_GUIDE.md
rm -f JS_LOADING_FAILURE_FIX.md FIRST_LOAD_ISSUE_EXPLAINED.md LOADING_FIX_SUMMARY.md
rm -f LOADING_ISSUE_ROOT_CAUSE_AND_FIX.md WEBSITE_LOADING_ISSUES_FIXED.md
rm -f RAZORPAY_INTEGRATION_FIXED.md PAYMENT_FLOW_DEBUG_FIXED.md
rm -f ALL_ISSUES_RESOLVED.md PRICING_TRANSPARENCY_FIXED.md DASHBOARD_LAYOUT_FIXED.md
rm -f COMPLETE_THEME_CONSISTENCY_FIXED.md BOOKING_FLOW_IMPROVEMENTS.md
rm -f MENTOR_ASSIGNMENT_SYSTEM_COMPLETE.md IMPROVED_USER_FLOW_IMPLEMENTED.md
rm -f PRICING_AND_PAYOUT_SYSTEM_COMPLETE.md SETUP_COMPLETE.md SETUP_GUIDE.md
rm -f PHASE_1_IMPLEMENTATION.md DEPLOYMENT_SUCCESS.md SIMPLE_DOMAIN_SETUP.md
rm -f QUICK_DOMAIN_SETUP.md DOMAIN_SETUP_INSTRUCTIONS.md FINAL_DEPLOYMENT_GUIDE.md
rm -f COMPLETE_DEPLOYMENT_JOURNEY.md COMPONENT_USAGE_GUIDE.md SCALING_TO_100K_USERS_GUIDE.md
rm -f CURRENT_ARCHITECTURE_GUIDE.md MOBILE_AND_PAYMENT_FIXES.md FRONTEND_API_FIX.md
rm -f DOMAIN_SETUP_GUIDE.md THEME_SYSTEM_GUIDE.md LAUNCH_MESSAGES.md

# Remove old config files
rm -f nginx-https-ready.conf docker-compose.prod.yml vps-access-guide.md
rm -f frontend/Dockerfile.prod

# Remove debug scripts
rm -f backend/debug_payment_issue.py backend/test_payment_flow.py
rm -f backend/validate_pricing_integrity.py backend/cleanup_duplicate_pricing.py
rm -f backend/fix_pricing_transparency.py backend/update_pricing.py backend/update_new_pricing.py

echo "✓ Cleanup complete!"
echo ""
echo "Kept essential files:"
echo "  - deploy.sh (main deployment script)"
echo "  - DEPLOYMENT_SOP.md (deployment guide)"
echo "  - CHECK_STATUS.sh (status checker)"
echo "  - start-local-dev.sh (local development)"
echo "  - backend/setup_initial_data.py (database setup)"

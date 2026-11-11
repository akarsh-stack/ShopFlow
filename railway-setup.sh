#!/usr/bin/env bash
# Helper script to deploy the monorepo services to Railway using the Railway CLI.
# This script echoes the commands for safety — run the commands interactively.

set -euo pipefail

SERVICES=("product-service" "auth-service" "payment-service" "order-service" "email-service")
MONOREPO_ROOT="$(pwd)"

echo "Railway CLI helper — make sure you have 'railway' installed and you're logged in."
echo "Install: npm install -g @railway/cli"

if ! command -v railway >/dev/null 2>&1; then
  echo "railway CLI not found. Install and then re-run this script."
  exit 1
fi

echo "1) Initialize or link a Railway project (interactive):"
echo "   railway init"

echo "2) For each service, run the following (it will build the Dockerfile in that folder):"
for s in "${SERVICES[@]}"; do
  echo "---"
  echo "cd $MONOREPO_ROOT/apps/$s"
  echo "railway up"
done

echo "---"
echo "3) After each service deploys, Railway will provide a public URL. Note those URLs and set environment variables in Railway and Vercel."

echo "4) Example: set variables via Railway CLI (run once you have actual values):"
echo "railway variables set CLERK_SECRET_KEY=your-clerk-secret"
echo "railway variables set STRIPE_SECRET_KEY=your-stripe-secret"
echo "railway variables set STRIPE_WEBHOOK_SECRET=your-webhook-secret"
echo "railway variables set KAFKA_BROKERS=broker1:port,broker2:port"

echo "5) If you want me to generate exact railway variables commands, paste the Railway service URLs here and I'll prepare them."

exit 0

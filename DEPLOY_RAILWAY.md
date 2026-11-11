Railway + Vercel deployment guide (quick)

This file helps you deploy your backend to Railway and frontends to Vercel.

Prereqs
- GitHub repo for this project, pushed and connected to Railway/Vercel
- Railway account (https://railway.app) connected to GitHub
- Vercel account (https://vercel.com) connected to GitHub
- Upstash (or Confluent) account for Kafka (Railway does not provide Kafka)
- Stripe, Clerk, Cloudinary, Google OAuth credentials ready

High-level flow (web UI)
1. Railway: create a Project -> Deploy from GitHub -> choose this repo.
2. For each backend service (in Railway): create a new Service and point the root to the folder under `apps/<service>` and let Railway build using the `Dockerfile`.
   - Services: product-service, auth-service, payment-service, order-service, email-service
3. Add plugins on Railway (or external services): PostgreSQL, MongoDB (or use MongoDB Atlas), Upstash Kafka.
4. Set environment variables (Railway: Project -> Variables). See `vercel-envs.txt` and `.env.railway.example` for exact names and placeholders.
5. Deploy and wait for Railway to provide public URLs for each service.
6. Copy the public service URLs into Vercel project environment variables for `apps/client` and `apps/admin`.
7. Configure Stripe webhook using the Railway Payment service URL: `https://<payment-service>/webhooks/stripe`.

Railway CLI helper (manual steps)
- Install Railway CLI: `npm install -g @railway/cli`
- Login: `railway login`
- From the monorepo root, you can deploy a service folder by folder; example (run interactively):

```bash
# link/create a railway project
railway init   # follow prompts to create a new project or link

# deploy product-service
cd apps/product-service
railway up
# repeat for other services
```

Set Railway variables (example):

```bash
railway variables set CLERK_SECRET_KEY=your-clerk-secret
railway variables set STRIPE_SECRET_KEY=your-stripe-secret
railway variables set STRIPE_WEBHOOK_SECRET=your-webhook-secret
railway variables set KAFKA_BROKERS="broker1:port,broker2:port"
```

Notes
- Upstash Kafka may require SASL/SSL; you may need to update `packages/kafka/src/client.ts` to support username/password and ssl settings. I already made broker selection read from `KAFKA_BROKERS`.
- Use the Railway-provided Postgres and Mongo connection strings in `DATABASE_URL` and `MONGO_URL`.

If you want, I can:
- Prepare exact `railway variables set` commands once you paste the Railway service URLs
- Help adapt `packages/kafka/src/client.ts` for SASL/SSL if you choose Upstash

Files created in repo:
- `vercel-envs.txt` (copy-paste for Vercel)
- `.env.railway.example` (copy to Railway or use to populate variables)
- `railway-setup.sh` (helper script with step-by-step commands/echoes)

Runbook: after Railway deploy, paste service URLs here and I'll produce the exact commands to set variables on Railway and Vercel.

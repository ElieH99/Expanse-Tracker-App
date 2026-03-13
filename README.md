# Internal Expense Tracker

An internal web application for employees to submit expense claims and managers to review, approve, reject, or close them. Supports the full expense lifecycle with version-snapshotted resubmissions and a permanent audit trail.

This is an internal tool — clarity, correctness, and auditability take priority over polish.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend / DB | Convex (database, server functions, real-time queries, file storage) |
| Auth | Convex Auth (email/password) |
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI) |
| Tables | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| Dates | date-fns |
| Language | TypeScript (strict) |

## Prerequisites

- **Node.js** >= 18
- **npm** (or pnpm)
- **Convex CLI** — install globally: `npm i -g convex`

## Local Development

```bash
# 1. Clone the repository
git clone <repo-url> && cd expense-tracker

# 2. Copy environment variables
cp .env.example .env.local

# 3. Fill in your Convex deployment URL and auth secret in .env.local

# 4. Install dependencies
npm install

# 5. Start the Convex dev server (in a separate terminal)
npx convex dev

# 6. Start the Next.js dev server
npm run dev

# 7. Open http://localhost:3000
```

## Seed Script

Seed the database with categories and test accounts:

```bash
npx convex run seed
```

This creates:
- 7 expense categories (Travel, Accommodation, Meals & Entertainment, etc.)
- 2 test accounts (see below)

The script is idempotent — safe to run multiple times.

## Environment Variables

| Variable | Description | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL | Convex dashboard → Settings |
| `CONVEX_DEPLOY_KEY` | Deploy key for CI/CD pipelines | Convex dashboard → Settings → Deploy keys |
| `CONVEX_AUTH_SECRET` | Secret for signing auth tokens | Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the deployed app | Your Vercel/hosting dashboard |

## Deploying to Vercel

```bash
# 1. Push your code to GitHub

# 2. Import the repo in Vercel (vercel.com/new)

# 3. Set environment variables in Vercel project settings:
#    - NEXT_PUBLIC_CONVEX_URL
#    - CONVEX_DEPLOY_KEY
#    - CONVEX_AUTH_SECRET
#    - NEXT_PUBLIC_APP_URL

# 4. Deploy your Convex backend to production
npx convex deploy

# 5. Trigger a Vercel deploy (or it will auto-deploy from git push)

# 6. Seed production data
npx convex run seed --prod
```

## Test Accounts

| Role | Name | Email | Password |
|---|---|---|---|
| Employee | Alex Morgan | `employee@test.expensetracker.dev` | `TestEmployee@2026!` |
| Manager | Jordan Lee | `manager@test.expensetracker.dev` | `TestManager@2026!` |

## Project Structure

```
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Login & registration pages
│   ├── (dashboard)/            # Authenticated pages
│   │   ├── page.tsx            # Employee dashboard
│   │   └── manager/page.tsx    # Manager dashboard
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── expenses/               # Expense-specific components
│   └── manager/                # Manager-specific components
├── convex/
│   ├── schema.ts               # Database schema
│   ├── auth.ts                 # Auth configuration
│   ├── http.ts                 # HTTP routes (auth)
│   ├── seed.ts                 # Seed script
│   ├── expenses.ts             # Expense mutations & queries
│   ├── users.ts                # User queries
│   ├── categories.ts           # Category queries
│   └── files.ts                # File upload helpers
├── lib/
│   ├── constants.ts            # Status enums, reasons, currencies
│   ├── permissions.ts          # Role → permission mapping
│   ├── validators.ts           # Shared Zod schemas
│   └── utils.ts                # Utility functions
├── agents/                     # Agent prompt files
├── CLAUDE.md                   # Master context document
├── .env.example                # Environment variable template
└── README.md                   # This file
```

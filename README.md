# ReMarket

ReMarket is a hyper-local secondhand marketplace for Addis Ababa, built with Next.js 14, Prisma, PostgreSQL, NextAuth, and Tailwind CSS.

## Features

- **Authentication** — Register, login, JWT sessions, protected `/sell` and `/dashboard` routes
- **Listings** — Browse, search, filter by category/condition/location/price, create listings
- **Transactions** — Chapa-style checkout flow (create + complete payment)
- **Reviews** — Rate sellers after successful purchases; seller ratings update automatically
- **Dashboard** — Manage listings, purchases, sales, and pending reviews

## Tech Stack

- Next.js 14 App Router (Server Components + Server Actions)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth v5 (Credentials provider + bcrypt)
- Zod validation

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and set your secrets:

```bash
cp .env.example .env.local
```

Required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/remarket?schema=public"
AUTH_SECRET="your-random-secret-here"
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Start PostgreSQL

Using Docker:

```bash
docker compose up -d
```

Or use any existing PostgreSQL instance and update `DATABASE_URL`.

### 4. Set up the database

```bash
npm run db:push
npm run db:seed
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo account (after seeding)

- **Email:** `abebe@example.com`
- **Password:** `password123`

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed sample data |

## Project Structure

```
actions/           Server actions (auth, listings, transactions, reviews)
auth.ts            NextAuth configuration
auth.config.ts     Edge-safe auth + route protection
middleware.ts      Protects /dashboard and /sell
lib/               Prisma client, utilities
prisma/            Schema + seed script
src/app/           Next.js App Router pages
src/components/    Shared UI components
```

## Architecture Notes

- Server actions handle all data mutations and queries.
- Pages are Server Components that fetch from the database directly.
- Without `DATABASE_URL`, auth falls back to in-memory storage and listing browse uses mock data — full functionality requires PostgreSQL.

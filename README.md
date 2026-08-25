# 🌐 E-merkato — Ethiopian Peer-to-Peer Secondhand Marketplace

> **Live Production Deployment**: [https://vintage-challenge.vercel.app/](https://vintage-challenge.vercel.app/)

---

## 📌 Executive Summary & Core Value Proposition

**E-merkato** is a modern, hyper-local P2P secondhand marketplace tailored for Addis Ababa and Ethiopia. It empowers citizens to buy and sell pre-owned goods with high trust, transaction security, and national identity verification built natively into the platform.

### Key Capabilities:
- **Ethiopian National ID (Fayda) Verification**: 4-step national identity verification model using Fayda Identification Numbers (FAN), SMS OTP verification, and physical/digital National ID document photograph uploads.
- **Admin Review Queue & Verification Portal**: Role-restricted admin interface (`/admin`) for inspecting submitted national ID card photos, verifying FAN numbers, and issuing platform verified badges (`🛡️ Verified`).
- **Hyper-Local P2P Marketplace**: Categorized listings (*Electronics*, *Furniture*, *Vehicles*, *Apparel*), neighborhood filtering (*Bole*, *Kazanchis*, *Piassa*, *CMC*, etc.), hero search, and item condition badges.
- **Real-Time Item Status Management**: Instant `• SOLD` tag overlays on item cards upon purchase completion.
- **Role-Based Access Control (RBAC)**: Strict permission boundaries ensuring only authorized platform administrators can access `/admin`.
- **User Account & Profile Management**: Complete account management section (`/account`) with dynamic profile editing (Name, Phone Number, Telegram Handle) and verification status tracking.

---

## 🚀 Live Demo & Admin Credentials

| Environment | URL / Access Details |
| :--- | :--- |
| **Live Web App** | [https://vintage-challenge.vercel.app/](https://vintage-challenge.vercel.app/) |
| **Admin Portal** | [https://vintage-challenge.vercel.app/admin](https://vintage-challenge.vercel.app/admin) *(Restricted to Admin Role)* |
| **Admin Email** | `admin@emerkato.com` |
| **Admin Password** | `admin123password` |

---

## 🛡️ National ID (Fayda) Verification Workflow

E-merkato incorporates a robust 2-phase National Identity verification system:

```
[1. User enters FAN Number] ➔ [2. SMS OTP Verification (849201)] ➔ [3. Upload National ID Card Photo] ➔ [4. Submission Queued in Admin Portal] ➔ [5. Admin Approves/Declines] ➔ [6. Verified Badge Issued 🛡️]
```

1. **FAN Entry**: The user enters their official 12–16 digit Fayda Identification Number (FAN).
2. **SMS OTP Validation**: System dispatches an SMS verification code (Sandbox OTP: `849201`).
3. **Physical ID Photo Upload**: User uploads a photograph of their physical or digital National ID card using a native file input with live preview.
4. **Admin Queue & Audit**: The request is transmitted immediately to the Admin Portal queue (`/admin`). Status transitions to `⏳ Pending Admin Review`.
5. **1-Click Admin Decision**: Administrators evaluate the FAN number and uploaded ID document on `/admin`, clicking **`Approve ✓`** to grant the `🛡️ Verified` badge or **`Decline ✕`** to reject the request.

---

## 💻 Tech Stack

- **Framework**: Next.js 14 / 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **Styling**: Vanilla CSS + Tailwind CSS (Custom Color System, Glassmorphism, Micro-animations)
- **Authentication**: AuthJS v5 (NextAuth) with JWT Sessions & Middleware
- **Database & ORM**: PostgreSQL (Neon Database Serverless Cloud Engine) + Prisma ORM
- **State Store**: `globalThis` persistent memory stores for HMR resilience + Server Actions
- **Validation**: Zod schema validation
- **Deployment**: Vercel Serverless Platform

---

## 📂 Directory & Codebase Architecture

```
vintage-challenge/
├── actions/                  # Server Actions (fayda.ts, listings.ts, user.ts, transactions.ts)
├── auth.ts                   # AuthJS configuration, Credentials provider & Admin role mapping
├── auth.config.ts            # Route protection middleware & session token callbacks
├── lib/                      # Core backend utilities & memory stores
│   ├── account-store.ts      # User profile store & persistence
│   ├── listing-store.ts      # Active marketplace listing store
│   ├── verification-store.ts # National ID verification request persistence store
│   ├── prisma.ts             # Prisma ORM database client connection
│   └── location-data.ts      # Addis Ababa neighborhoods & regions mapping
├── prisma/                   # Database schema & seed scripts
│   ├── schema.prisma         # Prisma data schema (User, Listing, Category, Transaction, Review)
│   └── seed.ts               # Production seed script (Admin setup & category initialization)
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Homepage with Hero Search & Marketplace Feed
│   │   ├── dashboard/        # User Marketplace Dashboard
│   │   ├── explore/          # Category & Location Filtered Explorer
│   │   ├── account/          # User Account Settings & Fayda Verification Hub
│   │   ├── admin/            # Admin Verification Portal (Role Protected)
│   │   ├── sell/             # Item Listing Posting Form with photo upload
│   │   └── listings/[id]/    # Detailed Listing Page with Sold state & Buy flow
│   ├── components/           # UI Components (Header, FaydaVerificationModal, EditProfileModal, etc.)
│   ├── data/                 # System constants & category definitions
│   └── types/                # TypeScript interfaces & domain models
├── README.md                 # Project documentation
└── package.json              # Project dependencies & scripts
```

---

## 🛠️ Getting Started & Local Development

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Dagi2730/vintage-challenge.git
cd vintage-challenge
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://user:password@ep-cool-seed-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="super-secret-auth-key-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Initialization

```bash
# Push schema to database
npm run db:push

# Run seed script to set up Admin user & Categories
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 npm Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start local development server on `http://localhost:3000` |
| `npm run build` | Build Next.js production bundle |
| `npm run start` | Start production server |
| `npm run db:push` | Synchronize Prisma schema with database |
| `npm run db:seed` | Seed database with admin user and clean categories |
| `npm run lint` | Run ESLint static code analysis |

---

## 👥 Credits & Contact

Designed & Developed by **Dagmawit Andargie** for the Ethiopian Secondhand Marketplace Challenge.

- **Live Host**: [https://vintage-challenge.vercel.app/](https://vintage-challenge.vercel.app/)

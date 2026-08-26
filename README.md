# 🌐 E-merkato — Ethiopian Peer-to-Peer Secondhand Marketplace

> **Live Production Deployment**: [https://vintage-challenge.vercel.app/](https://vintage-challenge.vercel.app/)

---

## 📌 Executive Summary & Core Value Proposition

**E-merkato** is a state-of-the-art, hyper-local peer-to-peer (P2P) secondhand marketplace specifically engineered for Addis Ababa and Ethiopia. It empowers citizens to buy and sell pre-owned items (electronics, furniture, vehicles, apparel) with high trust, transaction security, and native national identity verification powered by the Ethiopian Fayda ID system.

---

## 🚀 Live Demo & Access Credentials

| Environment | URL / Details |
| :--- | :--- |
| **Live Web Application** | [https://vintage-challenge.vercel.app/](https://vintage-challenge.vercel.app/) |
| **Admin Management Portal** | [https://vintage-challenge.vercel.app/admin](https://vintage-challenge.vercel.app/admin) *(Restricted to Admin Role)* |
| **Admin Email** | `admin@emerkato.com` |
| **Admin Password** | `admin123password` *(or `admin123`)* |

---

## ✨ Complete Feature & Functionality Breakdown

### 1. 🛡️ Ethiopian National ID (Fayda) Verification Workflow
- **4-Step Verification Wizard**: Interactive modal guiding users through FAN input, SMS OTP validation, ID photo upload, and status tracking.
- **Fayda Identification Number (FAN) Validation**: Validates 12–16 digit national ID numbers.
- **SMS OTP Simulation**: Dispatches a sandbox SMS verification code (`849201`) with rate-limiting protection.
- **National ID Document Upload**: Supports client-side image upload of physical or digital National ID cards with live preview.
- **Admin Review Queue**: Transmits requests to `/admin` where administrators inspect submitted FAN numbers and ID card photos.
- **1-Click Approve & Decline**: Admins can issue platform-wide verified status (`🛡️ Verified`) or reject requests (`❌ Declined`).
- **Verified Seller Badges**: Verified users earn a green `🛡️ Verified` badge displayed across their profile, item detail pages, and listing cards.

### 2. 📸 Image Upload & Real Photo Preservation
- **HTML5 Canvas Compression**: Automatically resizes uploaded images on the client side (800px max dimension, 82% JPEG quality) before submission.
- **Real Photo Storage**: Guarantees that user-uploaded photos are preserved and stored directly without replacing user media with demo assets.
- **Expanded Server Action Payload Limit**: Configured `10MB` body size limit in `next.config.js` to allow multi-photo uploads without request entity size errors.
- **Multi-Photo Support**: Enforces 3 to 5 photos per listing with interactive thumbnail galleries on detail pages.

### 3. ⚙️ Admin Management & Moderation Portal (`/admin`)
- **Role-Based Access Control**: Strict middleware and session checks protecting `/admin` so only users with `ADMIN` role can access it.
- **National ID Verification Queue**: View submitted FAN numbers, view full-resolution National ID card photographs, approve or decline verification requests, or click **`🗑️ Clear Queue`** to reset queue data.
- **Marketplace Listings Moderation**: Complete overview of all active marketplace listings with seller info, price, location, thumbnail, and 1-click **`🗑️ Delete Listing`** capability to purge inappropriate posts from PostgreSQL and memory stores.

### 4. 🛒 Seller Contact & Direct Buyer Outreach
- **Dynamic Contact Synchronization**: Automatically fetches and populates the seller's verified Phone Number and Telegram handle (`@handle`).
- **Direct Telegram Integration**: One-click **`Chat on Telegram (@username)`** button opening `https://t.me/username` in a new tab.
- **Direct Phone Dialer**: One-click **`Call Seller (+251...)`** button launching the phone dialer.
- **Report Listing Modal**: Users can report suspicious or inappropriate items with category reasons (*Misleading Info*, *Prohibited Item*, *Scam*, *Inappropriate Content*).

### 5. 🔍 Hyper-Local Search & Filtering
- **Addis Ababa Neighborhood Mapping**: Supports city and neighborhood selection (*Bole*, *Kazanchis*, *Piassa*, *CMC*, *Akaki Kality*, *Bahir Dar - Belay Zeleke*, etc.).
- **Category Tabs**: Filter listings by *Electronics*, *Furniture*, *Vehicles*, and *Apparel*.
- **Price Range & Sorting**: Filter by min/max ETB price and sort by *Newest*, *Price: Low to High*, or *Price: High to Low*.
- **Hero Search Bar**: Instant keyword search matching item title and description.

### 6. 👤 Account & Profile Management (`/account`)
- **Profile Customization**: Edit display Name, Phone Number, and Telegram Handle with immediate persistence.
- **My Listings Dashboard**: View all user-created listings with direct deletion buttons.
- **Fayda Verification Status Hub**: Real-time status indicator (`UNVERIFIED`, `IN_PROGRESS`, `VERIFIED`, `DECLINED`) with quick launch for the verification wizard.

### 7. 🤖 AI Assistant & Interactive Modals
- **Floating AI Assistant & FAQ Widget**: 24/7 floating support drawer with instant FAQ answers regarding buying, selling, Fayda ID security, and platform rules.
- **Footer Information Modals**: Interactive popups for *Trust & Safety*, *Support & FAQ*, *About Us*, and *Privacy Policy*.

### 8. 🧮 Float Precision & Robust Server Action Error Protection
- **Float Precision Fix**: Handles 32-bit floating point precision loss (e.g. converting `499,984` back to clean `ETB 500,000`).
- **Graceful Error Handling**: Server Actions return structured `{ success: false, error: message }` objects instead of throwing uncaught exceptions, preventing Next.js production Server Component render crashes.

---

## 💻 Tech Stack & Architecture

- **Framework**: Next.js 14 / 15 (App Router, React Server Components, Server Actions)
- **Language**: TypeScript
- **Styling**: Vanilla CSS + Tailwind CSS (Custom Color System, Glassmorphism, Micro-animations)
- **Authentication**: AuthJS v5 (NextAuth) with JWT Sessions & Middleware
- **Database & ORM**: PostgreSQL (Neon Database Serverless Engine) + Prisma ORM
- **Validation**: Zod schema validation
- **Deployment**: Vercel Serverless Platform

---

## 🗄️ Database Schema (Prisma)

```prisma
model User {
  id                String             @id @default(cuid())
  name              String
  email             String             @unique
  passwordHash      String
  role              Role               @default(USER)
  phoneNumber       String?
  telegramHandle    String?
  fanNumber         String?
  nationalIdUrl     String?
  verificationState VerificationState? @default(UNVERIFIED)
  verifiedStatus    Boolean            @default(false)
  rating            Float              @default(0.0)
  listings          Listing[]
  reports           Report[]
  createdAt         DateTime           @default(now())
}

model Listing {
  id           String        @id @default(cuid())
  sellerId     String
  seller       User          @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  categoryId   String
  category     Category      @relation(fields: [categoryId], references: [id])
  title        String
  description  String
  price        Float
  condition    Condition
  city         String
  neighborhood String
  status       ListingStatus @default(ACTIVE)
  photos       String[]
  reports      Report[]
  createdAt    DateTime      @default(now())
}
```

---

## 📂 Project Directory Structure

```
vintage-challenge/
├── actions/                  # Server Actions (fayda.ts, listings.ts, user.ts, transactions.ts)
├── auth.ts                   # AuthJS configuration, Credentials provider & Admin role mapping
├── auth.config.ts            # Route protection middleware & session token callbacks
├── lib/                      # Core backend utilities & memory stores
│   ├── account-store.ts      # User profile store & memory fallback
│   ├── listing-store.ts      # Active marketplace listing store
│   ├── verification-store.ts # Fayda verification request persistence store
│   ├── prisma.ts             # Prisma ORM database client instance
│   ├── location-data.ts      # Addis Ababa neighborhoods & regions mapping
│   └── format.ts             # Currency formatting & float precision correction
├── prisma/                   # Database schema & seed scripts
│   ├── schema.prisma         # Prisma data schema
│   └── seed.ts               # Production seed script
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Homepage with Hero Search & Marketplace Feed
│   │   ├── dashboard/        # User Marketplace Dashboard
│   │   ├── explore/          # Category & Location Filtered Explorer
│   │   ├── account/          # User Account Settings & Fayda Verification Hub
│   │   ├── admin/            # Admin Management Portal (Role Protected)
│   │   ├── sell/             # Item Posting Form with Canvas compression
│   │   └── listings/[id]/    # Listing Detail Page with Sold state & Contact flow
│   ├── components/           # UI Components (Header, FaydaVerificationModal, DeleteListingButton, AiAssistantWidget, InfoModals)
│   ├── data/                 # System constants & category definitions
│   └── types/                # TypeScript interfaces & domain models
├── README.md                 # Comprehensive project documentation
└── package.json              # Project dependencies & scripts
```

---

## 🛠️ Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Dagi2730/vintage-challenge.git
cd vintage-challenge
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://neondb_owner:password@ep-cool-seed.us-east-2.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="super-secret-auth-key-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Push & Seed

```bash
# Push Prisma schema to database
npm run db:push

# Seed admin user and categories
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Available npm Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start local development server on `http://localhost:3000` |
| `npm run build` | Build Next.js production bundle |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema directly to PostgreSQL database |
| `npm run db:seed` | Seed database with admin user and clean categories |
| `npm run lint` | Run ESLint static code analysis |

---

## 👥 Credits & Contact

Designed & Developed by **Dagmawit Andargie** for the Ethiopian Secondhand Marketplace Challenge.

- **Live Host**: [https://vintage-challenge.vercel.app/](https://vintage-challenge.vercel.app/)

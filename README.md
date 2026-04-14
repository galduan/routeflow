# RouteFlow - Order Management & Distribution System

RouteFlow is a real-time order management and distribution routing system designed for fast, accurate delivery operations.

## 🚀 How to Start

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database
- npm

### 1. Clone & Install
```bash
npm install
```

### 2. Database Setup
1. Create a `.env` file in the root (copy from `.env.example` if available):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/routeflow?schema=public"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```
2. Run migrations and generate the client:
   ```bash
   npx prisma generate
   # To sync with DB:
   # npx prisma db push 
   ```

### 3. Run the App (FE & BE)
Since this is a Next.js application, the frontend and backend start together:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## 🏗 Key Architectural Points

- **Framework:** Next.js 14+ (App Router) for a unified Full-stack experience.
- **ORM:** Prisma v6 for type-safe database access and migrations.
- **Auth:** NextAuth.js with JWT Strategy and Role-Based Access Control (RBAC).
- **UI:** Tailwind CSS + shadcn/ui + Lucide Icons for a modern, responsive interface.
- **State Management:** TanStack Query (React Query) for server-state synchronization and caching.
- **Validation:** Zod schemas shared between Client (Forms) and Server (API Routes).
- **Testing:** Vitest + React Testing Library for high-confidence deployments.

---

## 🏁 Sprint 1 Deliverables
- [x] Full project scaffolding & infrastructure.
- [x] RBAC Authentication (Admin, Deputy, Order Desk, Driver).
- [x] Product Catalog Management (CRUD + UI).
- [x] Customer Management (CRUD + UI).
- [x] Route Setup & Driver Assignment (CRUD + UI).
- [x] Verified build and testing suite.

---

## 📅 Roadmap
- **Sprint 2:** Real-time Order Entry & Daily Dashboard.
- **Sprint 3:** Driver Mobile View & Waze Integration.
- **Sprint 4:** WhatsApp Automation & Analytics.

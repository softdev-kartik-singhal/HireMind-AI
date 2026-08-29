# HireMind AI 🚀

**HireMind AI** is a production-quality, AI-powered technical interview and recruitment platform designed to streamline developer assessments, recruiter workflows, and interview evaluation.

---

## 🏛️ Monorepo Architecture

```
/
├── client/                     # Next.js 14 App Router, TypeScript, Tailwind CSS, TanStack Query
│   ├── src/
│   │   ├── app/                # Pages: Landing, Login, Register, Forgot/Reset Password, Profile, Dashboard
│   │   ├── components/         # UI kit, layout, RoleGuard, ProtectedRoute
│   │   ├── context/            # AuthContext & Session management
│   │   ├── hooks/              # useAuth hook
│   │   ├── lib/                # API client with automatic token refresh, utilities
│   │   ├── middleware.ts       # Next.js route protection middleware
│   │   └── types/              # TypeScript interfaces
│   └── package.json
├── server/                     # Node.js, Express, TypeScript, Prisma ORM
│   ├── prisma/
│   │   └── schema.prisma       # PostgreSQL schema: User, RefreshToken, PasswordResetToken
│   ├── src/
│   │   ├── config/             # Zod environment validation & Prisma singleton
│   │   ├── constants/          # Status codes, User roles (CANDIDATE, RECRUITER, ADMIN)
│   │   ├── controllers/        # Auth, User, and Health controllers
│   │   ├── middlewares/        # Error handler, Zod validator, JWT auth & Role authorize guards
│   │   ├── routes/             # REST routes (/api/v1/auth, /api/v1/users, /health)
│   │   ├── services/           # TokenService, AuthService, UserService
│   │   ├── types/              # Express augmentations & payload types
│   │   ├── utils/              # ApiError, ApiResponse, asyncHandler, logger
│   │   └── validations/        # Zod request validation schemas
│   └── package.json
├── package.json                # Root workspaces & development orchestrator
└── README.md
```

---

## 👥 User Roles & Permissions Matrix

| Capability | CANDIDATE | RECRUITER | ADMIN |
|---|:---:|:---:|:---:|
| Register & Login | ✅ | ✅ | ✅ |
| Update Personal Profile | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ |
| Access Candidate Portal | ✅ | ❌ | ❌ |
| Recruiter Pipeline & Templates | ❌ | ✅ | ✅ |
| User Directory & Administration (`/api/v1/users`) | ❌ | ❌ | ✅ |
| System Health & Latency Metrics | ❌ | ❌ | ✅ |

---

## 🔐 Authentication & Security

- **Password Hashing**: Salted bcrypt (12 rounds) — plaintext passwords are never stored.
- **JWT Architecture**:
  - Short-lived Access Tokens (15 mins)
  - Long-lived Refresh Tokens (7 days) with **automatic rotation** & database reuse detection.
- **HTTP-Only Cookies**: Secure, SameSite cookies prevent XSS and CSRF token theft.
- **Role Guards**: Express middleware `authorize('ADMIN', ...)` on the backend + `<RoleGuard>` and Next.js `middleware.ts` on the frontend.
- **Input Validation**: Strict Zod validation schemas for all request payloads, query parameters, and environment variables.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database instance
- npm or pnpm

### 1. Installation

Install all monorepo dependencies from the root:
```bash
npm install
```

### 2. Environment Variables

Create `.env` in `/server`:
```bash
cp server/.env.example server/.env
```

Ensure your PostgreSQL `DATABASE_URL` is set:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hiremind_db?schema=public"
JWT_ACCESS_SECRET="hiremind_access_super_secret_key_change_in_production_2026"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="hiremind_refresh_super_secret_key_change_in_production_2026"
JWT_REFRESH_EXPIRES_IN="7d"
JWT_RESET_PASSWORD_SECRET="hiremind_reset_super_secret_key_change_in_production_2026"
JWT_RESET_PASSWORD_EXPIRES_IN="1h"
CORS_ORIGIN="http://localhost:3000"
APP_URL="http://localhost:3000"
```

Create `.env.local` in `/client`:
```bash
cp client/.env.example client/.env.local
```

### 3. Database Migration

Generate Prisma client and push schema to PostgreSQL:
```bash
npm run db:generate
npm run db:push
```

### 4. Run Development Servers

Start both client and server concurrently with one command:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5001/api/v1`
- **Server Health Check**: `http://localhost:5001/health`

---

## 📡 API Endpoints (v1)

### Auth (`/api/v1/auth`)
- `POST /register` — Register a new account (`CANDIDATE`, `RECRUITER`, `ADMIN`)
- `POST /login` — Authenticate and receive tokens & HTTP-only cookies
- `POST /refresh` — Refresh access token via token rotation
- `POST /logout` — Revoke session and clear cookies
- `GET  /me` — Retrieve current authenticated user session
- `POST /forgot-password` — Generate password recovery token
- `POST /reset-password` — Reset account password with token
- `POST /change-password` — Change password with current password verification

### Users (`/api/v1/users`)
- `GET  /profile` — Get authenticated user's profile
- `PUT  /profile` — Update user profile details
- `GET  /` — Retrieve paginated users list *(ADMIN only)*
- `DELETE /:id` — Delete user account *(ADMIN only)*

### Health (`/api/v1/health` & `/health`)
- `GET  /` — System health check, database ping & latency, uptime status

---

## 🧪 Verification & Production Build

```bash
# Run TypeScript type check across both workspaces
npm run type-check

# Run ESLint across both workspaces
npm run lint

# Build production bundles
npm run build
```

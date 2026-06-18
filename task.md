# MERN Stack Migration Tasks

- [x] **Phase 1: Project Setup & Mongoose Models**
  - [x] Initialize `backend/package.json` & `backend/tsconfig.json`
  - [x] Create `backend/src/config/db.ts` (MongoDB Connection)
  - [x] Create `backend/src/config/env.ts` (Environment setup)
  - [x] Create Mongoose Models:
    - [x] `User.ts`
    - [x] `College.ts`
    - [x] `Canteen.ts`
    - [x] `MenuItem.ts`
    - [x] `Order.ts`
    - [x] `Wallet.ts`
    - [x] `Transaction.ts`
    - [x] `Notification.ts`
    - [x] `Review.ts`
    - [x] `PrintOrder.ts`
  - [x] Create Error Handling, Authentication, and Authorization Middlewares

- [x] **Phase 2: Authentication & Session Management**
  - [x] Create `backend/src/config/passport.ts` (Google OAuth Strategy)
  - [x] Implement JWT Sign & Verify service tokens
  - [x] Create `/api/auth` Router & Controllers (login, logout, refresh, callback)

- [x] **Phase 3: Core Business APIs & Controllers**
  - [x] Create Controllers and Routers for:
    - [x] Colleges & Canteens
    - [x] Menu Items (Menu management)
    - [x] User profiles & Admin lists
    - [x] Wallets & Transactions
    - [x] Orders & Print Orders
    - [x] Razorpay Payment gateway integration

- [x] **Phase 4: Sockets & Realtime Updates**
  - [x] Create `backend/src/sockets/socketHandler.ts`
  - [x] Integrate Socket.IO server within `backend/src/server.ts`

- [x] **Phase 5: Data Migration, Seeding & Frontend Adaptation**
  - [x] Create data migration script (`migrate.ts`)
  - [x] Create seed script (`seed.ts`)
  - [x] Update Frontend `UserContext.tsx` and components to point to the new backend API endpoints and Socket.IO client connections.

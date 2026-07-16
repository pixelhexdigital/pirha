# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pirha is a restaurant management SaaS platform. It handles table management, menu/category management, customer ordering (via QR codes), kitchen order tracking, billing, and subscriptions. The codebase is a monorepo with a React client and Express/Node.js server, managed via Yarn workspaces.

## Commands

### Client (from `client/`)
- `yarn dev` — Start Vite dev server (connects to local server at localhost:8080)
- `yarn build` — Production build
- `yarn lint` — ESLint check
- `yarn preview` — Preview production build

### Server (from `server/`)
- `yarn start` — Start with nodemon (reads `.env` file)
- `yarn build` — Production start (sets NODE_ENV=production)
- `yarn debug` — Start with nodemon + `--inspect`

### Root
- `yarn install` — Install all workspace dependencies

## Architecture

### Monorepo Structure
```
client/     — React 18 SPA (Vite, Tailwind CSS, shadcn/ui)
server/     — Express.js REST API + Socket.IO (MongoDB via Mongoose)
```

### Client (`client/src/`)

**State Management:** Redux Toolkit with RTK Query for API calls, redux-persist for localStorage/sessionStorage persistence.

- `api/` — RTK Query API slices (`authApi`, `menuApi`, `orderApi`, `tableApi`, `customerApi`, `billApi`, `adminApi`, `userApi`, `miscApi`). Each defines endpoints using `fetchBaseQuery` pointed at `/api/v1/*`.
- `store/` — Redux slices (`AuthSlice`, `CartSlice`, `MenuSlice`, `OrderSlice`, `TableSlice`, `MiscellaneousSlice`) + store configuration with persisted reducers.
- `routes/` — React Router v6 config. `RouterConfig.js` defines route constants. `Router.jsx` / `RouterV1.jsx` handle routing logic.
- `pages/` — Page components organized by feature (AdminPages, MenuPages, KitchenPages, OrdersPage, TablesPage, etc.)
- `components/ui/` — shadcn/ui components (new-york style, JSX not TSX, CSS variables enabled)
- `lib/constants.js` — `BASE_URL` (localhost:8080 in dev, production URL otherwise), HTTP constants

**Path aliases:** Both `@/` prefix and bare imports from `src/` work (configured in `jsconfig.json` + `vite-jsconfig-paths`).

### Server (`server/src/`)

**Pattern:** Express routes → controllers → Mongoose models. Uses `asyncHandler` wrapper and custom `ApiError`/`ApiResponse` classes.

- `routes/apps/auth/` — Restaurant auth (register, login, password reset)
- `routes/apps/manageRestaurant/` — Table, menu, customer, order, bill, tax routes
- `routes/superAdmin.routes.js` — Super admin routes
- `controllers/` — Mirrors route structure
- `models/apps/auth/` — `restaurant.models.js`
- `models/apps/manageRestaurant/` — `table`, `menu`, `customer`, `order`, `bill`, `subscription`, `tax`, `analytic`, `visitor` models
- `middlewares/` — Auth (JWT-based), error handler, multer (file upload), subscription check
- `utils/` — ApiError, ApiResponse, asyncHandler, Cloudinary integration, mail (nodemailer + mailgen)
- `socket/` — Socket.IO for real-time order/table status updates
- `passport/` — Google and GitHub OAuth strategies

**API base path:** All routes are under `/api/v1/`

**Key constants** (`constants.js`): `UserRolesEnum` (ADMIN/USER), `OrderStatusEnum` (PENDING/CANCELLED/DELIVERED), socket event enums for orders and tables.

**Database:** MongoDB (configured via `.env`). DB name constant: `BNM_DATA`.

### Real-time Communication
Socket.IO handles order status updates (`newOrderCreated`, `updateOrderStatus`) and table status changes (`updateTableStatus`). The `io` instance is mounted on the Express app via `app.set("io", io)`.

## Key Conventions
- ES Modules throughout (both client and server use `"type": "module"`)
- Server uses `.env` file for configuration (loaded via `--env-file=.env` flag)
- File uploads go through Multer → Cloudinary
- Authentication is JWT-based with cookie storage (`credentials: "include"` on client)
- Payments via Razorpay
- Client uses shadcn/ui component library with Tailwind CSS

## Design Context

The client's design system is captured for AI-assisted UI work:
- **`client/PRODUCT.md`** — strategic context. Register: `product` (design serves the task). Platform: `web`. Users are restaurant staff working mid-service under time pressure; personality is *warm, welcoming, human*. Anti-reference: **generic SaaS dashboards with heavy card clutter**.
- **`client/DESIGN.md`** — visual system. North Star **"The Open Kitchen"** (everything visible at a glance, human tone at full tempo). Brand: **Pirha Magenta** `#EA2A88` reserved for primary actions and live status only (≤10% of a screen), **Deep Indigo** `#090B53` anchoring the dark theme, cool slate neutrals, semantic success/warning/info/destructive. One system-sans family at a fixed rem scale; soft-layered depth (gentle shadows + hairline borders). Signature components: dotted `StatusBadge`, magenta `Spinner`, rounded-pill `LeftSidebar`.
- **`client/.impeccable/`** — Impeccable design-skill config (live-mode + `design.json` sidecar).

Read `client/DESIGN.md` before generating or restyling any client UI; it is the normative source for colors, typography, and component patterns.

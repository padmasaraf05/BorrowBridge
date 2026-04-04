# BorrowBridge Frontend Analysis Summary

## 1. Project Overview
- **Description**: Campus peer-to-peer platform for students to lend, rent, or sell items like textbooks, calculators, lab kits.
- **Main Purpose**: Facilitate quick campus exchanges between verified college students.
- **Target Users**: College/university students.

## 2. Features Implemented (Frontend Only)
- **Authentication**: Login, Signup forms with validation, terms acceptance.
- **Home (Index)**: Featured listings carousel, categories (Books, Electronics, etc.), quick CTAs (Browse/Add Listing), 3-step user flow visualization.
- **Browse**: Listing filters (All/Rent/Sale/Free), grid view with search/sort.
- **ItemDetail**: Individual item details page (`/item/:id`).
- **Dashboard**: Personalized greeting, quick actions, active borrows/recent activity cards, stats overview.
- **MyListings**: User's own listings management.
- **AddListing**: Form to create new listings.
- **Messages**: Messaging inbox/conversations.
- **Profile**: Editable profile (name, email, phone, branch, year, college, privacy toggles), tabs for Listings/Reviews (with dummy data).
- **Navbar**: Logo, main links (Browse/Dashboard), notifications (badge), user dropdown (Dashboard/Profile/My Listings/Reviews/Help/Logout), mobile-responsive menu.
- **Shared UI**: Full shadcn/ui component library, responsive design, toast notifications, tooltips.

## 3. Tech Stack
- **Core**: React 18, TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS, shadcn/ui (Radix primitives), clsx/cva, lucide-react icons
- **Forms/State**: React Hook Form, Zod, TanStack Query (setup), useState/local hooks
- **Notifications**: Sonner
- **Build/Test**: Vite, Vitest, Playwright E2E, ESLint/TSLint
- **Other**: date-fns, recharts (unused)

## 4. Folder Structure
```
BorrowBridge/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│   ├── components/
│   │   ├── BorrowBridgeLogo.tsx
│   │   ├── Navbar.tsx
│   │   └── NavLink.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       └── use-toast.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── AddListing.tsx
│   │   ├── Browse.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── ItemDetail.tsx
│   │   ├── Login.tsx
│   │   ├── Messages.tsx
│   │   ├── MyListings.tsx
│   │   ├── NotFound.tsx
│   │   ├── Profile.tsx
│   │   └── Signup.tsx
│   └── test/
│       ├── example.test.ts
│       └── setup.ts
├── .gitignore
├── bun.lock
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── playwright-fixture.ts
├── playwright.config.ts
├── postcss.config.js
├── PROJECT_SUMMARY.md
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts

```

## 5. UI Flow
```
Public Flow: / (Home/Featured) → /browse (Filter/Grid) → /item/:id (Details)
Auth Flow: /login or /signup → /dashboard (Overview/Actions)
User Flow: Navbar → Dashboard/MyListings/AddListing/Messages/Profile
Global: Persistent Navbar + Mobile menu; 404 → NotFound
Interactions: Form submits (mock nav), Link-based routing, local state toggles.
```

## 6. Data Handling (Frontend)
- **Static Data**: Dummy arrays in components (listings: title/price/badge/owner/rating/img; reviews; active borrows; profile fields).
- **Forms**: react-hook-form + Zod validation; onSubmit mocks navigation (e.g., login → /dashboard).
- **No Real Data Flow**: No API calls/fetch/axios visible; TanStack Query client ready but unused.
- **Local State**: useState for forms, tabs, modals, mobile nav.

## 7. Missing Backend Requirements
```
Auth:
- POST /api/auth/login {email, password} → JWT
- POST /api/auth/signup {name, email, password, college} → user
- GET /api/auth/me → profile
- POST /api/auth/logout

Listings:
- GET /api/listings?type=rent&amp;search=&amp;page=1 → paginated
- GET /api/listings/:id
- POST /api/listings {title, description, type, price, images[]} (multer)
- PUT /api/listings/:id
- DELETE /api/listings/:id

Users:
- GET /api/users/:id
- PUT /api/users/:id {profile fields}
- GET /api/users/:id/listings
- GET /api/users/:id/reviews

Messages:
- GET /api/messages?userId=
- GET /api/messages/:conversationId
- POST /api/messages {toUserId, text}

Other:
- GET /api/notifications
- Image upload endpoint
- Search/filter/pagination
```

## 8. Suggested Backend Architecture
```
Framework: Node.js + Express/Fastify | ORM: Prisma | DB: PostgreSQL
```
```
src/
├── controllers/     # HTTP handlers: authController, listingsController.ts
├── services/        # Business logic: authService (JWT/bcrypt), listingsService.ts
├── routes/          # Express Router: authRoutes.ts, listingsRoutes.ts (/api prefix)
├── models/          # Prisma schema: User, Listing, Message, Review, Notification
├── middleware/      # auth.ts (JWT verify), upload.ts (multer), validateZod.ts, rateLimit.ts
├── utils/           # errorHandler.ts, logger.ts, env validation
├── prisma/          # schema.prisma, migrations/
└── server.ts        # App bootstrap, CORS, middleware chain

Auth: JWT tokens (access/refresh), bcrypt passwords.
Deployment: Docker, PM2/PM2 ecosystem, Vercel/Render.
API Docs: Swagger/OpenAPI.
```


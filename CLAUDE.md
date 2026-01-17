# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern monorepo blog system with "液态玻璃美学" (Liquid Glass Aesthetics) design. Built with Vue 3 + Fastify + TypeScript using pnpm workspaces.

**Structure:**
- `packages/backend/` - Fastify API server with Prisma ORM
- `packages/frontend/` - Vue 3 SPA with Vite, Naive UI, Vue Query
- `packages/shared/` - Shared TypeScript types
- `tests/` - Unit tests (Vitest), E2E tests (Playwright)
- `.shared/ui-ux-pro-max/` - UI/UX design system helper scripts

## Common Commands

```bash
# Development
pnpm dev              # Start both frontend (:3000) and backend (:3001)
pnpm dev:frontend     # Frontend only
pnpm dev:backend      # Backend only

# Building
pnpm build            # Build both
pnpm build:frontend   # Frontend production build
pnpm build:backend    # Backend TypeScript compilation

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed initial data
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Unit tests (Vitest)
pnpm test:ui          # Vitest UI mode
pnpm test:e2e         # E2E tests (Playwright)

# Code Quality
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier format
pnpm type-check       # TypeScript type check
```

## Architecture

### Backend (Fastify + Prisma)

**Layered architecture:**
- `routes/` - Route handlers (validation, response formatting)
- `services/` - Business logic layer (CRUD operations)
- `middleware/` - Auth, error handling, rate limiting, validation
- `config/` - Environment configuration

**Key patterns:**
- Routes use services (e.g., `ArticleService`) for data operations
- JWT authentication via `fastify.authenticate` decorator
- Error responses follow `{ success: false, error: { code, message } }` format
- Prisma instance exposed on `fastify.prisma`

### Frontend (Vue 3)

**Structure:**
- `api/` - Type-safe API client with axios
- `stores/` - Pinia stores (auth, article)
- `composables/` - Vue composables (useTheme)
- `components/` - Reusable components
  - `common/` - GlassCard, LiquidButton (液态玻璃美学 design)
- `views/` - Page components split into `public/` and `admin/`

**Key patterns:**
- API calls use shared types from `packages/shared/types`
- Route guards in router for auth (`requiresAuth` meta)
- Vue Query for data fetching/caching

### Design System

The project uses "液态玻璃美学" (Liquid Glass Aesthetics):
- CSS variables for glass effects (`--glass-bg`, `--glass-blur`, `--gradient-liquid`)
- Core components: `GlassCard`, `LiquidButton`
- Motion One for high-performance animations
- Dark mode support via `useTheme` composable

For UI/UX work, use the helper scripts:
```bash
python3 .shared/ui-ux-pro-max/scripts/search.py "<keywords>" --design-system
```

## Database Models

Core models (see `packages/backend/prisma/schema.prisma`):
- `User` - Authors (email, username, password)
- `Article` - Posts (title, slug, content, published, views)
- `Category` - Article categories
- `Tag` - Article tags (many-to-many)
- `Comment` - Nested comments (parentId for replies)
- `Subscription` - Email subscriptions

## API Endpoints

**Public:**
- `GET /api/articles` - List (with pagination)
- `GET /api/articles/:slug` - Detail (increments views)
- `GET /api/categories`, `GET /api/tags` - Lists
- `GET /api/search?q=` - Full-text search
- `GET /rss.xml`, `GET /sitemap.xml` - SEO

**Auth required:**
- `POST /api/articles` - Create
- `PUT /api/articles/:id` - Update
- `DELETE /api/articles/:id` - Delete
- `POST /api/articles/:slug/comments` - Comment

## Environment Setup

Required `.env` variables:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="<32+ chars>"
CORS_ORIGIN="http://localhost:3000"
```

Optional (for email subscriptions):
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
```

Default test account: `admin@blog.com` / `admin123`

## Type Safety

- Import types from `shared/types` for API contracts
- Backend validates inputs with Zod schemas
- Frontend API client uses `ApiResponse<T>` wrapper

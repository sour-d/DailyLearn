# Daily Learn - Agent Instructions

## Project Overview

Personal daily learning companion built with Next.js (App Router) + Supabase + TypeScript. Uses spaced repetition (SM-2) for review scheduling and OpenRouter for AI-powered question generation.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components, Server Actions)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **AI**: OpenRouter API (configurable model)
- **Icons**: lucide-react
- **Charts**: recharts
- **Markdown**: react-markdown + rehype-highlight + remark-gfm
- **Theme**: next-themes (dark/light/system)
- **Toasts**: sonner
- **Dates**: date-fns

## Database Schema

Reference snapshot: [`supabase/schema.sql`](supabase/schema.sql) (read-only, not meant to be run directly)

### Migrations

Schema changes are managed via numbered migration files in `supabase/migrations/`. Each migration is a `DO $$` block guarded by a check against the `schema_migrations` table so it only runs once.

| File | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | Tables, indexes, triggers, seed data |
| `supabase/migrations/002_disable_rls.sql` | Disable RLS for single-user app |
| `supabase/migrate.sql` | Runner — paste into Supabase SQL Editor to apply all pending migrations |

**Adding a new migration:**
1. Create `supabase/migrations/NNN_description.sql` using the idempotent DO block pattern
2. Append the corresponding block to `supabase/migrate.sql`
3. Update `supabase/schema.sql` to reflect the full current state
4. Run `migrate.sql` in Supabase SQL Editor — already-applied migrations are skipped

### Tables

1. **categories** - Learning categories
   - `id UUID PK`, `name`, `description`, `color`, `icon`, `daily_review_limit`
   - Auto-updated `created_at`, `updated_at` (trigger)

2. **entries** - Learning items
   - `id UUID PK`, `category_id` (FK CASCADE), `type` (enum: note/qa/snippet/vocabulary/link), `source` (enum: manual/ai)
   - `title`, `content` (markdown), `answer` (markdown), `tags TEXT[]`
   - `is_favorite`, `is_archived`
   - SM-2 fields: `ease_factor` (default 2.5), `interval` (days, default 0), `repetitions` (default 0), `next_review_date` (default today), `last_reviewed_at`
   - Indexes: category_id, next_review_date, is_archived

3. **review_history** - Per-review log
   - `id UUID PK`, `entry_id` (FK CASCADE), `rating` (0-5), `reviewed_at`

4. **daily_stats** - One row per day
   - `id UUID PK`, `date` (unique), `entries_added`, `entries_reviewed`

5. **app_config** - Single-row config
   - `id UUID PK`, `current_streak`, `longest_streak`, `last_active_date`, `daily_review_goal`
   - Seeded with one row on schema creation

6. **ai_generation_log** - AI usage tracking
   - `id UUID PK`, `category_id` (FK CASCADE), `prompt`, `model`, `entries_generated`

### Enums
- `entry_type`: note, qa, snippet, vocabulary, link
- `entry_source`: manual, ai

### Triggers
- `update_updated_at()` on: categories, entries, app_config

## Environment Variables

Stored in `.env.local` (gitignored). Template: `.env.example`

| Variable | Server/Client | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase anonymous key |
| `OPENROUTER_API_KEY` | Server only | OpenRouter API key |
| `OPENROUTER_MODEL` | Server only | Default model (e.g. google/gemini-2.0-flash-001) |
| `APP_PIN` | Server only | 6-digit PIN for app access (session lasts 1 hour) |

## Authentication

Simple PIN-based auth. A 6-digit PIN in `APP_PIN` env var protects the entire app.

- **Middleware** (`src/middleware.ts`) intercepts all requests; unauthenticated users redirect to `/login`
- **Session**: HMAC-SHA256 signed token stored in an HTTP-only cookie, expires after 1 hour
- **Auth lib** (`src/lib/auth.ts`): uses Web Crypto API (works in both Edge and Node runtimes)
- **API routes**: `POST /api/auth/verify-pin` (login), `POST /api/auth/logout` (clear cookie)
- If `APP_PIN` is not set, auth is skipped entirely

## Architecture

### Server Actions
- `src/app/categories/_actions/` - Category CRUD
- `src/app/entries/_actions/` - Entry CRUD, bulk operations, favorites, daily stats
- `src/app/review/_actions/` - Review queue, SM-2 submission, streak updates
- `src/app/_actions/` - Dashboard data (config, today stats, categories with stats)

### API Routes (server-side, keeps API keys secure)
- `POST /api/auth/verify-pin` - PIN verification, sets session cookie
- `POST /api/auth/logout` - Clears session cookie
- `POST /api/generate` - AI question generation via OpenRouter
- `POST /api/clean` - AI bulk content cleanup via OpenRouter

### Supabase Clients
- `src/lib/supabase/client.ts` - Browser client (for client components)
- `src/lib/supabase/server.ts` - Server client (for server components/actions)

### Key Libraries
- `src/lib/spaced-repetition.ts` - SM-2 algorithm (calculateSM2, RATING_OPTIONS)
- `src/lib/openrouter.ts` - OpenRouter client (callOpenRouter, parseGeneratedEntries)
- `src/lib/supabase/types.ts` - All DB interfaces + getMasteryLevel + MASTERY_CONFIG
- `src/lib/constants.ts` - Category colors and icons

## Mastery Levels (derived from SM-2 data)

| Level | Condition |
|-------|-----------|
| New | repetitions === 0 |
| Learning | interval <= 7 |
| Reviewing | interval > 7 (but not mastered) |
| Mastered | interval > 21 AND ease_factor >= 2.5 |

## SM-2 Rating Scale

| Rating | Label | Effect |
|--------|-------|--------|
| 0 | Again | Reset to beginning (repetitions=0, interval=0) |
| 3 | Hard | Continue but reduce ease factor |
| 4 | Good | Standard progression |
| 5 | Easy | Increase ease factor |

## Conventions

- Server Components by default; `"use client"` only for interactivity
- `sonner` toast for notifications (especially undo toasts on destructive actions)
- Destructive actions: confirmation dialog + undo toast
- All dates stored as UTC in the database
- Tags are stored as `TEXT[]` PostgreSQL arrays
- Colors stored as hex strings
- Icons stored as lucide icon name strings
- Update README.md and AGENTS.md when schema or architecture changes
- Schema changes go in a new numbered migration file in `supabase/migrations/`, then append to `migrate.sql`, then update `schema.sql` reference

## Component Organization

```
components/
├── ai/          - GenerateDialog, BulkImportDialog, AiEntryPreview
├── categories/  - CategoryCard, CategoryFormDialog, CategoryDetailView, CategoryIcon, DeleteCategoryDialog, CategoryList
├── dashboard/   - DashboardView
├── entries/     - EntryFormDialog, EntryTable, MoveEntriesDialog, MarkdownContent
├── layout/      - SidebarNav, MobileNav, ThemeToggle, ThemeProvider
├── review/      - Flashcard, ReviewSession
├── search/      - SearchView
├── stats/       - StatsView
└── ui/          - shadcn/ui base components
```

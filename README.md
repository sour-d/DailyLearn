# Daily Learn

A personal daily learning companion that helps you learn and retain knowledge across multiple categories using spaced repetition.

## Features

### Core
- **Category-based learning** -- Create categories for topics (React, System Design, TypeScript, Vocabulary, etc.) with custom colors, icons, and daily review limits
- **Multiple entry types** -- Notes, Q&A, code snippets, vocabulary, links
- **Markdown support** -- Full markdown rendering with syntax-highlighted code blocks

### Spaced Repetition
- **SM-2 algorithm** -- Scientifically proven spaced repetition for optimal review scheduling
- **Flashcard review** -- Interactive review sessions with flip-card UX and difficulty rating (Again / Hard / Good / Easy)
- **Mastery tracking** -- Visual badges per entry: New, Learning, Reviewing, Mastered
- **Refresh** -- Get a fresh batch of review items at any time

### AI Features
- **Generate with AI** -- Generate questions + answers via OpenRouter for any category with a fully customizable prompt
- **Bulk import + AI cleanup** -- Paste raw, unformatted content and AI cleans/structures it into entries
- **Per-item control** -- Preview, edit, save, or discard each AI-generated item before committing

### Management
- **Table view** -- Sortable data table per category with columns for title, type, source, tags, mastery, next review date
- **Bulk actions** -- Multi-select entries for bulk delete, archive, or move to another category
- **Sort & filter** -- Sort by date/title/type/next review, filter by type/mastery/source
- **Favorites** -- Star important entries
- **Search** -- Full-text search across all entries

### Progress
- **Dashboard** -- Today's review queue, streak counter, daily goal progress, category overview
- **Daily goals** -- Configurable daily review target with progress bar
- **Learning streaks** -- Track current and longest streaks
- **Statistics** -- Charts for daily activity, mastery distribution, per-category breakdown
- **Dark mode** -- Full dark/light mode support with system detection
- **PIN protection** -- 6-digit PIN lock with 1-hour sessions

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** (strict mode)
- **Supabase** (PostgreSQL)
- **Tailwind CSS v4 + shadcn/ui**
- **OpenRouter** (AI question generation)
- **recharts** (statistics charts)
- **react-markdown + rehype-highlight** (markdown rendering)
- **next-themes** (dark mode)
- **sonner** (toast notifications)
- **date-fns** (date formatting)
- **lucide-react** (icons)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) API key (for AI features)

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd DailyLearn
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL, anon key, OpenRouter API key, and a 6-digit `APP_PIN`.

4. Set up the database -- paste [`supabase/migrate.sql`](supabase/migrate.sql) into your Supabase SQL Editor and run it. This is safe to run repeatedly; it only applies migrations that haven't been applied yet.

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

| Table | Purpose |
|-------|---------|
| `schema_migrations` | Tracks which migrations have been applied |
| `categories` | Learning categories with color, icon, daily review limit |
| `entries` | Learning items with SM-2 spaced repetition fields |
| `review_history` | Per-review log with rating |
| `daily_stats` | Daily counts of entries added and reviewed |
| `app_config` | Single-row config (streaks, daily goal) |
| `ai_generation_log` | Tracks AI question generation usage |

Full schema reference: [`supabase/schema.sql`](supabase/schema.sql)

### Migrations

Schema changes use numbered migration files that run once and are tracked in the `schema_migrations` table. See [`supabase/migrations/`](supabase/migrations/) for individual migration files and [`supabase/migrate.sql`](supabase/migrate.sql) as the all-in-one runner.

## Project Structure

```
src/
├── app/
│   ├── _actions/           # Dashboard server actions
│   ├── api/
│   │   ├── auth/            # PIN verify + logout endpoints
│   │   ├── generate/       # AI question generation endpoint
│   │   └── clean/          # AI bulk cleanup endpoint
│   ├── login/              # PIN entry page
│   ├── categories/
│   │   ├── _actions/       # Category CRUD server actions
│   │   ├── [id]/           # Category detail page
│   │   └── page.tsx        # Category list page
│   ├── entries/
│   │   └── _actions/       # Entry CRUD server actions
│   ├── review/
│   │   ├── _actions/       # Review queue + SM-2 server actions
│   │   └── page.tsx        # Flashcard review page
│   ├── search/             # Full-text search page
│   ├── stats/              # Statistics page
│   ├── layout.tsx          # Root layout (sidebar, theme, toaster)
│   └── page.tsx            # Dashboard
├── components/
│   ├── ai/                 # AI generate + bulk import dialogs
│   ├── categories/         # Category cards, forms, detail view
│   ├── dashboard/          # Dashboard view
│   ├── entries/            # Entry forms, table, markdown renderer
│   ├── layout/             # AppShell, sidebar, mobile nav, theme toggle
│   ├── review/             # Flashcard, review session
│   ├── search/             # Search view
│   ├── stats/              # Stats charts
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client
│   │   └── types.ts        # TypeScript types + mastery helpers
│   ├── auth.ts             # PIN session token (HMAC-SHA256)
│   ├── constants.ts        # Category colors, icons
│   ├── openrouter.ts       # OpenRouter API client
│   ├── spaced-repetition.ts # SM-2 algorithm
│   └── utils.ts            # cn() utility
└── supabase/
    ├── migrations/
    │   ├── 001_initial_schema.sql  # Tables, indexes, triggers, seed
    │   └── 002_disable_rls.sql     # Disable RLS for single-user app
    ├── migrate.sql                 # Runner: paste into SQL Editor to apply all
    └── schema.sql                  # Full schema reference (read-only)
```

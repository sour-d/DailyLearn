DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE name = '001_initial_schema') THEN

    -- Enable UUID generation
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 1. Categories
    CREATE TABLE categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT 'book',
      daily_review_limit INTEGER DEFAULT 5,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Entries (learning items)
    CREATE TYPE entry_type AS ENUM ('note', 'qa', 'snippet', 'vocabulary', 'link');
    CREATE TYPE entry_source AS ENUM ('manual', 'ai');

    CREATE TABLE entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      type entry_type DEFAULT 'note',
      source entry_source DEFAULT 'manual',
      title TEXT NOT NULL,
      content TEXT,
      answer TEXT,
      tags TEXT[] DEFAULT '{}',
      is_favorite BOOLEAN DEFAULT false,
      is_archived BOOLEAN DEFAULT false,
      ease_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review_date DATE DEFAULT CURRENT_DATE,
      last_reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_entries_category ON entries(category_id);
    CREATE INDEX idx_entries_next_review ON entries(next_review_date);
    CREATE INDEX idx_entries_archived ON entries(is_archived);

    -- 3. Review history
    CREATE TABLE review_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
      reviewed_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_review_history_entry ON review_history(entry_id);
    CREATE INDEX idx_review_history_date ON review_history(reviewed_at);

    -- 4. Daily stats
    CREATE TABLE daily_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE UNIQUE DEFAULT CURRENT_DATE,
      entries_added INTEGER DEFAULT 0,
      entries_reviewed INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_daily_stats_date ON daily_stats(date);

    -- 5. App config (single-row table)
    CREATE TABLE app_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_active_date DATE,
      daily_review_goal INTEGER DEFAULT 20,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO app_config (current_streak, longest_streak, daily_review_goal)
    VALUES (0, 0, 20);

    -- 6. AI generation log
    CREATE TABLE ai_generation_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      prompt TEXT,
      model TEXT,
      entries_generated INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_ai_log_category ON ai_generation_log(category_id);

    -- Helper: auto-update updated_at on row change
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TRIGGER categories_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    CREATE TRIGGER entries_updated_at
      BEFORE UPDATE ON entries
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    CREATE TRIGGER app_config_updated_at
      BEFORE UPDATE ON app_config
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    INSERT INTO schema_migrations (name) VALUES ('001_initial_schema');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE name = '003_category_prompts') THEN

    CREATE TABLE category_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID NOT NULL UNIQUE REFERENCES categories(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_category_prompts_category ON category_prompts(category_id);

    ALTER TABLE category_prompts DISABLE ROW LEVEL SECURITY;

    CREATE TRIGGER category_prompts_updated_at
      BEFORE UPDATE ON category_prompts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    INSERT INTO schema_migrations (name) VALUES ('003_category_prompts');
  END IF;
END $$;

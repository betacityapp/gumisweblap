-- ─── Page Views Tracking (for AI Assistant) ────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  device_type TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views (session_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
CREATE POLICY "anon_insert_page_views" ON page_views FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_page_views" ON page_views;
CREATE POLICY "auth_select_page_views" ON page_views FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_delete_page_views" ON page_views;
CREATE POLICY "auth_delete_page_views" ON page_views FOR DELETE
  TO authenticated USING (true);

-- ─── AI Generation Log ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID,
  config_name TEXT,
  type TEXT NOT NULL,
  topic TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  tokens_used INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_generation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_ai_log" ON ai_generation_log;
CREATE POLICY "auth_select_ai_log" ON ai_generation_log FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_ai_log" ON ai_generation_log;
CREATE POLICY "auth_insert_ai_log" ON ai_generation_log FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_ai_log" ON ai_generation_log;
CREATE POLICY "auth_delete_ai_log" ON ai_generation_log FOR DELETE
  TO authenticated USING (true);

-- ════════════════════════════════════════════════════════════════════════════
-- Database Protection: Revoke anon write privileges, tighten RLS
-- ════════════════════════════════════════════════════════════════════════════

-- Revoke ALL write privileges from anon role on all tables
REVOKE INSERT, UPDATE, DELETE ON ac_extra_services FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ac_pricing_settings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ac_specs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON cars_generations FROM anon;
REVOKE INSERT, UPDATE, DELETE ON cars_makes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON cars_models FROM anon;
REVOKE INSERT, UPDATE, DELETE ON cars_variants FROM anon;
REVOKE INSERT, UPDATE, DELETE ON tire_shop_configs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON tire_size_database FROM anon;
REVOKE INSERT, UPDATE, DELETE ON tire_specs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON blog_posts FROM anon;
REVOKE INSERT, UPDATE, DELETE ON pages FROM anon;
REVOKE INSERT, UPDATE, DELETE ON navigation_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON services FROM anon;
REVOKE INSERT, UPDATE, DELETE ON testimonials FROM anon;
REVOKE INSERT, UPDATE, DELETE ON faq_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON price_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON settings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ai_configs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON contact_submissions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON page_views FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ai_generation_log FROM anon;

-- Revoke SELECT on sensitive tables from anon
REVOKE SELECT ON ai_configs FROM anon;
REVOKE SELECT ON ai_generation_log FROM anon;
REVOKE SELECT ON contact_submissions FROM anon;
REVOKE SELECT ON page_views FROM anon;
REVOKE SELECT ON settings FROM anon;
REVOKE SELECT ON api_rate_limits FROM anon;

-- Protect API keys in ai_configs
REVOKE SELECT (api_key) ON ai_configs FROM anon;

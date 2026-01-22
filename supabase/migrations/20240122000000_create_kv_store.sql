CREATE TABLE IF NOT EXISTS kv_store_b0184cae (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

ALTER TABLE kv_store_b0184cae ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON kv_store_b0184cae FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON kv_store_b0184cae FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow authenticated update" ON kv_store_b0184cae FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow authenticated delete" ON kv_store_b0184cae FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.role() = 'anon');

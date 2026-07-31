ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_idempotency_key ON demo_requests(idempotency_key) WHERE idempotency_key IS NOT NULL;

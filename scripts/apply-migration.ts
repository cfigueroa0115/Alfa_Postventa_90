import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(url);
  
  console.log('Applying migration: add idempotency_key column...');
  
  await sql`ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100)`;
  console.log('✓ Column added');
  
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_idempotency_key ON demo_requests(idempotency_key) WHERE idempotency_key IS NOT NULL`;
  console.log('✓ Index created');
  
  // Verify
  const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'demo_requests' AND column_name = 'idempotency_key'`;
  console.log('Verification:', result.length > 0 ? '✅ Column exists' : '❌ Column NOT found');
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

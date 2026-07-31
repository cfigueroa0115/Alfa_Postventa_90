import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL no está configurada en .env.local');
    process.exit(1);
  }

  console.log('🔄 Aplicando migraciones...');
  const sql = neon(url);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: './db/migrations' });
  console.log('✅ Migraciones aplicadas exitosamente');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error al aplicar migraciones:', err);
  process.exit(1);
});

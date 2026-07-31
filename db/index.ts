import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL no está configurada. Por favor configure la variable de entorno en .env.local'
    );
  }
  return url;
};

const sql = neon(getDatabaseUrl());
export const db = drizzle(sql, { schema });

export type Database = typeof db;

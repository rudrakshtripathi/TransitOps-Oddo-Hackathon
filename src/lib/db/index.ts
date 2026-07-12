import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// max:1 and prepare:false are required for Supabase PgBouncer transaction pooling (port 6543)
const client = postgres(env.DATABASE_URL, { max: 1, prepare: false });

export const db = drizzle(client, { schema });

import { Pool } from 'pg'; 
import { drizzle } from 'drizzle-orm/node-postgres'; 
import * as schema from "@shared/schema"; 
import { URL } from 'url'; 
import dns from "dns"; 

// Ensure we use IPv4 first as Node 17+ defaults to IPv6 first 
dns.setDefaultResultOrder('ipv4first'); 

if (!process.env.DATABASE_URL) { 
  throw new Error( 
    "DATABASE_URL must be set. Did you forget to provision a database?", 
  ); 
} 

// Parse the connection string 
let connectionConfig: any = { 
  max: 20, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 15000, 
}; 

const dbUrl = new URL(process.env.DATABASE_URL); 

// Supabase Connection Logic 
// We specifically target the Transaction Pooler on port 6543 
// This avoids IPv6 issues and provides better connection management 
if (dbUrl.hostname.includes('supabase.co')) { 
  console.log(`[DB] Supabase detected. Configuring for Transaction Pooler (IPv4 compatible)...`); 
  
  // Force port 6543 (Transaction Pooler) 
  dbUrl.port = '5432'; 
  
  // Ensure SSL is required 
  dbUrl.searchParams.set('sslmode', 'require'); 
  
  // Use connection string with updated port 
  connectionConfig.connectionString = dbUrl.toString(); 
  
  // Explicit SSL configuration for pg 
  connectionConfig.ssl = { 
    rejectUnauthorized: false, // Required for Supabase self-signed certs in some regions 
  }; 
} else { 
  connectionConfig.connectionString = process.env.DATABASE_URL; 
} 

export const pool = new Pool(connectionConfig); 

console.log(`[DB] Database pool initialized. Target: ${dbUrl.hostname}:${dbUrl.port}`); 

// Monkey-patch pool.connect to enforce search_path on every connection 
// This is necessary because some connection poolers (like Supabase Transaction mode) 
// do not support the "options" startup parameter, and session-level SET commands 
// via "on('connect')" event are race-condition prone. 
const originalConnect = pool.connect.bind(pool); 
// @ts-ignore - overriding method with compatible signature 
pool.connect = async (...args: any[]) => { 
  // Handle callback style if ever used (unlikely by Drizzle) 
  if (args.length > 0 && typeof args[0] === 'function') { 
    return (originalConnect as any)(...args); 
  } 

  const client = await originalConnect(); 
  try { 
    await client.query("SET search_path TO public"); 
  } catch (err) { 
    console.error('[DB] Failed to set search_path in connection interceptor', err); 
  } 
  return client; 
}; 

// Basic error handler for the pool to prevent crashes on idle connection loss 
pool.on('error', (err) => { 
  console.error('Unexpected error on idle database client', err); 
  // Don't exit process here, let the request handler fail if needed 
}); 

export const db = drizzle(pool, { schema, logger: true });
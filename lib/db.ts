import { Pool } from "pg";

// Dynamically load environment variables via Next.js env loader on startup
try {
  const { loadEnvConfig } = require("@next/env");
  loadEnvConfig(process.cwd());
} catch (e) {
  // Ignored if loader is not available
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing.");
}

// Log database connection details securely without exposing the password
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log(`Host: ${url.hostname}`);
  console.log(`User: ${url.username}`);
  console.log(`Database: ${url.pathname.substring(1)}`);
} catch (e) {
  console.error("❌ DATABASE_URL is not a valid connection URL.");
}

// Prevent duplicate pool instances in Next.js hot-reload development environments
const globalForDb = global as unknown as { pool: Pool; isDbReady: boolean; dbError: string | null };

if (!globalForDb.pool) {
  globalForDb.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  globalForDb.isDbReady = false;
  globalForDb.dbError = null;

  // Run connection test and table schema verification immediately on initialization
  globalForDb.pool.query("SELECT 1;")
    .then(async () => {
      console.log("✅ Connected to Neon PostgreSQL");
      
      try {
        // Query to check if the 'papers' table exists in the public schema
        const tableCheck = await globalForDb.pool.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'papers');"
        );
        const exists = tableCheck.rows[0].exists;
        
        if (!exists) {
          const schemaErrMsg = "Database schema error: Table 'papers' does not exist. Please run 'node scripts/seed.js' to seed the database.";
          console.error(`❌ ${schemaErrMsg}`);
          globalForDb.dbError = schemaErrMsg;
          globalForDb.isDbReady = false;
        } else {
          console.log("✅ Database schema validation passed: Table 'papers' exists.");
          globalForDb.isDbReady = true;
          globalForDb.dbError = null;
        }
      } catch (schemaErr: any) {
        const schemaErrMsg = `Failed to verify database schema: ${schemaErr.message}`;
        console.error(`❌ ${schemaErrMsg}`, schemaErr.stack);
        globalForDb.dbError = schemaErrMsg;
        globalForDb.isDbReady = false;
      }
    })
    .catch((err) => {
      const connErrMsg = `Failed to connect to Neon PostgreSQL: ${err.message}`;
      console.error(`❌ ${connErrMsg}`, err.stack);
      globalForDb.dbError = connErrMsg;
      globalForDb.isDbReady = false;
    });
}

export const pool = globalForDb.pool;

/**
 * Validates that the database connection is established and the table schema exists.
 * Throws a detailed error if verification has failed to block API route execution.
 */
export function checkDbStatus() {
  if (!globalForDb.isDbReady) {
    throw new Error(globalForDb.dbError || "Database connection is not initialized or the papers table is missing.");
  }
}

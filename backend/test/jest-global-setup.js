// Global setup to ensure the test database exists before running tests
// This file runs in a separate Node process (no ts-jest), so it must be plain JS.
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  // Load .env manually to read base DB info
  const dotenvPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(dotenvPath)) {
    require('dotenv').config({ path: dotenvPath });
  }

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const baseDb = process.env.DB_NAME || 'postgres';
  const testDb = `${baseDb}_test`;

  // Connect to the maintenance DB (postgres) to create the test DB if needed
  const maintenanceDb = 'postgres';

  const client = new Client({
    host,
    port,
    user,
    password,
    database: maintenanceDb,
  });

  try {
    await client.connect();
    // Check if DB exists
    const checkRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDb]);
    if (checkRes.rowCount === 0) {
      // Create database with UTF8 encoding
      await client.query(`CREATE DATABASE "${testDb}" WITH ENCODING 'UTF8' TEMPLATE template1`);
      // eslint-disable-next-line no-console
      console.log(`[jest-global-setup] Created test database ${testDb}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`[jest-global-setup] Test database ${testDb} already exists`);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[jest-global-setup] Failed to ensure test database exists:', e);
    throw e;
  } finally {
    try { await client.end(); } catch (_) {}
  }
};

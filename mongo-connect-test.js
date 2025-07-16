// === mongo-connect-test.js ===
// Created: 2025-07-16
// Purpose: Minimal MongoDB Atlas connectivity test for diagnostics
// Key Exports: None
// Interactions: Run directly via Node.js
// Notes: Use to isolate local environment issues

/**
 * OVERVIEW
 *
 * This script tests basic connectivity to MongoDB Atlas using the official driver.
 * It logs connection diagnostics and exits with code 0 on success, 1 on failure.
 *
 * Assumptions:
 * - The MongoDB Atlas cluster is accessible and credentials are valid.
 * - Node.js and the 'mongodb' package are installed and compatible.
 *
 * Limitations:
 * - Does not perform any database operations beyond connection.
 * - Does not handle retries or advanced error handling.
 */

import { MongoClient } from 'mongodb';
const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://fame:Sthcnh4525%21@aggronation.b2xoypd.mongodb.net/aggroNATION?retryWrites=true&w=majority';

console.log('Node.js version:', process.version);
console.log('MongoDB URI:', uri.replace(/:[^@]+@/, ':<redacted>@'));

(async () => {
  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
})();

/*
 * === mongo-connect-test.js ===
 * Updated: 2025-07-16
 * Summary: Minimal MongoDB Atlas connectivity test for local diagnostics.
 * Key Components:
 *   - MongoClient connection
 * Dependencies:
 *   - Requires: 'mongodb' package, valid MongoDB Atlas URI
 * Version History:
 *   v1.0 - Initial release
 * Notes:
 *   - Redacts credentials in logs
 */

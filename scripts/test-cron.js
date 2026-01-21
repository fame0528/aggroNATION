#!/usr/bin/env node
/**
 * Test Cron Webhook Endpoint
 * 
 * Usage:
 *   node scripts/test-cron.js
 *   node scripts/test-cron.js https://yourdomain.com
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';
const secret = process.env.CRON_SECRET || 'test-secret';

console.log('🧪 Testing Cron Webhook Endpoint\n');
console.log(`Base URL: ${baseUrl}`);
console.log(`Secret: ${secret.substring(0, 8)}...`);
console.log('');

// Test 1: Without secret (should fail)
console.log('Test 1: Call without secret (should fail)...');
fetch(`${baseUrl}/api/cron/fetch`)
  .then(res => res.json())
  .then(data => {
    if (data.error === 'Unauthorized') {
      console.log('✅ PASS: Unauthorized as expected');
      console.log('');
      
      // Test 2: With correct secret (should succeed)
      console.log('Test 2: Call with correct secret...');
      return fetch(`${baseUrl}/api/cron/fetch?secret=${secret}`);
    } else {
      console.log('❌ FAIL: Should have been unauthorized');
      console.log('Response:', data);
      process.exit(1);
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('✅ PASS: Fetch succeeded');
      console.log('');
      console.log('Results:');
      console.log(`  Total sources: ${data.summary.total}`);
      console.log(`  Successful: ${data.summary.successful}`);
      console.log(`  Failed: ${data.summary.failed}`);
      console.log(`  Items fetched: ${data.summary.itemsFetched}`);
      console.log('');
      
      if (data.results && data.results.length > 0) {
        console.log('Source Details:');
        data.results.forEach(result => {
          const status = result.success ? '✅' : '❌';
          console.log(`  ${status} ${result.sourceName} (${result.sourceType}): ${result.count} items`);
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
        });
      }
      
      console.log('');
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ FAIL: Fetch failed');
      console.log('Response:', data);
      process.exit(1);
    }
  })
  .catch(error => {
    console.log('❌ ERROR:', error.message);
    process.exit(1);
  });

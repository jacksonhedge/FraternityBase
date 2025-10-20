#!/usr/bin/env node
/**
 * Simple stress test for FraternityBase Admin API
 */

const http = require('http');

const API_URL = 'localhost';
const API_PORT = 3001;
const ADMIN_TOKEN = '***REMOVED***';
const CONCURRENT_USERS = 5;
const REQUESTS_PER_USER = 10;

const stats = {
  total: 0,
  success: 0,
  failed: 0,
  times: []
};

function makeRequest(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const options = {
      hostname: API_URL,
      port: API_PORT,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'x-admin-token': ADMIN_TOKEN
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const time = Date.now() - start;
        stats.total++;
        stats.times.push(time);
        
        if (res.statusCode === 200) {
          stats.success++;
          console.log(`✅ ${path} - ${time}ms`);
        } else {
          stats.failed++;
          console.log(`❌ ${path} - ${res.statusCode} - ${time}ms`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      const time = Date.now() - start;
      stats.total++;
      stats.failed++;
      stats.times.push(time);
      console.log(`❌ ${path} - ERROR: ${err.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTest() {
  console.log('\n🚀 FraternityBase Stress Test Starting...\n');
  console.log(`Users: ${CONCURRENT_USERS}, Requests/User: ${REQUESTS_PER_USER}\n`);

  const endpoints = [
    '/admin/analytics/overview',
    '/admin/chapters',
    '/admin/universities',
    '/admin/companies',
    '/admin/greek-organizations'
  ];

  const startTime = Date.now();

  // Run concurrent users
  const users = [];
  for (let u = 0; u < CONCURRENT_USERS; u++) {
    users.push((async () => {
      for (let i = 0; i < REQUESTS_PER_USER; i++) {
        const endpoint = endpoints[i % endpoints.length];
        await makeRequest(endpoint);
        await new Promise(r => setTimeout(r, 50)); // Small delay
      }
    })());
  }

  await Promise.all(users);

  const duration = (Date.now() - startTime) / 1000;
  const avg = stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
  const sorted = stats.times.sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS');
  console.log('='.repeat(60));
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Total Requests: ${stats.total}`);
  console.log(`Success: ${stats.success} (${(stats.success/stats.total*100).toFixed(1)}%)`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Avg Response: ${avg.toFixed(0)}ms`);
  console.log(`95th Percentile: ${p95}ms`);
  console.log(`Requests/sec: ${(stats.total/duration).toFixed(1)}`);
  console.log('='.repeat(60));

  if (stats.success === stats.total && avg < 500) {
    console.log('✅ EXCELLENT - All requests succeeded!\n');
  } else if (stats.success / stats.total > 0.95) {
    console.log('✅ GOOD - Most requests succeeded\n');
  } else {
    console.log('⚠️  ISSUES DETECTED - Check failed requests\n');
  }
}

runTest().catch(console.error);

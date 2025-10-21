#!/usr/bin/env node
/**
 * FraternityBase Admin API Stress Testing Suite
 *
 * Tests the performance and reliability of admin endpoints under load
 *
 * Usage:
 *   node stress-test.js --test=all
 *   node stress-test.js --test=read
 *   node stress-test.js --test=write
 *   node stress-test.js --test=analytics
 */

const https = require('https');
const http = require('http');

require('dotenv').config();

// Configuration
const CONFIG = {
  // Change to production URL when ready
  API_URL: process.env.API_URL || 'http://localhost:3001/api',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,

  // Test parameters
  CONCURRENT_USERS: parseInt(process.env.CONCURRENT_USERS) || 10,
  REQUESTS_PER_USER: parseInt(process.env.REQUESTS_PER_USER) || 50,
  RAMP_UP_TIME: parseInt(process.env.RAMP_UP_TIME) || 5000, // ms
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test results storage
const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null,
};

/**
 * Make an HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.API_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': CONFIG.ADMIN_TOKEN,
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const startTime = Date.now();
    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        results.totalRequests++;
        results.responseTimes.push(responseTime);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          results.successfulRequests++;
          resolve({
            statusCode: res.statusCode,
            data: data ? ((() => { try { return JSON.parse(data); } catch(e) { return null; } })()) : null,
            responseTime,
          });
        } else {
          results.failedRequests++;
          results.errors.push({
            path,
            statusCode: res.statusCode,
            data: data,
          });
          resolve({
            statusCode: res.statusCode,
            try { data = JSON.parse(data); } catch(e) { data = { error: "Invalid JSON response", raw: data.substring(0, 100) }; }
            responseTime,
            error: true,
          });
        }
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      results.totalRequests++;
      results.failedRequests++;
      results.responseTimes.push(responseTime);
      results.errors.push({
        path,
        error: error.message,
      });
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test Scenarios
 */

// READ TESTS - Analytics and Dashboard
async function testAnalytics(userId) {
  const endpoints = [
    '/admin/analytics/overview',
    '/admin/analytics/colleges',
    '/admin/analytics/timeline',
    '/admin/analytics/unlock-types',
    '/admin/analytics/recent-transactions',
    '/admin/analytics/top-companies',
  ];

  const results = [];
  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest('GET', endpoint);
      results.push({
        endpoint,
        success: !result.error,
        responseTime: result.responseTime,
      });
      log(`User ${userId}: ${endpoint} - ${result.responseTime}ms`, 'gray');
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error.message,
      });
    }
  }
  return results;
}

// READ TESTS - Data listing
async function testDataListing(userId) {
  const endpoints = [
    '/admin/chapters',
    '/admin/universities',
    '/admin/greek-organizations',
    '/admin/officers',
    '/admin/companies',
  ];

  const results = [];
  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest('GET', endpoint);
      results.push({
        endpoint,
        success: !result.error,
        responseTime: result.responseTime,
        recordCount: result.data?.data?.length || 0,
      });
      log(`User ${userId}: ${endpoint} - ${result.responseTime}ms (${result.data?.data?.length || 0} records)`, 'gray');
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error.message,
      });
    }
  }
  return results;
}

// WRITE TESTS - Chapter creation
async function testChapterCreation(userId, iteration) {
  try {
    const result = await makeRequest('POST', '/admin/chapters/quick-add', {
      organization_name: 'Sigma Chi',
      university_name: 'Test University',
      grade: 4.0,
      is_viewable: false,
      status: 'active',
      note: `Stress test - User ${userId} - Iteration ${iteration}`,
    });

    log(`User ${userId}: Create chapter - ${result.responseTime}ms`, result.error ? 'red' : 'gray');
    return {
      success: !result.error,
      responseTime: result.responseTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// WRITE TESTS - Revenue and transactions
async function testRevenueEndpoints(userId) {
  const endpoints = [
    '/admin/revenue/summary',
    '/admin/revenue/transactions?limit=100',
    '/admin/revenue/by-company',
    '/admin/revenue/by-time',
  ];

  const results = [];
  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest('GET', endpoint);
      results.push({
        endpoint,
        success: !result.error,
        responseTime: result.responseTime,
      });
      log(`User ${userId}: ${endpoint} - ${result.responseTime}ms`, 'gray');
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error.message,
      });
    }
  }
  return results;
}

/**
 * User simulation - simulates one concurrent user
 */
async function simulateUser(userId, testType) {
  log(`User ${userId} starting...`, 'blue');

  for (let i = 0; i < CONFIG.REQUESTS_PER_USER; i++) {
    try {
      if (testType === 'read' || testType === 'all') {
        // Mix of analytics and data listing
        if (i % 3 === 0) {
          await testAnalytics(userId);
        } else {
          await testDataListing(userId);
        }
      }

      if (testType === 'write' || testType === 'all') {
        // Periodic write operations
        if (i % 5 === 0) {
          await testChapterCreation(userId, i);
        }
      }

      if (testType === 'analytics' || testType === 'all') {
        // Revenue endpoints
        if (i % 4 === 0) {
          await testRevenueEndpoints(userId);
        }
      }

      // Small delay between requests
      await sleep(100);
    } catch (error) {
      log(`User ${userId} error: ${error.message}`, 'red');
    }
  }

  log(`User ${userId} completed`, 'green');
}

/**
 * Main test runner
 */
async function runStressTest(testType = 'all') {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   FraternityBase Admin API - Stress Test Suite        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`Configuration:`, 'yellow');
  log(`  API URL: ${CONFIG.API_URL}`, 'gray');
  log(`  Test Type: ${testType}`, 'gray');
  log(`  Concurrent Users: ${CONFIG.CONCURRENT_USERS}`, 'gray');
  log(`  Requests per User: ${CONFIG.REQUESTS_PER_USER}`, 'gray');
  log(`  Ramp-up Time: ${CONFIG.RAMP_UP_TIME}ms\n`, 'gray');

  results.startTime = Date.now();

  // Ramp up users gradually
  const users = [];
  const rampUpDelay = CONFIG.RAMP_UP_TIME / CONFIG.CONCURRENT_USERS;

  for (let i = 0; i < CONFIG.CONCURRENT_USERS; i++) {
    users.push(simulateUser(i + 1, testType));
    await sleep(rampUpDelay);
  }

  // Wait for all users to complete
  await Promise.all(users);

  results.endTime = Date.now();

  // Print results
  printResults();
}

/**
 * Calculate and print test results
 */
function printResults() {
  const duration = (results.endTime - results.startTime) / 1000;
  const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
  const minResponseTime = Math.min(...results.responseTimes);
  const maxResponseTime = Math.max(...results.responseTimes);
  const requestsPerSecond = results.totalRequests / duration;
  const successRate = (results.successfulRequests / results.totalRequests) * 100;

  // Calculate percentiles
  const sortedTimes = results.responseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST RESULTS                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`Duration: ${duration.toFixed(2)}s`, 'yellow');
  log(`Total Requests: ${results.totalRequests}`, 'gray');
  log(`Successful: ${results.successfulRequests} (${successRate.toFixed(2)}%)`, 'green');
  log(`Failed: ${results.failedRequests}`, results.failedRequests > 0 ? 'red' : 'gray');
  log(`Requests/sec: ${requestsPerSecond.toFixed(2)}\n`, 'yellow');

  log(`Response Times:`, 'yellow');
  log(`  Average: ${avgResponseTime.toFixed(2)}ms`, 'gray');
  log(`  Min: ${minResponseTime}ms`, 'gray');
  log(`  Max: ${maxResponseTime}ms`, 'gray');
  log(`  50th percentile: ${p50}ms`, 'gray');
  log(`  95th percentile: ${p95}ms`, 'gray');
  log(`  99th percentile: ${p99}ms\n`, 'gray');

  // Performance assessment
  if (successRate === 100 && avgResponseTime < 500) {
    log('✅ EXCELLENT - All requests succeeded with fast response times', 'green');
  } else if (successRate > 95 && avgResponseTime < 1000) {
    log('✅ GOOD - Most requests succeeded with acceptable response times', 'green');
  } else if (successRate > 90) {
    log('⚠️  ACCEPTABLE - Some failures or slow response times detected', 'yellow');
  } else {
    log('❌ POOR - High failure rate or very slow response times', 'red');
  }

  // Show errors if any
  if (results.errors.length > 0) {
    log('\n❌ Errors encountered:', 'red');
    const errorSummary = {};
    results.errors.forEach((error) => {
      const key = error.statusCode || error.error || 'Unknown';
      errorSummary[key] = (errorSummary[key] || 0) + 1;
    });
    Object.entries(errorSummary).forEach(([error, count]) => {
      log(`  ${error}: ${count} occurrences`, 'red');
    });
  }
}

/**
 * Utility functions
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * CLI Argument parsing
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const testArg = args.find((arg) => arg.startsWith('--test='));
  const testType = testArg ? testArg.split('=')[1] : 'all';

  if (!['all', 'read', 'write', 'analytics'].includes(testType)) {
    log('❌ Invalid test type. Use: all, read, write, or analytics', 'red');
    process.exit(1);
  }

  return testType;
}

// Run the stress test
if (require.main === module) {
  const testType = parseArgs();
  runStressTest(testType).catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runStressTest, makeRequest };

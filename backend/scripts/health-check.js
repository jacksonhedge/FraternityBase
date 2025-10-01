#!/usr/bin/env node

/**
 * Health Check Script for Fraternity Base
 * Monitors system health and sends alerts if issues are detected
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  APP_URL: process.env.NODE_ENV === 'production'
    ? 'https://fraternitybase.com'
    : 'http://localhost:3001',
  BACKEND_URL: 'http://localhost:3001',
  DB_PATH: process.env.DB_PATH || '/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/fraternity-base.db',
  LOG_FILE: '/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/logs/health-check.log',
  ADMIN_EMAIL: 'jacksonfitzgerald25@gmail.com',
  ALERT_COOLDOWN: 5 * 60 * 1000, // 5 minutes
  LAST_ALERT_FILE: '/tmp/fraternity-base-last-alert'
};

// Ensure logs directory exists
const logsDir = path.dirname(CONFIG.LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logging function
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;

  console.log(logEntry.trim());

  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logEntry);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Check if we should send an alert (rate limiting)
function shouldSendAlert() {
  try {
    if (!fs.existsSync(CONFIG.LAST_ALERT_FILE)) {
      return true;
    }

    const lastAlert = parseInt(fs.readFileSync(CONFIG.LAST_ALERT_FILE, 'utf8'));
    const now = Date.now();

    return (now - lastAlert) > CONFIG.ALERT_COOLDOWN;
  } catch (error) {
    log('error', `Error checking alert cooldown: ${error.message}`);
    return true;
  }
}

// Record that we sent an alert
function recordAlert() {
  try {
    fs.writeFileSync(CONFIG.LAST_ALERT_FILE, Date.now().toString());
  } catch (error) {
    log('error', `Error recording alert: ${error.message}`);
  }
}

// Send email notification
async function sendAlert(subject, message) {
  if (!shouldSendAlert()) {
    log('info', 'Alert suppressed due to cooldown period');
    return;
  }

  try {
    const emailScript = '/Users/jacksonfitzgerald/Documents/Bankroll/email_notify.py';
    if (fs.existsSync(emailScript)) {
      execSync(`python3 "${emailScript}" "${subject}" "${message}"`, {
        stdio: 'pipe',
        timeout: 10000
      });
      log('info', `Alert sent: ${subject}`);
      recordAlert();
    } else {
      log('warn', 'Email script not found, cannot send alert');
    }
  } catch (error) {
    log('error', `Failed to send alert: ${error.message}`);
  }
}

// HTTP request helper
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const request = lib.get(url, { timeout }, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          data: data,
          headers: response.headers
        });
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Health check functions
async function checkBackendHealth() {
  try {
    const response = await makeRequest(`${CONFIG.BACKEND_URL}/health`);

    if (response.statusCode === 200) {
      const healthData = JSON.parse(response.data);
      log('info', `Backend health check passed: ${JSON.stringify(healthData)}`);
      return { status: 'healthy', data: healthData };
    } else {
      throw new Error(`Backend returned status ${response.statusCode}`);
    }
  } catch (error) {
    log('error', `Backend health check failed: ${error.message}`);
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkDatabaseHealth() {
  try {
    if (!fs.existsSync(CONFIG.DB_PATH)) {
      throw new Error('Database file does not exist');
    }

    // Check database file permissions
    const stats = fs.statSync(CONFIG.DB_PATH);
    if (!stats.isFile()) {
      throw new Error('Database path is not a file');
    }

    // Try to query the database
    const result = execSync(`sqlite3 "${CONFIG.DB_PATH}" "SELECT COUNT(*) FROM waitlist; SELECT COUNT(*) FROM company_signups;"`,
      { encoding: 'utf8', timeout: 5000 });

    const lines = result.trim().split('\n');
    const waitlistCount = parseInt(lines[0]) || 0;
    const companyCount = parseInt(lines[1]) || 0;

    log('info', `Database health check passed: ${waitlistCount} waitlist entries, ${companyCount} company signups`);

    return {
      status: 'healthy',
      data: {
        waitlistCount,
        companyCount,
        size: stats.size,
        lastModified: stats.mtime
      }
    };
  } catch (error) {
    log('error', `Database health check failed: ${error.message}`);
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkDiskSpace() {
  try {
    const result = execSync('df -h /', { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    const diskInfo = lines[1].split(/\s+/);
    const usedPercent = parseInt(diskInfo[4].replace('%', ''));

    if (usedPercent > 90) {
      throw new Error(`Disk space critical: ${usedPercent}% used`);
    } else if (usedPercent > 80) {
      log('warn', `Disk space warning: ${usedPercent}% used`);
    }

    log('info', `Disk space check passed: ${usedPercent}% used`);
    return { status: 'healthy', data: { usedPercent, info: diskInfo } };
  } catch (error) {
    log('error', `Disk space check failed: ${error.message}`);
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkProcessHealth() {
  try {
    // Check if Node.js processes are running
    const result = execSync('pgrep -f "fraternity-base\\|server-enhanced"', { encoding: 'utf8' });
    const processes = result.trim().split('\n').filter(pid => pid);

    if (processes.length === 0) {
      throw new Error('No Fraternity Base processes found');
    }

    log('info', `Process health check passed: ${processes.length} processes running (PIDs: ${processes.join(', ')})`);
    return { status: 'healthy', data: { processCount: processes.length, pids: processes } };
  } catch (error) {
    log('error', `Process health check failed: ${error.message}`);
    return { status: 'unhealthy', error: error.message };
  }
}

// Main health check function
async function runHealthChecks() {
  log('info', 'Starting comprehensive health check...');

  const checks = {
    backend: await checkBackendHealth(),
    database: await checkDatabaseHealth(),
    diskSpace: await checkDiskSpace(),
    processes: await checkProcessHealth()
  };

  const failed = Object.entries(checks).filter(([_, result]) => result.status === 'unhealthy');
  const warnings = Object.entries(checks).filter(([_, result]) => result.status === 'warning');

  if (failed.length > 0) {
    const errors = failed.map(([check, result]) => `${check}: ${result.error}`).join('\n');
    log('error', `Health check FAILED:\n${errors}`);

    await sendAlert(
      '🚨 Fraternity Base System Alert - Critical Issues Detected',
      `The following critical issues were detected:\n\n${errors}\n\nImmediate attention required!\n\nTime: ${new Date().toLocaleString()}`
    );

    process.exit(1);
  } else if (warnings.length > 0) {
    const warningMessages = warnings.map(([check, result]) => `${check}: ${result.error || result.message}`).join('\n');
    log('warn', `Health check completed with warnings:\n${warningMessages}`);
  } else {
    log('info', 'All health checks passed successfully');
  }

  // Log summary
  const summary = Object.entries(checks).map(([check, result]) =>
    `${check}: ${result.status}`
  ).join(', ');

  log('info', `Health check summary: ${summary}`);

  return checks;
}

// Run health checks
if (require.main === module) {
  runHealthChecks().catch(error => {
    log('error', `Health check script error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runHealthChecks, checkBackendHealth, checkDatabaseHealth };
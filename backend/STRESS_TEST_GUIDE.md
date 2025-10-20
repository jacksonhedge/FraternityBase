# FraternityBase Admin - Comprehensive Stress Testing Guide

## 🎯 Overview

This guide provides both **automated** and **manual** stress testing procedures for the FraternityBase admin dashboard and API endpoints.

---

## 🤖 Part 1: Automated Stress Testing

### Quick Start

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend

# Test all endpoints (recommended)
node stress-test.js --test=all

# Test only read operations (safe, no data modification)
node stress-test.js --test=read

# Test analytics endpoints
node stress-test.js --test=analytics

# Test write operations (creates test data)
node stress-test.js --test=write
```

### Environment Variables (Optional)

```bash
# Customize test parameters
export CONCURRENT_USERS=20          # Number of simultaneous users (default: 10)
export REQUESTS_PER_USER=100        # Requests per user (default: 50)
export RAMP_UP_TIME=10000           # Ramp-up time in ms (default: 5000)
export API_URL=https://your-api.com/api  # API endpoint (default: localhost:3001)

# Then run the test
node stress-test.js --test=all
```

### Example Output

```
╔════════════════════════════════════════════════════════╗
║   FraternityBase Admin API - Stress Test Suite        ║
╚════════════════════════════════════════════════════════╝

Configuration:
  API URL: http://localhost:3001/api
  Test Type: all
  Concurrent Users: 10
  Requests per User: 50
  Ramp-up Time: 5000ms

User 1 starting...
User 2 starting...
...

╔════════════════════════════════════════════════════════╗
║                    TEST RESULTS                        ║
╚════════════════════════════════════════════════════════╝

Duration: 45.23s
Total Requests: 5000
Successful: 4987 (99.74%)
Failed: 13
Requests/sec: 110.54

Response Times:
  Average: 245.32ms
  Min: 45ms
  Max: 1823ms
  50th percentile: 213ms
  95th percentile: 567ms
  99th percentile: 1234ms

✅ EXCELLENT - All requests succeeded with fast response times
```

### What the Automated Test Does

1. **Read Operations:**
   - Hits analytics endpoints (overview, colleges, timeline, etc.)
   - Lists all data (chapters, universities, officers, companies)
   - Measures response times and success rates

2. **Write Operations:**
   - Creates test chapters using `/admin/chapters/quick-add`
   - Tests database write performance
   - ⚠️ Creates test data (mark as `is_viewable: false`)

3. **Analytics Operations:**
   - Revenue summary
   - Transaction history
   - Company analytics
   - Time-based revenue queries

4. **Metrics Collected:**
   - Total requests / success rate
   - Average, min, max response times
   - Percentiles (50th, 95th, 99th)
   - Requests per second
   - Error breakdown

---

## 🧪 Part 2: Manual Stress Testing Guide

### Test 1: Dashboard Load Test

**Objective:** Verify the dashboard handles multiple rapid refreshes

**Steps:**
1. Open admin dashboard: `http://localhost:5173/app/admin`
2. Open browser DevTools (F12) → Network tab
3. Rapidly refresh page 10 times (Cmd+R / Ctrl+R)
4. Check:
   - ✅ All data loads consistently
   - ✅ No JavaScript errors in Console
   - ✅ Response times stay under 2 seconds
   - ✅ No memory leaks (check Performance Monitor)

**Pass Criteria:**
- All 10 refreshes complete without errors
- Page remains responsive
- No console errors

---

### Test 2: Rapid Tab Switching

**Objective:** Test UI performance under rapid navigation

**Steps:**
1. Navigate to admin dashboard
2. Rapidly click through all tabs in sequence:
   - Dashboard → Companies → Colleges → Chapters → Ambassadors → Users → Waitlist → Fraternities → Payments
3. Repeat 5 times as fast as possible
4. Check:
   - ✅ All tabs load data correctly
   - ✅ No visual glitches or overlapping elements
   - ✅ No frozen UI or loading states
   - ✅ Network requests complete successfully

**Pass Criteria:**
- All tabs respond within 1 second
- No UI freezing or errors
- Data displays correctly in each tab

---

### Test 3: Large Dataset Display

**Objective:** Test performance with maximum data loads

**Steps:**
1. Navigate to **Colleges** tab (1,000 universities)
2. Test search functionality:
   - Type "University" (should filter many results)
   - Clear search and try "State"
   - Test with no results: "zzzzzz"
3. Navigate to **Chapters** tab (1,000 chapters)
4. Apply all grade filters:
   - All Chapters → 5.0 → 4.0 → 3.0 → All Chapters
5. Check:
   - ✅ Search results update instantly
   - ✅ Filter changes apply within 500ms
   - ✅ Scrolling remains smooth
   - ✅ No pagination breaks

**Pass Criteria:**
- Search/filter updates within 500ms
- Smooth scrolling on large lists
- No browser lag or freezing

---

### Test 4: Concurrent User Simulation (Manual)

**Objective:** Simulate multiple admins using the system

**Steps:**
1. Open 5 browser windows (use different browsers or incognito)
2. Log in to admin dashboard in each window
3. In each window, perform different actions:
   - Window 1: Navigate through tabs
   - Window 2: Search in Colleges tab
   - Window 3: View chapter details
   - Window 4: Load analytics/revenue data
   - Window 5: Rapid refresh dashboard
4. Run all actions simultaneously for 2 minutes
5. Check:
   - ✅ All windows remain responsive
   - ✅ Data loads correctly in all windows
   - ✅ No authentication errors
   - ✅ Backend API responds to all requests

**Pass Criteria:**
- All windows function independently
- No performance degradation
- All API requests succeed

---

### Test 5: CSV Import Stress Test

**Objective:** Test large roster import performance

**Prerequisites:**
- Create a test CSV file with 500 roster members
- Use format: `Chapter Name, University Name, Member Name, Position, Email, Phone`

**Steps:**
1. Navigate to **Chapters** tab
2. Select a test chapter
3. Click "Import Roster"
4. Upload CSV with 500 members
5. Monitor import progress:
   - Check console logs
   - Watch network requests
   - Note any errors
6. Verify:
   - ✅ Import completes without timeout
   - ✅ All 500 members added successfully
   - ✅ No duplicate entries
   - ✅ UI remains responsive during import

**Pass Criteria:**
- Import completes within 30 seconds
- 100% success rate (no errors)
- UI doesn't freeze during import

---

### Test 6: Analytics Query Performance

**Objective:** Test heavy analytics queries

**Steps:**
1. Navigate to **Payments & Revenue** tab
2. Test different date ranges:
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - All time
3. For each range:
   - Check "Revenue Summary"
   - View "Transactions" list
   - Check "Top Companies"
4. Monitor:
   - ✅ Query response times
   - ✅ Chart/graph rendering
   - ✅ Data accuracy
   - ✅ No timeout errors

**Pass Criteria:**
- All queries complete within 3 seconds
- Charts render smoothly
- Data remains accurate across ranges

---

### Test 7: Mobile Responsiveness Under Load

**Objective:** Test mobile UI performance

**Steps:**
1. Open admin dashboard on mobile device (or Chrome DevTools mobile emulation)
2. Perform rapid actions:
   - Navigate all tabs
   - Scroll through long lists (Colleges, Chapters)
   - Open/close modals
   - Use search functionality
3. Check:
   - ✅ UI adapts correctly to screen size
   - ✅ Touch targets are appropriately sized
   - ✅ No horizontal scrolling issues
   - ✅ Performance remains acceptable

**Pass Criteria:**
- All UI elements accessible on mobile
- No layout breaks
- Acceptable performance (< 2s page loads)

---

### Test 8: Error Recovery Test

**Objective:** Test system resilience under failure conditions

**Steps:**
1. **Simulate Network Interruption:**
   - Open DevTools → Network tab
   - Set throttling to "Offline"
   - Try navigating tabs (should show error)
   - Re-enable network
   - Verify data loads correctly

2. **Simulate Backend Timeout:**
   - Open DevTools → Network tab
   - Set throttling to "Slow 3G"
   - Try loading large datasets
   - Check loading states and error handling

3. **Simulate Invalid Token:**
   - Clear localStorage admin token
   - Try accessing admin endpoints
   - Verify proper authentication error handling

**Pass Criteria:**
- Graceful error messages displayed
- No crashes or white screens
- System recovers when network restored

---

## 📊 Performance Benchmarks

### Acceptable Performance Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Dashboard Load | < 1s | 1-2s | > 2s |
| Analytics Query | < 2s | 2-5s | > 5s |
| Chapter List (1000) | < 1s | 1-3s | > 3s |
| CSV Import (500) | < 30s | 30-60s | > 60s |
| Search/Filter | < 500ms | 500ms-1s | > 1s |
| Tab Switch | < 500ms | 500ms-1s | > 1s |

### Load Testing Targets

| Concurrent Users | Success Rate | Avg Response Time |
|------------------|--------------|-------------------|
| 1-5 | 100% | < 200ms |
| 5-10 | > 99% | < 500ms |
| 10-20 | > 95% | < 1000ms |
| 20-50 | > 90% | < 2000ms |

---

## 🚨 What to Watch For

### Red Flags (Critical Issues)

- ❌ **Response times > 5 seconds** - Database query optimization needed
- ❌ **Success rate < 90%** - Backend stability issues
- ❌ **Memory leaks** - Check for unclosed connections or infinite loops
- ❌ **UI freezing** - JavaScript performance issues
- ❌ **Database connection errors** - Check Supabase connection pooling

### Yellow Flags (Performance Issues)

- ⚠️ **Response times 2-5 seconds** - Acceptable but could be improved
- ⚠️ **Success rate 90-95%** - Investigate intermittent failures
- ⚠️ **Slow pagination** - Consider implementing virtual scrolling
- ⚠️ **Large payload sizes** - Add pagination or limit query results

---

## 🔧 Troubleshooting

### High Response Times

**Check:**
1. Database indexes on frequently queried columns
2. Query complexity (too many JOINs?)
3. Supabase query limits
4. Network latency

**Solutions:**
- Add database indexes
- Implement query result caching
- Optimize complex queries
- Use pagination for large datasets

### High Failure Rate

**Check:**
1. Backend logs for errors
2. Database connection limits
3. Rate limiting settings
4. Authentication token issues

**Solutions:**
- Increase database connection pool
- Implement request queuing
- Add retry logic for failed requests
- Check Supabase row-level security

### Memory Leaks

**Check:**
1. Browser DevTools → Performance → Memory
2. Unclosed connections
3. Event listeners not cleaned up
4. Large data structures not cleared

**Solutions:**
- Use React cleanup functions in useEffect
- Clear intervals/timeouts
- Implement pagination to limit data in memory
- Use memoization for expensive computations

---

## 📝 Test Report Template

```markdown
# Stress Test Report - [Date]

## Test Configuration
- **Test Type:** Automated / Manual
- **Concurrent Users:** X
- **Duration:** X minutes
- **Environment:** Local / Production

## Results Summary
- **Total Requests:** X
- **Success Rate:** X%
- **Average Response Time:** Xms
- **95th Percentile:** Xms

## Performance Assessment
- ✅ Dashboard Load: [Pass/Fail]
- ✅ Analytics Queries: [Pass/Fail]
- ✅ Data Display: [Pass/Fail]
- ✅ CSV Import: [Pass/Fail]

## Issues Found
1. [Issue description]
   - Severity: Critical / Warning / Minor
   - Impact: [Description]
   - Recommended Fix: [Description]

## Recommendations
- [Optimization suggestions]
- [Scaling recommendations]
- [Infrastructure improvements]

## Next Steps
- [ ] Address critical issues
- [ ] Implement recommended fixes
- [ ] Re-test after optimizations
```

---

## 🎯 Quick Test Checklist

Use this for rapid pre-deployment testing:

- [ ] Run automated stress test: `node stress-test.js --test=all`
- [ ] Verify success rate > 95%
- [ ] Check average response time < 500ms
- [ ] Test dashboard rapid refresh (10x)
- [ ] Test rapid tab switching (5x all tabs)
- [ ] Test search/filter on large datasets
- [ ] Verify CSV import with 100+ rows
- [ ] Check analytics queries with different date ranges
- [ ] Test on mobile viewport
- [ ] Verify error handling (offline mode)
- [ ] Check browser console for errors
- [ ] Monitor network requests for failures

---

## 📞 Support

If you encounter issues during stress testing:

1. **Check Logs:**
   - Browser console (F12)
   - Backend server logs
   - Supabase logs

2. **Review Documentation:**
   - `BACKEND_OPERATIONS.md`
   - Supabase documentation

3. **Common Commands:**
   ```bash
   # Check backend server status
   curl -I http://localhost:3001/api/health

   # View recent Supabase queries
   # (Use Supabase MCP tool: mcp__supabase__get_logs)

   # Monitor system resources
   top -pid [backend_process_id]
   ```

---

## ✅ Completion Checklist

After running all tests:

- [ ] Document all test results
- [ ] Create GitHub issues for any bugs found
- [ ] Share performance metrics with team
- [ ] Update infrastructure if scaling needed
- [ ] Schedule regular stress tests (weekly/monthly)
- [ ] Archive test reports for future reference

---

**Last Updated:** October 2025
**Maintained By:** FraternityBase Engineering Team

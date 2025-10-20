# 🚀 Quick Start: Stress Testing FraternityBase Admin

## Run Automated Tests

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend

# Quick test (10 users, read-only, safe)
node stress-test.js --test=read

# Full test suite
node stress-test.js --test=all

# Analytics only
node stress-test.js --test=analytics

# Customize parameters
CONCURRENT_USERS=20 REQUESTS_PER_USER=100 node stress-test.js --test=all
```

## Test Types

| Test Type | Description | Data Modification |
|-----------|-------------|-------------------|
| `read` | Analytics + data listing | ❌ No |
| `write` | Chapter creation tests | ⚠️ Yes (test data) |
| `analytics` | Revenue + transaction queries | ❌ No |
| `all` | Complete test suite | ⚠️ Yes (test data) |

## What to Expect

### Successful Test Output
```
✅ EXCELLENT - All requests succeeded with fast response times

Duration: 45.23s
Total Requests: 5000
Successful: 4987 (99.74%)
Response Times:
  Average: 245ms
  95th percentile: 567ms
```

### Performance Targets

- ✅ Success Rate: > 95%
- ✅ Average Response: < 500ms
- ✅ 95th Percentile: < 1000ms
- ✅ Requests/sec: > 50

## Files Created

1. **`stress-test.js`** - Automated load testing script
2. **`STRESS_TEST_GUIDE.md`** - Comprehensive testing documentation
3. **`README_STRESS_TEST.md`** - This quick start guide

## Manual Testing

See `STRESS_TEST_GUIDE.md` for:
- Dashboard load testing
- Rapid tab switching
- Large dataset display tests
- CSV import stress tests
- Error recovery testing
- Mobile responsiveness tests

## Troubleshooting

### Test fails with connection errors
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check admin token is correct
echo $ADMIN_TOKEN
```

### High response times
- Check database indexes
- Monitor Supabase dashboard
- Review query complexity
- Consider adding caching

### Low success rate
- Check backend logs
- Verify database connection pool
- Review rate limiting settings
- Check authentication

## Next Steps

1. ✅ Run initial `--test=read` to establish baseline
2. ✅ Review results and identify bottlenecks
3. ✅ Run full `--test=all` suite
4. ✅ Follow manual testing checklist in guide
5. ✅ Document results and create issues for improvements

## Environment Variables

```bash
export CONCURRENT_USERS=10      # Default: 10
export REQUESTS_PER_USER=50     # Default: 50
export RAMP_UP_TIME=5000        # Default: 5000ms
export API_URL=http://localhost:3001/api
export ADMIN_TOKEN=***REMOVED***
```

## Support

For detailed testing procedures, performance benchmarks, and troubleshooting:
👉 See `STRESS_TEST_GUIDE.md`

# Sigma Chi Roster Data System - Setup Guide

## 🔐 Security First

This system handles sensitive PII (Personally Identifiable Information) including:
- Full names
- Email addresses
- Phone numbers
- Physical addresses
- Birthdays

**ALL PII IS ENCRYPTED AT REST** using industry-standard encryption.

## 📋 Prerequisites

- PostgreSQL 14+ with pgcrypto extension
- Python 3.9+
- Node.js 18+ (for API)
- 8GB+ RAM recommended for large imports

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create database
createdb fraternitybase

# Run schema migration
psql -d fraternitybase -f database/sigma_chi_schema.sql

# Verify setup
psql -d fraternitybase -c "SELECT * FROM fraternity_data.fraternities;"
```

### 2. Generate Encryption Key

```bash
# Generate a secure encryption key
python scripts/generate_encryption_key.py

# This will create a key and optionally save to .env
# NEVER commit the .env file!
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
# CRITICAL: Set ROSTER_ENCRYPTION_KEY from step 2
```

### 4. Install Dependencies

```bash
# Python dependencies
pip install -r requirements.txt

# Node dependencies (if using API)
npm install
```

### 5. Import Roster Data

```bash
# Import a chapter roster
python scripts/import_sigma_chi_roster.py data/sample_roster.csv "Iota Psi"

# Check import results
psql -d fraternitybase -c "SELECT * FROM fraternity_data.import_batches ORDER BY created_at DESC LIMIT 1;"
```

## 📊 Data Format

Your CSV should have these columns:
- `First Name` *
- `Last Name` *
- `Member Type` (Undergrad/Alumni/Graduate)
- `Status` (Active/Inactive/Alumni)
- `Initiation Date` (MM/DD/YYYY)
- `Initiating Chapter`
- `Graduation Year`
- `Birthday` (M/D/YYYY)
- `Email` *
- `Cell Phone`
- `Mailing Address` (Full address with commas)
- `Other/School/Work Address`

\* Required fields

## 🔍 Viewing Data (Admin)

```sql
-- Connect to database
psql -d fraternitybase

-- View chapter statistics (safe, no PII)
SELECT * FROM fraternity_data.chapter_stats;

-- Count members by chapter (no PII exposed)
SELECT
    c.chapter_name,
    COUNT(m.id) as total_members,
    COUNT(CASE WHEN m.status = 'Active' THEN 1 END) as active_members
FROM fraternity_data.chapters c
LEFT JOIN encrypted_pii.members m ON c.id = m.chapter_id
GROUP BY c.chapter_name;

-- View recent imports
SELECT * FROM fraternity_data.import_batches
ORDER BY created_at DESC
LIMIT 10;
```

## 🛡️ Security Best Practices

### Encryption Key Management

**Development:**
```bash
# Store in .env file (git-ignored)
ROSTER_ENCRYPTION_KEY=your_key_here
```

**Production:**
```bash
# Use AWS KMS or similar
AWS_KMS_KEY_ID=arn:aws:kms:us-east-1:xxx:key/xxx

# Or use environment variable from secure service
heroku config:set ROSTER_ENCRYPTION_KEY=xxx
```

### Access Control

1. **Database Users**: Create separate users for different access levels
```sql
-- Read-only user for API
CREATE USER api_reader WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA fraternity_data TO api_reader;

-- Admin user for imports
CREATE USER import_admin WITH PASSWORD 'secure_password';
GRANT ALL ON SCHEMA encrypted_pii TO import_admin;
```

2. **Audit Logging**: All data access is logged
```sql
-- View recent data access
SELECT * FROM audit_logs.data_access_log
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

3. **Row-Level Security**: Enabled on sensitive tables
```sql
-- Companies can only see data they've paid for
SET app.current_company_id = 'company_uuid';
SELECT * FROM encrypted_pii.members; -- Filtered automatically
```

## 📈 Data Quality Monitoring

```sql
-- Check data completeness by chapter
SELECT
    chapter_name,
    total_members,
    email_completeness,
    phone_completeness,
    last_member_added
FROM fraternity_data.chapter_stats
ORDER BY email_completeness ASC;

-- Find import issues
SELECT
    file_name,
    imported_count,
    error_count,
    status
FROM fraternity_data.import_batches
WHERE error_count > 0
ORDER BY created_at DESC;
```

## 🚨 Troubleshooting

### Import Errors

```bash
# Check import log
tail -f roster_import.log

# View specific import batch errors
psql -d fraternitybase -c "
SELECT error_log
FROM fraternity_data.import_batches
WHERE id = 'batch_uuid';"
```

### Encryption Issues

```python
# Test encryption key
python -c "
from cryptography.fernet import Fernet
key = 'your_key_here'
f = Fernet(key.encode())
test = f.encrypt(b'test')
print(f.decrypt(test))
"
```

### Performance Issues

```sql
-- Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY fraternity_data.chapter_stats;

-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('fraternity_data', 'encrypted_pii')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Analyze tables for query optimizer
ANALYZE encrypted_pii.members;
```

## 🔄 Regular Maintenance

### Daily Tasks
- Check import status
- Review error logs
- Verify data quality metrics

### Weekly Tasks
- Refresh materialized views
- Review access logs for anomalies
- Check disk usage

### Monthly Tasks
- Full data quality audit
- Review and optimize slow queries
- Update chapter statistics

### Semester Tasks (Important!)
- Full roster refresh
- Officer position updates
- Alumni status updates
- Graduate member transitions

## 📞 Support

For issues related to:
- **Data Import**: Check `roster_import.log`
- **Database**: Check PostgreSQL logs
- **Encryption**: Verify key is set correctly
- **Access Control**: Review audit logs

## ⚠️ Legal Compliance

- **GDPR**: Members can request data deletion
- **CCPA**: California members have additional rights
- **FERPA**: Educational records require special handling
- **Opt-Out**: Honor all opt-out requests immediately

```sql
-- Mark member as opted-out
UPDATE encrypted_pii.members
SET opt_out = TRUE
WHERE email_hash = 'hash_of_email';
```

## 🎯 Next Steps

1. ✅ Set up automated imports for semester updates
2. ✅ Configure backup and disaster recovery
3. ✅ Implement API rate limiting
4. ✅ Set up monitoring and alerting
5. ✅ Create data retention policies

---

**Remember**: You're handling sensitive data for thousands of members. Security and privacy are non-negotiable!
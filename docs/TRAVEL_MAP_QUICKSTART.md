# Travel Map Quick Start Guide

## ⚡ Add Members to the Travel Map (One Command)

```bash
./scripts/update_travel_map_members.sh your_data.csv "Chapter Name"
```

**Example:**
```bash
./scripts/update_travel_map_members.sh data/rutgers_roster.csv "Rutgers University Sigma Chi"
```

Then **refresh your browser** to see the new members on the map!

---

## 📋 CSV Format

Your CSV file should have these columns:

```csv
First Name,Last Name,Email,Cell Phone,Birthday,Mailing Address,Other/School/Work Address,Member Type,Status,Initiation Date,Graduation Year
```

**Example Row:**
```csv
John,Doe,john@example.com,555-1234,01/15/2002,"123 Main St, Newark, NJ, 07102","456 College Ave, New Brunswick, NJ, 08901",Undergrad,Active,09/15/2020,2024
```

---

## 🔧 First Time Setup

### 1. Install Dependencies

```bash
pip install psycopg2-binary pandas cryptography python-dotenv
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database (Supabase PostgreSQL)
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432

# Encryption Key
ROSTER_ENCRYPTION_KEY=your_fernet_key_here
```

### 3. Test the Setup

```bash
# Export existing database to travel map (no import)
./scripts/update_travel_map_members.sh --export-only
```

---

## 🎯 Common Tasks

### Add New Members

```bash
# Import CSV + Export to Map
./scripts/update_travel_map_members.sh data/new_batch.csv "Chapter Name"
```

### Update Existing Travel Map (No Import)

```bash
# Just regenerate the map from database
./scripts/update_travel_map_members.sh --export-only
```

### Import Only (Without Updating Map)

```bash
python3 scripts/import_sigma_chi_roster.py data/roster.csv "Chapter Name"
```

### Export Only (Map Update)

```bash
python3 scripts/export_travel_map_data.py
```

---

## 📊 Where is the Data?

| Location | What's There | Why |
|----------|-------------|-----|
| **Database (Supabase)** | Encrypted member PII | Secure, permanent storage |
| **frontend/src/data/travelMapData.json** | Formatted map data | What the browser displays |
| **roster_import.log** | Import operation logs | Debugging imports |
| **export_travel_map.log** | Export operation logs | Debugging exports |

---

## 🔍 Verify Your Data

### Check Database Import

```bash
tail -50 roster_import.log
```

Look for: `✅ Import completed` and statistics showing imported members

### Check JSON Export

```bash
# View file size
ls -lh frontend/src/data/travelMapData.json

# Preview first members
head -50 frontend/src/data/travelMapData.json
```

### Check Member Count

```bash
# Count members in JSON
grep -c '"id":' frontend/src/data/travelMapData.json
```

---

## 🚨 Troubleshooting

### "Members not showing on map"

1. Did the import succeed? → Check `roster_import.log`
2. Did the export run? → Check `export_travel_map.log`
3. Is JSON file updated? → Check file timestamp
4. Hard refresh browser → `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### "Database connection failed"

- Check `.env` file exists and has correct credentials
- Verify Supabase allows your IP address
- Test connection: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME`

### "Decryption error"

- Verify `ROSTER_ENCRYPTION_KEY` matches the key used during original imports
- The encryption key is a Fernet key (base64-encoded)

### "CSV parsing error"

- Ensure CSV has a header row
- Check for special characters in data (use UTF-8 encoding)
- Verify date formats: `MM/DD/YYYY` for birthdays and initiation dates

---

## 📈 Your Progress So Far

You've successfully imported **62 members across 4 batches**:
- ✅ Batch 1: 15 members (Rutgers, Penn State, Delaware, Maryland, Ohio State, Wake Forest)
- ✅ Batch 2: 10 members (USC, LSU, San Diego State, GW, Cornell, UCLA, Sacred Heart)
- ✅ Batch 3: 26 members (Sacred Heart, Syracuse)
- ✅ Batch 4: 11 members (Syracuse, Bucknell)

**Total Routes Mapped:** 4,405 routes across the United States

---

## 📚 Full Documentation

For detailed information, see: [`docs/TRAVEL_MAP_DATA_WORKFLOW.md`](./TRAVEL_MAP_DATA_WORKFLOW.md)

Topics covered:
- Database schema and security
- Data encryption details
- CSV format specifications
- API endpoint development
- Future enhancements
- GDPR/CCPA compliance

---

## 🎉 Next Steps

1. **Prepare your next CSV batch**
2. **Run the update script:** `./scripts/update_travel_map_members.sh`
3. **Refresh the map** and see your members plotted!
4. **Use filters** to explore data by state, age, member type

**Questions?** See the full documentation or check the log files.

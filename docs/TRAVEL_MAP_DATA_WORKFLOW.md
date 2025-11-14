# Travel Map Data Workflow

This document explains how member data flows from CSV imports to the interactive travel map visualization.

## Overview

The FraternityBase travel map tracks member locations across two journeys:
- **Undergraduates**: Home State → College State
- **Alumni**: College State → Career Location

## Data Flow Architecture

```
CSV File → Database (Encrypted) → JSON Export → Travel Map Display
   ↓            ↓                      ↓              ↓
 Import     Supabase              Frontend       D3.js Map
 Script    PostgreSQL              /data/         Visualization
```

## How to Add Members to the Travel Map

### Option 1: Quick Update (Recommended)

Use the all-in-one update script that handles both import and export:

```bash
./scripts/update_travel_map_members.sh data/roster.csv "Chapter Name"
```

**Example:**
```bash
./scripts/update_travel_map_members.sh data/rutgers_fall_2024.csv "Rutgers University Sigma Chi"
```

This script:
1. ✅ Imports members from CSV to encrypted database
2. ✅ Exports database to travel map JSON
3. ✅ Shows detailed progress and statistics
4. ✅ Creates audit logs for tracking

### Option 2: Manual Step-by-Step

If you need more control, run each step separately:

#### Step 1: Import CSV to Database

```bash
python3 scripts/import_sigma_chi_roster.py <csv_file> <chapter_name>
```

**What it does:**
- Reads member data from CSV
- Encrypts sensitive PII (names, emails, phones, addresses)
- Stores in Supabase PostgreSQL database
- Creates audit trail in `import_batches` table
- Calculates ages from birthdays
- Validates data format

**CSV Format Required:**
```csv
First Name,Last Name,Email,Cell Phone,Birthday,Mailing Address,Other/School/Work Address,Member Type,Status,Initiation Date,Graduation Year
John,Doe,john@example.com,555-1234,01/15/2002,"123 Main St, Newark, NJ, 07102","456 College Ave, New Brunswick, NJ, 08901",Undergrad,Active,09/15/2020,2024
```

#### Step 2: Export Database to Travel Map JSON

```bash
python3 scripts/export_travel_map_data.py
```

**What it does:**
- Connects to Supabase PostgreSQL
- Decrypts member names and location data
- Calculates current ages and birthday flags
- Joins member → chapter → university data
- Generates routes (home ↔ college)
- Writes to `frontend/src/data/travelMapData.json`

#### Step 3: Refresh Browser

The travel map automatically loads the JSON file. Just refresh your browser to see the new members!

### Option 3: Export Only (Update Map from Existing Database)

If you've already imported members and just want to regenerate the travel map:

```bash
./scripts/update_travel_map_members.sh --export-only
```

This is useful when:
- You fixed geocoding coordinates in the database
- You updated university locations
- You want to regenerate the map without re-importing

## Database Tables

### Member Data Storage

| Table | Purpose | Security |
|-------|---------|----------|
| `encrypted_pii.members` | Member personal information | 🔒 Fernet encryption |
| `fraternity_data.chapters` | Chapter roster and info | Public aggregate data |
| `fraternity_data.universities` | University locations | Public with lat/lng |
| `fraternity_data.import_batches` | Import audit trail | Tracking imports |

### Encrypted Fields

These fields are encrypted at rest using Fernet encryption:
- First Name
- Last Name
- Email
- Cell Phone
- Birthday
- Street Address
- City
- ZIP Code

### Non-Encrypted Fields

These fields are stored in plaintext for filtering/querying:
- State (both home and current)
- Member Type (Undergrad/Alumni)
- Status (Active/Inactive)
- Graduation Year
- Initiation Date

## Travel Map JSON Structure

The exported JSON has three main sections:

### 1. Members Array
```json
{
  "id": 0,
  "first_name": "John",
  "last_name": "Doe",
  "chapter": "Rutgers University",
  "age": 22,
  "birthday": "01/15/2002",
  "birthday_today": false,
  "current_location": {
    "name": "Rutgers University",
    "state": "NJ",
    "lat": 40.5008,
    "lng": -74.4474
  },
  "home_location": {
    "city": "Newark",
    "state": "NJ",
    "lat": 40.7357,
    "lng": -74.1724
  }
}
```

### 2. Routes Array
```json
{
  "member_id": 0,
  "from_lat": 40.7357,
  "from_lng": -74.1724,
  "from_state": "NJ",
  "to_lat": 40.5008,
  "to_lng": -74.4474,
  "to_state": "NJ",
  "age": 22
}
```

### 3. Universities Array
```json
{
  "name": "Rutgers University",
  "state": "NJ",
  "lat": 40.5008,
  "lng": -74.4474
}
```

## Environment Variables Required

Create a `.env` file in the project root with:

```bash
# Supabase PostgreSQL Connection
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_PORT=5432

# Encryption Key (keep this secret!)
ROSTER_ENCRYPTION_KEY=your_fernet_encryption_key

# Optional: Supabase API (for Node.js backend)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Batch Import Workflow

You've successfully imported **62 members across 4 batches**:

### Batch 1 (15 members)
- Rutgers, Penn State, Delaware, Maryland, Ohio State, Wake Forest

### Batch 2 (10 members)
- USC, LSU, San Diego State, GW, Cornell, UCLA, Sacred Heart

### Batch 3 (26 members)
- Sacred Heart (16), Syracuse (10)

### Batch 4 (11 members)
- Syracuse (2), Bucknell (9)

**To continue adding batches:**

```bash
# Prepare your CSV file
# Run the update script
./scripts/update_travel_map_members.sh data/batch_5.csv "Chapter Name"
```

## Troubleshooting

### Members not appearing on map

1. **Check database import was successful:**
   ```bash
   tail -n 50 roster_import.log
   ```

2. **Verify export ran correctly:**
   ```bash
   tail -n 50 export_travel_map.log
   ```

3. **Check JSON file was updated:**
   ```bash
   ls -lh frontend/src/data/travelMapData.json
   head -n 20 frontend/src/data/travelMapData.json
   ```

4. **Hard refresh browser:**
   - Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5`

### Decryption errors

If you see "Failed to decrypt field" errors:
- Verify `ROSTER_ENCRYPTION_KEY` matches the key used during import
- Check the encryption key is a valid Fernet key (base64-encoded)

### Missing geocoding data

Currently city lat/lng are set to 0. To add geocoding:
1. Use a geocoding service (Google Maps API, OpenCage, etc.)
2. Update the export script to geocode cities
3. Or manually update coordinates in the database

### Database connection errors

- Verify `.env` file exists and has correct credentials
- Test connection: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME`
- Check Supabase firewall allows your IP address

## Future Enhancements

### Real-Time API Endpoint

Instead of exporting to JSON, create a live API endpoint:

```typescript
// GET /api/travel-map/data
// Returns live data from database
```

**Advantages:**
- Always up-to-date (no export step needed)
- Can filter by chapter, graduation year, etc.
- Supports user authentication

**See:** `backend/src/routes/travelMap.ts` for initial implementation

### Geocoding Integration

Add automatic city → lat/lng conversion:

```python
from geopy.geocoders import Nominatim

def geocode_city(city, state):
    geolocator = Nominatim(user_agent="fraternitybase")
    location = geolocator.geocode(f"{city}, {state}, USA")
    return location.latitude, location.longitude
```

### Alumni Career Tracking

Enhance alumni location tracking:
- Current employer location (not just college)
- Industry clustering (show tech hubs, finance centers, etc.)
- Post-graduation migration patterns

## Data Privacy & Security

### PII Protection
- All sensitive data encrypted at rest with Fernet
- Encryption keys stored in environment variables (never in code)
- Audit logs track all data access
- Row-level security policies in Supabase

### GDPR/CCPA Compliance
- `opt_out` flag allows members to request removal
- Export only includes members with `status = 'Active'` or `'Alumni'`
- Birthday data blurred on frontend for privacy
- Names shown as "First L." format

### Access Control
- Import/export scripts require database credentials
- Travel map shows aggregated/anonymized views
- Personal emails/phones never exported to frontend JSON

## Support

For questions or issues:
1. Check logs: `roster_import.log` and `export_travel_map.log`
2. Review this documentation
3. Contact system administrator

---

**Last Updated:** November 2024
**Version:** 2.0
**Maintainer:** FraternityBase Development Team

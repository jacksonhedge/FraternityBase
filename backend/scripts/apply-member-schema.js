import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Applying member schema migration...\n');

// Read the full SQL file
const sqlFile = readFileSync(join(__dirname, 'add_member_schema.sql'), 'utf-8');

// Execute the entire migration as one transaction
console.log('Executing SQL migration...');

try {
  const { data, error } = await supabase.rpc('exec', { sql: sqlFile });

  if (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n📋 Please run the SQL manually in Supabase SQL Editor:');
    console.error('   https://supabase.com/dashboard/project/gxtspzttmwnnlxwwudct/sql/new');
    console.error('\n   SQL file: backend/scripts/add_member_schema.sql\n');
    process.exit(1);
  }

  console.log('✅ Migration completed successfully!\n');
  console.log('Created/Updated:');
  console.log('  - chapters table (added greek_letter_name, chapter_type, fraternity_province, etc.)');
  console.log('  - members table');
  console.log('  - leadership_positions table');
  console.log('  - member_leadership table');
  console.log('  - All indexes and RLS policies\n');

} catch (err) {
  console.error('❌ Exception during migration:', err.message);
  console.error('\n📋 SQL exec RPC might not be available. Running migration manually...\n');

  // Try executing manually with fetch
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql: sqlFile })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    console.log('✅ Migration completed successfully via REST API!\n');
  } catch (fetchErr) {
    console.error('❌ REST API also failed:', fetchErr.message);
    console.error('\n📋 Please run the SQL manually in Supabase SQL Editor:');
    console.error('   https://supabase.com/dashboard/project/gxtspzttmwnnlxwwudct/sql/new');
    console.error('\n   File location: backend/scripts/add_member_schema.sql\n');
    process.exit(1);
  }
}

process.exit(0);

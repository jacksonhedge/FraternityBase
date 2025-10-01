require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupWaitlistTable() {
  console.log('Setting up waitlist table in Supabase...');

  const sql = fs.readFileSync('./create_waitlist_table.sql', 'utf8');

  try {
    // For Supabase, we need to use the service role key to execute DDL
    // Since we only have anon key, let's use a simpler approach - just try to insert a test record
    console.log('Testing waitlist table...');

    const { data, error } = await supabase
      .from('waitlist')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Waitlist table does not exist or is not accessible:', error.message);
      console.log('\nPlease run this SQL in your Supabase SQL Editor:');
      console.log('\n' + sql);
      process.exit(1);
    }

    console.log('✓ Waitlist table exists and is accessible!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupWaitlistTable();

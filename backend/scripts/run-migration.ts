import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../migrations/create_user_activity_logs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Running migration: create_user_activity_logs.sql');

    // Execute the SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('Trying direct SQL execution...');
      const { error: directError } = await supabaseAdmin.from('user_activity_logs').select('*').limit(1);

      if (directError && directError.code === '42P01') {
        // Table doesn't exist, we need to run the migration manually
        console.error('❌ Migration failed. Please run the SQL manually in Supabase SQL Editor:');
        console.log('\n--- COPY THIS SQL ---\n');
        console.log(sql);
        console.log('\n--- END SQL ---\n');
        process.exit(1);
      }
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    console.log('\n📝 Please run the migration manually in Supabase SQL Editor.');
    console.log('Migration file location:', path.join(__dirname, '../migrations/create_user_activity_logs.sql'));
    process.exit(1);
  }
}

runMigration();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

console.log('🚀 Running member schema migration...\n');

// Read the SQL file
const sql = readFileSync(join(__dirname, 'add_member_schema.sql'), 'utf-8');

// Split into individual statements (rough split on semicolons not in strings)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && s.length > 0);

console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';';

  // Skip empty or comment-only statements
  if (!statement.trim() || statement.trim().startsWith('--')) {
    continue;
  }

  console.log(`Executing statement ${i + 1}/${statements.length}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

    if (error) {
      console.error(`❌ Error in statement ${i + 1}:`, error.message);
      errorCount++;

      // Print the failing statement
      if (statement.length < 200) {
        console.error(`   Statement: ${statement.substring(0, 100)}...`);
      }
    } else {
      console.log(`✅ Statement ${i + 1} executed successfully`);
      successCount++;
    }
  } catch (err) {
    console.error(`❌ Exception in statement ${i + 1}:`, err.message);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`\n✅ Successfully executed: ${successCount} statements`);
console.log(`❌ Failed: ${errorCount} statements\n`);

if (errorCount > 0) {
  console.log('⚠️  Some statements failed. You may need to run them manually in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/gxtspzttmwnnlxwwudct/sql/new\n');
  console.log('   SQL file location: backend/scripts/add_member_schema.sql\n');
}

process.exit(errorCount > 0 ? 1 : 0);

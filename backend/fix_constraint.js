require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixConstraint() {
  console.log('🔧 Fixing unlock_type constraint...');

  // First, drop the old constraint
  const { error: dropError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE chapter_unlocks DROP CONSTRAINT IF EXISTS chapter_unlocks_unlock_type_check;'
  });

  if (dropError) {
    console.error('❌ Error dropping constraint:', dropError);
  } else {
    console.log('✅ Old constraint dropped');
  }

  // Add the new constraint
  const { error: addError } = await supabase.rpc('exec_sql', {
    sql: "ALTER TABLE chapter_unlocks ADD CONSTRAINT chapter_unlocks_unlock_type_check CHECK (unlock_type IN ('basic_info', 'roster', 'officers', 'warm_introduction', 'full'));"
  });

  if (addError) {
    console.error('❌ Error adding constraint:', addError);
  } else {
    console.log('✅ New constraint added successfully!');
  }
}

fixConstraint().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

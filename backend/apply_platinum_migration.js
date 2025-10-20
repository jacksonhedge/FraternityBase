const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://oqptnptlshlhbmmnjamb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHRucHRsc2hsaGJtbW5qYW1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzI5OTA3NywiZXhwIjoyMDQyODc1MDc3fQ.0B5hMmVtcCexKH7Oq14iPYSc90Uh8qjHCEbpzPVX7Jk';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('📝 Reading migration file...');
    const migration = fs.readFileSync('./migrations/add_is_platinum_to_chapters.sql', 'utf8');

    console.log('🚀 Applying migration...');
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: migration
    });

    if (error) {
      // If RPC doesn't exist, try direct query
      console.log('⚠️  RPC not available, trying direct query...');

      // Split the migration into individual statements
      const statements = migration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

      for (const statement of statements) {
        const { error: stmtError } = await supabaseAdmin.rpc('exec', {
          query: statement
        });

        if (stmtError) {
          console.error('Error executing statement:', statement.substring(0, 100));
          console.error(stmtError);
        } else {
          console.log('✅ Statement executed');
        }
      }
    } else {
      console.log('✅ Migration applied successfully!');
    }

    // Update the chapters directly
    console.log('\n💎 Marking chapters as Platinum in database...');

    const platinumChapterIds = [
      'e502e257-6dd3-4797-95f9-bb204636a26e',
      '813a94af-5d70-4df4-b968-e5ef5987d65f',
      '22493c14-2d30-4d60-8e26-0004362e6f71',
      '9a5881d7-7d1c-48a0-8b2b-ecdd8c045907',
      '0f783e4b-6140-49e0-9aa5-244d1e68d08f',
      'c3977257-4ea6-45bb-ac5b-3a694878c7aa',
      'dbdcbaa0-85df-4ded-baed-b364f295dae4',
      '9798592f-3821-4641-a07b-48329e760002',
      'd449ab49-26a3-490d-b7b4-eb82d688c902',
      '34bb9467-4719-4013-8d92-88842d97d1e1'
    ];

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('chapters')
      .update({ is_platinum: true })
      .in('id', platinumChapterIds);

    if (updateError) {
      console.error('❌ Error updating chapters:', updateError);
    } else {
      console.log(`✅ Marked ${platinumChapterIds.length} chapters as Platinum!`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

applyMigration();

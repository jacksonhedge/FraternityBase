import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY === 'ADD_YOUR_SERVICE_ROLE_KEY_HERE'
  ? process.env.SUPABASE_ANON_KEY!
  : process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import the college data from frontend
const COLLEGE_LOCATIONS = require('../../frontend/src/data/statesGeoData').COLLEGE_LOCATIONS;

async function importColleges() {
  console.log('\n🎓 Starting college import...');
  console.log(`📊 Found ${Object.keys(COLLEGE_LOCATIONS).length} colleges to import\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const [collegeName, data] of Object.entries(COLLEGE_LOCATIONS)) {
    // Remove state suffix like "(KY)" from the name
    const cleanName = collegeName.replace(/\s*\([A-Z]{2}\)\s*$/, '');

    // Check if college already exists
    const { data: existing } = await supabase
      .from('universities')
      .select('id')
      .eq('name', cleanName)
      .single();

    if (existing) {
      console.log(`⏭️  Skipped: ${cleanName} (already exists)`);
      skippedCount++;
      continue;
    }

    // Prepare university data
    const universityData: any = {
      name: cleanName,
      location: (data as any).state,
      state: (data as any).state,
      student_count: (data as any).totalMembers * 10, // Estimate based on Greek life
      greek_percentage: 0.10, // 10% default
      website: '',
      logo_url: ''
    };

    try {
      const { error } = await supabase
        .from('universities')
        .insert(universityData);

      if (error) {
        console.error(`❌ Error inserting ${cleanName}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Imported: ${cleanName} (${(data as any).state})`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception importing ${cleanName}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n📈 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`⏭️  Skipped (already exist): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total processed: ${successCount + skippedCount + errorCount}`);
}

importColleges()
  .then(() => {
    console.log('\n✨ Import complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Import failed:', err);
    process.exit(1);
  });

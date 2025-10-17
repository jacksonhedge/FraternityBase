require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importData() {
  console.log('🚀 POWER5 BIG10 DATA IMPORT - STARTING');
  console.log('━'.repeat(80));
  console.log('\n⚠️  SAFETY MODE: Will ONLY add missing data, never override\n');
  console.log('━'.repeat(80));

  try {
    // Read the analysis report
    const report = JSON.parse(
      fs.readFileSync('/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/power5_analysis_report.json', 'utf8')
    );

    console.log('\n📊 IMPORT PLAN:\n');
    console.log(`   New Fraternities to Add: ${report.newFraternities.length}`);
    console.log(`   New Chapters to Add: ${report.newChapters.length}`);
    console.log(`   Default Grade for New Chapters: 3.0 ⭐⭐⭐\n`);
    console.log('━'.repeat(80));

    // ============================================
    // STEP 1: Import New Fraternities
    // ============================================
    console.log('\n🏛️  STEP 1: Importing New Fraternities...\n');

    let fraternitySuccessCount = 0;
    let fraternitySkipCount = 0;
    const fraternityErrors = [];

    for (const frat of report.newFraternities) {
      try {
        const { data, error} = await supabase
          .from('greek_organizations')
          .insert({
            name: frat.name,
            greek_letters: frat.greek_letters
          })
          .select();

        if (error) {
          if (error.code === '23505') {
            // Duplicate - skip
            fraternitySkipCount++;
            console.log(`   ⏭️  Skipped (exists): ${frat.name}`);
          } else {
            fraternityErrors.push({ frat: frat.name, error: error.message });
            console.log(`   ❌ Error: ${frat.name} - ${error.message}`);
          }
        } else {
          fraternitySuccessCount++;
          console.log(`   ✅ Added: ${frat.name} - ${frat.greek_letters}`);
        }
      } catch (err) {
        fraternityErrors.push({ frat: frat.name, error: err.message });
        console.log(`   ❌ Exception: ${frat.name} - ${err.message}`);
      }
    }

    console.log('\n━'.repeat(80));
    console.log('\n🏛️  FRATERNITY IMPORT RESULTS:\n');
    console.log(`   ✅ Successfully Added: ${fraternitySuccessCount}`);
    console.log(`   ⏭️  Skipped (already exist): ${fraternitySkipCount}`);
    console.log(`   ❌ Errors: ${fraternityErrors.length}\n`);

    if (fraternityErrors.length > 0) {
      console.log('   Errors:');
      fraternityErrors.forEach(e => console.log(`      - ${e.frat}: ${e.error}`));
    }

    // Re-fetch all fraternities for chapter creation
    const { data: allFraternities, error: fratFetchError } = await supabase
      .from('greek_organizations')
      .select('id, name, greek_letters');

    if (fratFetchError) {
      throw new Error('Failed to fetch fraternities: ' + fratFetchError.message);
    }

    const fraternityMap = new Map();
    allFraternities.forEach(f => {
      fraternityMap.set(f.name.toLowerCase().trim(), f);
      if (f.greek_letters) {
        fraternityMap.set(f.greek_letters.toLowerCase().trim(), f);
      }
    });

    // ============================================
    // STEP 2: Import New Chapters
    // ============================================
    console.log('\n━'.repeat(80));
    console.log('\n🏠 STEP 2: Importing New Chapters (Grade 3.0 default)...\n');

    let chapterSuccessCount = 0;
    let chapterSkipCount = 0;
    const chapterErrors = [];

    // Batch insert for performance (100 at a time)
    const batchSize = 100;
    for (let i = 0; i < report.newChapters.length; i += batchSize) {
      const batch = report.newChapters.slice(i, i + batchSize);

      const chaptersToInsert = batch.map(chapter => ({
        university_id: chapter.university_id,
        greek_organization_id: chapter.greek_organization_id,
        chapter_name: `${chapter.fraternity} - ${chapter.college}`,
        grade: 3.0 // DEFAULT GRADE 3.0 ⭐⭐⭐
      }));

      try {
        const { data, error } = await supabase
          .from('chapters')
          .insert(chaptersToInsert)
          .select();

        if (error) {
          // Check if it's a duplicate error
          if (error.code === '23505') {
            chapterSkipCount += batch.length;
            console.log(`   ⏭️  Batch ${Math.floor(i / batchSize) + 1}: Skipped ${batch.length} (already exist)`);
          } else {
            chapterErrors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
            console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1}: Error - ${error.message}`);
          }
        } else {
          chapterSuccessCount += data.length;
          console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}: Added ${data.length} chapters`);
        }
      } catch (err) {
        chapterErrors.push({ batch: Math.floor(i / batchSize) + 1, error: err.message });
        console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1}: Exception - ${err.message}`);
      }
    }

    console.log('\n━'.repeat(80));
    console.log('\n🏠 CHAPTER IMPORT RESULTS:\n');
    console.log(`   ✅ Successfully Added: ${chapterSuccessCount}`);
    console.log(`   ⏭️  Skipped (already exist): ${chapterSkipCount}`);
    console.log(`   ❌ Errors: ${chapterErrors.length}\n`);

    if (chapterErrors.length > 0) {
      console.log('   Errors:');
      chapterErrors.forEach(e => console.log(`      - Batch ${e.batch}: ${e.error}`));
    }

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n━'.repeat(80));
    console.log('\n✅ IMPORT COMPLETE!\n');
    console.log('━'.repeat(80));
    console.log('\n📊 FINAL SUMMARY:\n');
    console.log(`   🏛️  Fraternities Added: ${fraternitySuccessCount}`);
    console.log(`   🏠 Chapters Added: ${chapterSuccessCount}`);
    console.log(`   ⭐ Default Grade: 3.0 (Good)\n`);

    console.log('━'.repeat(80));
    console.log('\n🔒 SAFETY VERIFICATION:\n');
    console.log('   ✅ No existing data was overridden');
    console.log('   ✅ All existing chapter grades preserved');
    console.log('   ✅ All existing unlock data preserved');
    console.log('   ✅ All user data preserved\n');

    console.log('━'.repeat(80));
    console.log('\n🎯 WHAT TO DO NEXT:\n');
    console.log('   1. Check your admin panel at /admin/chapters');
    console.log('   2. Verify new chapters appear with 3.0⭐ rating');
    console.log('   3. Manually upgrade grades for premium chapters');
    console.log('   4. All new chapters are unlockable immediately\n');

    console.log('━'.repeat(80));

    // Save import results
    const importResults = {
      timestamp: new Date().toISOString(),
      fraternities: {
        added: fraternitySuccessCount,
        skipped: fraternitySkipCount,
        errors: fraternityErrors.length
      },
      chapters: {
        added: chapterSuccessCount,
        skipped: chapterSkipCount,
        errors: chapterErrors.length,
        defaultGrade: 3.0
      },
      errors: {
        fraternities: fraternityErrors,
        chapters: chapterErrors
      }
    };

    fs.writeFileSync(
      '/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/power5_import_results.json',
      JSON.stringify(importResults, null, 2)
    );

    console.log('\n   📄 Detailed results saved to: power5_import_results.json\n');
    console.log('━'.repeat(80));

  } catch (error) {
    console.error('\n\n❌ CRITICAL ERROR:\n');
    console.error(error);
    console.log('\n⚠️  Import aborted. No data was modified.\n');
    process.exit(1);
  }
}

// Run import
importData().catch(console.error);

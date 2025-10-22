#!/usr/bin/env node
/**
 * Add Instagram handles to Sigma Chi chapters in Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env file');
  console.error('   Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Power 5 Sigma Chi Instagram handles mapped to universities
const instagramData = {
  // BIG TEN
  'Ohio State University': '@osusigmachi',
  'University of Michigan': '@michigansigmachi',
  'Michigan State University': '@msu_sigmachi',
  'University of Wisconsin-Madison': '@sigmachiwisconsin',
  'Pennsylvania State University': '@sigmachisc',
  'University of Nebraska-Lincoln': '@nebraskasigmachi',
  'University of Illinois Urbana-Champaign': '@uiucsigmachi',
  'University of Iowa': '@iowasigmachi',
  'Purdue University': '@sigmachipurdue',
  'Indiana University Bloomington': '@sigmachi_indiana',
  'University of Minnesota': '@sigmachiumn',
  'Northwestern University': '@sigsatnorthwestern',
  'Rutgers University': '@sigmachirutgers',
  'University of Maryland College Park': '@sigmachiumd',

  // SEC
  'University of Alabama': '@uasigmachi',
  'Auburn University': '@auburnsigmachi',
  'Louisiana State University': '@sigmachilsu',
  'University of Florida': '@ufsigmachi',
  'University of Tennessee': '@utksigmachi',
  'University of South Carolina': '@sigmachiusc',
  'Texas A&M University': '@tamusigmachi',
  'University of Kentucky': '@uk_sigmachi',
  'University of Mississippi': '@olemisssigmachi',
  'Mississippi State University': '@msusigmachi',
  'University of Arkansas': '@arkansas.sigmachi',
  'University of Missouri': '@sigmachimizzou',
  'Vanderbilt University': '@vandysigs',

  // ACC
  'Clemson University': '@clemsonsigmachi',
  'University of North Carolina at Chapel Hill': '@sigmachiunc',
  'Wake Forest University': '@sigmachideltanu',
  'University of Miami': '@sigmachi_umiami',
  'Georgia Tech': '@gtsigmachi',
  'University of Pittsburgh': '@sigmachipitt',
  'Florida State University': '@fsusigmachi',
  'North Carolina State University': '@ncsusigmachi',

  // BIG 12
  'University of Oklahoma': '@ousigmachi',
  'Oklahoma State University': '@okstatesigmachi',
  'Texas Tech University': '@texastech.sigmachi',
  'Texas Christian University': '@sigmachitcu',
  'Kansas State University': '@kstatesigmachi',
  'University of Kansas': '@sigmachi_ku',
  'Iowa State University': '@isusigmachi',
  'West Virginia University': '@sigmachiwv',

  // PAC-12
  'University of California Los Angeles': '@sigmachi_ucla',
  'Stanford University': '@stanfordsigmachi',
  'University of Southern California': '@trojansigs',
  'University of Oregon': '@uosigmachi',
  'University of Arizona': '@az_sigmachi',
  'University of Washington': '@uwsigmachi',
};

async function updateInstagramHandles() {
  console.log('=' .repeat(70));
  console.log('Sigma Chi Instagram Handle Updater');
  console.log('='.repeat(70));
  console.log(`\nSupabase URL: ${supabaseUrl}`);
  console.log(`Total universities to update: ${Object.keys(instagramData).length}\n`);

  let updated = 0;
  let notFound = 0;
  let errors = 0;

  // First, get Sigma Chi organization ID
  const { data: sigmaChiOrg, error: orgError } = await supabase
    .from('greek_organizations')
    .select('id')
    .eq('name', 'Sigma Chi')
    .single();

  if (orgError || !sigmaChiOrg) {
    console.error('❌ Error: Sigma Chi organization not found in database');
    console.error('   Please ensure Sigma Chi exists in greek_organizations table');
    process.exit(1);
  }

  console.log(`✓ Found Sigma Chi organization (ID: ${sigmaChiOrg.id})\n`);
  console.log('Processing updates...\n');

  for (const [universityName, instagramHandle] of Object.entries(instagramData)) {
    process.stdout.write(`  ${universityName}... `);

    try {
      // Find the university
      const { data: university, error: uniError } = await supabase
        .from('universities')
        .select('id')
        .ilike('name', `%${universityName}%`)
        .single();

      if (uniError || !university) {
        console.log(`⚠️  University not found`);
        notFound++;
        continue;
      }

      // Find the chapter
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .select('id, instagram_handle')
        .eq('greek_organization_id', sigmaChiOrg.id)
        .eq('university_id', university.id)
        .single();

      if (chapterError || !chapter) {
        console.log(`⚠️  Chapter not found`);
        notFound++;
        continue;
      }

      // Update the Instagram handle
      const { error: updateError } = await supabase
        .from('chapters')
        .update({
          instagram_handle: instagramHandle,
          updated_at: new Date().toISOString()
        })
        .eq('id', chapter.id);

      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
        errors++;
        continue;
      }

      if (chapter.instagram_handle) {
        console.log(`✓ Updated (was: ${chapter.instagram_handle})`);
      } else {
        console.log(`✓ Added`);
      }
      updated++;

    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✓ Successfully updated: ${updated}`);
  console.log(`⚠️  Not found in database: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\nTotal processed: ${Object.keys(instagramData).length}`);
  console.log('\n' + '='.repeat(70));

  // List chapters that weren't found
  if (notFound > 0) {
    console.log('\n📋 Universities/Chapters not found:');
    console.log('   These may need to be added to the database first:\n');

    for (const [universityName, instagramHandle] of Object.entries(instagramData)) {
      const { data: university } = await supabase
        .from('universities')
        .select('id')
        .ilike('name', `%${universityName}%`)
        .single();

      if (!university) {
        console.log(`   - ${universityName} (${instagramHandle})`);
      } else {
        const { data: chapter } = await supabase
          .from('chapters')
          .select('id')
          .eq('greek_organization_id', sigmaChiOrg.id)
          .eq('university_id', university.id)
          .single();

        if (!chapter) {
          console.log(`   - Sigma Chi chapter at ${universityName} (${instagramHandle})`);
        }
      }
    }
  }
}

// Run the update
updateInstagramHandles()
  .then(() => {
    console.log('\n✅ Update complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

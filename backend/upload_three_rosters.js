const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vvsawtexgpopqxgaqyxg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2c2F3dGV4Z3BvcHF4Z2FxeXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTM2NzA5NCwiZXhwIjoyMDUwOTQzMDk0fQ.gXVH1ZtunHnWkFMk6d67RTD_pcLhd-YQ9rg1l5wrM_A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Chapter ID mapping
const CHAPTERS = {
  'pittsburgh': 'a8b21209-8bfe-41dd-a321-d737522523b4',
  'fau': 'd8fbd7a4-06be-4992-b4e4-81d62ab3a838',
  'fgcu': '4b054cbe-555c-452a-9fcd-dc11938b07fa'
};

// File mapping
const FILES = {
  'pittsburgh': '/Users/jacksonfitzgerald/Downloads/sigma_chi_university_of_pittsburgh_roster.csv',
  'fau': '/Users/jacksonfitzgerald/Downloads/sigma_chi_florida_atlantic_roster.csv',
  'fgcu': '/Users/jacksonfitzgerald/Downloads/sigma_chi_florida_gulf_coast_roster.csv'
};

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i] ? values[i].trim() : '';
    });
    return obj;
  });
}

function formatPhone(phone) {
  if (!phone || phone.length !== 10) return phone;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
}

async function uploadRoster(schoolKey, schoolName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📤 Processing ${schoolName} Sigma Chi`);
  console.log(`${'='.repeat(60)}`);

  const chapterId = CHAPTERS[schoolKey];
  const filePath = FILES[schoolKey];

  // Parse CSV
  const members = parseCSV(filePath);
  console.log(`📊 Found ${members.length} members in CSV`);

  // Clear existing members for this chapter
  console.log(`🗑️  Clearing existing members...`);
  const { error: deleteError } = await supabase
    .from('chapter_members')
    .delete()
    .eq('chapter_id', chapterId);

  if (deleteError) {
    console.error(`❌ Error clearing members:`, deleteError);
    return;
  }
  console.log(`✅ Cleared existing members`);

  // Prepare data for insertion
  const membersToInsert = members.map(member => ({
    chapter_id: chapterId,
    name: member.name,
    email: member.email || null,
    phone: member.phone ? formatPhone(member.phone) : null,
    graduation_year: member.graduation_year || null,
    major: member.major || null,
    position: member.position || 'Member',
    member_type: member.member_type || 'Undergrad',
    linkedin_profile: member.linkedin || null
  }));

  // Insert in batches of 100
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < membersToInsert.length; i += batchSize) {
    const batch = membersToInsert.slice(i, i + batchSize);
    console.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(membersToInsert.length / batchSize)} (${batch.length} members)...`);

    const { data, error } = await supabase
      .from('chapter_members')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error inserting batch:`, error);
      errorCount += batch.length;
    } else {
      console.log(`✅ Inserted ${data.length} members`);
      successCount += data.length;
    }
  }

  console.log(`\n📊 ${schoolName} Summary:`);
  console.log(`   ✅ Successfully inserted: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount}`);
  }
}

async function main() {
  console.log('🚀 Starting roster upload for 3 Sigma Chi chapters...\n');

  await uploadRoster('pittsburgh', 'University of Pittsburgh');
  await uploadRoster('fau', 'Florida Atlantic University');
  await uploadRoster('fgcu', 'Florida Gulf Coast University');

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ All rosters uploaded successfully!');
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeData() {
  console.log('📊 POWER5 BIG10 DATA ANALYSIS - READ ONLY');
  console.log('━'.repeat(80));

  // Read JSON file
  const jsonData = JSON.parse(
    fs.readFileSync('/Users/jacksonfitzgerald/Downloads/power5_big10_fraternities.json', 'utf8')
  );

  console.log(`\n✅ Loaded JSON file with ${jsonData.length} colleges\n`);

  // Get existing universities from database
  const { data: existingColleges, error: collegeError } = await supabase
    .from('universities')
    .select('id, name, state');

  if (collegeError) {
    console.error('❌ Error fetching universities:', collegeError);
    return;
  }

  // Get existing greek organizations from database
  const { data: existingFraternities, error: fratError } = await supabase
    .from('greek_organizations')
    .select('id, name, greek_letters');

  if (fratError) {
    console.error('❌ Error fetching fraternities:', fratError);
    return;
  }

  // Get existing chapters from database
  const { data: existingChapters, error: chapterError } = await supabase
    .from('chapters')
    .select('id, chapter_name, university_id, greek_organization_id, grade');

  if (chapterError) {
    console.error('❌ Error fetching chapters:', chapterError);
    return;
  }

  console.log(`\n📚 EXISTING DATABASE DATA:`);
  console.log(`   Colleges: ${existingColleges.length}`);
  console.log(`   Fraternities: ${existingFraternities.length}`);
  console.log(`   Chapters: ${existingChapters.length}\n`);
  console.log('━'.repeat(80));

  // Analysis arrays
  const newColleges = [];
  const existingCollegeMatches = [];
  const newFraternities = new Set();
  const existingFraternityMatches = new Set();
  const newChapters = [];
  const existingChapterMatches = [];
  const potentialIssues = [];

  // Create lookup maps for quick matching
  const collegeMap = new Map(
    existingColleges.map(c => [c.name.toLowerCase().trim(), c])
  );

  const fraternityMap = new Map();
  existingFraternities.forEach(f => {
    // Try to match by name
    fraternityMap.set(f.name.toLowerCase().trim(), f);
    // Also try to match by greek letters if they exist
    if (f.greek_letters) {
      fraternityMap.set(f.greek_letters.toLowerCase().trim(), f);
    }
  });

  // Analyze each college in JSON
  for (const collegeData of jsonData) {
    const collegeName = collegeData.college.trim();
    const collegeKey = collegeName.toLowerCase();

    // Check if college exists
    let matchedCollege = collegeMap.get(collegeKey);

    if (!matchedCollege) {
      // Try fuzzy matching
      for (const [key, college] of collegeMap.entries()) {
        if (key.includes(collegeKey.split(' ')[0]) || collegeKey.includes(key.split(' ')[0])) {
          matchedCollege = college;
          potentialIssues.push({
            type: 'college_fuzzy_match',
            json: collegeName,
            db: college.name,
            message: 'Fuzzy matched - please verify'
          });
          break;
        }
      }
    }

    if (matchedCollege) {
      existingCollegeMatches.push({
        json: collegeName,
        db: matchedCollege.name,
        id: matchedCollege.id
      });
    } else {
      newColleges.push({
        name: collegeName,
        conference: collegeData.conference,
        fraternityCount: collegeData.fraternityCount
      });
    }

    // Analyze fraternities for this college
    for (const fratString of collegeData.fraternities) {
      // Parse fraternity name and greek letters
      const parts = fratString.split(' - ');
      const fratName = parts[0].trim();
      const greekLetters = parts[1] ? parts[1].trim() : null;

      // Try to find matching fraternity
      let matchedFrat = fraternityMap.get(fratName.toLowerCase());

      if (!matchedFrat && greekLetters) {
        matchedFrat = fraternityMap.get(greekLetters.toLowerCase());
      }

      if (matchedFrat) {
        existingFraternityMatches.add(fratName);
      } else {
        newFraternities.add(JSON.stringify({ name: fratName, greek_letters: greekLetters }));
      }

      // Check if chapter exists (university + greek organization combination)
      if (matchedCollege && matchedFrat) {
        const chapterExists = existingChapters.find(
          ch => ch.university_id === matchedCollege.id && ch.greek_organization_id === matchedFrat.id
        );

        if (chapterExists) {
          existingChapterMatches.push({
            name: chapterExists.chapter_name,
            college: matchedCollege.name,
            fraternity: matchedFrat.name,
            grade: chapterExists.grade
          });
        } else {
          newChapters.push({
            college: matchedCollege.name,
            university_id: matchedCollege.id,
            fraternity: matchedFrat.name,
            greek_organization_id: matchedFrat.id
          });
        }
      }
    }
  }

  // Print detailed report
  console.log('\n\n🎯 ANALYSIS REPORT\n');
  console.log('━'.repeat(80));

  console.log('\n📍 COLLEGES ANALYSIS:\n');
  console.log(`   ✅ Matched (already in DB): ${existingCollegeMatches.length}`);
  console.log(`   🆕 New (need to add): ${newColleges.length}\n`);

  if (newColleges.length > 0) {
    console.log('   New Colleges to Add:');
    newColleges.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.conference}, ${c.fraternityCount} fraternities)`);
    });
  }

  console.log('\n━'.repeat(80));
  console.log('\n🏛️  FRATERNITIES ANALYSIS:\n');
  console.log(`   ✅ Matched (already in DB): ${existingFraternityMatches.size}`);
  console.log(`   🆕 New (need to add): ${newFraternities.size}\n`);

  if (newFraternities.size > 0) {
    console.log('   New Fraternities to Add:');
    const newFratArray = Array.from(newFraternities).map(f => JSON.parse(f));
    newFratArray.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.name}${f.greek_letters ? ' - ' + f.greek_letters : ''}`);
    });
  }

  console.log('\n━'.repeat(80));
  console.log('\n🏠 CHAPTERS ANALYSIS:\n');
  console.log(`   ✅ Matched (already in DB): ${existingChapterMatches.length}`);
  console.log(`   🆕 New (need to add): ${newChapters.length}\n`);

  if (newChapters.length > 0 && newChapters.length <= 20) {
    console.log('   Sample New Chapters to Add:');
    newChapters.slice(0, 20).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.fraternity} at ${c.college}`);
    });
    if (newChapters.length > 20) {
      console.log(`   ... and ${newChapters.length - 20} more chapters`);
    }
  } else if (newChapters.length > 20) {
    console.log(`   🎉 ${newChapters.length} new chapters to add!`);
  }

  console.log('\n━'.repeat(80));
  console.log('\n⚠️  POTENTIAL ISSUES:\n');

  if (potentialIssues.length > 0) {
    potentialIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.type}: JSON="${issue.json}" vs DB="${issue.db}"`);
      console.log(`      → ${issue.message}\n`);
    });
  } else {
    console.log('   ✅ No potential issues detected!\n');
  }

  console.log('━'.repeat(80));
  console.log('\n📊 SUMMARY:\n');
  console.log(`   Total Colleges in JSON: ${jsonData.length}`);
  console.log(`   Total Fraternities in JSON: ${Array.from(new Set(jsonData.flatMap(c => c.fraternities))).length}`);
  console.log(`   Estimated New Chapters: ${newChapters.length}\n`);

  console.log('━'.repeat(80));
  console.log('\n✅ SAFETY CHECKS:\n');
  console.log(`   ✅ Will NOT override existing colleges: ${existingCollegeMatches.length} preserved`);
  console.log(`   ✅ Will NOT override existing fraternities: ${existingFraternityMatches.size} preserved`);
  console.log(`   ✅ Will NOT override existing chapters: ${existingChapterMatches.length} preserved`);
  console.log(`   ✅ Will NOT override chapter grades: All existing grades preserved`);
  console.log(`   ✅ Will NOT override unlock data: All unlock data preserved\n`);

  console.log('━'.repeat(80));
  console.log('\n🎯 NEXT STEPS:\n');
  console.log(`   1. Review this report carefully`);
  console.log(`   2. If everything looks good, run the import script`);
  console.log(`   3. Import will ONLY add missing data, never override\n`);

  // Save detailed report to file
  const report = {
    summary: {
      jsonColleges: jsonData.length,
      matchedColleges: existingCollegeMatches.length,
      newColleges: newColleges.length,
      matchedFraternities: existingFraternityMatches.size,
      newFraternities: newFraternities.size,
      matchedChapters: existingChapterMatches.length,
      newChapters: newChapters.length,
    },
    newColleges,
    newFraternities: Array.from(newFraternities).map(f => JSON.parse(f)),
    newChapters,
    existingMatches: {
      colleges: existingCollegeMatches,
      chapters: existingChapterMatches.slice(0, 100) // Limit to first 100 for file size
    },
    potentialIssues
  };

  fs.writeFileSync(
    '/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/power5_analysis_report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('   📄 Detailed report saved to: power5_analysis_report.json\n');
  console.log('━'.repeat(80));
}

// Run analysis
analyzeData().catch(console.error);

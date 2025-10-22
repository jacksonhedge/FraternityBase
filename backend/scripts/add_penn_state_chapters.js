/**
 * Add Penn State chapters at 3.0 grade
 * Run: node add_penn_state_chapters.js
 */

const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

const organizations = [
  'Acacia',
  'Alpha Chi Rho',
  'Alpha Delta Phi',
  'Alpha Epsilon Pi',
  'Alpha Gamma Rho',
  'Alpha Kappa Lambda',
  'Alpha Phi Delta',
  'Alpha Rho Chi',
  'Alpha Sigma Phi',
  'Alpha Tau Omega',
  'Alpha Zeta',
  'Beta Sigma Beta',
  'Chi Phi',
  'Delta Chi',
  'Delta Sigma Phi',
  'Delta Theta Sigma',
  'Delta Upsilon',
  'Delta Kappa Epsilon',
  'Lambda Chi Alpha',
  'Phi Delta Theta',
  'Phi Gamma Delta',
  'Phi Kappa Psi',
  'Phi Kappa Tau',
  'Phi Kappa Theta',
  'Phi Sigma Kappa',
  'Pi Kappa Phi',
  'Sigma Alpha Epsilon',
  'Sigma Phi Epsilon',
  'Sigma Pi',
  'Tau Epsilon Phi',
  'Tau Phi Delta',
  'Theta Chi',
  'Theta Delta Chi',
  'Triangle',
  'Zeta Beta Tau'
];

async function addChapter(orgName) {
  try {
    const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        organization_name: orgName,
        university_name: 'Pennsylvania State University', // Main campus in State College
        grade: 3.0,
        is_viewable: true,
        status: 'active'
      })
    });

    const result = await res.json();

    if (!res.ok) {
      console.log(`❌ ${orgName}: ${result.error || 'Failed'}`);
      return { success: false, org: orgName, error: result.error };
    }

    if (result.existing_chapter) {
      console.log(`⚠️  ${orgName}: Already exists (ID: ${result.existing_chapter.id})`);
      return { success: true, org: orgName, existing: true };
    }

    console.log(`✅ ${orgName}: Created (ID: ${result.data.id}, ${result.data.chapter_name})`);
    return { success: true, org: orgName, chapter: result.data };

  } catch (error) {
    console.log(`❌ ${orgName}: ${error.message}`);
    return { success: false, org: orgName, error: error.message };
  }
}

async function main() {
  console.log(`\n🎓 Adding ${organizations.length} Penn State chapters at 3.0⭐\n`);

  const results = [];

  for (const org of organizations) {
    const result = await addChapter(org);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Created: ${results.filter(r => r.success && !r.existing).length}`);
  console.log(`⚠️  Already existed: ${results.filter(r => r.existing).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed organizations:');
    failed.forEach(f => console.log(`  - ${f.org}: ${f.error}`));
  }
}

main().catch(console.error);

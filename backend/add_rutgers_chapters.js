const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

const organizations = [
  'Alpha Phi Delta',
  'Alpha Sigma Phi',
  'Beta Chi Theta',
  'Chi Phi',
  'Chi Psi',
  'Delta Chi',
  'Delta Kappa Epsilon',
  'Delta Phi',
  'Kappa Sigma',
  'La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc.',
  'Phi Delta Theta',
  'Phi Gamma Delta',
  'Phi Kappa Psi',
  'Phi Kappa Tau',
  'Phi Mu Delta',
  'Phi Sigma Kappa',
  'Pi Kappa Phi',
  'Sigma Alpha Epsilon',
  'Sigma Alpha Mu',
  'Sigma Beta Rho',
  // 'Sigma Chi', // Already exists at Rutgers - skip
  'Sigma Phi Delta',
  'Sigma Phi Epsilon',
  'Sigma Pi',
  'Zeta Beta Tau',
  // 'Zeta Psi' // Already exists at Rutgers - skip
];

async function addRutgersChapters() {
  const results = {
    created: [],
    existing: [],
    failed: []
  };

  console.log(`🎓 Adding ${organizations.length} chapters to Rutgers University...\n`);

  for (const org of organizations) {
    try {
      console.log(`📝 Creating ${org} at Rutgers...`);

      const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          organization_name: org,
          university_name: 'Rutgers',
          grade: 4.0,
          is_viewable: true,
          status: 'active'
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ Created: ${data.data.id}`);
        results.created.push({ org, id: data.data.id });
      } else if (data.existing_chapter) {
        console.log(`ℹ️  Already exists: ${data.existing_chapter.id}`);
        results.existing.push({ org, id: data.existing_chapter.id });
      } else {
        console.log(`❌ Error: ${data.error}`);
        results.failed.push({ org, error: data.error });
      }
    } catch (error) {
      console.error(`❌ Fatal error for ${org}:`, error.message);
      results.failed.push({ org, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`ℹ️  Already existed: ${results.existing.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('='.repeat(60));

  if (results.failed.length > 0) {
    console.log('\n❌ Failed chapters:');
    results.failed.forEach(f => {
      console.log(`  - ${f.org}: ${f.error}`);
    });
  }

  console.log('\n✨ Done!');
}

addRutgersChapters();

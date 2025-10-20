const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

const organizations = [
  'Alpha Phi Delta',
  'Chi Psi',
  'La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc.',
  'Phi Mu Delta',
  'Sigma Beta Rho',
  'Sigma Phi Delta'
];

async function addRemainingChapters() {
  const results = {
    created: [],
    failed: []
  };

  console.log(`🎓 Adding remaining ${organizations.length} chapters to Rutgers...\n`);

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
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('='.repeat(60));

  if (results.failed.length > 0) {
    console.log('\n❌ Failed chapters:');
    results.failed.forEach(f => {
      console.log(`  - ${f.org}: ${f.error}`);
    });
  }

  console.log('\n✨ All Rutgers chapters complete!');
  console.log(`📊 Total Rutgers chapters created this session: ${18 + results.created.length}`);
}

addRemainingChapters();

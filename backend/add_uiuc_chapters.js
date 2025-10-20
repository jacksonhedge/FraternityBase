const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

// IFC Fraternities at University of Illinois
const fraternities = [
  { org: 'Acacia' },
  { org: 'Alpha Delta Phi' },
  { org: 'Alpha Epsilon Pi' },
  { org: 'Alpha Gamma Rho' },
  { org: 'Alpha Gamma Sigma' },
  { org: 'Alpha Sigma Phi' },
  { org: 'Alpha Tau Omega' },
  { org: 'Beta Sigma Psi' },
  { org: 'Beta Theta Pi' },
  { org: 'Chi Psi' },
  { org: 'Delta Chi' },
  { org: 'Delta Kappa Epsilon' },
  { org: 'Delta Upsilon' },
  { org: 'Farmhouse' },
  { org: 'Kappa Sigma' },
  { org: 'Omega Delta' },
  { org: 'Phi Delta Theta' },
  { org: 'Phi Gamma Delta' },
  { org: 'Phi Kappa Psi' },
  { org: 'Phi Kappa Tau' },
  { org: 'Phi Sigma Kappa' },
  { org: 'Pi Kappa Alpha' },
  { org: 'Pi Kappa Phi' },
  { org: 'Psi Upsilon' },
  { org: 'Sigma Alpha Epsilon' },
  { org: 'Sigma Alpha Mu' },
  { org: 'Sigma Chi' },
  { org: 'Sigma Nu' },
  { org: 'Sigma Phi Delta' },
  { org: 'Sigma Phi Epsilon' },
  { org: 'Tau Kappa Epsilon' },
  { org: 'Theta Chi' },
  { org: 'Theta Xi' },
  { org: 'Triangle' },
  { org: 'Zeta Beta Tau' },
  { org: 'Zeta Psi' }
];

async function addUIUCChapters() {
  const results = {
    created: [],
    existing: [],
    failed: []
  };

  console.log(`🎓 Adding ${fraternities.length} fraternities to University of Illinois...`);
  console.log(`  - ${fraternities.length} IFC fraternities\n`);

  for (const chapter of fraternities) {
    try {
      console.log(`📝 Creating ${chapter.org} at Illinois...`);

      const chapterData = {
        organization_name: chapter.org,
        university_name: 'University of Illinois',
        grade: 4.5,
        is_viewable: true,
        status: 'active'
      };

      const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify(chapterData)
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ Created chapter: ${data.data.id}`);
        results.created.push({ org: chapter.org, id: data.data.id });
      } else if (data.existing_chapter) {
        console.log(`ℹ️  Already exists: ${data.existing_chapter.id}`);
        results.existing.push({ org: chapter.org, id: data.existing_chapter.id });
      } else {
        console.log(`❌ Error: ${data.error}`);
        results.failed.push({ org: chapter.org, error: data.error });
      }

    } catch (error) {
      console.error(`❌ Fatal error for ${chapter.org}:`, error.message);
      results.failed.push({ org: chapter.org, error: error.message });
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

  console.log('\n✨ University of Illinois complete!');
}

addUIUCChapters();

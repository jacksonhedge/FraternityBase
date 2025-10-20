const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

// List of fraternities we just added to University of Illinois
const fraternities = [
  'Acacia',
  'Alpha Delta Phi',
  'Alpha Epsilon Pi',
  'Alpha Gamma Rho',
  'Alpha Gamma Sigma',
  'Alpha Sigma Phi',
  'Alpha Tau Omega',
  'Beta Sigma Psi',
  'Beta Theta Pi',
  'Chi Psi',
  'Delta Chi',
  'Delta Kappa Epsilon',
  'Delta Upsilon',
  'Farmhouse',
  'Kappa Sigma',
  'Omega Delta',
  'Phi Delta Theta',
  'Phi Gamma Delta',
  'Phi Kappa Psi',
  'Phi Kappa Tau',
  'Phi Sigma Kappa',
  'Pi Kappa Alpha',
  'Pi Kappa Phi',
  'Psi Upsilon',
  'Sigma Alpha Epsilon',
  'Sigma Alpha Mu',
  'Sigma Chi',
  'Sigma Nu',
  'Sigma Phi Delta',
  'Sigma Phi Epsilon',
  'Tau Kappa Epsilon',
  'Theta Chi',
  'Theta Xi',
  'Triangle',
  'Zeta Beta Tau',
  'Zeta Psi'
];

async function updateUIUCTo5Star() {
  const results = {
    updated: [],
    notFound: [],
    failed: []
  };

  console.log(`⭐ Updating ${fraternities.length} University of Illinois chapters to 5.0 rating...`);
  console.log('');

  for (const orgName of fraternities) {
    try {
      console.log(`📝 Updating ${orgName} at Illinois to 5.0⭐...`);

      // First, get the chapter to find its ID
      const searchRes = await fetch(`${API_URL}/chapters?university=University of Illinois&organization=${encodeURIComponent(orgName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const searchData = await searchRes.json();

      if (!searchData.data || searchData.data.length === 0) {
        console.log(`❓ Not found: ${orgName}`);
        results.notFound.push(orgName);
        continue;
      }

      const chapter = searchData.data[0];
      const chapterId = chapter.id;

      // Update the chapter's rating to 5.0
      const updateRes = await fetch(`${API_URL}/admin/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          five_star_rating: 5.0
        })
      });

      const updateData = await updateRes.json();

      if (updateRes.ok) {
        console.log(`✅ Updated ${orgName} to 5.0⭐ (ID: ${chapterId})`);
        results.updated.push({ org: orgName, id: chapterId });
      } else {
        console.log(`❌ Failed to update ${orgName}: ${updateData.error}`);
        results.failed.push({ org: orgName, error: updateData.error });
      }

    } catch (error) {
      console.error(`❌ Fatal error for ${orgName}:`, error.message);
      results.failed.push({ org: orgName, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`✅ Updated to 5.0⭐: ${results.updated.length}`);
  console.log(`❓ Not found: ${results.notFound.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('='.repeat(60));

  if (results.notFound.length > 0) {
    console.log('\n❓ Chapters not found:');
    results.notFound.forEach(org => {
      console.log(`  - ${org}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed updates:');
    results.failed.forEach(f => {
      console.log(`  - ${f.org}: ${f.error}`);
    });
  }

  console.log('\n⭐ University of Illinois chapters updated to 5.0 rating!');
}

updateUIUCTo5Star();

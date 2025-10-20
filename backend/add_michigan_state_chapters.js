const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

const chapters = [
  { org: 'Alpha Epsilon Pi', president: 'Eli Glaser', email: 'glaserel@msu.edu', address: '225 N. Harrison Rd.' },
  { org: 'Alpha Gamma Rho', president: 'Cramer Laurenz', email: 'laurenz5@msu.edu', address: '432 Evergreen Ave.' },
  { org: 'Alpha Kappa Psi', president: 'Christian Zukauskas', email: 'zukausk3@msu.edu', address: '123 Louis St.' },
  { org: 'Alpha Sigma Phi', president: 'Gavin LeBrun', email: 'lebrung1@msu.edu', address: '128 Collingwood Dr.' },
  { org: 'Beta Theta Pi', president: 'Alexander Ziouras', email: 'ziourasa@msu.edu', address: '330 N. Harrison Rd.' },
  { org: 'Delta Chi', president: null, email: null, address: null },
  { org: 'Delta Kappa Epsilon', president: 'Owen Boyd', email: 'boydowen@msu.edu', address: '1148 E. Grand River Ave.' },
  { org: 'Delta Sigma Phi', president: 'Calvin Larson', email: 'larso219@msu.edu', address: '1218 E. Grand River Ave.' },
  { org: 'FarmHouse', president: 'Logan Paxton', email: 'paxtonlo@msu.edu', address: '151 Bogue St.' },
  { org: 'Kappa Sigma', president: 'Tyler Murray', email: 'murra412@msu.edu', address: '427 Mac Ave.' },
  { org: 'Phi Delta Theta', president: 'John McGaughy', email: 'mcgaug19@msu.edu', address: '626 Cowley Ave.' },
  { org: 'Phi Gamma Delta', president: 'Cody Cummins', email: 'cummi333@msu.edu', address: null },
  { org: 'Phi Kappa Psi', president: 'Conor McMahon', email: 'mcmah170@msu.edu', address: '101 Woodmere Ave.' },
  { org: 'Phi Kappa Sigma', president: 'Seth Hildebrand', email: 'hildeb80@msu.edu', address: '120 Spartan Ave.' },
  { org: 'Pi Kappa Alpha', president: 'Benjamin Virkus', email: 'virkusbe@msu.edu', address: '301 Charles St.' },
  { org: 'Pi Kappa Phi', president: 'Chase Coleman', email: 'colem505@msu.edu', address: '520 Linden St.' },
  { org: 'Psi Upsilon', president: 'Tyler Hahn', email: 'hahntyl1@msu.edu', address: '810 W. Grand Rive Ave.' },
  { org: 'Sigma Alpha Epsilon', president: 'Drew Taylor', email: 'tayl1594@msu.edu', address: '342 N. Harrison Rd.' },
  { org: 'Sigma Alpha Mu', president: 'Matthew Kay', email: 'kaymatt2@msu.edu', address: '715 Grove St.' },
  { org: 'Sigma Chi', president: 'Andrew Davis', email: 'davis510@msu.edu', address: '729 E. Grand River Ave.' },
  { org: 'Sigma Pi', president: 'Chad Beckeman', email: 'beckema7@msu.edu', address: '251 W. Grand River Ave.' },
  { org: 'Sigma Tau Gamma', president: 'Will Archer', email: 'archerw1@msu.edu', address: '207 Bogue St.' },
  { org: 'Tau Kappa Epsilon', president: 'Logan Thurber', email: 'thurberl@msu.edu', address: '445 Abbott Rd.' },
  { org: 'Theta Chi', president: 'Nolan Thomson', email: 'thomso97@msu.edu', address: '453 Abbott Rd.' },
  { org: 'Theta Delta Chi', president: 'Gabriel Tomazin', email: 'tomazing@msu.edu', address: '131 Bogue St.' },
  { org: 'Triangle', president: 'Joshua Brott', email: 'brottjo1@msu.edu', address: '242 N. Harrison Rd.' },
  { org: 'Zeta Beta Tau', president: 'Jackson Smith', email: 'smit3569@msu.edu', address: '710 Oak St.' },
  { org: 'Zeta Psi', president: 'AJ Damone', email: 'damoneal@msu.edu', address: '334 Michigan Ave.' }
];

async function addMichiganStateChapters() {
  const results = {
    created: [],
    existing: [],
    failed: []
  };

  console.log(`🎓 Adding ${chapters.length} chapters to Michigan State University...\n`);

  for (const chapter of chapters) {
    try {
      console.log(`📝 Creating ${chapter.org} at Michigan State...`);

      // Create chapter
      const chapterData = {
        organization_name: chapter.org,
        university_name: 'Michigan State',
        grade: 4.5,
        is_viewable: true,
        status: 'active'
      };

      if (chapter.address) {
        chapterData.address = chapter.address;
      }

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

        const chapterId = data.data.id;
        results.created.push({ org: chapter.org, id: chapterId });

        // Add president as officer if available
        if (chapter.president && chapter.email) {
          console.log(`  👤 Adding president: ${chapter.president}...`);

          const officerRes = await fetch(`${API_URL}/admin/officers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': ADMIN_TOKEN
            },
            body: JSON.stringify({
              chapter_id: chapterId,
              name: chapter.president,
              position: 'President',
              email: chapter.email,
              member_type: 'officer',
              is_primary_contact: true
            })
          });

          const officerData = await officerRes.json();
          if (officerRes.ok) {
            console.log(`  ✅ Added president`);
          } else {
            console.log(`  ⚠️  Failed to add president: ${officerData.error}`);
          }
        }

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

  console.log('\n✨ Michigan State complete!');
}

addMichiganStateChapters();

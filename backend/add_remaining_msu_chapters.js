const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = '***REMOVED***';

const chapters = [
  { org: 'Alpha Kappa Psi', president: 'Christian Zukauskas', email: 'zukausk3@msu.edu', address: '123 Louis St.' },
  { org: 'Phi Kappa Sigma', president: 'Seth Hildebrand', email: 'hildeb80@msu.edu', address: '120 Spartan Ave.' }
];

async function addRemainingChapters() {
  console.log(`🎓 Adding remaining 2 chapters to Michigan State...\n`);

  for (const chapter of chapters) {
    try {
      console.log(`📝 Creating ${chapter.org} at Michigan State...`);

      const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          organization_name: chapter.org,
          university_name: 'Michigan State',
          grade: 4.5,
          is_viewable: true,
          status: 'active',
          address: chapter.address
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ Created chapter: ${data.data.id}`);

        // Add president
        console.log(`  👤 Adding president: ${chapter.president}...`);

        const officerRes = await fetch(`${API_URL}/admin/officers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': ADMIN_TOKEN
          },
          body: JSON.stringify({
            chapter_id: data.data.id,
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
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
  }

  console.log('\n✨ All Michigan State chapters complete!');
}

addRemainingChapters();

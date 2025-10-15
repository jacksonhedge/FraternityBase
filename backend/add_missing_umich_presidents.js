const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = '***REMOVED***';

const presidents = [
  { chapterId: '3ff72083-95f3-4010-a16f-271b15b8243a', name: 'Ella Morgades', email: 'ellamor@umich.edu', org: 'Chi Omega' },
  { chapterId: 'e7c4b958-fdb9-4476-826c-d2e0be616fb7', name: 'Eli Germain', email: 'egermain@umich.edu', org: 'Delta Chi' }
];

async function addPresidents() {
  for (const pres of presidents) {
    try {
      console.log(`👤 Adding ${pres.name} to ${pres.org}...`);

      const res = await fetch(`${API_URL}/admin/officers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          chapter_id: pres.chapterId,
          name: pres.name,
          position: 'President',
          email: pres.email,
          member_type: 'officer',
          is_primary_contact: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✅ Added ${pres.name}`);
      } else {
        console.log(`⚠️  Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
  }
  
  console.log('\n✨ Complete!');
}

addPresidents();

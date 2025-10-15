const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = '***REMOVED***';

const chapters = [
  { org: 'Sigma Chi', university: 'University of Michigan' },
  { org: 'Sigma Chi', university: 'Rutgers' },
  { org: 'Sigma Chi', university: 'Michigan State University' },
  { org: 'Sigma Chi', university: 'Texas A&M' },
  { org: 'Sigma Chi', university: 'Pitt' },
  { org: 'Phi Sigma Phi', university: 'West Virginia University' },
  { org: 'Sigma Chi', university: 'University of Illinois' },
  { org: 'Alpha Delta Phi', university: 'Illinois' },
  { org: 'Zeta Psi', university: 'Rutgers' },
  { org: 'Chi Phi', university: 'Penn State' },
  { org: 'Lambda Chi Alpha', university: 'Penn State' }
];

async function addPlatinumChapters() {
  const createdChapters = [];

  console.log('🌟 Creating 5.0 star chapters...\n');

  for (const chapter of chapters) {
    try {
      console.log(`📝 Creating ${chapter.org} at ${chapter.university}...`);

      const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          organization_name: chapter.org,
          university_name: chapter.university,
          grade: 5.0,
          is_viewable: true,
          status: 'active'
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ Created: ${data.data.id}`);
        createdChapters.push({
          id: data.data.id,
          name: `${chapter.org} at ${chapter.university}`
        });
      } else {
        console.log(`⚠️  ${data.error}`);
        // If it already exists, try to find it
        if (data.existing_chapter) {
          createdChapters.push({
            id: data.existing_chapter.id,
            name: `${chapter.org} at ${chapter.university}`
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error creating ${chapter.org} at ${chapter.university}:`, error.message);
    }
  }

  console.log('\n🏆 Marking chapters as Platinum...\n');

  for (const chapter of createdChapters) {
    try {
      console.log(`💎 Marking ${chapter.name} as Platinum...`);

      const res = await fetch(`${API_URL}/admin/chapters/${chapter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          is_favorite: true,
          grade: 5.0,
          is_viewable: true
          // Note: We'll add a platinum field after checking the schema
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ Updated successfully`);
      } else {
        console.log(`❌ Error:`, data.error);
      }
    } catch (error) {
      console.error(`❌ Error updating ${chapter.name}:`, error.message);
    }
  }

  console.log('\n✨ All chapters processed!');
  console.log(`📊 Total chapters: ${createdChapters.length}`);
}

addPlatinumChapters();

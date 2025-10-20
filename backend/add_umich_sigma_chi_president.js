const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

async function addPresident() {
  try {
    console.log('👤 Adding president to Sigma Chi at Michigan...');

    const res = await fetch(`${API_URL}/admin/officers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        chapter_id: 'e502e257-6dd3-4797-95f9-bb204636a26e',
        name: 'Tyloer Werner',
        position: 'President',
        email: 'tywer@umich.edu',
        member_type: 'officer',
        is_primary_contact: true
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Added Tyloer Werner as president');
    } else {
      console.log(`⚠️  Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addPresident();

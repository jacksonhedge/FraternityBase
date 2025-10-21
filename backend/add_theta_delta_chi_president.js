const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
require('dotenv').config();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function addPresident() {
  try {
    console.log('👤 Adding president to Theta Delta Chi at Michigan State...');

    const res = await fetch(`${API_URL}/admin/officers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        chapter_id: '2cd48690-16f2-40a7-8a40-6cece15855e2',
        name: 'Gabriel Tomazin',
        position: 'President',
        email: 'tomazing@msu.edu',
        member_type: 'officer',
        is_primary_contact: true
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Added Gabriel Tomazin as president');
    } else {
      console.log(`⚠️  Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addPresident();

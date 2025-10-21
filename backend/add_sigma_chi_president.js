const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
require('dotenv').config();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function addPresident() {
  try {
    console.log('👤 Adding president to Sigma Chi at Michigan State...');

    const res = await fetch(`${API_URL}/admin/officers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        chapter_id: '22493c14-2d30-4d60-8e26-0004362e6f71',
        name: 'Andrew Davis',
        position: 'President',
        email: 'davis510@msu.edu',
        member_type: 'officer',
        is_primary_contact: true
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Added Andrew Davis as president');
    } else {
      console.log(`⚠️  Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addPresident();

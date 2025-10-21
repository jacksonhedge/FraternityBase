const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
require('dotenv').config();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function addDeltaChi() {
  try {
    console.log('📝 Creating Delta Chi at Rutgers...');

    const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        organization_name: 'Delta Chi',
        university_name: 'Rutgers',
        grade: 4.0,
        is_viewable: true,
        status: 'active'
      })
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`✅ Created: ${data.data.id}`);
    } else {
      console.log(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

addDeltaChi();

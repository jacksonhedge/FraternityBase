const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

async function addAlphaDeltaPhi() {
  try {
    console.log('📝 Creating Alpha Delta Phi at Illinois...');

    const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        organization_name: 'Alpha Delta Phi',
        university_name: 'Illinois',
        grade: 5.0,
        is_viewable: true,
        status: 'active'
      })
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`✅ Created chapter with ID: ${data.data.id}`);

      // Mark as favorite
      console.log('⭐ Marking as favorite...');
      const updateRes = await fetch(`${API_URL}/admin/chapters/${data.data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          is_favorite: true
        })
      });

      const updateData = await updateRes.json();
      if (updateRes.ok) {
        console.log('✅ Marked as favorite');
        console.log('\n💎 Now marking as platinum in database...');
        return data.data.id;
      }
    } else {
      console.log(`❌ Error: ${data.error}`);
      if (data.existing_chapter) {
        console.log(`ℹ️  Chapter already exists: ${data.existing_chapter.id}`);
        return data.existing_chapter.id;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addAlphaDeltaPhi();

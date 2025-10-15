const API_URL = 'https://backend-gir2kat8a-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = '***REMOVED***';
const CHAPTER_ID = '90df42d6-6b68-4c6f-8335-eb35dc591909';

async function updateChapter() {
  try {
    console.log('⭐ Marking Oklahoma State Sigma Chi as favorite...');

    const res = await fetch(`${API_URL}/admin/chapters/${CHAPTER_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        is_favorite: true,
        member_count: 133,
        grade: 5.0,
        is_viewable: true
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Error:', data.error);
    } else {
      console.log('✅ Chapter updated successfully!');
      console.log(JSON.stringify(data.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

updateChapter();

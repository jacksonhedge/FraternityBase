require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updatePennState() {
  const { data: sigChi } = await supabase
    .from('greek_organizations')
    .select('id')
    .eq('name', 'Sigma Chi')
    .single();

  const names = ['Penn State University', 'Pennsylvania State University'];

  for (const name of names) {
    const { data: uni } = await supabase
      .from('universities')
      .select('id, name')
      .eq('name', name)
      .eq('state', 'PA')
      .single();

    if (!uni) continue;

    console.log('Found:', uni.name);

    const { data: chapter } = await supabase
      .from('chapters')
      .select('id, chapter_name, instagram_handle')
      .eq('greek_organization_id', sigChi.id)
      .eq('university_id', uni.id)
      .single();

    if (chapter) {
      console.log('  Chapter:', chapter.chapter_name);
      console.log('  Current IG:', chapter.instagram_handle || 'none');

      const { error } = await supabase
        .from('chapters')
        .update({ instagram_handle: '@sigmachisc' })
        .eq('id', chapter.id);

      if (error) {
        console.log('  ❌ Error:', error.message);
      } else {
        console.log('  ✅ Updated to @sigmachisc');
      }
    } else {
      console.log('  ⚠️  No Sigma Chi chapter found');
    }
  }
}

updatePennState();

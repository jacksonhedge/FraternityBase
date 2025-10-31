const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function exportFraternities() {
  console.log('Fetching all fraternity chapters...');

  const allChapters = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('chapters')
      .select(`
        universities(name),
        greek_organizations(name, organization_type),
        instagram_handle
      `)
      .eq('greek_organizations.organization_type', 'fraternity')
      .order('universities(name)')
      .range(from, to);

    if (error) {
      console.error('Error fetching data:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    allChapters.push(...data);
    console.log(`Fetched ${allChapters.length} chapters so far...`);

    if (data.length < pageSize) {
      hasMore = false;
    }

    page++;
  }

  console.log(`\nTotal fraternity chapters: ${allChapters.length}`);

  // Convert to CSV
  const csvRows = ['College,Fraternity Name,Instagram Handle'];

  for (const chapter of allChapters) {
    const college = (chapter.universities?.name || '').replace(/"/g, '""');
    const fraternity = (chapter.greek_organizations?.name || '').replace(/"/g, '""');
    const instagram = (chapter.instagram_handle || '').replace(/"/g, '""');

    csvRows.push(`"${college}","${fraternity}","${instagram}"`);
  }

  const outputPath = path.join(__dirname, '../../fraternity_all_chapters.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf-8');

  console.log(`\n✅ CSV file created: ${outputPath}`);
  console.log(`Total rows: ${allChapters.length}`);

  // Count stats
  const withInstagram = allChapters.filter(c => c.instagram_handle && c.instagram_handle.trim() !== '').length;
  const withoutInstagram = allChapters.length - withInstagram;

  console.log(`\n📊 Stats:`);
  console.log(`   With Instagram: ${withInstagram} (${(withInstagram/allChapters.length*100).toFixed(1)}%)`);
  console.log(`   Without Instagram: ${withoutInstagram} (${(withoutInstagram/allChapters.length*100).toFixed(1)}%)`);
}

exportFraternities().catch(console.error);

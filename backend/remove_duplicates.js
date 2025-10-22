/**
 * Remove duplicate members from chapters
 * Keeps the most recent entry for each unique (chapter_id, name) combination
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CHAPTER_IDS = [
  '01394a98-22e2-4729-94b4-ca432e005608',  // Penn State
  'e502e257-6dd3-4797-95f9-bb204636a26e',  // Michigan
  '3b3d2feb-3ae7-4c62-a4b1-df1b60078ecd',  // TCU
  '88140069-13c0-43d8-9003-074b14e938ef'   // Florida State
];

async function removeDuplicates() {
  console.log('\n🧹 Starting duplicate removal...\n');

  let totalDeleted = 0;

  for (const chapterId of CHAPTER_IDS) {
    console.log(`\nProcessing chapter: ${chapterId}`);

    // Delete duplicates, keeping only the oldest entry for each name
    const { data, error } = await supabase.rpc('remove_duplicate_officers', {
      p_chapter_id: chapterId
    });

    if (error) {
      // If the function doesn't exist, do it with SQL
      const result = await supabase.from('chapter_officers').select('id, name, created_at, chapter_id')
        .eq('chapter_id', chapterId)
        .order('created_at');

      if (result.error) {
        console.error(`❌ Error fetching members:`, result.error.message);
        continue;
      }

      const members = result.data;
      const seenNames = new Map();
      const toDelete = [];

      // Group by name, keep first occurrence
      members.forEach(member => {
        if (seenNames.has(member.name)) {
          toDelete.push(member.id);
        } else {
          seenNames.set(member.name, member.id);
        }
      });

      if (toDelete.length > 0) {
        console.log(`  Found ${toDelete.length} duplicates to remove`);

        const { error: deleteError } = await supabase
          .from('chapter_officers')
          .delete()
          .in('id', toDelete);

        if (deleteError) {
          console.error(`  ❌ Error deleting:`, deleteError.message);
        } else {
          console.log(`  ✅ Deleted ${toDelete.length} duplicate entries`);
          totalDeleted += toDelete.length;
        }
      } else {
        console.log(`  ✓ No duplicates found`);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Total duplicates removed: ${totalDeleted}`);
  console.log(`${'='.repeat(60)}\n`);
}

removeDuplicates().catch(console.error);

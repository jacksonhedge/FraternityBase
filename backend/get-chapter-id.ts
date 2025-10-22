import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getChapterId() {
  try {
    // First get Sigma Chi org ID
    const { data: org } = await supabase
      .from('greek_organizations')
      .select('id')
      .eq('name', 'Sigma Chi')
      .single();

    if (!org) throw new Error('Sigma Chi not found');

    // Then get the chapter
    const { data: chapter, error } = await supabase
      .from('chapters')
      .select(`
        id,
        chapter_name,
        greek_letter_name,
        universities(name)
      `)
      .eq('greek_letter_name', 'Gamma')
      .eq('greek_organization_id', org.id)
      .single();

    if (error) throw error;

    console.log(JSON.stringify(chapter, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getChapterId();

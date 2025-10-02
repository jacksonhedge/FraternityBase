import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('Checking organizations table...\n');

const { data, error } = await supabase
  .from('organizations')
  .select('*');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Organizations found:', data);
}

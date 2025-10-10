import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportUniversities() {
  console.log('🎓 Exporting universities database...');

  // Fetch ALL universities (default limit is 1000, we have 1106)
  let universities: any[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('universities')
      .select('id, name, location, state, student_count, greek_percentage, website, logo_url, bars_nearby, conference')
      .order('name')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('❌ Error fetching universities:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) break;

    universities = universities.concat(data);
    console.log(`   Fetched ${universities.length} universities so far...`);

    if (data.length < pageSize) break; // Last page
    page++;
  }

  console.log(`📊 Found ${universities.length} universities`);

  // Export as JSON
  const jsonPath = path.join(__dirname, '../../database/UNIVERSITIES_DATABASE.json');
  fs.writeFileSync(jsonPath, JSON.stringify(universities, null, 2));
  console.log(`✅ JSON exported to: ${jsonPath}`);

  // Export as CSV
  const csvPath = path.join(__dirname, '../../database/UNIVERSITIES_DATABASE.csv');
  const headers = 'ID,Name,Location,State,Student Count,Greek %,Website,Logo URL,Bars Nearby,Conference\n';
  const rows = universities.map(u =>
    `"${u.id}","${u.name}","${u.location || ''}","${u.state || ''}","${u.student_count || ''}","${u.greek_percentage || ''}","${u.website || ''}","${u.logo_url || ''}","${u.bars_nearby || ''}","${u.conference || ''}"`
  ).join('\n');
  fs.writeFileSync(csvPath, headers + rows);
  console.log(`✅ CSV exported to: ${csvPath}`);

  // Export as readable text for Claude
  const txtPath = path.join(__dirname, '../../database/UNIVERSITIES_DATABASE.txt');
  let txtContent = `FRATERNITYBASE UNIVERSITIES DATABASE\n`;
  txtContent += `=====================================\n`;
  txtContent += `Total Universities: ${universities.length}\n`;
  txtContent += `Exported: ${new Date().toISOString()}\n\n`;

  universities.forEach((u, idx) => {
    txtContent += `${idx + 1}. ${u.name}\n`;
    txtContent += `   Location: ${u.location || 'N/A'}, ${u.state || 'N/A'}\n`;
    if (u.student_count) txtContent += `   Students: ${u.student_count.toLocaleString()}\n`;
    if (u.greek_percentage) txtContent += `   Greek Life: ${u.greek_percentage}%\n`;
    if (u.conference) txtContent += `   Conference: ${u.conference}\n`;
    if (u.bars_nearby) txtContent += `   Bars Nearby: ${u.bars_nearby}\n`;
    txtContent += `   ID: ${u.id}\n\n`;
  });

  fs.writeFileSync(txtPath, txtContent);
  console.log(`✅ Text file exported to: ${txtPath}`);

  // Summary by state
  const byState: { [key: string]: number } = {};
  universities.forEach(u => {
    const state = u.state || 'Unknown';
    byState[state] = (byState[state] || 0) + 1;
  });

  console.log('\n📍 Universities by State:');
  Object.entries(byState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([state, count]) => {
      console.log(`   ${state}: ${count}`);
    });

  console.log('\n✨ Export complete!');
}

exportUniversities();

/**
 * Seed Partnership Marketplace with 5.0★ chapters
 * This script creates sponsorship opportunities for all 5.0-rated chapters
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const OPPORTUNITY_TYPES = [
  'event_sponsor',
  'merchandise_partner',
  'philanthropy_partner',
  'long_term_partnership',
  'venue_rental',
  'ambassador_program'
];

const BUDGET_RANGES = [
  '$500-$1,000',
  '$1,000-$2,500',
  '$2,500-$5,000',
  '$5,000-$10,000',
  '$10,000+'
];

async function seedMarketplace() {
  console.log('🌟 Starting Partnership Marketplace seeding...\n');

  try {
    // 1. Fetch all 5.0-rated chapters
    console.log('📊 Fetching 5.0★ chapters...');
    const { data: chapters, error: chaptersError } = await supabaseAdmin
      .from('chapters')
      .select(`
        *,
        greek_organizations (
          name,
          greek_letters,
          organization_type
        ),
        universities (
          name,
          location,
          state
        )
      `)
      .eq('grade', 5.0)
      .order('id');

    if (chaptersError) {
      throw new Error(`Failed to fetch chapters: ${chaptersError.message}`);
    }

    if (!chapters || chapters.length === 0) {
      console.log('❌ No 5.0★ chapters found');
      return;
    }

    console.log(`✅ Found ${chapters.length} 5.0★ chapters\n`);

    // 2. Check if opportunities already exist
    const { data: existingOpps } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .select('chapter_id');

    const existingChapterIds = new Set(existingOpps?.map(o => o.chapter_id) || []);

    // 3. Create sponsorship opportunities for each chapter
    const opportunitiesToCreate = [];

    for (const chapter of chapters) {
      // Skip if opportunity already exists for this chapter
      if (existingChapterIds.has(chapter.id)) {
        console.log(`⏭️  Skipping ${chapter.chapter_name} - opportunity already exists`);
        continue;
      }

      // Generate random opportunity details
      const opportunityType = OPPORTUNITY_TYPES[Math.floor(Math.random() * OPPORTUNITY_TYPES.length)];
      const budgetRange = BUDGET_RANGES[Math.floor(Math.random() * BUDGET_RANGES.length)];
      const expectedReach = Math.floor(Math.random() * 500) + 100; // 100-600 students

      // Create title based on opportunity type
      let title = '';
      switch (opportunityType) {
        case 'event_sponsor':
          title = `Event Sponsorship at ${chapter.universities?.name}`;
          break;
        case 'merchandise_partner':
          title = `Merchandise Partnership with ${chapter.greek_organizations?.name}`;
          break;
        case 'philanthropy_partner':
          title = `Philanthropy Partnership Opportunity`;
          break;
        case 'long_term_partnership':
          title = `Long-term Brand Partnership`;
          break;
        case 'venue_rental':
          title = `Chapter House Venue Rental`;
          break;
        case 'ambassador_program':
          title = `Campus Ambassador Program`;
          break;
      }

      opportunitiesToCreate.push({
        chapter_id: chapter.id,
        title,
        opportunity_type: opportunityType,
        budget_range: budgetRange,
        expected_reach: expectedReach,
        status: 'active',
        posted_at: new Date().toISOString()
      });

      console.log(`✅ Prepared opportunity for ${chapter.chapter_name}`);
    }

    if (opportunitiesToCreate.length === 0) {
      console.log('\n📝 No new opportunities to create - all chapters already have opportunities');
      return;
    }

    // 4. Insert opportunities in bulk
    console.log(`\n📝 Creating ${opportunitiesToCreate.length} sponsorship opportunities...`);

    const { data: createdOpps, error: insertError } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .insert(opportunitiesToCreate)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert opportunities: ${insertError.message}`);
    }

    console.log(`\n✅ Successfully created ${createdOpps?.length || 0} sponsorship opportunities!`);

    // 5. Show summary
    console.log('\n📊 Summary:');
    console.log(`   Total 5.0★ chapters: ${chapters.length}`);
    console.log(`   New opportunities created: ${createdOpps?.length || 0}`);
    console.log(`   Already existed: ${existingChapterIds.size}`);

    // Show breakdown by opportunity type
    const typeBreakdown: { [key: string]: number } = {};
    opportunitiesToCreate.forEach(opp => {
      typeBreakdown[opp.opportunity_type] = (typeBreakdown[opp.opportunity_type] || 0) + 1;
    });

    console.log('\n📈 Opportunities by type:');
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

  } catch (error) {
    console.error('\n❌ Error seeding marketplace:', error);
    process.exit(1);
  }
}

// Run the script
seedMarketplace()
  .then(() => {
    console.log('\n🎉 Marketplace seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

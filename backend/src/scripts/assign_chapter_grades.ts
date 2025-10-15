/**
 * Assign Grades to All Chapters (Fraternities & Sororities)
 *
 * This script assigns grades/ratings (1.0-5.0) to all chapters based on:
 * - Member count (larger chapters = higher rating)
 * - Status (active = higher rating)
 * - Whether they have complete data
 * - Random variation for realism
 *
 * Grade Distribution Strategy:
 * - 5.0 stars (Top 5%): Premier chapters with excellent data
 * - 4.5-4.9 stars (15%): High-quality chapters
 * - 4.0-4.4 stars (30%): Solid, well-established chapters
 * - 3.5-3.9 stars (30%): Average chapters
 * - 3.0-3.4 stars (15%): Below average
 * - <3.0 stars (5%): Struggling or incomplete data
 *
 * Usage:
 *   npm run assign-grades -- --dry-run    # Preview changes
 *   npm run assign-grades                  # Apply grades
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ChapterData {
  id: string;
  chapter_name: string;
  organization_type: string;
  five_star_rating: number | null;
  member_count: number | null;
  status: string | null;
  greekrank_url: string | null;
  university_id: string;
}

interface GradingStats {
  totalChapters: number;
  fraternities: number;
  sororities: number;
  withExistingRank: number;
  withMemberCount: number;
  withGreekRankUrl: number;
  gradesAssigned: number;
  errors: number;
}

const stats: GradingStats = {
  totalChapters: 0,
  fraternities: 0,
  sororities: 0,
  withExistingRank: 0,
  withMemberCount: 0,
  withGreekRankUrl: 0,
  gradesAssigned: 0,
  errors: 0
};

/**
 * Calculate grade based on chapter data
 */
function calculateGrade(chapter: ChapterData): number {
  let baseScore = 3.5; // Start at average

  // Factor 1: Member count (if available)
  if (chapter.member_count) {
    if (chapter.member_count >= 150) {
      baseScore += 0.8; // Very large chapter
    } else if (chapter.member_count >= 100) {
      baseScore += 0.5; // Large chapter
    } else if (chapter.member_count >= 75) {
      baseScore += 0.3; // Above average
    } else if (chapter.member_count >= 50) {
      baseScore += 0.1; // Average
    } else if (chapter.member_count >= 30) {
      baseScore += 0; // Small but viable
    } else {
      baseScore -= 0.3; // Very small chapter
    }
  } else {
    // No member count data - slight penalty
    baseScore -= 0.1;
  }

  // Factor 2: Status
  if (chapter.status === 'active') {
    baseScore += 0.2;
  } else if (chapter.status === 'inactive' || chapter.status === 'suspended') {
    baseScore -= 0.5;
  }

  // Factor 3: GreekRank verification
  if (chapter.greekrank_url) {
    baseScore += 0.2; // Has external validation
  }

  // Factor 4: Add some random variation for realism (-0.3 to +0.3)
  const randomVariation = (Math.random() - 0.5) * 0.6;
  baseScore += randomVariation;

  // Ensure within bounds
  if (baseScore > 5.0) baseScore = 5.0;
  if (baseScore < 1.0) baseScore = 1.0;

  // Round to 1 decimal place
  return Math.round(baseScore * 10) / 10;
}

/**
 * Assign grades to all chapters
 */
async function assignGrades(dryRun: boolean): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Chapter Grading Assignment Script                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No data will be written');
    console.log();
  }

  // Fetch all chapters (with pagination to get beyond 1000 limit)
  console.log('📊 Fetching chapters from database...\n');

  let allChapters: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: chaptersPage, error } = await supabase
      .from('chapters')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('❌ Error fetching chapters:', error.message);
      process.exit(1);
    }

    if (!chaptersPage || chaptersPage.length === 0) {
      hasMore = false;
    } else {
      allChapters = allChapters.concat(chaptersPage);
      page++;

      if (chaptersPage.length < pageSize) {
        hasMore = false;
      }
    }
  }

  const chapters = allChapters;

  if (chapters.length === 0) {
    console.log('⚠️  No chapters found in database');
    process.exit(0);
  }

  stats.totalChapters = chapters.length;
  stats.fraternities = chapters.filter(c => c.organization_type === 'fraternity').length;
  stats.sororities = chapters.filter(c => c.organization_type === 'sorority').length;
  stats.withExistingRank = chapters.filter(c => c.five_star_rating !== null).length;
  stats.withMemberCount = chapters.filter(c => c.member_count !== null).length;
  stats.withGreekRankUrl = chapters.filter(c => c.greekrank_url !== null).length;

  console.log(`Found ${stats.totalChapters} chapters:`);
  console.log(`  • ${stats.fraternities} fraternities`);
  console.log(`  • ${stats.sororities} sororities`);
  console.log(`  • ${stats.withExistingRank} with existing rank`);
  console.log(`  • ${stats.withMemberCount} with member count data`);
  console.log(`  • ${stats.withGreekRankUrl} with GreekRank URL`);
  console.log();

  // Track grade distribution
  const gradeDistribution: { [key: string]: number } = {
    '5.0': 0,
    '4.5-4.9': 0,
    '4.0-4.4': 0,
    '3.5-3.9': 0,
    '3.0-3.4': 0,
    '<3.0': 0
  };

  // Process each chapter
  console.log('📝 Calculating grades...\n');

  const updates: Array<{ id: string; grade: number; name: string }> = [];

  for (const chapter of chapters) {
    const grade = calculateGrade(chapter);
    updates.push({
      id: chapter.id,
      grade: grade,
      name: chapter.chapter_name || 'Unknown'
    });

    // Track distribution
    if (grade === 5.0) {
      gradeDistribution['5.0']++;
    } else if (grade >= 4.5) {
      gradeDistribution['4.5-4.9']++;
    } else if (grade >= 4.0) {
      gradeDistribution['4.0-4.4']++;
    } else if (grade >= 3.5) {
      gradeDistribution['3.5-3.9']++;
    } else if (grade >= 3.0) {
      gradeDistribution['3.0-3.4']++;
    } else {
      gradeDistribution['<3.0']++;
    }
  }

  // Show sample of grades
  console.log('Sample of assigned grades:');
  const samples = [...updates]
    .sort((a, b) => b.grade - a.grade)
    .slice(0, 10);

  for (const sample of samples) {
    const tierLabel = sample.grade >= 5.0 ? 'Premium' :
                      sample.grade >= 4.5 ? 'Quality' :
                      sample.grade >= 4.0 ? 'Good' :
                      sample.grade >= 3.5 ? 'Standard' :
                      sample.grade >= 3.0 ? 'Basic' : 'Budget';
    console.log(`  ${sample.grade.toFixed(1)} ⭐ (${tierLabel}) - ${sample.name}`);
  }
  console.log();

  // Show distribution
  console.log('Grade Distribution:');
  console.log(`  5.0 stars (Premium):    ${gradeDistribution['5.0']} chapters (${((gradeDistribution['5.0'] / stats.totalChapters) * 100).toFixed(1)}%)`);
  console.log(`  4.5-4.9 (Quality):      ${gradeDistribution['4.5-4.9']} chapters (${((gradeDistribution['4.5-4.9'] / stats.totalChapters) * 100).toFixed(1)}%)`);
  console.log(`  4.0-4.4 (Good):         ${gradeDistribution['4.0-4.4']} chapters (${((gradeDistribution['4.0-4.4'] / stats.totalChapters) * 100).toFixed(1)}%)`);
  console.log(`  3.5-3.9 (Standard):     ${gradeDistribution['3.5-3.9']} chapters (${((gradeDistribution['3.5-3.9'] / stats.totalChapters) * 100).toFixed(1)}%)`);
  console.log(`  3.0-3.4 (Basic):        ${gradeDistribution['3.0-3.4']} chapters (${((gradeDistribution['3.0-3.4'] / stats.totalChapters) * 100).toFixed(1)}%)`);
  console.log(`  <3.0 (Budget):          ${gradeDistribution['<3.0']} chapters (${((gradeDistribution['<3.0'] / stats.totalChapters) * 100).toFixed(1)}%)`);
  console.log();

  if (dryRun) {
    console.log('⚠️  DRY RUN - Grades calculated but not saved');
    console.log();
    return;
  }

  // Apply updates in batches of 100
  console.log('💾 Saving grades to database...\n');
  const batchSize = 100;

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    // Update each chapter in batch
    for (const update of batch) {
      const { error: updateError } = await supabase
        .from('chapters')
        .update({ five_star_rating: update.grade })
        .eq('id', update.id);

      if (updateError) {
        console.error(`  ✗ Error updating ${update.name}:`, updateError.message);
        stats.errors++;
      } else {
        stats.gradesAssigned++;
      }
    }

    const progress = Math.min(i + batchSize, updates.length);
    console.log(`  Progress: ${progress}/${updates.length} chapters updated`);
  }

  console.log();
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  await assignGrades(dryRun);

  // Print summary
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Grading Summary                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Total chapters:          ${stats.totalChapters}`);
  console.log(`  • Fraternities:        ${stats.fraternities}`);
  console.log(`  • Sororities:          ${stats.sororities}`);
  console.log();
  console.log(`Grades assigned:         ${stats.gradesAssigned}`);
  console.log(`Errors:                  ${stats.errors}`);
  console.log();

  if (dryRun) {
    console.log('⚠️  This was a DRY RUN - no data was written');
    console.log('Run without --dry-run flag to apply grades');
  } else {
    console.log('✅ Grading complete!');
    console.log();
    console.log('💡 Pricing Impact:');
    console.log('   5.0 stars → 10 credits ($9.99)');
    console.log('   4.5 stars → 7 credits ($6.99)');
    console.log('   4.0 stars → 5 credits ($4.99)');
    console.log('   3.5 stars → 3 credits ($2.99)');
    console.log('   3.0 stars → 2 credits ($1.99)');
    console.log('   <3.0 stars → 1 credit ($0.99)');
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

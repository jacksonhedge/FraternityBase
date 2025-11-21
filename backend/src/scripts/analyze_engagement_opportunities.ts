#!/usr/bin/env tsx
/**
 * Analyze Instagram posts for engagement opportunities
 *
 * Usage:
 *   npm run analyze:opportunities           # Analyze all posts from last 30 days
 *   npm run analyze:opportunities -- --days=7  # Analyze posts from last 7 days
 *   npm run analyze:opportunities -- --chapter=CHAPTER_ID  # Analyze specific chapter
 */

import { EngagementOpportunityService } from '../services/EngagementOpportunityService';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔍 Starting engagement opportunity analysis...\n');

  const service = new EngagementOpportunityService();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const daysArg = args.find(arg => arg.startsWith('--days='));
  const chapterArg = args.find(arg => arg.startsWith('--chapter='));

  try {
    if (chapterArg) {
      // Analyze specific chapter
      const chapterId = chapterArg.split('=')[1];
      console.log(`📊 Analyzing posts for chapter: ${chapterId}`);

      await service.analyzeChapterPosts(chapterId);

      console.log('✅ Analysis complete for chapter!');
    } else {
      // Analyze all recent posts
      const days = daysArg ? parseInt(daysArg.split('=')[1]) : 30;
      console.log(`📊 Analyzing all posts from last ${days} days...`);

      const result = await service.analyzeAllRecentPosts(days);

      console.log('\n📈 Analysis Results:');
      console.log(`   Total posts found: ${result.total}`);
      console.log(`   Posts processed: ${result.processed}`);
      console.log(`   Opportunities identified: ${result.opportunities}`);
      console.log(`   Opportunity rate: ${((result.opportunities / result.processed) * 100).toFixed(1)}%`);

      // Get top opportunities
      console.log('\n🎯 Top 10 Engagement Opportunities:');
      const opportunities = await service.getTopOpportunities(10);

      opportunities.forEach((opp, idx) => {
        const chapter = opp.chapters as any;
        console.log(`\n${idx + 1}. ${chapter.greek_organizations.name} @ ${chapter.universities.name}`);
        console.log(`   Score: ${opp.opportunity_score}`);
        console.log(`   Reason: ${opp.opportunity_reason}`);
        console.log(`   Posted: ${new Date(opp.posted_at).toLocaleDateString()}`);
        console.log(`   Caption: ${opp.caption.substring(0, 100)}...`);
        console.log(`   URL: ${opp.post_url}`);
      });

      // Recalculate engagement scores
      console.log('\n🔄 Recalculating engagement scores for all chapters...');
      await service.recalculateEngagementScores();
      console.log('✅ Engagement scores updated!');
    }

    console.log('\n✅ All done!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

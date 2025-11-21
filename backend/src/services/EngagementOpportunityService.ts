import { createClient } from '@supabase/supabase-js';

export class EngagementOpportunityService {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Analyze a post and detect engagement opportunities
   */
  async analyzePost(postId: string): Promise<{
    is_opportunity: boolean;
    opportunity_reason: string | null;
    opportunity_score: number;
    detected_event_type: string | null;
  }> {
    // Get the post
    const { data: post } = await this.supabase
      .from('chapter_posts')
      .select('*, chapters!inner(id, instagram_handle)')
      .eq('id', postId)
      .single();

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    const caption = (post.caption || '').toLowerCase();
    let score = 0;
    const reasons: string[] = [];
    let detectedEventType: string | null = null;

    // Get engagement keywords
    const { data: keywords } = await this.supabase
      .from('engagement_keywords')
      .select('*');

    // 1. Keyword matching
    if (keywords) {
      for (const keyword of keywords) {
        if (caption.includes(keyword.keyword.toLowerCase())) {
          score += keyword.weight;
          reasons.push(`Contains "${keyword.keyword}" (${keyword.category})`);

          // Detect event type
          if (keyword.category === 'event_type' && !detectedEventType) {
            detectedEventType = keyword.keyword;
          }
        }
      }
    }

    // 2. Recent activity bonus (posted in last 7 days)
    const postDate = new Date(post.posted_at);
    const daysSincePost = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSincePost <= 7) {
      score += 10;
      reasons.push('Posted in last 7 days (timely engagement)');
    }

    // 3. High engagement bonus
    if (post.engagement_rate && post.engagement_rate > 5.0) {
      score += 15;
      reasons.push(`High engagement rate (${post.engagement_rate}%)`);
    }

    // 4. Event detection patterns
    const eventPatterns = [
      { pattern: /recruitment|rush/i, event: 'recruitment', score: 15 },
      { pattern: /philanthropy|charity|fundrais/i, event: 'philanthropy', score: 12 },
      { pattern: /social|mixer|date party|formals/i, event: 'social', score: 10 },
      { pattern: /brotherhood|sisterhood/i, event: 'brotherhood', score: 5 },
      { pattern: /intramural|sport/i, event: 'sports', score: 5 },
    ];

    for (const { pattern, event, score: eventScore } of eventPatterns) {
      if (pattern.test(caption)) {
        if (!detectedEventType) {
          detectedEventType = event;
        }
        score += eventScore;
        reasons.push(`Event detected: ${event}`);
        break;
      }
    }

    // 5. Partnership signal patterns
    const partnershipPatterns = [
      /sponsor/i,
      /partnership/i,
      /looking for/i,
      /vendor/i,
      /need.*help/i,
      /seeking/i
    ];

    for (const pattern of partnershipPatterns) {
      if (pattern.test(caption)) {
        score += 20;
        reasons.push('Contains partnership signal keywords');
        break;
      }
    }

    // 6. Vendor need patterns
    const vendorPatterns = [
      /merch|merchandise|apparel|shirt|swag/i,
      /photographer|photography|photos/i,
      /dj|music/i,
      /catering|food|cater/i
    ];

    for (const pattern of vendorPatterns) {
      if (pattern.test(caption)) {
        score += 12;
        reasons.push('Indicates vendor need');
        break;
      }
    }

    // Determine if this is an opportunity (threshold: score >= 20)
    const isOpportunity = score >= 20;
    const opportunityReason = isOpportunity ? reasons.join('; ') : null;

    return {
      is_opportunity: isOpportunity,
      opportunity_reason: opportunityReason,
      opportunity_score: Math.min(100, score), // Cap at 100
      detected_event_type: detectedEventType
    };
  }

  /**
   * Analyze all posts for a chapter
   */
  async analyzeChapterPosts(chapterId: string, limit: number = 20): Promise<void> {
    const { data: posts } = await this.supabase
      .from('chapter_posts')
      .select('id')
      .eq('chapter_id', chapterId)
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (!posts) return;

    for (const post of posts) {
      const analysis = await this.analyzePost(post.id);

      await this.supabase
        .from('chapter_posts')
        .update(analysis)
        .eq('id', post.id);
    }
  }

  /**
   * Batch analyze all recent posts (e.g., last 30 days)
   */
  async analyzeAllRecentPosts(days: number = 30): Promise<{
    total: number;
    opportunities: number;
    processed: number;
  }> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: posts, count } = await this.supabase
      .from('chapter_posts')
      .select('id', { count: 'exact' })
      .gte('posted_at', cutoffDate);

    if (!posts) {
      return { total: 0, opportunities: 0, processed: 0 };
    }

    let opportunitiesCount = 0;

    for (const post of posts) {
      const analysis = await this.analyzePost(post.id);

      await this.supabase
        .from('chapter_posts')
        .update(analysis)
        .eq('id', post.id);

      if (analysis.is_opportunity) {
        opportunitiesCount++;
      }
    }

    return {
      total: count || 0,
      opportunities: opportunitiesCount,
      processed: posts.length
    };
  }

  /**
   * Get top engagement opportunities
   */
  async getTopOpportunities(limit: number = 50): Promise<any[]> {
    const { data: opportunities } = await this.supabase
      .from('chapter_posts')
      .select(`
        *,
        chapters!inner (
          id,
          chapter_name,
          instagram_handle,
          universities (name),
          greek_organizations (name)
        )
      `)
      .eq('is_opportunity', true)
      .gte('posted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('opportunity_score', { ascending: false })
      .limit(limit);

    return opportunities || [];
  }

  /**
   * Recalculate engagement scores for all chapters
   */
  async recalculateEngagementScores(): Promise<void> {
    // Get all chapters with outreach records
    const { data: chapters } = await this.supabase
      .from('chapter_outreach')
      .select('chapter_id');

    if (!chapters) return;

    for (const { chapter_id } of chapters) {
      // Call the PostgreSQL function to recalculate score
      await this.supabase.rpc('calculate_engagement_score', {
        p_chapter_id: chapter_id
      });
    }
  }
}

export default EngagementOpportunityService;

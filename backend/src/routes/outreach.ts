import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const router = Router();

let anthropic: Anthropic | null = null;
let supabase: ReturnType<typeof createClient> | null = null;

function getAnthropic() {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for AI-powered filtering');
    }
    // Debug log to verify API key format
    console.log('🔑 Initializing Anthropic client with API key:', {
      length: apiKey.length,
      prefix: apiKey.substring(0, 14),
      suffix: apiKey.substring(apiKey.length - 4)
    });
    anthropic = new Anthropic({
      apiKey: apiKey
    });
  }
  return anthropic;
}

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

interface InstagramPost {
  id: string;
  type: string;
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  url: string;
  commentsCount: number;
  firstComment?: string;
  likesCount: number;
  timestamp: string;
  locationName?: string;
  ownerUsername: string;
  ownerFullName: string;
}

interface FilterResult {
  post: InstagramPost;
  matchReason: string;
  relevanceScore: number;
}

/**
 * POST /api/admin/outreach/filter-posts
 * Filters Instagram posts using Claude AI based on custom criteria
 */
router.post('/filter-posts', async (req: Request, res: Response) => {
  try {
    const { posts, filterPrompt } = req.body;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Posts array is required and must not be empty'
      });
    }

    if (!filterPrompt || typeof filterPrompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Filter prompt is required'
      });
    }

    const client = getAnthropic();

    // Prepare simplified post data for AI analysis
    const simplifiedPosts = posts.map(post => ({
      id: post.id,
      caption: post.caption,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      timestamp: post.timestamp,
      ownerUsername: post.ownerUsername,
      ownerFullName: post.ownerFullName,
      locationName: post.locationName || ''
    }));

    // Create the prompt for Claude
    const systemPrompt = `You are an expert social media analyst specializing in fraternity and sorority Instagram content. Your task is to analyze Instagram posts and filter them based on specific criteria.

You will receive:
1. A list of Instagram posts (with captions, hashtags, engagement metrics, etc.)
2. Filtering criteria describing what types of posts to identify

For each post that matches the criteria, provide:
- A clear explanation of WHY it matches (be specific, cite exact phrases, hashtags, or context)
- A relevance score from 0.0 to 1.0 (where 1.0 is a perfect match)

Only include posts that genuinely match the criteria. If a post doesn't match, exclude it entirely.

Return your response as a JSON array with this structure:
[
  {
    "postId": "the post id",
    "matchReason": "Specific explanation of why this post matches the criteria",
    "relevanceScore": 0.85
  }
]

If NO posts match the criteria, return an empty array: []`;

    const userPrompt = `Filter Criteria: ${filterPrompt}

Posts to analyze:
${JSON.stringify(simplifiedPosts, null, 2)}

Analyze these posts and return ONLY the JSON array of matching posts. Do not include any other text or explanation outside the JSON.`;

    // Call Claude API
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Extract JSON from response (handle cases where Claude adds extra text)
    let matches: Array<{ postId: string; matchReason: string; relevanceScore: number }> = [];

    try {
      // Try to find JSON array in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      } else {
        matches = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.error('Response text:', responseText);

      // If parsing fails, return empty results
      return res.json({
        success: true,
        results: [],
        message: 'AI filtering completed but no matches found'
      });
    }

    // Build final results by matching AI results with original posts
    const results: FilterResult[] = matches.map(match => {
      const originalPost = posts.find(p => p.id === match.postId);

      if (!originalPost) {
        console.warn(`Post ${match.postId} not found in original posts`);
        return null;
      }

      return {
        post: originalPost,
        matchReason: match.matchReason,
        relevanceScore: match.relevanceScore
      };
    }).filter((r): r is FilterResult => r !== null);

    // Sort by relevance score (highest first)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      success: true,
      results,
      totalPosts: posts.length,
      matchedPosts: results.length,
      filterPrompt
    });

  } catch (error: any) {
    console.error('Error filtering posts:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to filter posts',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/outreach/match-contacts
 * Matches imported chapter data with existing database contacts
 */
router.post('/match-contacts', async (req: Request, res: Response) => {
  try {
    const { chapters } = req.body;

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Chapters array is required and must not be empty'
      });
    }

    const supabase = getSupabase();
    const matches: any[] = [];
    const unmatched: any[] = [];

    for (const inputChapter of chapters) {
      const { greek_organization, university, chapter_name, instagram_handle } = inputChapter;

      if (!greek_organization || !university) {
        unmatched.push({
          input: inputChapter,
          reason: 'Missing greek_organization or university'
        });
        continue;
      }

      // Try to match chapter in database
      let matchedChapter = null;
      let matchMethod = 'none';
      let matchConfidence = 'none';

      // 1. Try exact match on greek org + university + chapter name
      if (chapter_name) {
        const { data: exactMatch, error: exactError } = await supabase
          .from('chapters')
          .select(`
            id,
            chapter_name,
            status,
            instagram_handle,
            facebook_page,
            contact_email,
            phone,
            greek_organizations(name, organization_type),
            universities(name, state)
          `)
          .ilike('chapter_name', chapter_name)
          .limit(1)
          .maybeSingle();

        if (!exactError && exactMatch) {
          const exactMatchAny = exactMatch as any;
          if (exactMatchAny.greek_organizations && exactMatchAny.universities) {
            const greekOrgName = exactMatchAny.greek_organizations.name || '';
            const univName = exactMatchAny.universities.name || '';
            const greekOrgMatch = greekOrgName.toLowerCase().includes(greek_organization.toLowerCase());
            const universityMatch = univName.toLowerCase().includes(university.toLowerCase());

            if (greekOrgMatch && universityMatch) {
              matchedChapter = exactMatchAny;
              matchMethod = 'exact';
              matchConfidence = 'high';
            }
          }
        }
      }

      // 2. Try fuzzy match on greek org + university
      if (!matchedChapter) {
        const { data: fuzzyMatches } = await supabase
          .from('chapters')
          .select(`
            id,
            chapter_name,
            status,
            instagram_handle,
            facebook_page,
            contact_email,
            phone,
            greek_organizations(name, organization_type),
            universities(name, state)
          `)
          .limit(10);

        if (fuzzyMatches && fuzzyMatches.length > 0) {
          // Find best match by checking greek org and university
          const bestMatch = fuzzyMatches.find((chapter: any) => {
            const greekOrgName = chapter.greek_organizations?.name?.toLowerCase() || '';
            const univName = chapter.universities?.name?.toLowerCase() || '';
            const inputGreek = greek_organization.toLowerCase();
            const inputUniv = university.toLowerCase();

            return greekOrgName.includes(inputGreek) && univName.includes(inputUniv);
          });

          if (bestMatch) {
            matchedChapter = bestMatch as any;
            matchMethod = 'fuzzy';
            matchConfidence = 'medium';
          }
        }
      }

      // 3. Try Instagram handle match
      if (!matchedChapter && instagram_handle) {
        const cleanHandle = instagram_handle.replace('@', '').toLowerCase();
        const { data: instagramMatch, error: instagramError } = await supabase
          .from('chapters')
          .select(`
            id,
            chapter_name,
            status,
            instagram_handle,
            facebook_page,
            contact_email,
            phone,
            greek_organizations(name, organization_type),
            universities(name, state)
          `)
          .ilike('instagram_handle', `%${cleanHandle}%`)
          .limit(1)
          .maybeSingle();

        if (!instagramError && instagramMatch) {
          matchedChapter = instagramMatch as any;
          matchMethod = 'instagram';
          matchConfidence = 'low';
        }
      }

      // If no match found, add to unmatched
      if (!matchedChapter) {
        unmatched.push({
          input: inputChapter,
          reason: 'No matching chapter found in database'
        });
        continue;
      }

      // Fetch contacts for matched chapter
      const chapterId = (matchedChapter as any).id;

      // Get primary contact
      const { data: primaryOfficer } = await supabase
        .from('chapter_officers')
        .select('*')
        .eq('chapter_id', chapterId)
        .eq('is_primary_contact', true)
        .limit(1)
        .maybeSingle();

      // Get leadership positions
      const { data: leadership } = await supabase
        .from('chapter_officers')
        .select('*')
        .eq('chapter_id', chapterId)
        .in('position', ['President', 'Vice President', 'Social Chair', 'Rush Chair', 'Philanthropy Chair'])
        .not('email', 'is', null)
        .limit(5);

      // Get ambassadors
      const { data: ambassadors } = await supabase
        .from('chapter_officers')
        .select('*')
        .eq('chapter_id', chapterId)
        .eq('is_ambassador', true)
        .limit(5);

      // Get total officer count
      const { count: officerCount } = await supabase
        .from('chapter_officers')
        .select('*', { count: 'exact', head: true })
        .eq('chapter_id', chapterId);

      // Build contact response
      const contactsResponse: any = {
        primary: primaryOfficer ? {
          source: 'chapter_officers',
          id: (primaryOfficer as any).id,
          name: (primaryOfficer as any).name || `${(primaryOfficer as any).first_name || ''} ${(primaryOfficer as any).last_name || ''}`.trim(),
          position: (primaryOfficer as any).position,
          email: (primaryOfficer as any).email,
          phone: (primaryOfficer as any).phone,
          linkedin: (primaryOfficer as any).linkedin_profile,
          is_primary_contact: true
        } : null,
        leadership: (leadership || []).map((officer: any) => ({
          source: 'chapter_officers',
          id: officer.id,
          name: officer.name || `${officer.first_name || ''} ${officer.last_name || ''}`.trim(),
          position: officer.position,
          email: officer.email,
          phone: officer.phone,
          linkedin: officer.linkedin_profile
        })),
        ambassadors: (ambassadors || []).map((officer: any) => ({
          source: 'chapter_officers',
          id: officer.id,
          name: officer.name || `${officer.first_name || ''} ${officer.last_name || ''}`.trim(),
          position: officer.position,
          email: officer.email,
          phone: officer.phone,
          linkedin: officer.linkedin_profile,
          is_ambassador: true
        })),
        all_officers_count: officerCount || 0,
        chapter_level: {
          email: (matchedChapter as any).contact_email,
          phone: (matchedChapter as any).phone,
          instagram: (matchedChapter as any).instagram_handle,
          facebook: (matchedChapter as any).facebook_page
        }
      };

      matches.push({
        input: inputChapter,
        matched_chapter: {
          id: (matchedChapter as any).id,
          chapter_name: (matchedChapter as any).chapter_name,
          greek_organization: (matchedChapter as any).greek_organizations?.name,
          organization_type: (matchedChapter as any).greek_organizations?.organization_type,
          university: (matchedChapter as any).universities?.name,
          state: (matchedChapter as any).universities?.state,
          instagram_handle: (matchedChapter as any).instagram_handle,
          status: (matchedChapter as any).status,
          match_confidence: matchConfidence,
          match_method: matchMethod
        },
        contacts: contactsResponse,
        override_instructions: {
          update_chapter_url: `/api/admin/chapters/${chapterId}`,
          update_officer_url: `/api/admin/chapter-officers/{officer_id}`,
          add_officer_url: `/api/admin/chapters/${chapterId}/officers`
        }
      });
    }

    res.json({
      success: true,
      matches,
      unmatched,
      summary: {
        total_input: chapters.length,
        matched: matches.length,
        unmatched: unmatched.length
      }
    });

  } catch (error: any) {
    console.error('Error matching contacts:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to match contacts',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/outreach/test
 * Test endpoint to verify outreach routes are working
 */
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Outreach API is working!',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
  });
});

export default router;

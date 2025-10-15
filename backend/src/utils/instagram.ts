/**
 * Instagram API Integration Utilities
 *
 * Functions to fetch Instagram profile and post data from RapidAPI
 */

export interface InstagramProfile {
  username: string;
  full_name: string;
  biography: string;
  follower_count: number;
  following_count: number;
  media_count: number;
  profile_pic_url: string;
  is_verified: boolean;
  is_business_account: boolean;
  external_url?: string;
}

export interface InstagramPost {
  id: string;
  shortcode: string;
  caption?: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  like_count: number;
  comment_count: number;
  timestamp: string;
  permalink: string;
}

export interface InstagramData {
  profile: InstagramProfile;
  recent_posts: InstagramPost[];
  last_updated: string;
}

/**
 * Clean Instagram handle to remove @ symbol and whitespace
 */
export function cleanInstagramHandle(handle: string | null | undefined): string | null {
  if (!handle) return null;

  // Remove @ symbol, whitespace, and convert to lowercase
  return handle
    .trim()
    .replace(/^@/, '')
    .toLowerCase();
}

/**
 * Get Instagram handle from chapter data
 * Prefers instagram_handle_official over instagram_handle
 */
export function getInstagramHandle(
  instagram_handle?: string | null,
  instagram_handle_official?: string | null
): string | null {
  // Try official handle first (without @)
  if (instagram_handle_official) {
    return cleanInstagramHandle(instagram_handle_official);
  }

  // Fall back to regular handle (with @)
  if (instagram_handle) {
    return cleanInstagramHandle(instagram_handle);
  }

  return null;
}

/**
 * Fetch Instagram profile data from RapidAPI
 */
export async function fetchInstagramProfile(username: string): Promise<InstagramProfile | null> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const RAPIDAPI_HOST = process.env.RAPIDAPI_INSTAGRAM_HOST || 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com';

  if (!RAPIDAPI_KEY) {
    console.error('RAPIDAPI_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/profile/${username}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    if (!response.ok) {
      console.error(`Instagram API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Map API response to our interface
    return {
      username: data.username,
      full_name: data.full_name || data.username,
      biography: data.biography || '',
      follower_count: data.follower_count || data.edge_followed_by?.count || 0,
      following_count: data.following_count || data.edge_follow?.count || 0,
      media_count: data.media_count || data.edge_owner_to_timeline_media?.count || 0,
      profile_pic_url: data.profile_pic_url || data.profile_pic_url_hd || '',
      is_verified: data.is_verified || false,
      is_business_account: data.is_business_account || false,
      external_url: data.external_url || undefined
    };
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    return null;
  }
}

/**
 * Fetch recent Instagram posts from RapidAPI
 */
export async function fetchInstagramPosts(username: string, limit: number = 6): Promise<InstagramPost[]> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const RAPIDAPI_HOST = process.env.RAPIDAPI_INSTAGRAM_HOST || 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com';

  if (!RAPIDAPI_KEY) {
    console.error('RAPIDAPI_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/posts/${username}?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    if (!response.ok) {
      console.error(`Instagram API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const posts = data.items || data.data || [];

    // Map API response to our interface
    return posts.map((post: any) => ({
      id: post.id,
      shortcode: post.shortcode || post.code,
      caption: post.caption?.text || post.edge_media_to_caption?.edges[0]?.node?.text || '',
      media_url: post.display_url || post.thumbnail_src || '',
      media_type: post.media_type || (post.is_video ? 'VIDEO' : 'IMAGE'),
      like_count: post.like_count || post.edge_media_preview_like?.count || 0,
      comment_count: post.comment_count || post.edge_media_to_comment?.count || 0,
      timestamp: post.taken_at_timestamp ? new Date(post.taken_at_timestamp * 1000).toISOString() : new Date().toISOString(),
      permalink: `https://www.instagram.com/p/${post.shortcode || post.code}/`
    })).slice(0, limit);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return [];
  }
}

/**
 * Fetch complete Instagram data (profile + posts)
 */
export async function fetchInstagramData(username: string, postLimit: number = 6): Promise<InstagramData | null> {
  const cleanUsername = cleanInstagramHandle(username);

  if (!cleanUsername) {
    return null;
  }

  try {
    // Fetch profile and posts in parallel
    const [profile, posts] = await Promise.all([
      fetchInstagramProfile(cleanUsername),
      fetchInstagramPosts(cleanUsername, postLimit)
    ]);

    if (!profile) {
      return null;
    }

    return {
      profile,
      recent_posts: posts,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    return null;
  }
}

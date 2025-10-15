/**
 * Enhanced Daily Report Service
 * Generates comprehensive daily email reports with:
 * - New chapters & roster members
 * - New partnerships landed
 * - Chapter unlocks & revenue
 * - Warm intro requests
 * - User growth metrics
 * - Platform engagement stats
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Existing interfaces
interface NewChapter {
  id: string;
  chapter_name: string;
  university_name: string;
  greek_org_name: string;
  grade: number;
  member_count: number;
  created_at: string;
}

interface NewOfficer {
  id: string;
  name: string;
  position: string;
  chapter_name: string;
  university_name: string;
  created_at: string;
}

interface HighGradeChapter {
  id: string;
  chapter_name: string;
  university_name: string;
  greek_org_name: string;
  grade: number;
  member_count: number;
  is_introducable: boolean;
}

// NEW interfaces for enhanced metrics
interface NewPartnership {
  id: string;
  brand_name: string;
  chapter_name: string;
  university_name: string;
  partnership_type: string;
  status: string;
  deal_value: number;
  signed_date: string;
}

interface ChapterUnlock {
  chapter_name: string;
  university_name: string;
  company_name: string;
  unlock_type: string;
  amount_paid: number;
  unlocked_at: string;
}

interface WarmIntroRequest {
  chapter_name: string;
  university_name: string;
  company_name: string;
  status: string;
  created_at: string;
}

interface DailyMetrics {
  new_partnerships_count: number;
  total_partnership_value: number;
  chapter_unlocks_count: number;
  total_unlock_revenue: number;
  warm_intro_requests_count: number;
  warm_intro_revenue: number;
  new_users_count: number;
  total_active_users: number;
  total_chapters: number;
  total_premium_chapters: number;
}

interface ChapterDataEnrichment {
  chapter_name: string;
  university_name: string;
  greek_org_name: string;
  data_added: string[];  // e.g., ["Instagram", "5 roster members", "LinkedIn profiles"]
  updated_at: string;
}

interface DataEnrichmentSummary {
  chapters_with_instagram: number;
  chapters_with_new_members: number;
  total_new_members: number;
  chapters_with_linkedin: number;
  chapters_with_contacts: number;
  enriched_chapters: ChapterDataEnrichment[];
}

interface Company {
  id: string;
  name: string;
  email: string;
}

export class EnhancedDailyReportService {
  private supabase: SupabaseClient;
  private resend: Resend;
  private fromEmail: string;

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    resendApiKey: string,
    fromEmail: string = 'updates@fraternitybase.com'
  ) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.resend = new Resend(resendApiKey);
    this.fromEmail = fromEmail;
  }

  /**
   * Get new partnerships signed in last 24 hours
   */
  async getNewPartnerships(): Promise<NewPartnership[]> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data, error } = await this.supabase
      .from('partnerships')
      .select(`
        id,
        partnership_type,
        status,
        budget_amount,
        created_at,
        companies:company_id (name),
        chapters:chapter_id (
          chapter_name,
          universities:university_id (name)
        )
      `)
      .gte('created_at', yesterday.toISOString())
      .in('status', ['active', 'confirmed'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partnerships:', error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      brand_name: p.companies?.name || 'Unknown Brand',
      chapter_name: p.chapters?.chapter_name || 'Unknown',
      university_name: p.chapters?.universities?.name || 'Unknown',
      partnership_type: p.partnership_type || 'General',
      status: p.status,
      deal_value: p.budget_amount || 0,
      signed_date: p.created_at
    }));
  }

  /**
   * Get chapter unlocks from last 24 hours
   */
  async getChapterUnlocks(): Promise<ChapterUnlock[]> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data, error } = await this.supabase
      .from('chapter_unlocks')
      .select(`
        unlock_type,
        amount_paid,
        unlocked_at,
        chapters:chapter_id (
          chapter_name,
          universities:university_id (name)
        ),
        companies:company_id (name)
      `)
      .gte('unlocked_at', yesterday.toISOString())
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching chapter unlocks:', error);
      return [];
    }

    return (data || []).map((u: any) => ({
      chapter_name: u.chapters?.chapter_name || 'Unknown',
      university_name: u.chapters?.universities?.name || 'Unknown',
      company_name: u.companies?.name || 'Unknown Company',
      unlock_type: u.unlock_type || 'full',
      amount_paid: parseFloat(u.amount_paid || 0),
      unlocked_at: u.unlocked_at
    }));
  }

  /**
   * Get warm intro requests from last 24 hours
   */
  async getWarmIntroRequests(): Promise<WarmIntroRequest[]> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data, error } = await this.supabase
      .from('warm_intro_requests')
      .select(`
        status,
        created_at,
        chapters:chapter_id (
          chapter_name,
          universities:university_id (name)
        ),
        companies:company_id (name)
      `)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching warm intro requests:', error);
      return [];
    }

    return (data || []).map((w: any) => ({
      chapter_name: w.chapters?.chapter_name || 'Unknown',
      university_name: w.chapters?.universities?.name || 'Unknown',
      company_name: w.companies?.name || 'Unknown Company',
      status: w.status || 'pending',
      created_at: w.created_at
    }));
  }

  /**
   * Get daily platform metrics
   */
  async getDailyMetrics(): Promise<DailyMetrics> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Get new user signups
    const { count: newUsersCount } = await this.supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    // Get total active users
    const { count: totalActiveUsers } = await this.supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get total chapters
    const { count: totalChapters } = await this.supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true });

    // Get premium chapters (grade >= 4.5)
    const { count: totalPremiumChapters } = await this.supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .gte('grade', 4.5);

    // Get partnerships data
    const partnerships = await this.getNewPartnerships();
    const totalPartnershipValue = partnerships.reduce((sum, p) => sum + p.deal_value, 0);

    // Get unlock revenue
    const unlocks = await this.getChapterUnlocks();
    const totalUnlockRevenue = unlocks.reduce((sum, u) => sum + u.amount_paid, 0);

    // Get warm intro data
    const warmIntros = await this.getWarmIntroRequests();
    const warmIntroRevenue = warmIntros.length * 59.99; // $59.99 per intro

    return {
      new_partnerships_count: partnerships.length,
      total_partnership_value: totalPartnershipValue,
      chapter_unlocks_count: unlocks.length,
      total_unlock_revenue: totalUnlockRevenue,
      warm_intro_requests_count: warmIntros.length,
      warm_intro_revenue: warmIntroRevenue,
      new_users_count: newUsersCount || 0,
      total_active_users: totalActiveUsers || 0,
      total_chapters: totalChapters || 0,
      total_premium_chapters: totalPremiumChapters || 0
    };
  }

  /**
   * Get chapter data enrichment summary (last 24 hours)
   */
  async getDataEnrichmentSummary(): Promise<DataEnrichmentSummary> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Get chapters with Instagram added recently
    const { data: instagramChapters } = await this.supabase
      .from('chapters')
      .select(`
        id,
        chapter_name,
        instagram_handle,
        updated_at,
        universities:university_id (name),
        greek_organizations:greek_organization_id (name)
      `)
      .not('instagram_handle', 'is', null)
      .gte('updated_at', yesterday.toISOString());

    // Get new officers/members grouped by chapter
    const { data: newOfficers } = await this.supabase
      .from('chapter_officers')
      .select(`
        id,
        name,
        email,
        phone,
        linkedin_url,
        created_at,
        chapters:chapter_id (
          id,
          chapter_name,
          universities:university_id (name),
          greek_organizations:greek_organization_id (name)
        )
      `)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    // Aggregate data by chapter
    const chapterMap = new Map<string, ChapterDataEnrichment>();

    // Add Instagram chapters
    (instagramChapters || []).forEach((chapter: any) => {
      if (!chapterMap.has(chapter.id)) {
        chapterMap.set(chapter.id, {
          chapter_name: chapter.chapter_name,
          university_name: chapter.universities?.name || 'Unknown',
          greek_org_name: chapter.greek_organizations?.name || 'Unknown',
          data_added: [],
          updated_at: chapter.updated_at
        });
      }
      const entry = chapterMap.get(chapter.id)!;
      entry.data_added.push(`Instagram: ${chapter.instagram_handle}`);
    });

    // Count chapters with different types of data
    let chaptersWithLinkedIn = 0;
    let chaptersWithContacts = 0;
    const officersByChapter = new Map<string, any[]>();

    (newOfficers || []).forEach((officer: any) => {
      const chapterId = officer.chapters?.id;
      if (!chapterId) return;

      // Group officers by chapter
      if (!officersByChapter.has(chapterId)) {
        officersByChapter.set(chapterId, []);
      }
      officersByChapter.get(chapterId)!.push(officer);

      // Initialize chapter in map if not exists
      if (!chapterMap.has(chapterId)) {
        chapterMap.set(chapterId, {
          chapter_name: officer.chapters?.chapter_name || 'Unknown',
          university_name: officer.chapters?.universities?.name || 'Unknown',
          greek_org_name: officer.chapters?.greek_organizations?.name || 'Unknown',
          data_added: [],
          updated_at: officer.created_at
        });
      }
    });

    // Add officer data to chapters
    officersByChapter.forEach((officers, chapterId) => {
      const entry = chapterMap.get(chapterId)!;
      const count = officers.length;
      entry.data_added.push(`${count} roster member${count > 1 ? 's' : ''}`);

      // Check for LinkedIn profiles
      const linkedInCount = officers.filter(o => o.linkedin_url).length;
      if (linkedInCount > 0) {
        entry.data_added.push(`${linkedInCount} LinkedIn profile${linkedInCount > 1 ? 's' : ''}`);
        chaptersWithLinkedIn++;
      }

      // Check for contact info (email or phone)
      const contactCount = officers.filter(o => o.email || o.phone).length;
      if (contactCount > 0) {
        entry.data_added.push(`${contactCount} contact${contactCount > 1 ? 's' : ''} (email/phone)`);
        chaptersWithContacts++;
      }
    });

    return {
      chapters_with_instagram: instagramChapters?.length || 0,
      chapters_with_new_members: officersByChapter.size,
      total_new_members: newOfficers?.length || 0,
      chapters_with_linkedin: chaptersWithLinkedIn,
      chapters_with_contacts: chaptersWithContacts,
      enriched_chapters: Array.from(chapterMap.values()).slice(0, 20) // Limit to top 20
    };
  }

  /**
   * Get chapters from existing service
   */
  async getNewChapters(): Promise<NewChapter[]> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data, error } = await this.supabase
      .from('chapters')
      .select(`
        id,
        chapter_name,
        grade,
        member_count,
        created_at,
        universities:university_id (name),
        greek_organizations:greek_organization_id (name)
      `)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching new chapters:', error);
      return [];
    }

    return (data || []).map((chapter: any) => ({
      id: chapter.id,
      chapter_name: chapter.chapter_name,
      university_name: chapter.universities?.name || 'Unknown',
      greek_org_name: chapter.greek_organizations?.name || 'Unknown',
      grade: chapter.grade || 0,
      member_count: chapter.member_count || 0,
      created_at: chapter.created_at
    }));
  }

  /**
   * Get officers from existing service
   */
  async getNewOfficers(): Promise<NewOfficer[]> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data, error } = await this.supabase
      .from('chapter_officers')
      .select(`
        id,
        name,
        position,
        created_at,
        chapters:chapter_id (
          chapter_name,
          universities:university_id (name)
        )
      `)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching new officers:', error);
      return [];
    }

    return (data || []).map((officer: any) => ({
      id: officer.id,
      name: officer.name,
      position: officer.position || 'Member',
      chapter_name: officer.chapters?.chapter_name || 'Unknown',
      university_name: officer.chapters?.universities?.name || 'Unknown',
      created_at: officer.created_at
    }));
  }

  /**
   * Get high-grade chapters from existing service
   */
  async getHighGradeChapters(): Promise<HighGradeChapter[]> {
    const { data, error } = await this.supabase
      .from('chapters')
      .select(`
        id,
        chapter_name,
        grade,
        member_count,
        universities:university_id (name),
        greek_organizations:greek_organization_id (name)
      `)
      .gte('grade', 4.5)
      .order('grade', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching high-grade chapters:', error);
      return [];
    }

    return (data || []).map((chapter: any) => ({
      id: chapter.id,
      chapter_name: chapter.chapter_name,
      university_name: chapter.universities?.name || 'Unknown',
      greek_org_name: chapter.greek_organizations?.name || 'Unknown',
      grade: chapter.grade || 0,
      member_count: chapter.member_count || 0,
      is_introducable: chapter.grade >= 4.5
    }));
  }

  /**
   * Get approved companies
   */
  async getApprovedCompanies(): Promise<Company[]> {
    const { data: companies, error: companiesError } = await this.supabase
      .from('companies')
      .select(`
        id,
        name,
        user_profiles (
          user_id
        )
      `)
      .eq('approval_status', 'approved');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return [];
    }

    const companiesWithEmails: Company[] = [];

    for (const company of companies || []) {
      if (company.user_profiles && company.user_profiles.length > 0) {
        const userId = company.user_profiles[0].user_id;

        try {
          const { data: authUser, error: authError } = await this.supabase.auth.admin.getUserById(userId);

          if (!authError && authUser?.user?.email) {
            companiesWithEmails.push({
              id: company.id,
              name: company.name,
              email: authUser.user.email
            });
          }
        } catch (error) {
          console.error(`Error fetching email for company ${company.name}:`, error);
        }
      }
    }

    return companiesWithEmails;
  }

  /**
   * Generate enhanced HTML email with all metrics
   */
  generateEnhancedReportHtml(
    companyName: string,
    dataEnrichment: DataEnrichmentSummary,
    newChapters: NewChapter[],
    newOfficers: NewOfficer[],
    highGradeChapters: HighGradeChapter[],
    newPartnerships: NewPartnership[],
    chapterUnlocks: ChapterUnlock[],
    warmIntroRequests: WarmIntroRequest[],
    metrics: DailyMetrics
  ): string {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f3f4f6;
      padding: 20px 0;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      opacity: 0.95;
      font-size: 15px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      padding: 30px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 5px;
    }
    .metric-label {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }
    .metric-revenue { color: #059669; }
    .metric-count { color: #3b82f6; }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 20px;
      margin-bottom: 20px;
      color: #1e3a8a;
      font-weight: 600;
    }
    .section {
      margin-bottom: 35px;
    }
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #3b82f6;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-count {
      background: #3b82f6;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 700;
      margin-left: 8px;
      text-transform: uppercase;
    }
    .badge-premium {
      background-color: #fef3c7;
      color: #92400e;
    }
    .badge-introducable {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }
    .item {
      background-color: #f9fafb;
      padding: 18px;
      margin-bottom: 12px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
      transition: transform 0.2s;
    }
    .item-title {
      font-weight: 700;
      font-size: 16px;
      color: #111827;
      margin-bottom: 8px;
    }
    .item-detail {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }
    .item-detail strong {
      color: #374151;
      font-weight: 600;
    }
    .partnership-value {
      display: inline-block;
      background: #d1fae5;
      color: #065f46;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
    }
    .empty-state {
      text-align: center;
      padding: 30px;
      color: #9ca3af;
      font-style: italic;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      margin: 25px auto;
      padding: 16px 32px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
    }
    .footer {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer strong {
      color: #111827;
      font-size: 15px;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📊 FraternityBase Daily Report</h1>
      <p>${today}</p>
    </div>

    <!-- Metrics Dashboard -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value metric-count">${dataEnrichment.total_new_members}</div>
        <div class="metric-label">New Contacts Added</div>
      </div>
      <div class="metric-card">
        <div class="metric-value metric-count">${newChapters.length}</div>
        <div class="metric-label">New Chapters</div>
      </div>
      <div class="metric-card">
        <div class="metric-value metric-count">${dataEnrichment.chapters_with_instagram}</div>
        <div class="metric-label">Instagram Handles</div>
      </div>
      <div class="metric-card">
        <div class="metric-value metric-count">${metrics.total_premium_chapters}</div>
        <div class="metric-label">Premium Chapters</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="greeting">
        Hello ${companyName}! 👋
      </div>

      <p style="margin-bottom: 30px; font-size: 15px; color: #4b5563;">
        Here's your daily update on new chapters, roster contacts, and data added to the FraternityBase platform.
      </p>

      <!-- Chapter Data Enrichment Summary -->
      ${dataEnrichment.enriched_chapters.length > 0 ? `
      <div class="section">
        <div class="section-title">
          <span>📝 Chapter Data Added (Last 24h)</span>
          <span class="section-count">${dataEnrichment.enriched_chapters.length}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
          ${dataEnrichment.total_new_members > 0 ? `
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #3b82f6;">
            <div style="font-size: 24px; font-weight: 700; color: #1e40af;">${dataEnrichment.total_new_members}</div>
            <div style="font-size: 13px; color: #1e40af;">New Roster Members</div>
          </div>
          ` : ''}
          ${dataEnrichment.chapters_with_instagram > 0 ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #f59e0b;">
            <div style="font-size: 24px; font-weight: 700; color: #92400e;">${dataEnrichment.chapters_with_instagram}</div>
            <div style="font-size: 13px; color: #92400e;">Instagram Added</div>
          </div>
          ` : ''}
          ${dataEnrichment.chapters_with_linkedin > 0 ? `
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #0ea5e9;">
            <div style="font-size: 24px; font-weight: 700; color: #075985;">${dataEnrichment.chapters_with_linkedin}</div>
            <div style="font-size: 13px; color: #075985;">Chapters w/ LinkedIn</div>
          </div>
          ` : ''}
          ${dataEnrichment.chapters_with_contacts > 0 ? `
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
            <div style="font-size: 24px; font-weight: 700; color: #065f46;">${dataEnrichment.chapters_with_contacts}</div>
            <div style="font-size: 13px; color: #065f46;">Chapters w/ Contacts</div>
          </div>
          ` : ''}
        </div>
        ${dataEnrichment.enriched_chapters.slice(0, 10).map(chapter => `
          <div class="item">
            <div class="item-title">
              ${chapter.chapter_name} · ${chapter.greek_org_name}
            </div>
            <div class="item-detail">
              📍 ${chapter.university_name}
            </div>
            <div class="item-detail">
              ✅ <strong>${chapter.data_added.join(' · ')}</strong>
            </div>
          </div>
        `).join('')}
        ${dataEnrichment.enriched_chapters.length > 10 ? `
          <div class="item-detail" style="text-align: center; margin-top: 10px; color: #6b7280;">
            + ${dataEnrichment.enriched_chapters.length - 10} more chapters enriched
          </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Premium 5.0 Chapters Available -->
      ${highGradeChapters.filter(c => c.grade >= 5.0).length > 0 ? `
      <div class="section">
        <div class="section-title">
          <span>⭐ Premium 5.0 Chapters Available</span>
          <span class="section-count">${highGradeChapters.filter(c => c.grade >= 5.0).length}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
          Top-tier chapters with complete roster data, verified contacts, and warm intro availability.
        </p>
        ${highGradeChapters.filter(c => c.grade >= 5.0).slice(0, 10).map(chapter => `
          <div class="item">
            <div class="item-title">
              ${chapter.chapter_name} at ${chapter.university_name}
              <span class="badge badge-premium">⭐ 5.0</span>
            </div>
            <div class="item-detail">
              📍 ${chapter.greek_org_name} · ${chapter.member_count || 'N/A'} members
            </div>
          </div>
        `).join('')}
        ${highGradeChapters.filter(c => c.grade >= 5.0).length > 10 ? `
          <div class="item-detail" style="text-align: center; margin-top: 10px; color: #6b7280;">
            + ${highGradeChapters.filter(c => c.grade >= 5.0).length - 10} more premium chapters
          </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- New Chapters Section -->
      ${newChapters.length > 0 ? `
      <div class="section">
        <div class="section-title">
          <span>🎓 New Chapters Added</span>
          <span class="section-count">${newChapters.length}</span>
        </div>
        ${newChapters.map(chapter => `
          <div class="item">
            <div class="item-title">
              ${chapter.chapter_name} at ${chapter.university_name}
              ${chapter.grade >= 5.0 ? '<span class="badge badge-premium">⭐ Premium</span>' : ''}
              ${chapter.grade >= 4.5 && chapter.grade < 5.0 ? '<span class="badge badge-introducable">🤝 Introducable</span>' : ''}
            </div>
            <div class="item-detail">
              📍 ${chapter.greek_org_name} · ${chapter.member_count || 'N/A'} members · Grade: ${chapter.grade.toFixed(1)}
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Platform Growth Stats -->
      <div class="section">
        <div class="section-title">
          <span>📈 Platform Growth</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${metrics.total_chapters.toLocaleString()}</div>
            <div style="font-size: 13px; color: #6b7280;">Total Chapters Available</div>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${metrics.total_premium_chapters.toLocaleString()}</div>
            <div style="font-size: 13px; color: #6b7280;">Premium 5.0 Chapters</div>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #059669;">${newChapters.length + dataEnrichment.enriched_chapters.length}</div>
            <div style="font-size: 13px; color: #6b7280;">New Data Added (24h)</div>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${dataEnrichment.total_new_members.toLocaleString()}</div>
            <div style="font-size: 13px; color: #6b7280;">New Contacts Added</div>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://fraternitybase.com/chapters" class="cta-button">
          View Dashboard →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>FraternityBase</strong><br>
        The premier platform for fraternity partnerships & introductions
      </p>
      <p style="margin-top: 15px;">
        <a href="https://fraternitybase.com">Visit Website</a> ·
        <a href="https://fraternitybase.com/settings">Email Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send enhanced daily report to a single company
   */
  async sendEnhancedDailyReport(company: Company): Promise<boolean> {
    try {
      console.log(`Generating enhanced report for ${company.name}...`);

      // Fetch all data in parallel
      const [
        dataEnrichment,
        newChapters,
        newOfficers,
        highGradeChapters,
        newPartnerships,
        chapterUnlocks,
        warmIntroRequests,
        metrics
      ] = await Promise.all([
        this.getDataEnrichmentSummary(),
        this.getNewChapters(),
        this.getNewOfficers(),
        this.getHighGradeChapters(),
        this.getNewPartnerships(),
        this.getChapterUnlocks(),
        this.getWarmIntroRequests(),
        this.getDailyMetrics()
      ]);

      // Generate email
      const html = this.generateEnhancedReportHtml(
        company.name,
        dataEnrichment,
        newChapters,
        newOfficers,
        highGradeChapters,
        newPartnerships,
        chapterUnlocks,
        warmIntroRequests,
        metrics
      );

      // Send email
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: company.email,
        subject: `📊 FraternityBase Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        html
      });

      if (result.error) {
        console.error(`Failed to send report to ${company.name}:`, result.error);
        return false;
      }

      console.log(`✓ Enhanced report sent to ${company.name} (${company.email})`);
      return true;
    } catch (error: any) {
      console.error(`Error sending enhanced report to ${company.name}:`, error.message);
      return false;
    }
  }

  /**
   * Send enhanced daily reports to all approved companies
   */
  async sendAllEnhancedDailyReports(): Promise<{ sent: number; failed: number }> {
    console.log('Starting enhanced daily report generation...');

    const companies = await this.getApprovedCompanies();
    console.log(`Found ${companies.length} approved companies`);

    // TEMPORARY: Only send to jacksonfitzgerald25@gmail.com for testing
    const filteredCompanies = companies.filter(c =>
      c.email === 'jacksonfitzgerald25@gmail.com'
    );

    console.log(`⚠️  TESTING MODE: Filtered to ${filteredCompanies.length} recipient(s) (jacksonfitzgerald25@gmail.com only)`);

    let sent = 0;
    let failed = 0;

    for (const company of filteredCompanies) {
      const success = await this.sendEnhancedDailyReport(company);
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting: wait 1 second between emails
      await this.sleep(1000);
    }

    console.log(`Enhanced daily reports complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EnhancedDailyReportService;

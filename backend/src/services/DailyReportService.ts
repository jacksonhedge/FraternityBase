/**
 * Daily Report Service
 * Generates and sends daily email reports to clients with:
 * - New chapters added
 * - New rosters/officers added
 * - New high-grade chapters (5.0 and 4.5 - "introducable")
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

interface Company {
  id: string;
  name: string;
  email: string;
}

export class DailyReportService {
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
   * Get chapters created in the last 24 hours
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
   * Get officers/roster members added in the last 24 hours
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
   * Get high-grade chapters (5.0 and 4.5)
   * These are "Premium" and "Introducable" chapters
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
      .limit(50); // Limit to top 50 to avoid overwhelming emails

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
   * Get all approved companies with valid email addresses
   */
  async getApprovedCompanies(): Promise<Company[]> {
    // Get companies with their user profiles
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

    // Get emails for each company
    const companiesWithEmails: Company[] = [];

    for (const company of companies || []) {
      if (company.user_profiles && company.user_profiles.length > 0) {
        const userId = company.user_profiles[0].user_id;

        // Get email from auth.users using admin client
        try {
          const { data: authUser, error: authError } = await this.supabase.auth.admin.getUserById(userId);

          if (!authError && authUser?.user?.email) {
            companiesWithEmails.push({
              id: company.id,
              name: company.name,
              email: authUser.user.email
            });
          } else {
            console.warn(`No email found for company ${company.name} (user ${userId})`);
          }
        } catch (error) {
          console.error(`Error fetching email for company ${company.name}:`, error);
        }
      } else {
        console.warn(`No user profiles found for company ${company.name}`);
      }
    }

    return companiesWithEmails;
  }

  /**
   * Generate HTML email for daily report
   */
  generateReportHtml(
    companyName: string,
    newChapters: NewChapter[],
    newOfficers: NewOfficer[],
    highGradeChapters: HighGradeChapter[]
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
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1e3a8a;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e3a8a;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
    .badge-premium {
      background-color: #fef3c7;
      color: #92400e;
    }
    .badge-introducable {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .item {
      background-color: #f9fafb;
      padding: 15px;
      margin-bottom: 12px;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    .item-title {
      font-weight: 600;
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 6px;
    }
    .item-detail {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0;
    }
    .grade-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 6px;
    }
    .empty-state {
      text-align: center;
      padding: 20px;
      color: #9ca3af;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      margin: 20px 0;
      padding: 14px 28px;
      background-color: #1e3a8a;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily FraternityBase Report</h1>
      <p>${today}</p>
    </div>

    <div class="content">
      <div class="greeting">
        Hello ${companyName}! 👋
      </div>

      <p style="margin-bottom: 30px;">
        Here's your daily update on new chapters, rosters, and high-value partnership opportunities.
      </p>

      <!-- New Chapters Section -->
      <div class="section">
        <div class="section-title">
          🎓 New Chapters Added (${newChapters.length})
        </div>
        ${newChapters.length === 0 ? `
          <div class="empty-state">No new chapters added in the last 24 hours</div>
        ` : newChapters.map(chapter => `
          <div class="item">
            <div class="item-title">
              ${chapter.chapter_name} at ${chapter.university_name}
              ${chapter.grade >= 5.0 ? '<span class="badge badge-premium">⭐ PREMIUM</span>' : ''}
              ${chapter.grade >= 4.5 && chapter.grade < 5.0 ? '<span class="badge badge-introducable">🤝 INTRODUCABLE</span>' : ''}
            </div>
            <div class="item-detail">
              📍 Organization: ${chapter.greek_org_name}
            </div>
            <div class="item-detail">
              👥 Members: ${chapter.member_count || 'Unknown'}
              <span class="grade-badge">Grade: ${chapter.grade.toFixed(1)}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- New Officers Section -->
      <div class="section">
        <div class="section-title">
          👔 New Roster Members Added (${newOfficers.length})
        </div>
        ${newOfficers.length === 0 ? `
          <div class="empty-state">No new roster members added in the last 24 hours</div>
        ` : newOfficers.slice(0, 10).map(officer => `
          <div class="item">
            <div class="item-title">${officer.name}</div>
            <div class="item-detail">
              📋 Position: ${officer.position}
            </div>
            <div class="item-detail">
              🏛️ ${officer.chapter_name} at ${officer.university_name}
            </div>
          </div>
        `).join('')}
        ${newOfficers.length > 10 ? `
          <div class="item-detail" style="text-align: center; margin-top: 10px;">
            + ${newOfficers.length - 10} more roster members added
          </div>
        ` : ''}
      </div>

      <!-- High-Grade Chapters Section -->
      <div class="section">
        <div class="section-title">
          ⭐ Premium & Introducable Chapters (${highGradeChapters.length})
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
          These chapters have comprehensive data and warm introduction capabilities.
        </p>
        ${highGradeChapters.length === 0 ? `
          <div class="empty-state">No high-grade chapters available</div>
        ` : highGradeChapters.slice(0, 15).map(chapter => `
          <div class="item">
            <div class="item-title">
              ${chapter.chapter_name} at ${chapter.university_name}
              ${chapter.grade >= 5.0 ? '<span class="badge badge-premium">⭐ PREMIUM</span>' : ''}
              ${chapter.grade >= 4.5 && chapter.grade < 5.0 ? '<span class="badge badge-introducable">🤝 INTRODUCABLE</span>' : ''}
            </div>
            <div class="item-detail">
              📍 ${chapter.greek_org_name} · ${chapter.member_count || 'N/A'} members
              <span class="grade-badge">Grade: ${chapter.grade.toFixed(1)}</span>
            </div>
            ${chapter.is_introducable ? `
              <div class="item-detail" style="color: #1e40af; font-weight: 500;">
                💼 Warm introduction available
              </div>
            ` : ''}
          </div>
        `).join('')}
        ${highGradeChapters.length > 15 ? `
          <div class="item-detail" style="text-align: center; margin-top: 10px;">
            + ${highGradeChapters.length - 15} more high-grade chapters available
          </div>
        ` : ''}
      </div>

      <div style="text-align: center;">
        <a href="https://fraternitybase.com/chapters" class="cta-button">
          View All Chapters →
        </a>
      </div>
    </div>

    <div class="footer">
      <p>
        <strong>FraternityBase</strong><br>
        The premier platform for fraternity partnerships and introductions
      </p>
      <p style="margin-top: 10px;">
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
   * Generate plain text version of the report
   */
  generateReportText(
    companyName: string,
    newChapters: NewChapter[],
    newOfficers: NewOfficer[],
    highGradeChapters: HighGradeChapter[]
  ): string {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let text = `DAILY FRATERNITYBASE REPORT\n`;
    text += `${today}\n`;
    text += '='.repeat(60) + '\n\n';
    text += `Hello ${companyName}!\n\n`;
    text += `Here's your daily update on new chapters, rosters, and high-value partnership opportunities.\n\n`;

    text += `NEW CHAPTERS ADDED (${newChapters.length})\n`;
    text += '-'.repeat(60) + '\n';
    if (newChapters.length === 0) {
      text += 'No new chapters added in the last 24 hours\n\n';
    } else {
      newChapters.forEach(chapter => {
        text += `• ${chapter.chapter_name} at ${chapter.university_name}\n`;
        text += `  Organization: ${chapter.greek_org_name}\n`;
        text += `  Grade: ${chapter.grade.toFixed(1)} | Members: ${chapter.member_count || 'Unknown'}\n`;
        if (chapter.grade >= 5.0) text += `  ⭐ PREMIUM CHAPTER\n`;
        if (chapter.grade >= 4.5 && chapter.grade < 5.0) text += `  🤝 INTRODUCABLE\n`;
        text += '\n';
      });
    }

    text += `NEW ROSTER MEMBERS ADDED (${newOfficers.length})\n`;
    text += '-'.repeat(60) + '\n';
    if (newOfficers.length === 0) {
      text += 'No new roster members added in the last 24 hours\n\n';
    } else {
      newOfficers.slice(0, 10).forEach(officer => {
        text += `• ${officer.name} - ${officer.position}\n`;
        text += `  ${officer.chapter_name} at ${officer.university_name}\n\n`;
      });
      if (newOfficers.length > 10) {
        text += `  + ${newOfficers.length - 10} more roster members added\n\n`;
      }
    }

    text += `PREMIUM & INTRODUCABLE CHAPTERS (${highGradeChapters.length})\n`;
    text += '-'.repeat(60) + '\n';
    text += 'Chapters with comprehensive data and warm introduction capabilities:\n\n';
    if (highGradeChapters.length === 0) {
      text += 'No high-grade chapters available\n\n';
    } else {
      highGradeChapters.slice(0, 15).forEach(chapter => {
        text += `• ${chapter.chapter_name} at ${chapter.university_name}\n`;
        text += `  ${chapter.greek_org_name} · ${chapter.member_count || 'N/A'} members · Grade: ${chapter.grade.toFixed(1)}\n`;
        if (chapter.is_introducable) text += `  💼 Warm introduction available\n`;
        text += '\n';
      });
      if (highGradeChapters.length > 15) {
        text += `  + ${highGradeChapters.length - 15} more high-grade chapters available\n\n`;
      }
    }

    text += '\nView all chapters: https://fraternitybase.com/chapters\n';
    text += '\n---\n';
    text += 'FraternityBase - The premier platform for fraternity partnerships\n';

    return text;
  }

  /**
   * Generate and send daily report to a single company
   */
  async sendDailyReport(company: Company): Promise<boolean> {
    try {
      console.log(`Generating report for ${company.name}...`);

      // Fetch all data
      const [newChapters, newOfficers, highGradeChapters] = await Promise.all([
        this.getNewChapters(),
        this.getNewOfficers(),
        this.getHighGradeChapters()
      ]);

      // Generate email content
      const html = this.generateReportHtml(
        company.name,
        newChapters,
        newOfficers,
        highGradeChapters
      );

      const text = this.generateReportText(
        company.name,
        newChapters,
        newOfficers,
        highGradeChapters
      );

      // Send email
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: company.email,
        subject: `📊 Daily FraternityBase Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        html,
        text
      });

      if (result.error) {
        console.error(`Failed to send report to ${company.name}:`, result.error);
        return false;
      }

      console.log(`✓ Report sent to ${company.name} (${company.email})`);
      return true;
    } catch (error: any) {
      console.error(`Error sending report to ${company.name}:`, error.message);
      return false;
    }
  }

  /**
   * Generate and send daily reports to all approved companies
   */
  async sendAllDailyReports(): Promise<{ sent: number; failed: number }> {
    console.log('Starting daily report generation...');

    const companies = await this.getApprovedCompanies();
    console.log(`Found ${companies.length} approved companies`);

    let sent = 0;
    let failed = 0;

    for (const company of companies) {
      const success = await this.sendDailyReport(company);
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting: wait 1 second between emails
      await this.sleep(1000);
    }

    console.log(`Daily reports complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default DailyReportService;

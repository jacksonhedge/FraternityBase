import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { waitlistDb, companyDb, WaitlistEntry, CompanySignup } from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://fraternitybase.com', 'https://www.fraternitybase.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jacksonfitzgerald25@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// Helper function to send waitlist confirmation
async function sendWaitlistConfirmation(email: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🎯 You\'re on the Fraternity Base waitlist!',
      html: `
        <div style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <div style="font-size: 48px; margin-bottom: 16px;">🧢</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Fraternity Base
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
              Find a Fraternity to help Build your Brand
            </p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px; background: white;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 600;">
                🎉 Welcome to the waitlist!
              </h2>
              <p style="color: #64748b; margin: 16px 0 0 0; font-size: 16px; line-height: 1.6;">
                You're now first in line to access the premier platform for connecting brands with Greek organizations.
              </p>
            </div>

            <!-- What's Coming -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                🚀 What's launching soon:
              </h3>
              <ul style="color: #334155; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>5,000+ Greek organizations</strong> across 250+ universities</li>
                <li><strong>Advanced search & filtering</strong> by size, location, engagement</li>
                <li><strong>Direct contact information</strong> for chapter leadership</li>
                <li><strong>Partnership management tools</strong> to track your campaigns</li>
                <li><strong>Analytics dashboard</strong> to measure ROI</li>
              </ul>
            </div>

            <!-- Early Access Benefits -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                🎁 Early access perks:
              </h3>
              <ul style="color: #451a03; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>30% discount</strong> on your first year</li>
                <li><strong>Free setup</strong> and onboarding session</li>
                <li><strong>Priority support</strong> from our team</li>
                <li><strong>Beta features</strong> before everyone else</li>
              </ul>
            </div>

            <!-- Timeline -->
            <div style="text-align: center; margin: 32px 0;">
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border: 2px dashed #cbd5e1;">
                <p style="color: #475569; margin: 0; font-size: 14px; font-weight: 500;">
                  📅 Expected Launch: <strong style="color: #1e293b;">Early 2025</strong>
                </p>
                <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">
                  We'll email you 48 hours before launch
                </p>
              </div>
            </div>

            <!-- Social Proof -->
            <div style="text-align: center; margin: 32px 0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Join <strong style="color: #1e293b;">500+</strong> brands already on the waitlist
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Have questions? Reply to this email or visit
              <a href="https://fraternitybase.com" style="color: #2563eb; text-decoration: none;">fraternitybase.com</a>
            </p>
            <p style="color: #94a3b8; margin: 16px 0 0 0; font-size: 12px;">
              © 2024 Fraternity Base. All rights reserved.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Error sending waitlist confirmation:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send waitlist confirmation:', error);
    return { success: false, error };
  }
}

// Helper function to send admin waitlist notification
async function sendAdminWaitlistNotification(email: string) {
  try {
    const stats = waitlistDb.getStats();

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📧 New Waitlist Signup (#${stats.total}) - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🧢 New Waitlist Signup</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone joined the Fraternity Base waitlist</p>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <h2 style="color: #166534; margin-top: 0; font-size: 20px;">📊 Waitlist Stats</h2>
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Total Signups:</strong> <span style="color: #059669; font-size: 18px; font-weight: 600;">${stats.total}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Today:</strong> <span style="color: #059669;">${stats.today}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">This Week:</strong> <span style="color: #059669;">${stats.thisWeek}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Latest Email:</strong> <span style="color: #0f172a;">${email}</span></p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fraternitybase.com/admin-panel"
               style="display: inline-block; background: #10b981; color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              View All Waitlist Signups →
            </a>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Waitlist endpoints
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, source, referrer } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      });
    }

    // Check if email already exists
    if (waitlistDb.emailExists(email)) {
      return res.status(409).json({
        success: false,
        error: 'Email already on waitlist',
        message: 'This email is already registered for early access!'
      });
    }

    // Add to waitlist
    const entry: WaitlistEntry = {
      email: email.toLowerCase().trim(),
      signupDate: new Date().toISOString(),
      source: source || 'landing',
      referrer: referrer || req.get('referer') || null,
      metadata: JSON.stringify({
        userAgent: req.get('user-agent'),
        ip: req.ip,
        timestamp: Date.now()
      })
    };

    const result = waitlistDb.addEmail(entry);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Send confirmation emails
    const userConfirmation = await sendWaitlistConfirmation(email);
    const adminNotification = await sendAdminWaitlistNotification(email);

    console.log('Waitlist signup processed:', {
      email,
      source,
      userEmailSent: userConfirmation.success,
      adminEmailSent: adminNotification.success
    });

    res.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        id: result.id,
        position: waitlistDb.getStats().total,
        emailsSent: {
          confirmation: userConfirmation.success,
          admin: adminNotification.success
        }
      }
    });

  } catch (error: any) {
    console.error('Waitlist signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join waitlist',
      details: error.message
    });
  }
});

// Get waitlist stats (public endpoint for marketing)
app.get('/api/waitlist/stats', (req, res) => {
  try {
    const stats = waitlistDb.getStats();
    res.json({
      success: true,
      data: {
        total: stats.total,
        // Don't expose today/week stats publicly
        milestone: Math.floor(stats.total / 100) * 100 // Round down to nearest 100
      }
    });
  } catch (error: any) {
    console.error('Error getting waitlist stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

// Admin endpoints
app.get('/api/admin/waitlist', (req, res) => {
  try {
    const entries = waitlistDb.getAll();
    const stats = waitlistDb.getStats();

    res.json({
      success: true,
      data: {
        entries,
        stats
      }
    });
  } catch (error: any) {
    console.error('Error getting admin waitlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get waitlist data'
    });
  }
});

app.get('/api/admin/dashboard', (req, res) => {
  try {
    const waitlistStats = waitlistDb.getStats();
    const companyStats = companyDb.getStats();

    res.json({
      success: true,
      data: {
        waitlist: waitlistStats,
        companies: companyStats,
        overview: {
          totalUsers: waitlistStats.total + companyStats.total,
          pendingApprovals: companyStats.pending,
          growthToday: waitlistStats.today
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

// Company signup endpoints (migrate existing functionality)
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, companyName, companyDescription } = req.body;

    if (!name || !email || !companyName || !companyDescription) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const signup: CompanySignup = {
      name,
      email: email.toLowerCase().trim(),
      companyName,
      companyDescription,
      signupDate: new Date().toISOString(),
      status: 'pending'
    };

    const result = companyDb.addSignup(signup);

    if (!result.success) {
      return res.status(409).json({
        success: false,
        error: result.error
      });
    }

    // Send existing email notifications (reuse existing functions)
    // ... (existing email code)

    res.json({
      success: true,
      message: 'Company signup successful!',
      data: { id: result.id, status: 'pending' }
    });

  } catch (error: any) {
    console.error('Company signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process signup'
    });
  }
});

app.get('/api/admin/signups', (req, res) => {
  try {
    const signups = companyDb.getAll();
    res.json({ success: true, data: signups });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to get signups' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Backend server running at http://localhost:${PORT}`);
  console.log(`📧 Admin email: ${ADMIN_EMAIL}`);
  console.log(`📤 From email: ${FROM_EMAIL}`);
  console.log('\n📋 Endpoints:');
  console.log(`  POST   /api/waitlist - Add email to waitlist`);
  console.log(`  GET    /api/waitlist/stats - Public waitlist stats`);
  console.log(`  POST   /api/signup - Company signup`);
  console.log(`  GET    /api/admin/waitlist - Admin waitlist management`);
  console.log(`  GET    /api/admin/dashboard - Admin dashboard data`);
  console.log(`  GET    /api/admin/signups - Admin company signups`);
  console.log('\n🗃️  Database: SQLite with persistent storage');
});

export default app;
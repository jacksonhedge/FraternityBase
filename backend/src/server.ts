import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Store signups (in production, use a database)
const signups: any[] = [];

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jacksonfitzgerald25@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Use Resend's test email for now

// Helper function to send admin notification
async function sendAdminNotification(userData: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🏢 New Company Onboarding Request - ${userData.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Company Onboarding Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">A company wants to partner with Greek organizations</p>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; margin: 20px 0;">
            <h2 style="color: #075985; margin-top: 0; font-size: 20px;">🏢 Company Information</h2>
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Company Name:</strong> <span style="color: #0f172a; font-size: 18px; font-weight: 600;">${userData.companyName}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Industry/Description:</strong></p>
              <div style="background: #f8fafc; padding: 12px; border-left: 3px solid #3b82f6; margin: 10px 0; border-radius: 4px;">
                <p style="margin: 0; color: #334155; line-height: 1.6;">${userData.companyDescription}</p>
              </div>
            </div>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">👤 Contact Person</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Name:</strong> <span style="color: #0f172a;">${userData.name}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Email:</strong> <a href="mailto:${userData.email}" style="color: #2563eb;">${userData.email}</a></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Submitted:</strong> <span style="color: #0f172a;">${new Date(userData.signupDate).toLocaleString()}</span></p>
            </div>
          </div>

          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b; font-weight: 600;">
              ⚡ ACTION REQUIRED: Review and approve this company for platform access
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fraternitybase.com/admin"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Review Company in Admin Dashboard →
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              <strong>Why review?</strong> Verify this is a legitimate company that would benefit from connecting with Greek organizations on your platform.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Error sending admin email:', error);
      return { success: false, error };
    }

    console.log('Admin notification sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
}

// Helper function to send user confirmation
async function sendUserConfirmation(userData: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userData.email,
      subject: 'Welcome to Fraternity Base - Application Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for signing up, ${userData.name}!</h2>

          <p style="color: #4b5563; line-height: 1.6;">
            We've received your application to join Fraternity Base. Our team is reviewing
            your information and will get back to you within 24 hours.
          </p>

          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Our team will review your company information</li>
              <li>You'll receive an approval email within 24 hours</li>
              <li>Once approved, you'll have access to your 14-day free trial</li>
              <li>You'll get 1 free chapter lookup to test our platform</li>
            </ul>
          </div>

          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <h4 style="color: #111827; margin-top: 0;">Your Submission Details:</h4>
            <p style="color: #4b5563; margin: 4px 0;"><strong>Company:</strong> ${userData.companyName}</p>
            <p style="color: #4b5563; margin: 4px 0;"><strong>Email:</strong> ${userData.email}</p>
            <p style="color: #4b5563; margin: 4px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span></p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            If you have any questions, feel free to reply to this email or contact our support team.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 12px;">
            © 2024 Fraternity Base. All rights reserved.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending user confirmation:', error);
      return { success: false, error };
    }

    console.log('User confirmation sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send user confirmation:', error);
    return { success: false, error };
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, companyName, companyDescription } = req.body;

    // Validate required fields
    if (!name || !email || !companyName || !companyDescription) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Create user object
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      companyName,
      companyDescription,
      signupDate: new Date().toISOString(),
      status: 'pending',
      verifiedAt: null,
      verifiedBy: null
    };

    // Store the signup (in production, save to database)
    signups.push(newUser);

    // Send email notifications
    const adminNotification = await sendAdminNotification(newUser);
    const userConfirmation = await sendUserConfirmation(newUser);

    // Log the results
    console.log('New signup processed:', {
      user: newUser.email,
      adminEmailSent: adminNotification.success,
      userEmailSent: userConfirmation.success
    });

    // Return success response
    res.json({
      success: true,
      message: 'Signup successful! Check your email for confirmation.',
      data: {
        id: newUser.id,
        status: newUser.status,
        emailsSent: {
          admin: adminNotification.success,
          user: userConfirmation.success
        }
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process signup',
      details: error.message
    });
  }
});

// Get all signups (admin endpoint)
app.get('/api/admin/signups', async (req, res) => {
  // In production, add authentication here
  res.json({
    success: true,
    data: signups
  });
});

// Update signup status (admin endpoint)
app.patch('/api/admin/signups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verifiedBy } = req.body;

    const signup = signups.find(s => s.id === id);
    if (!signup) {
      return res.status(404).json({
        success: false,
        error: 'Signup not found'
      });
    }

    // Update status
    signup.status = status;
    signup.verifiedAt = new Date().toISOString();
    signup.verifiedBy = verifiedBy || 'Admin';

    // Send approval/rejection email to user
    if (status === 'approved') {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: signup.email,
        subject: '✅ Your Fraternity Base Account is Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Great news, ${signup.name}!</h2>

            <p style="color: #4b5563; line-height: 1.6;">
              Your Fraternity Base account has been approved! You now have full access to
              your 14-day free trial with 1 chapter lookup included.
            </p>

            <a href="https://fraternitybase.com/login"
               style="display: inline-block; background: #10b981; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Access Your Account
            </a>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
              <h3 style="color: #166534; margin-top: 0;">Your Free Trial Includes:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>14 days of full platform access</li>
                <li>1 free chapter lookup to test our system</li>
                <li>Access to browse all universities and Greek organizations</li>
                <li>No credit card required</li>
              </ul>
            </div>
          </div>
        `
      });

      if (error) console.error('Error sending approval email:', error);
    }

    res.json({
      success: true,
      data: signup
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📧 Admin email: ${ADMIN_EMAIL}`);
  console.log(`📤 From email: ${FROM_EMAIL}`);
  console.log('\nEndpoints:');
  console.log(`  POST   /api/signup - Process new signups`);
  console.log(`  GET    /api/admin/signups - Get all signups (admin)`);
  console.log(`  PATCH  /api/admin/signups/:id - Update signup status (admin)`);
});
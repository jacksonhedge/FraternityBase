# College Org Network - Development Roadmap

## 🎯 Project Vision
A B2B SaaS platform connecting companies with Greek life organizations for partnerships, events, and ambassador programs.

## 📊 Phase 1: Authentication & User Management (Current)

### 1.1 Authentication System ✅
- [x] Set up Supabase for authentication
- [ ] Create sign-up flow with email verification
- [ ] Implement secure login with JWT tokens
- [ ] Add password reset functionality
- [ ] OAuth integration (Google, LinkedIn)

### 1.2 User Roles & Permissions
- **Company Users** (Customers)
  - Free Trial: 1 chapter lookup
  - Paid tiers with different access levels
  - Contact request capabilities

- **Admin Users** (Internal)
  - Full CRUD for fraternities/sororities
  - Contact management
  - Instagram data integration
  - Analytics dashboard
  - User management

### 1.3 Free Trial Implementation
- [ ] Track lookups per user
- [ ] Implement lookup limit (1 for free trial)
- [ ] Upgrade prompts when limit reached
- [ ] Trial expiration (14 days)

## 💳 Phase 2: Monetization & Payments

### 2.1 Stripe Integration
- [ ] Set up Stripe account and API keys
- [ ] Create subscription products and pricing tiers
- [ ] Implement payment flow
- [ ] Webhook handling for subscription events

### 2.2 Pricing Tiers
```
1. Free Trial
   - 1 chapter lookup
   - Basic information only
   - 14 days

2. Starter ($99/month)
   - 10 chapter lookups/month
   - Basic contact info
   - Email support

3. Growth ($299/month)
   - 50 chapter lookups/month
   - Full contact details
   - Contact request feature (5/month)
   - Export to CSV

4. Pro ($599/month)
   - Unlimited lookups
   - Unlimited contact requests
   - API access
   - Priority support
   - Advanced analytics

5. Enterprise (Custom)
   - Custom limits
   - Dedicated support
   - White-label options
   - Custom integrations
```

### 2.3 Usage Tracking
- [ ] Implement lookup counter
- [ ] Monthly usage reset
- [ ] Usage analytics dashboard
- [ ] Overage handling

## 🛠️ Phase 3: Admin Dashboard

### 3.1 Data Management Interface
- [ ] Fraternity/Sorority CRUD operations
- [ ] Chapter management by university
- [ ] Officer/contact management
- [ ] Event management
- [ ] Bulk import/export (CSV)

### 3.2 Data Fields for Organizations
```typescript
interface GreekOrganization {
  // Basic Info
  id: string;
  name: string;
  greekLetters: string;
  type: 'fraternity' | 'sorority' | 'honor_society';

  // Chapter Info
  university: string;
  chapterName: string;
  foundedDate: Date;
  status: 'active' | 'inactive' | 'suspended';

  // Metrics
  memberCount: number;
  engagementScore: number;
  eventFrequency: number;

  // Contact Info
  mainContact: {
    name: string;
    position: string;
    email: string;
    phone: string;
    linkedIn?: string;
  };
  officers: Officer[];

  // Social Media
  instagram: {
    handle: string;
    followers: number;
    avgEngagement: number;
    lastUpdated: Date;
  };
  facebook?: string;
  website?: string;

  // Partnership Info
  partnershipOpenness: 'open' | 'selective' | 'closed';
  pastPartners: string[];
  preferredIndustries: string[];
  philanthropyFocus: string;
}
```

### 3.3 Instagram Integration
- [ ] Instagram Basic Display API setup
- [ ] Automated data fetching
- [ ] Engagement metrics calculation
- [ ] Scheduled updates (weekly)

## 📧 Phase 4: Communication System

### 4.1 Contact Request System
- [ ] Request form with templates
- [ ] Request tracking dashboard
- [ ] Email notifications to chapters
- [ ] Response tracking
- [ ] Request history

### 4.2 Messaging Features
- [ ] In-app messaging system
- [ ] Email integration
- [ ] Message templates
- [ ] Bulk messaging (pro tier)

## 📈 Phase 5: Analytics & Insights

### 5.1 Company Analytics
- [ ] Lookup history
- [ ] Partnership success rate
- [ ] ROI tracking
- [ ] Engagement metrics

### 5.2 Admin Analytics
- [ ] User growth metrics
- [ ] Revenue analytics
- [ ] Platform usage statistics
- [ ] Chapter engagement scores

## 🚀 Phase 6: Advanced Features

### 6.1 AI-Powered Matching
- [ ] Company-chapter compatibility scoring
- [ ] Recommendation engine
- [ ] Predictive partnership success

### 6.2 API Access (Pro/Enterprise)
- [ ] RESTful API development
- [ ] API documentation
- [ ] Rate limiting
- [ ] API key management

### 6.3 Mobile App
- [ ] React Native development
- [ ] iOS and Android apps
- [ ] Push notifications

## 🔧 Technical Implementation Details

### Database Schema Updates
```sql
-- User Management
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  role VARCHAR(20) DEFAULT 'user',
  subscription_tier VARCHAR(20) DEFAULT 'free_trial',
  trial_lookups_used INTEGER DEFAULT 0,
  trial_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Management
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(20),
  status VARCHAR(20),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE
);

-- Usage Tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50), -- 'chapter_lookup', 'contact_request', 'export'
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact Requests
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  chapter_id UUID REFERENCES chapters(id),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);
```

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Instagram
INSTAGRAM_APP_ID=xxx
INSTAGRAM_APP_SECRET=xxx

# Email (SendGrid)
SENDGRID_API_KEY=xxx
```

## 📅 Timeline

- **Week 1-2**: Authentication system, user roles, Supabase setup
- **Week 3-4**: Stripe integration, payment flows, subscription management
- **Week 5-6**: Admin dashboard, data management interface
- **Week 7-8**: Contact request system, communication features
- **Week 9-10**: Analytics, testing, deployment
- **Week 11-12**: Mobile app development (MVP)

## 🎯 Success Metrics

- **User Acquisition**: 100 companies in first 3 months
- **Conversion Rate**: 20% free trial to paid
- **MRR Goal**: $10,000 by month 6
- **Chapter Coverage**: 1,000 chapters in database
- **User Satisfaction**: 4.5+ star rating

## 🚦 Current Status

✅ Frontend foundation complete
✅ Database schema designed
🔄 Authentication system in progress
⏳ Payment integration pending
⏳ Admin dashboard pending

## Next Steps

1. Connect Supabase and implement authentication
2. Create admin dashboard with protected routes
3. Set up Stripe and implement payment flows
4. Build contact request system
5. Deploy MVP and gather feedback
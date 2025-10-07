# FraternityBase API - Architecture & Implementation Plan

**Status:** Planned for Q2 2026
**Availability:** Enterprise Plan Only
**Pricing:** TBD (Custom Enterprise Pricing)

---

## Executive Summary

The FraternityBase API will provide programmatic access to our comprehensive database of 5,000+ Greek organizations, universities, chapters, members, and contacts. This API enables enterprise customers to integrate our data directly into their CRM systems, marketing automation tools, and custom applications.

**Key Value Propositions:**
- Eliminate manual data entry and copy-pasting from the web UI
- Automate lead generation and pipeline management
- Sync chapter data with CRM (Salesforce, HubSpot, etc.)
- Build custom dashboards and reporting tools
- Schedule automated outreach campaigns
- Integrate with existing marketing tech stacks

---

## 1. API Architecture Overview

### 1.1 Technology Stack

**API Framework:**
- **Node.js + Express.js** (existing backend stack)
- **RESTful API** architecture (industry standard, easy to integrate)
- **GraphQL** endpoint (optional, for advanced users who want flexible queries)

**Authentication:**
- **API Keys** - Simple bearer token authentication
- **OAuth 2.0** - For more secure server-to-server communication
- **JWT tokens** - For session management and stateless auth

**Rate Limiting:**
- **Redis** - For distributed rate limiting across API nodes
- Tiered limits based on plan (Enterprise = higher limits)

**Documentation:**
- **OpenAPI/Swagger** - Auto-generated interactive API docs
- **Postman Collection** - Pre-built request templates
- **SDK Libraries** - JavaScript/TypeScript, Python (popular languages)

**Infrastructure:**
- **Load Balancer** - Distribute API traffic across multiple servers
- **CDN** - Cache static responses (universities, fraternities list)
- **Monitoring** - DataDog/New Relic for performance tracking
- **Webhooks** - Push real-time updates to customers when data changes

---

## 2. API Endpoints Design

### 2.1 Core Resource Endpoints

#### **Universities**
```
GET    /api/v1/universities
GET    /api/v1/universities/:id
GET    /api/v1/universities/search?q={query}&state={state}
```

**Response Example:**
```json
{
  "data": {
    "id": "uuid-123",
    "name": "Penn State University",
    "location": "State College, PA",
    "state": "PA",
    "student_count": 46000,
    "greek_life_percentage": 17,
    "website": "https://psu.edu",
    "logo_url": "https://cdn.fraternitybase.com/logos/psu.png",
    "chapters_count": 67,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

#### **Greek Organizations (National Fraternities/Sororities)**
```
GET    /api/v1/organizations
GET    /api/v1/organizations/:id
GET    /api/v1/organizations?type=fraternity
GET    /api/v1/organizations?type=sorority
```

**Response Example:**
```json
{
  "data": {
    "id": "uuid-456",
    "name": "Sigma Chi",
    "greek_letters": "ΣΧ",
    "organization_type": "fraternity",
    "founded_year": 1855,
    "headquarters": "Evanston, IL",
    "total_chapters": 241,
    "total_members": 350000,
    "website": "https://sigmachi.org",
    "logo_url": "https://cdn.fraternitybase.com/logos/sigmachi.png",
    "motto": "In Hoc Signo Vinces",
    "colors": ["Blue", "Old Gold"]
  }
}
```

#### **Chapters** (The Core Asset)
```
GET    /api/v1/chapters
GET    /api/v1/chapters/:id
GET    /api/v1/chapters/search
POST   /api/v1/chapters/search (Advanced filtering)
GET    /api/v1/chapters/:id/members
GET    /api/v1/chapters/:id/contacts
GET    /api/v1/chapters/:id/officers
```

**Search Filters:**
- `university_id` - Filter by specific university
- `organization_id` - Filter by fraternity/sorority
- `state` - Filter by state
- `min_members` / `max_members` - Size range
- `five_star_rating` - Only premium quality chapters
- `has_contact_info` - Only chapters with available contacts
- `latitude` / `longitude` / `radius` - Geo search

**Response Example:**
```json
{
  "data": {
    "id": "uuid-789",
    "chapter_name": "Beta Theta",
    "organization": {
      "id": "uuid-456",
      "name": "Sigma Chi",
      "greek_letters": "ΣΧ"
    },
    "university": {
      "id": "uuid-123",
      "name": "Penn State University",
      "state": "PA"
    },
    "member_count": 145,
    "founded_date": "1888-03-15",
    "status": "active",
    "house_address": "420 E Fairmount Ave, State College, PA 16801",
    "website": "https://sigmachipsu.org",
    "instagram_handle": "@sigmachi_psu",
    "five_star_rating": true,
    "header_image_url": "https://cdn.fraternitybase.com/chapters/sigmachi-psu-header.jpg",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  },
  "pagination": {
    "page": 1,
    "per_page": 25,
    "total": 5243,
    "total_pages": 210
  }
}
```

#### **Contacts/Members** (Locked Behind Unlocks)
```
GET    /api/v1/chapters/:chapter_id/contacts
GET    /api/v1/contacts/:id
```

**Access Control:**
- Only return contacts for chapters the company has unlocked
- Return 403 Forbidden if not unlocked
- Include `unlock_status` in chapter response

**Response Example (Unlocked):**
```json
{
  "data": [
    {
      "id": "uuid-contact-1",
      "chapter_id": "uuid-789",
      "name": "Michael Thompson",
      "position": "President",
      "email": "mthompson@psu.edu",
      "phone": "(814) 555-0123",
      "major": "Business Administration",
      "graduation_year": 2026,
      "linkedin_url": "https://linkedin.com/in/mthompson",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### **Ambassadors**
```
GET    /api/v1/ambassadors
GET    /api/v1/ambassadors/:id
GET    /api/v1/ambassadors/search?skills={skill}&university_id={id}
```

**Response Example:**
```json
{
  "data": {
    "id": "uuid-amb-1",
    "first_name": "Tyler",
    "last_name_initial": "A",
    "university": {
      "id": "uuid-123",
      "name": "Penn State University"
    },
    "major": "Marketing",
    "graduation_year": 2026,
    "bio": "Passionate about brand partnerships...",
    "skills": ["Social Media", "Event Planning", "Brand Partnerships"],
    "experience_level": "Advanced",
    "rating": 4.8,
    "completed_campaigns": 12,
    "is_unlocked": false,
    "contact_info": null  // Null until unlocked
  }
}
```

#### **Venues/Bars** (Future)
```
GET    /api/v1/venues
GET    /api/v1/venues/:id
GET    /api/v1/venues/search?university_id={id}&type=bar
```

---

### 2.2 Account & Billing Endpoints

#### **Company Account**
```
GET    /api/v1/account
GET    /api/v1/account/balance
GET    /api/v1/account/unlocks
GET    /api/v1/account/transactions
```

#### **Unlocking Chapters**
```
POST   /api/v1/unlocks
  Body: { "chapter_id": "uuid-789", "unlock_type": "full_contacts" }

Response: { "success": true, "credits_spent": 9.99, "remaining_balance": 290.01 }
```

#### **Warm Introduction Requests**
```
POST   /api/v1/warm-intros/request
  Body: {
    "chapter_id": "uuid-789",
    "message": "We'd love to partner...",
    "urgency": "normal"
  }

Response: { "request_id": "uuid-req-1", "status": "pending", "credits_spent": 59.99 }
```

---

### 2.3 Webhooks (Push Notifications)

Enterprise customers can register webhook URLs to receive real-time updates:

**Webhook Events:**
- `chapter.created` - New chapter added to database
- `chapter.updated` - Chapter data updated (new contact, address change, etc.)
- `ambassador.created` - New ambassador added
- `university.created` - New university added
- `unlock.successful` - Your unlock was processed
- `warm_intro.accepted` - Your warm intro request was accepted
- `warm_intro.completed` - Intro successfully made

**Webhook Payload Example:**
```json
{
  "event": "chapter.created",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "chapter_id": "uuid-new-chapter",
    "chapter_name": "Alpha Beta",
    "organization": "Sigma Chi",
    "university": "Ohio State University",
    "state": "OH"
  }
}
```

---

## 3. Authentication & Security

### 3.1 API Key Management

**Generation:**
- Customers generate API keys from dashboard
- Keys have names/descriptions (e.g., "Production CRM", "Test Environment")
- Keys can be rotated/revoked at any time

**Usage:**
```bash
curl -H "Authorization: Bearer sk_live_abc123xyz..." \
     https://api.fraternitybase.com/v1/chapters
```

**Security Features:**
- Keys stored hashed in database (bcrypt)
- Rate limiting per key (1000 requests/hour for Enterprise)
- IP whitelisting (optional)
- HTTPS only (TLS 1.2+)
- Request signing (HMAC) for sensitive operations

---

### 3.2 Rate Limiting Tiers

| Plan | Requests/Hour | Requests/Day | Webhooks |
|------|--------------|--------------|----------|
| Monthly Subscription | No API Access | No API Access | No |
| Enterprise | 5,000 | 100,000 | Yes (100/day) |
| Enterprise Plus | 20,000 | 500,000 | Yes (Unlimited) |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4847
X-RateLimit-Reset: 1642089600
```

---

## 4. Use Cases & Integration Examples

### 4.1 CRM Integration (Salesforce/HubSpot)

**Scenario:** Marketing team wants chapter contacts automatically synced to Salesforce as leads

**Implementation:**
1. Run daily cron job on their server
2. Call `/api/v1/chapters/search` with filters (e.g., state=PA, min_members=100)
3. For each chapter, check if already in Salesforce
4. If new, call `/api/v1/unlocks` to unlock chapter
5. Call `/api/v1/chapters/:id/contacts` to get officers
6. Create Salesforce leads with chapter context
7. Tag leads with custom fields (chapter size, university, etc.)

**Benefits:**
- Sales team has qualified leads ready to call
- No manual data entry
- Always up-to-date contact info

---

### 4.2 Marketing Automation (Marketo/Pardot)

**Scenario:** Brand wants to send automated email campaigns to chapters in SEC states

**Implementation:**
1. Call `/api/v1/chapters/search?state=AL,GA,FL,TN,LA,MS` (SEC states)
2. Filter for chapters with `five_star_rating: true`
3. Unlock chapters (or check if already unlocked)
4. Get contact emails via `/api/v1/chapters/:id/contacts`
5. Import emails to Marketo
6. Trigger drip campaign with personalized chapter data

**Benefits:**
- Segment by geography, size, engagement
- Personalize emails with chapter-specific data
- Track campaign performance by chapter attributes

---

### 4.3 Custom Dashboard (React + Charts)

**Scenario:** Enterprise wants internal dashboard showing unlocked chapters on a map

**Implementation:**
```javascript
// Fetch all unlocked chapters
const response = await fetch('https://api.fraternitybase.com/v1/account/unlocks', {
  headers: { 'Authorization': 'Bearer sk_live_...' }
});

const unlocks = await response.json();

// Plot on map using chapter lat/lng
const mapData = unlocks.data.map(unlock => ({
  lat: unlock.chapter.latitude,
  lng: unlock.chapter.longitude,
  name: unlock.chapter.chapter_name,
  university: unlock.chapter.university.name
}));

// Render with Mapbox/Google Maps
<MapboxMap data={mapData} />
```

**Benefits:**
- Visualize geographic coverage
- Identify gaps in target markets
- Share with executive team

---

### 4.4 Outreach Automation Tool

**Scenario:** Build internal tool to automate warm intro requests

**Implementation:**
```javascript
// Find chapters matching criteria
const chapters = await fraternityBase.chapters.search({
  state: 'CA',
  organization: 'Sigma Chi',
  min_members: 80
});

// Request warm intros for top 10
for (const chapter of chapters.data.slice(0, 10)) {
  await fraternityBase.warmIntros.request({
    chapter_id: chapter.id,
    message: `Hi! We're ${companyName} and we'd love to partner with ${chapter.chapter_name}...`,
    urgency: 'high'
  });
}
```

**Benefits:**
- Scale outreach to hundreds of chapters
- Consistent messaging
- Track intro request status via API

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Backend API Development:**
- [ ] Set up Express.js API routes in `/backend/src/api/v1/`
- [ ] Implement API key authentication middleware
- [ ] Create rate limiting with Redis
- [ ] Build core endpoints (universities, organizations, chapters)
- [ ] Add pagination and filtering logic
- [ ] Implement access control (unlock checking)
- [ ] Error handling and validation (Joi/Zod schemas)

**Database Optimization:**
- [ ] Add indexes for API query patterns (state, organization_id, etc.)
- [ ] Create materialized views for common aggregations
- [ ] Set up read replicas for API traffic (separate from web app)

**Security:**
- [ ] API key generation/storage system
- [ ] HTTPS enforcement
- [ ] Request logging and audit trails
- [ ] DDoS protection (Cloudflare)

---

### Phase 2: Advanced Features (Months 3-4)

**Endpoints:**
- [ ] Advanced search with POST body (complex filters)
- [ ] Contacts/members endpoints with unlock checking
- [ ] Ambassadors endpoints
- [ ] Account/billing endpoints
- [ ] Unlock endpoints (purchase via API)
- [ ] Warm intro request endpoints

**Developer Experience:**
- [ ] OpenAPI/Swagger documentation
- [ ] Postman collection
- [ ] Code examples in docs (curl, JavaScript, Python)
- [ ] Error codes reference guide
- [ ] Interactive API explorer

**Testing:**
- [ ] Unit tests for all endpoints (Jest)
- [ ] Integration tests (Supertest)
- [ ] Load testing (k6/Artillery)
- [ ] Security testing (OWASP)

---

### Phase 3: Enterprise Features (Months 5-6)

**Webhooks:**
- [ ] Webhook registration system
- [ ] Event queue (Redis/RabbitMQ)
- [ ] Retry logic with exponential backoff
- [ ] Webhook signature verification (HMAC)
- [ ] Webhook logs and debugging UI

**SDKs:**
- [ ] JavaScript/TypeScript SDK (`npm install @fraternitybase/sdk`)
- [ ] Python SDK (`pip install fraternitybase`)
- [ ] Auto-generated from OpenAPI spec

**GraphQL (Optional):**
- [ ] GraphQL endpoint for flexible queries
- [ ] GraphQL Playground
- [ ] Schema documentation

**Analytics:**
- [ ] API usage dashboard for customers
- [ ] Endpoint performance metrics
- [ ] Most popular queries/filters
- [ ] Credit consumption tracking

---

### Phase 4: Launch & Support (Month 7+)

**Documentation:**
- [ ] Getting Started guide
- [ ] Authentication guide
- [ ] Rate limiting guide
- [ ] Use case tutorials (CRM sync, automation, etc.)
- [ ] API changelog
- [ ] Migration guides for API updates

**Customer Onboarding:**
- [ ] Sandbox environment for testing
- [ ] Test API keys with sample data
- [ ] Onboarding call for Enterprise customers
- [ ] Slack/Discord channel for API support

**Monitoring:**
- [ ] Real-time API health dashboard
- [ ] Error rate alerts (PagerDuty)
- [ ] Performance monitoring (DataDog/New Relic)
- [ ] Customer usage alerts (quota warnings)

---

## 6. Technical Architecture Details

### 6.1 Request Flow

```
Client → Cloudflare (DDoS) → Load Balancer → API Server (Node.js)
                                                     ↓
                                            Auth Middleware
                                                     ↓
                                            Rate Limit Check (Redis)
                                                     ↓
                                            Business Logic
                                                     ↓
                                            Database Query (Supabase/Postgres)
                                                     ↓
                                            Response Serialization
                                                     ↓
                                            Client ← JSON Response
```

### 6.2 Database Schema Additions

**New Tables:**

```sql
-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,  -- bcrypt hash of key
  key_prefix VARCHAR(20) NOT NULL,  -- First 8 chars for display (sk_live_abc123...)
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  rate_limit_tier VARCHAR(50) DEFAULT 'enterprise',  -- enterprise, enterprise_plus
  ip_whitelist JSONB  -- Array of allowed IPs
);

-- API Request Logs
CREATE TABLE api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id),
  company_id UUID REFERENCES companies(id),
  method VARCHAR(10),  -- GET, POST, etc.
  endpoint VARCHAR(500),
  query_params JSONB,
  response_status INT,
  response_time_ms INT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Limiting (using Redis instead, but can track in DB)
CREATE TABLE rate_limits (
  api_key_id UUID REFERENCES api_keys(id),
  window_start TIMESTAMPTZ,
  request_count INT,
  PRIMARY KEY (api_key_id, window_start)
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  events JSONB NOT NULL,  -- Array of subscribed events
  secret VARCHAR(255) NOT NULL,  -- For HMAC signature
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Deliveries
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  payload JSONB,
  response_status INT,
  response_body TEXT,
  attempt_count INT DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 Caching Strategy

**Redis Cache Layers:**

1. **Static Data (24 hour TTL):**
   - Universities list
   - Organizations list
   - State/filter options

2. **Chapter Data (1 hour TTL):**
   - Individual chapter details
   - Aggregated chapter stats

3. **Search Results (15 min TTL):**
   - Common search queries
   - Paginated results

4. **Rate Limits (Rolling Window):**
   - Request counts per API key
   - Reset times

**Cache Invalidation:**
- Webhook triggers when chapter updated
- Admin dashboard "clear cache" button
- Automatic TTL expiration

---

## 7. Pricing & Monetization

### 7.1 Pricing Tiers (Recommendations)

| Feature | Enterprise | Enterprise Plus |
|---------|-----------|-----------------|
| Monthly Base | $2,499/month | $7,999/month |
| API Requests | 100,000/month included | 500,000/month included |
| Overage Rate | $0.01 per request | $0.005 per request |
| Chapter Unlocks | Pay per unlock ($9.99) | 100 included/month |
| Warm Intros | Pay per intro ($59.99) | 25 included/month |
| Webhooks | 100/day | Unlimited |
| Support | Email (24hr SLA) | Slack + Priority |
| Custom SLA | No | Yes (99.9% uptime) |

### 7.2 Revenue Projections

**Assumptions:**
- 5 Enterprise customers by end of Year 1
- Average $3,500/month per customer (base + overages)

**Year 1 Revenue from API:**
- 5 customers × $3,500 × 12 months = **$210,000 ARR**

**Year 2 Targets:**
- 15 Enterprise customers
- 3 Enterprise Plus customers
- Estimated ARR: **$810,000**

---

## 8. Risks & Mitigation

### 8.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **API Downtime** | Lost customer trust, SLA violations | Load balancing, auto-scaling, 99.9% uptime monitoring |
| **Data Breach** | Massive liability, PR disaster | Encryption at rest/transit, API key rotation, audit logs |
| **Database Overload** | Slow responses, timeouts | Read replicas, caching, query optimization, pagination |
| **Abuse/Scraping** | Data theft, server costs spike | Rate limiting, anomaly detection, IP blocking |
| **Breaking Changes** | Customer integrations break | API versioning (/v1/, /v2/), deprecation notices (6mo+) |

### 8.2 Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Low Adoption** | R&D costs not recovered | Market research, beta program, incentives |
| **Support Burden** | High support costs eat margin | Great documentation, self-service tools, community |
| **Competition** | Others launch similar APIs | Unique data (ambassadors, venues), superior DX |
| **Compliance** | GDPR, data privacy lawsuits | Legal review, consent tracking, right to deletion |

---

## 9. Success Metrics

### 9.1 Launch Metrics (First 90 Days)

- **Adoption:** 3 Enterprise customers using API
- **Usage:** 50,000+ API requests/month
- **Uptime:** 99.5%+ availability
- **Performance:** <200ms average response time
- **Errors:** <1% error rate

### 9.2 Long-term Metrics (Year 1)

- **Revenue:** $200k+ ARR from API customers
- **Retention:** 90%+ customer retention
- **NPS:** Net Promoter Score 50+
- **Integrations:** 2+ CRM integrations documented (Salesforce, HubSpot)
- **Developer Satisfaction:** 4.5/5 stars for API docs/DX

---

## 10. Next Steps & Decision Points

### Immediate Actions (Pre-Development):

1. **Market Validation:**
   - Survey current customers about API interest
   - Interview 5-10 Enterprise prospects
   - Validate pricing assumptions

2. **Technical Scoping:**
   - Hire/assign backend engineer for API development
   - Audit current database schema for API readiness
   - Choose monitoring/analytics tools (DataDog vs New Relic)

3. **Legal/Compliance:**
   - Review Terms of Service for API usage
   - Add API-specific sections (rate limits, data usage, etc.)
   - GDPR compliance review for data exports

4. **Go-to-Market:**
   - Create API landing page on website
   - Prepare sales collateral (API pitch deck, case studies)
   - Set up demo environment for sales calls

### Key Decision Points:

**Q1:** Proceed with API development?
- **If YES:** Hire engineer, allocate budget ($50k-100k dev costs)
- **If NO:** Revisit after hitting 100 paying customers

**Q2:** GraphQL in addition to REST?
- **If YES:** Adds flexibility but increases complexity
- **If NO:** Keep it simple, REST only for v1

**Q3:** Build SDKs or rely on auto-generated?
- **If YES:** Better DX but more maintenance
- **If NO:** Use OpenAPI generators (swagger-codegen)

---

## Conclusion

The FraternityBase API represents a **significant revenue opportunity** and a **competitive moat**. By giving Enterprise customers programmatic access to our data, we unlock use cases that the web UI cannot support (CRM sync, automation, custom dashboards).

**Key Success Factors:**
1. **Excellent Developer Experience** - Great docs, SDKs, examples
2. **Reliability** - 99.9% uptime, fast responses, predictable performance
3. **Security** - API keys, rate limiting, audit logs, encryption
4. **Support** - Responsive to customer needs, quick bug fixes

**Recommended Approach:**
- **Start Small:** Launch v1 with core endpoints (chapters, universities, contacts)
- **Iterate Fast:** Weekly releases, customer feedback loop
- **Scale Gradually:** Add webhooks, GraphQL, SDKs based on demand

The API will position FraternityBase as the **industry-standard data platform** for Greek life marketing, rather than just another web app.

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Owner:** Engineering & Product Team

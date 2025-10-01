# Fraternity Data Collection Strategy

## 🎯 Goal
Build the most comprehensive Greek life database in the industry by collecting chapter data for all 58 NIC fraternities.

## 📊 Current Status

### ✅ Completed
- **Sigma Chi**: 240 chapters (100% complete with geocoding)

### 🔄 In Progress
- Geocoding Sigma Chi chapters with lat/long coordinates
- Building scraper infrastructure

### 📋 Next Steps
- Add remaining 57 NIC fraternities

---

## 🏛️ The 58 NIC Fraternities

### Tier 1: Top 10 Largest Fraternities (Priority)
These represent ~60% of all Greek life members.

| Fraternity | Approx Chapters | Est. Members | Priority |
|------------|----------------|--------------|----------|
| **Sigma Chi** | 240 | 18,000+ | ✅ DONE |
| **Sigma Alpha Epsilon** | 230+ | 15,000+ | 🔴 HIGH |
| **Pi Kappa Alpha** | 220+ | 15,000+ | 🔴 HIGH |
| **Beta Theta Pi** | 180+ | 14,000+ | 🔴 HIGH |
| **Sigma Nu** | 175+ | 13,000+ | 🔴 HIGH |
| **Lambda Chi Alpha** | 170+ | 12,000+ | 🔴 HIGH |
| **Alpha Tau Omega** | 160+ | 11,000+ | 🔴 HIGH |
| **Delta Tau Delta** | 145+ | 10,000+ | 🔴 HIGH |
| **Phi Delta Theta** | 185+ | 10,000+ | 🔴 HIGH |
| **Kappa Sigma** | 320+ | 17,000+ | 🔴 HIGH |

**Total Tier 1**: ~2,025 chapters, ~135,000 members

### Tier 2: Medium Fraternities (11-25)
Solid presence at D1 schools.

| Fraternity | Approx Chapters | Category |
|------------|----------------|----------|
| Pi Kappa Phi | 190+ | General |
| Phi Kappa Psi | 100+ | General |
| Delta Chi | 120+ | General |
| Theta Chi | 150+ | General |
| Sigma Phi Epsilon | 220+ | General |
| Alpha Epsilon Pi | 90+ | Jewish Heritage |
| Zeta Beta Tau | 80+ | Jewish Heritage |
| Alpha Gamma Rho | 70+ | Agricultural |
| FarmHouse | 30+ | Agricultural |
| Triangle | 35+ | Engineering/Science |
| Theta Xi | 55+ | Engineering |
| Phi Gamma Delta (FIJI) | 145+ | General |
| Phi Kappa Tau | 90+ | General |
| Delta Sigma Phi | 110+ | General |
| Delta Upsilon | 80+ | General |

**Total Tier 2**: ~1,565 chapters

### Tier 3: NPHC & Multicultural (Divine Nine + Others)
Historically important, but smaller chapter counts.

| Fraternity | Type | Chapters |
|------------|------|----------|
| Alpha Phi Alpha | NPHC | 900+ (includes alumni chapters) |
| Kappa Alpha Psi | NPHC | 700+ (includes alumni chapters) |
| Iota Phi Theta | NPHC | 320+ (includes alumni chapters) |
| Lambda Theta Phi | Latino | 90+ |
| Omega Delta Phi | Latino | 150+ |
| Lambda Sigma Upsilon | Latino | 75+ |
| Nu Alpha Kappa | Latino | 65+ |
| Phi Iota Alpha | Latino | 100+ |
| Iota Nu Delta | South Asian | 30+ |
| Sigma Beta Rho | South Asian | 20+ |

**Total Tier 3**: ~2,450 chapters (many are alumni/grad chapters)

### Tier 4: Smaller/Specialty Fraternities
Niche, regional, or emerging.

- Beta Chi Theta (Multicultural)
- Beta Upsilon Chi (Christian)
- Delta Lambda Phi (LGBTQ+)
- Phi Eta Psi
- Phi Sigma Phi (Multicultural)
- Chi Phi, Chi Psi, Delta Phi, Psi Upsilon (Historic but smaller)
- And 20+ others

**Total Tier 4**: ~400 chapters

---

## 📈 Total Addressable Market

- **Total NIC Chapters**: ~6,500 undergraduate chapters
- **Total Members**: ~400,000 undergraduates
- **Alumni**: ~5 million nationally

---

## 🎯 Data Collection Strategy

### Phase 1: Foundation (Weeks 1-2) ✅ IN PROGRESS
- [x] Build scraper infrastructure
- [x] Complete Sigma Chi (240 chapters)
- [ ] Add top 5 fraternities (Tier 1)
  - SAE, Pike, Beta, Sigma Nu, Lambda Chi

**Deliverable**: 1,200+ chapters across 6 fraternities

### Phase 2: Scale (Weeks 3-4)
- [ ] Add remaining Tier 1 (5 more fraternities)
- [ ] Add top 10 from Tier 2
- [ ] Start geocoding all chapters

**Deliverable**: 3,000+ chapters across 21 fraternities

### Phase 3: Comprehensive (Month 2)
- [ ] Add all remaining Tier 2
- [ ] Add Tier 3 (NPHC + Multicultural)
- [ ] Quality control and data enrichment

**Deliverable**: 5,500+ chapters across 45+ fraternities

### Phase 4: Long Tail (Ongoing)
- [ ] Add Tier 4 fraternities
- [ ] Historical/inactive chapters
- [ ] Data refresh (quarterly)

**Deliverable**: 6,500+ total chapters, all 58 NIC fraternities

---

## 🛠️ Technical Approach

### Data Sources (In Priority Order)

1. **Official Fraternity Websites** (Best)
   - Most fraternities have chapter directories
   - Example: sigmachi.org/chapters
   - Pros: Accurate, up-to-date, includes status
   - Cons: Different format per fraternity, some require login

2. **University Greek Life Offices** (Good)
   - Each D1 school lists their chapters
   - Example: greeklife.ua.edu
   - Pros: Verified by school, includes contact info
   - Cons: Manual per school, may be outdated

3. **GreekRank / Wikipedia** (Backup)
   - Crowdsourced chapter counts
   - Pros: Quick overview, free
   - Cons: Not always accurate, no details

4. **Social Media** (Enrichment)
   - Instagram, Facebook, LinkedIn
   - Pros: Follower counts, engagement, photos
   - Cons: Not all chapters have accounts

### Data Points Per Chapter

**Core** (Required):
- Fraternity name
- Chapter designation (e.g., "Alpha Chi")
- University name
- City, State
- Status (active/inactive/colony)
- Latitude/Longitude

**Enhanced** (Nice to have):
- Street address
- Founded year at school
- Member count
- Chapter house (Yes/No)
- Instagram handle + follower count
- Website
- President name/email

**Premium** (For top chapters):
- Full roster (names only)
- Officer list
- LinkedIn profiles
- Recent news/events
- Recruitment stats

---

## 💰 Business Impact

### Revenue Potential

With 6,500 chapters fully cataloged:

**Scenario 1: Low Engagement**
- 500 companies buy credits
- Average $500/month subscription
- **Revenue**: $250K/month = $3M/year

**Scenario 2: Medium Engagement**
- 1,500 companies (corporate recruiters, startups, brands)
- Average $800/month
- **Revenue**: $1.2M/month = $14.4M/year

**Scenario 3: High Engagement**
- 3,000 companies + premium features
- Average $1,200/month
- **Revenue**: $3.6M/month = $43.2M/year

### Competitive Advantage

No one else has this data:
- GreekRank: Social reviews, no structured data
- University websites: Fragmented, outdated
- LinkedIn: Can't bulk search by fraternity
- National orgs: Protect member data
- **FraternityBase**: The only centralized, verified database

---

## 🚀 Next Actions

### Immediate (This Week):
1. ✅ Finish Sigma Chi geocoding
2. ⏳ Scrape SAE chapters (230+)
3. ⏳ Scrape Pike chapters (220+)
4. ⏳ Deploy database to Supabase
5. ⏳ Test with real credit system

### Short Term (This Month):
1. Complete all Tier 1 fraternities (2,000+ chapters)
2. Build admin dashboard for data entry
3. Add Instagram integration for follower counts
4. Quality check top 50 D1 schools

### Medium Term (Next 3 Months):
1. All 58 NIC fraternities mapped
2. 5,500+ active chapters geocoded
3. Social media integration (Instagram + LinkedIn)
4. Chapter rosters for top 100 chapters
5. Launch beta to first 10 customers

---

## 📊 Success Metrics

- **Coverage**: % of NIC chapters in database
- **Accuracy**: % of addresses geocoded correctly
- **Freshness**: Days since last data update
- **Depth**: % of chapters with social media data
- **Completeness**: Average data points per chapter

**Target for Launch**:
- 2,000+ chapters (Top 10 fraternities)
- 95%+ geocoding accuracy
- 50%+ with Instagram data
- Ready for customer beta testing

---

## 🎓 Notes

- NPHC fraternities (Divine Nine) have many **graduate/alumni chapters** that don't fit our B2B model (we focus on undergrads)
- Some fraternities have **colonies** (new chapters forming) - lower data quality
- **Chapter closure**: ~50-100 chapters close/year, need quarterly updates
- Most valuable data: **Top 200 chapters** at major D1 schools (80/20 rule)

---

*Last Updated: 2025-09-29*
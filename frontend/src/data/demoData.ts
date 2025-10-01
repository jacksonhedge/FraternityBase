// Comprehensive demo data for all detail views

export const fraternityDetails = {
  'sigma-chi': {
    name: 'Sigma Chi',
    nationalFounded: 1855,
    motto: 'In Hoc Signo Vinces',
    colors: ['Blue', 'Old Gold'],
    symbol: 'The White Cross',
    flower: 'White Rose',
    headquarters: 'Evanston, Illinois',
    activeChapters: 247,
    totalMembers: 350000,
    notableAlumni: [
      'Brad Pitt - Actor',
      'John Wayne - Actor',
      'David Letterman - TV Host',
      'Grover Cleveland - 22nd & 24th President',
      'Barry Goldwater - Senator',
      'Tom Selleck - Actor'
    ],
    philanthropy: 'Huntsman Cancer Institute',
    annualRaised: '$2.8M',
    description: 'Founded on the principles of Friendship, Justice, and Learning, Sigma Chi has become one of the largest and most successful fraternities in North America.',
    coreValues: [
      'Friendship - Building lifelong bonds',
      'Justice - Standing for what is right',
      'Learning - Continuous self-improvement',
      'Service - Giving back to communities',
      'Leadership - Developing tomorrow\'s leaders'
    ]
  },
  'phi-delta-theta': {
    name: 'Phi Delta Theta',
    nationalFounded: 1848,
    motto: 'One Man is No Man',
    colors: ['Azure', 'Argent'],
    symbol: 'Sword and Shield',
    flower: 'White Carnation',
    headquarters: 'Oxford, Ohio',
    activeChapters: 191,
    totalMembers: 310000,
    notableAlumni: [
      'Neil Armstrong - First man on moon',
      'Lou Gehrig - Baseball legend',
      'Burt Reynolds - Actor',
      'Benjamin Harrison - 23rd President',
      'Roger Ebert - Film critic'
    ],
    philanthropy: 'ALS Association',
    annualRaised: '$1.9M',
    description: 'The first member of the Miami Triad, Phi Delta Theta promotes friendship, sound learning, and rectitude.',
    coreValues: [
      'Friendship - The sweetest influence',
      'Sound Learning - Academic excellence',
      'Rectitude - Moral uprightness',
      'Brotherhood - Lifelong commitment',
      'Excellence - In all endeavors'
    ]
  }
};

export const eventDetails = {
  'greek-week-2025': {
    name: 'Greek Week 2025',
    date: 'April 10-17, 2025',
    location: 'Penn State University',
    type: 'Competition & Philanthropy',
    attendance: 5000,
    participatingOrgs: 45,
    schedule: [
      { day: 'Monday', event: 'Opening Ceremony', time: '6:00 PM', location: 'HUB Ballroom' },
      { day: 'Tuesday', event: 'Greek Sing Competition', time: '7:00 PM', location: 'Eisenhower Auditorium' },
      { day: 'Wednesday', event: 'Sports Day', time: '12:00 PM', location: 'IM Fields' },
      { day: 'Thursday', event: 'Service Day', time: '9:00 AM', location: 'Various Locations' },
      { day: 'Friday', event: 'Talent Show', time: '8:00 PM', location: 'Schwab Auditorium' },
      { day: 'Saturday', event: 'Greek Games', time: '10:00 AM', location: 'Old Main Lawn' },
      { day: 'Sunday', event: 'Awards Banquet', time: '5:00 PM', location: 'Nittany Lion Inn' }
    ],
    sponsors: [
      { name: 'Nike', level: 'Platinum', amount: '$50,000' },
      { name: 'Chipotle', level: 'Gold', amount: '$25,000' },
      { name: 'State Farm', level: 'Silver', amount: '$15,000' }
    ],
    beneficiary: 'THON - Penn State Dance Marathon',
    fundsRaised: '$285,000',
    description: 'The largest Greek Week in the nation, bringing together all fraternity and sorority chapters for a week of competition, service, and celebration.',
    competitions: [
      'Greek Sing - Musical performances',
      'Greek Games - Athletic competitions',
      'Banner Competition - Artistic displays',
      'Penny Wars - Fundraising challenge',
      'Talent Show - Individual performances'
    ]
  },
  'derby-days-2025': {
    name: 'Sigma Chi Derby Days 2025',
    date: 'March 20-25, 2025',
    location: 'University of Alabama',
    type: 'Philanthropy',
    attendance: 3500,
    participatingOrgs: 28,
    schedule: [
      { day: 'Monday', event: 'Kickoff & Coaches Meeting', time: '5:00 PM', location: 'Ferguson Center' },
      { day: 'Tuesday', event: 'Derby Dancing', time: '6:00 PM', location: 'Quad' },
      { day: 'Wednesday', event: 'Derby Desserts', time: '7:00 PM', location: 'Sigma Chi House' },
      { day: 'Thursday', event: 'Service Projects', time: '3:00 PM', location: 'Various' },
      { day: 'Friday', event: 'Derby Days Field Events', time: '4:00 PM', location: 'Rec Fields' },
      { day: 'Saturday', event: 'Championship & Awards', time: '2:00 PM', location: 'Coleman Coliseum' }
    ],
    sponsors: [
      { name: 'Red Bull', level: 'Title', amount: '$30,000' },
      { name: 'Jimmy Johns', level: 'Gold', amount: '$15,000' },
      { name: 'Campus Bookstore', level: 'Silver', amount: '$10,000' }
    ],
    beneficiary: 'Huntsman Cancer Institute',
    fundsRaised: '$125,000',
    description: 'Sigma Chi\'s signature philanthropy event, bringing sororities together for friendly competition while raising funds for cancer research.',
    competitions: [
      'Derby Dancing - Choreographed performances',
      'Field Events - Relay races and games',
      'Penny Wars - Fundraising competition',
      'Banner Contest - Creative displays',
      'Spirit Award - Overall participation'
    ]
  }
};

export const partnershipDetails = {
  'nike-partnership': {
    company: 'Nike',
    type: 'Apparel Partnership',
    value: '$2.5M',
    duration: '5 years',
    startDate: 'January 2024',
    endDate: 'December 2028',
    benefits: [
      'Exclusive Greek apparel designs',
      'Custom chapter merchandise',
      '40% discount for all members',
      'Priority access to new releases',
      'Sponsored athletic events',
      'Professional development workshops'
    ],
    deliverables: [
      'Brand ambassadorship program',
      'Social media promotion',
      'Event sponsorship opportunities',
      'Product testing and feedback',
      'Recruitment material co-branding'
    ],
    contact: {
      name: 'Sarah Johnson',
      title: 'Greek Life Partnership Manager',
      email: 'sarah.johnson@nike.com',
      phone: '(503) 555-0100'
    },
    performanceMetrics: {
      socialReach: '2.5M impressions/month',
      salesGenerated: '$450K/year',
      eventAttendance: '15,000+ annually',
      brandSentiment: '92% positive'
    }
  },
  'chipotle-partnership': {
    company: 'Chipotle',
    type: 'Food & Event Sponsor',
    value: '$500K',
    duration: '2 years',
    startDate: 'August 2024',
    endDate: 'July 2026',
    benefits: [
      'Catering for major events',
      'Fundraising nights (33% of sales)',
      'BOGO cards for recruitment',
      'VIP rewards program',
      'Sponsored study breaks'
    ],
    deliverables: [
      'Monthly fundraising events',
      'Social media campaigns',
      'Campus brand activation',
      'Student feedback panels'
    ],
    contact: {
      name: 'Mike Rodriguez',
      title: 'University Relations Director',
      email: 'mrodriguez@chipotle.com',
      phone: '(303) 555-0200'
    },
    performanceMetrics: {
      eventsHosted: '48/year',
      fundsRaised: '$85K for chapters',
      studentEngagement: '8,500+ participants',
      appDownloads: '3,200 attributed'
    }
  }
};

export const ambassadorProfiles = {
  'jackson-fitzgerald': {
    name: 'Jackson Fitzgerald',
    title: 'FraternityBase Campus Ambassador',
    university: 'Penn State',
    chapter: 'Sigma Chi',
    year: 'Senior',
    major: 'Business & Entrepreneurship',
    email: 'jacksonfitzgerald25@gmail.com',
    phone: '(814) 555-0150',
    linkedIn: 'linkedin.com/in/jacksonfitzgerald',
    instagram: '@jackfitz_psu',
    bio: 'Passionate about connecting Greek organizations with meaningful partnerships. Founded two startups and served as IFC Vice President.',
    achievements: [
      'Secured $500K in sponsorships for Greek community',
      'Organized largest Greek Week in Penn State history',
      'IFC Man of the Year 2024',
      'Founded campus entrepreneurship club',
      'Published research on Greek life impact'
    ],
    responsibilities: [
      'Onboard new chapters to platform',
      'Facilitate brand partnerships',
      'Host monthly training workshops',
      'Create content for social media',
      'Provide platform feedback and testing'
    ],
    metrics: {
      chaptersOnboarded: 24,
      partnershipsCreated: 15,
      revenueGenerated: '$285K',
      eventsHosted: 12,
      satisfactionScore: 4.8
    }
  },
  'sarah-thompson': {
    name: 'Sarah Thompson',
    title: 'Regional Ambassador Lead',
    university: 'University of Alabama',
    chapter: 'Delta Delta Delta',
    year: 'Junior',
    major: 'Marketing & Communications',
    email: 'sthompson@ua.edu',
    phone: '(205) 555-0175',
    linkedIn: 'linkedin.com/in/sarahthompson',
    instagram: '@sarah_ddd_ua',
    bio: 'Dedicated to empowering Greek organizations through strategic partnerships and innovative fundraising solutions.',
    achievements: [
      'Panhellenic President 2024',
      'Raised $150K for St. Jude',
      'Greek Woman of the Year 2024',
      'Marketing Intern at Nike',
      'Published in Greek Life Today magazine'
    ],
    responsibilities: [
      'Train new ambassadors',
      'Manage Southeast region',
      'Coordinate with nationals',
      'Develop best practices',
      'Lead monthly webinars'
    ],
    metrics: {
      chaptersOnboarded: 31,
      partnershipsCreated: 22,
      revenueGenerated: '$420K',
      eventsHosted: 18,
      satisfactionScore: 4.9
    }
  }
};

export const analyticsData = {
  overview: {
    totalUsers: 15420,
    activeChapters: 847,
    totalRevenue: '$3.2M',
    growthRate: '+45%',
    avgEngagement: '72%',
    netPromoterScore: 68
  },
  userMetrics: {
    daily: [
      { date: 'Mon', users: 3200, newUsers: 145 },
      { date: 'Tue', users: 3450, newUsers: 189 },
      { date: 'Wed', users: 3800, newUsers: 201 },
      { date: 'Thu', users: 4100, newUsers: 245 },
      { date: 'Fri', users: 4500, newUsers: 298 },
      { date: 'Sat', users: 3900, newUsers: 167 },
      { date: 'Sun', users: 3100, newUsers: 134 }
    ],
    demographics: {
      undergrad: 78,
      graduate: 12,
      alumni: 10
    },
    devices: {
      mobile: 62,
      desktop: 31,
      tablet: 7
    }
  },
  financialMetrics: {
    revenue: [
      { month: 'Jan', amount: 245000, growth: 12 },
      { month: 'Feb', amount: 278000, growth: 15 },
      { month: 'Mar', amount: 312000, growth: 22 },
      { month: 'Apr', amount: 298000, growth: 18 },
      { month: 'May', amount: 265000, growth: 8 },
      { month: 'Jun', amount: 289000, growth: 14 }
    ],
    sources: {
      partnerships: 45,
      subscriptions: 35,
      events: 15,
      merchandise: 5
    },
    topPartners: [
      { name: 'Nike', revenue: 450000 },
      { name: 'Chipotle', revenue: 285000 },
      { name: 'State Farm', revenue: 198000 },
      { name: 'Red Bull', revenue: 167000 },
      { name: 'Amazon', revenue: 145000 }
    ]
  },
  engagementMetrics: {
    features: {
      messaging: 89,
      events: 76,
      partnerships: 68,
      analytics: 54,
      payments: 41
    },
    satisfaction: {
      excellent: 42,
      good: 35,
      average: 18,
      poor: 5
    },
    retention: {
      '1month': 92,
      '3months': 78,
      '6months': 65,
      '1year': 58
    }
  },
  geographicData: {
    topStates: [
      { state: 'California', users: 2145, chapters: 89 },
      { state: 'Texas', users: 1892, chapters: 76 },
      { state: 'Florida', users: 1654, chapters: 68 },
      { state: 'New York', users: 1423, chapters: 61 },
      { state: 'Pennsylvania', users: 1298, chapters: 54 }
    ],
    topUniversities: [
      { name: 'Penn State', users: 512, revenue: 89000 },
      { name: 'University of Alabama', users: 489, revenue: 76000 },
      { name: 'UCLA', users: 445, revenue: 71000 },
      { name: 'University of Texas', users: 421, revenue: 68000 },
      { name: 'Ohio State', users: 398, revenue: 62000 }
    ]
  }
};

export const teamMembers = {
  leadership: [
    {
      name: 'Jackson Fitzgerald',
      role: 'Founder & CEO',
      email: 'jackson@fraternitybase.com',
      phone: '(814) 555-0100',
      bio: 'Serial entrepreneur passionate about revolutionizing Greek life through technology.',
      image: 'https://ui-avatars.com/api/?name=JF&background=3b82f6&color=fff',
      linkedIn: 'linkedin.com/in/jacksonfitzgerald',
      achievements: ['Founded 2 successful startups', 'Forbes 30 Under 30', 'IFC Leadership Award']
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      email: 'michael@fraternitybase.com',
      phone: '(650) 555-0101',
      bio: 'Former Google engineer bringing cutting-edge technology to Greek organizations.',
      image: 'https://ui-avatars.com/api/?name=MC&background=10b981&color=fff',
      linkedIn: 'linkedin.com/in/michaelchen',
      achievements: ['10+ years at Google', 'MIT Computer Science', '3 patents in social networking']
    },
    {
      name: 'Sarah Williams',
      role: 'VP of Partnerships',
      email: 'sarah@fraternitybase.com',
      phone: '(212) 555-0102',
      bio: 'Connecting brands with the next generation of leaders through strategic partnerships.',
      image: 'https://ui-avatars.com/api/?name=SW&background=ec4899&color=fff',
      linkedIn: 'linkedin.com/in/sarahwilliams',
      achievements: ['$10M+ in partnerships secured', 'Former Nike Partnership Manager', 'Wharton MBA']
    }
  ],
  advisors: [
    {
      name: 'Brad Stevens',
      role: 'Strategic Advisor',
      company: 'Former CEO, GreekLife.com',
      bio: 'Built and sold the largest Greek life platform for $50M.',
      expertise: ['Growth Strategy', 'Fundraising', 'M&A']
    },
    {
      name: 'Jennifer Martinez',
      role: 'Marketing Advisor',
      company: 'CMO, StudentBrands Inc',
      bio: '15+ years marketing to college students and Greek organizations.',
      expertise: ['Brand Strategy', 'Digital Marketing', 'Community Building']
    }
  ]
};
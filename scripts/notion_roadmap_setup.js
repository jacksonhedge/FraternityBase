// Fraternity Base - Notion Roadmap Setup Script
// This script creates the complete product roadmap structure in Notion

const roadmapStructure = {
  mainPage: {
    title: "Fraternity Base Product Roadmap",
    icon: "🎯",
    content: {
      vision: "A B2B SaaS platform connecting companies with Greek life organizations for partnerships, events, and ambassador programs.",
      phases: [
        "Phase 1: Authentication & User Management",
        "Phase 2: Monetization & Payments",
        "Phase 3: Admin Dashboard",
        "Phase 4: Communication System",
        "Phase 5: Analytics & Insights",
        "Phase 6: Advanced Features"
      ]
    }
  },

  databases: {
    features: {
      name: "Features Database",
      icon: "✨",
      properties: {
        Name: { type: "title" },
        Status: {
          type: "select",
          options: ["Not Started", "In Progress", "In Review", "Completed", "Blocked"]
        },
        Priority: {
          type: "select",
          options: ["P0-Critical", "P1-High", "P2-Medium", "P3-Low"]
        },
        Phase: {
          type: "select",
          options: [
            "Authentication", "Monetization", "Admin Dashboard",
            "Communication", "Analytics", "Advanced Features"
          ]
        },
        Sprint: { type: "relation", relation: "sprints" },
        EstimatedHours: { type: "number" },
        ActualHours: { type: "number" },
        AssignedTo: { type: "people" },
        DueDate: { type: "date" },
        Tags: { type: "multi_select" },
        Description: { type: "text" },
        AcceptanceCriteria: { type: "text" },
        Dependencies: { type: "relation", relation: "features" }
      }
    },

    sprints: {
      name: "Sprints Database",
      icon: "🏃",
      properties: {
        Name: { type: "title" },
        SprintNumber: { type: "number" },
        Status: {
          type: "select",
          options: ["Planning", "Active", "Review", "Completed"]
        },
        StartDate: { type: "date" },
        EndDate: { type: "date" },
        Goal: { type: "text" },
        Features: { type: "relation", relation: "features" },
        Velocity: { type: "number" },
        Notes: { type: "text" }
      }
    },

    bugs: {
      name: "Bug & Issue Tracker",
      icon: "🐛",
      properties: {
        Title: { type: "title" },
        Status: {
          type: "select",
          options: ["Open", "In Progress", "Testing", "Resolved", "Closed", "Won't Fix"]
        },
        Severity: {
          type: "select",
          options: ["Critical", "High", "Medium", "Low"]
        },
        Type: {
          type: "select",
          options: ["Bug", "Performance", "Security", "UI/UX", "Feature Request"]
        },
        ReportedBy: { type: "people" },
        AssignedTo: { type: "people" },
        ReportedDate: { type: "date" },
        ResolvedDate: { type: "date" },
        AffectedFeature: { type: "relation", relation: "features" },
        Description: { type: "text" },
        ReproductionSteps: { type: "text" },
        Resolution: { type: "text" }
      }
    },

    metrics: {
      name: "Metrics Dashboard",
      icon: "📊",
      properties: {
        Metric: { type: "title" },
        Category: {
          type: "select",
          options: ["User Growth", "Revenue", "Engagement", "Performance", "Quality"]
        },
        Value: { type: "number" },
        Target: { type: "number" },
        Period: {
          type: "select",
          options: ["Daily", "Weekly", "Monthly", "Quarterly"]
        },
        Date: { type: "date" },
        Trend: {
          type: "select",
          options: ["📈 Up", "📉 Down", "➡️ Stable"]
        },
        Notes: { type: "text" }
      }
    }
  },

  views: {
    features: [
      {
        name: "Kanban by Status",
        type: "board",
        groupBy: "Status",
        sortBy: "Priority"
      },
      {
        name: "By Phase",
        type: "table",
        groupBy: "Phase",
        filters: { Status: ["Not Started", "In Progress"] }
      },
      {
        name: "Current Sprint",
        type: "table",
        filters: { Sprint: "current" }
      },
      {
        name: "Timeline",
        type: "timeline",
        dateProperty: "DueDate"
      }
    ],

    sprints: [
      {
        name: "Sprint Planning",
        type: "board",
        groupBy: "Status"
      },
      {
        name: "Sprint Timeline",
        type: "timeline",
        dateProperty: "StartDate"
      }
    ],

    bugs: [
      {
        name: "Active Issues",
        type: "board",
        groupBy: "Status",
        filters: { Status: ["Open", "In Progress", "Testing"] }
      },
      {
        name: "By Severity",
        type: "table",
        groupBy: "Severity",
        sortBy: "ReportedDate"
      }
    ],

    metrics: [
      {
        name: "Current Metrics",
        type: "gallery",
        groupBy: "Category"
      },
      {
        name: "Trends",
        type: "table",
        sortBy: "Date",
        descending: true
      }
    ]
  }
};

// Phase-specific features from ROADMAP.md
const features = [
  // Phase 1: Authentication
  { name: "Supabase setup", phase: "Authentication", priority: "P0-Critical", status: "Completed" },
  { name: "Sign-up flow with email verification", phase: "Authentication", priority: "P0-Critical" },
  { name: "Secure login with JWT tokens", phase: "Authentication", priority: "P0-Critical" },
  { name: "Password reset functionality", phase: "Authentication", priority: "P1-High" },
  { name: "OAuth integration (Google, LinkedIn)", phase: "Authentication", priority: "P1-High" },
  { name: "User roles & permissions", phase: "Authentication", priority: "P0-Critical" },
  { name: "Free trial implementation", phase: "Authentication", priority: "P0-Critical" },

  // Phase 2: Monetization
  { name: "Stripe account setup", phase: "Monetization", priority: "P0-Critical" },
  { name: "Create subscription products", phase: "Monetization", priority: "P0-Critical" },
  { name: "Implement payment flow", phase: "Monetization", priority: "P0-Critical" },
  { name: "Webhook handling", phase: "Monetization", priority: "P0-Critical" },
  { name: "Usage tracking system", phase: "Monetization", priority: "P1-High" },
  { name: "Monthly usage reset", phase: "Monetization", priority: "P1-High" },
  { name: "Overage handling", phase: "Monetization", priority: "P2-Medium" },

  // Phase 3: Admin Dashboard
  { name: "Fraternity/Sorority CRUD", phase: "Admin Dashboard", priority: "P0-Critical" },
  { name: "Chapter management", phase: "Admin Dashboard", priority: "P0-Critical" },
  { name: "Officer/contact management", phase: "Admin Dashboard", priority: "P1-High" },
  { name: "Event management", phase: "Admin Dashboard", priority: "P2-Medium" },
  { name: "Bulk import/export (CSV)", phase: "Admin Dashboard", priority: "P1-High" },
  { name: "Instagram API integration", phase: "Admin Dashboard", priority: "P1-High" },
  { name: "Engagement metrics calculation", phase: "Admin Dashboard", priority: "P2-Medium" },

  // Phase 4: Communication
  { name: "Contact request form", phase: "Communication", priority: "P1-High" },
  { name: "Request tracking dashboard", phase: "Communication", priority: "P1-High" },
  { name: "Email notifications", phase: "Communication", priority: "P1-High" },
  { name: "In-app messaging", phase: "Communication", priority: "P2-Medium" },
  { name: "Message templates", phase: "Communication", priority: "P2-Medium" },
  { name: "Bulk messaging", phase: "Communication", priority: "P3-Low" },

  // Phase 5: Analytics
  { name: "Lookup history tracking", phase: "Analytics", priority: "P1-High" },
  { name: "Partnership success metrics", phase: "Analytics", priority: "P2-Medium" },
  { name: "ROI tracking", phase: "Analytics", priority: "P2-Medium" },
  { name: "User growth metrics", phase: "Analytics", priority: "P1-High" },
  { name: "Revenue analytics", phase: "Analytics", priority: "P0-Critical" },
  { name: "Platform usage statistics", phase: "Analytics", priority: "P1-High" },

  // Phase 6: Advanced
  { name: "AI matching algorithm", phase: "Advanced Features", priority: "P3-Low" },
  { name: "Recommendation engine", phase: "Advanced Features", priority: "P3-Low" },
  { name: "RESTful API development", phase: "Advanced Features", priority: "P2-Medium" },
  { name: "API documentation", phase: "Advanced Features", priority: "P2-Medium" },
  { name: "React Native app", phase: "Advanced Features", priority: "P3-Low" },
  { name: "Push notifications", phase: "Advanced Features", priority: "P3-Low" }
];

// Success metrics to track
const initialMetrics = [
  { metric: "Total Users", category: "User Growth", target: 100, period: "Monthly" },
  { metric: "Free Trial Conversions", category: "Revenue", target: 20, period: "Monthly" },
  { metric: "MRR", category: "Revenue", target: 10000, period: "Monthly" },
  { metric: "Chapter Coverage", category: "Engagement", target: 1000, period: "Quarterly" },
  { metric: "User Satisfaction", category: "Quality", target: 4.5, period: "Monthly" }
];

console.log("Notion Roadmap Structure prepared!");
console.log("Databases to create:", Object.keys(roadmapStructure.databases).length);
console.log("Features to import:", features.length);
console.log("Metrics to track:", initialMetrics.length);

module.exports = { roadmapStructure, features, initialMetrics };
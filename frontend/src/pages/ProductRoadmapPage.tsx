import { useState } from 'react';
import {
  Rocket,
  MapPin,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Database,
  Globe2,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Code,
  Lock
} from 'lucide-react';

type RoadmapTab = 'features' | 'data';
type Status = 'shipped' | 'in-progress' | 'planned';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: Status;
  quarter?: string;
  category?: string;
  icon?: any;
}

const ProductRoadmapPage = () => {
  const [activeTab, setActiveTab] = useState<RoadmapTab>('features');

  const featureRoadmap: RoadmapItem[] = [
    {
      id: 'api',
      title: 'FraternityBase API',
      description: 'Full REST API access to our entire database of 5,000+ chapters, universities, and contacts. Programmatically search, filter, and integrate our data into your CRM, marketing automation, or custom tools. Enterprise Plan only - pricing TBD.',
      status: 'planned',
      quarter: 'Q2 2026',
      category: 'Enterprise',
      icon: Code,
    },
    {
      id: '1',
      title: 'User Activity Tracking',
      description: 'Track which companies are clicking through chapters, colleges, and features for better insights',
      status: 'shipped',
      quarter: 'Q4 2025',
      category: 'Analytics',
      icon: TrendingUp,
    },
    {
      id: '2',
      title: 'Ambassador Network',
      description: 'Connect with student ambassadors at target chapters for authentic intros and partnerships',
      status: 'in-progress',
      quarter: 'Q1 2026',
      category: 'Networking',
      icon: Users,
    },
    {
      id: '3',
      title: 'Advanced Search & Filters',
      description: 'Filter chapters by size, engagement score, location, and custom criteria',
      status: 'in-progress',
      quarter: 'Q1 2026',
      category: 'Core Features',
      icon: Target,
    },
    {
      id: '4',
      title: 'Warm Intro Requests',
      description: 'Request personalized introductions to chapter leadership through our network',
      status: 'planned',
      quarter: 'Q1 2026',
      category: 'Outreach',
      icon: MessageSquare,
    },
    {
      id: '5',
      title: 'Pricing & Credits System',
      description: 'Flexible credit-based pricing for unlocking chapters and premium features',
      status: 'shipped',
      quarter: 'Q4 2025',
      category: 'Platform',
      icon: DollarSign,
    },
    {
      id: '6',
      title: 'Engagement Scoring',
      description: 'AI-powered scoring to identify the most active and engaged chapters',
      status: 'planned',
      quarter: 'Q2 2026',
      category: 'Analytics',
      icon: Zap,
    },
    {
      id: '7',
      title: 'Admin Dashboard',
      description: 'Comprehensive admin panel for managing users, companies, data, and platform analytics',
      status: 'in-progress',
      quarter: 'Q1 2026',
      category: 'Platform',
      icon: Target,
    },
  ];

  const dataRoadmap: RoadmapItem[] = [
    {
      id: 'd1',
      title: 'Complete SEC Coverage',
      description: 'All fraternities and sororities at SEC schools (Alabama, LSU, Georgia, Tennessee, etc.)',
      status: 'shipped',
      quarter: 'Q4 2025',
      category: 'Conference',
      icon: CheckCircle2,
    },
    {
      id: 'd2',
      title: 'Big Ten Expansion',
      description: 'Adding chapters from Michigan, Ohio State, Penn State, and other Big Ten schools',
      status: 'in-progress',
      quarter: 'Q1 2026',
      category: 'Conference',
      icon: Clock,
    },
    {
      id: 'd3',
      title: 'ACC & Big 12 Coverage',
      description: 'Expanding to ACC (Clemson, UNC, Duke) and Big 12 (Texas, Oklahoma) schools',
      status: 'planned',
      quarter: 'Q1 2026',
      category: 'Conference',
      icon: MapPin,
    },
    {
      id: 'd4',
      title: 'Top 50 Private Universities',
      description: 'Stanford, Northwestern, Vanderbilt, USC, and other elite private schools',
      status: 'planned',
      quarter: 'Q2 2026',
      category: 'School Type',
      icon: Globe2,
    },
    {
      id: 'd5',
      title: 'Regional State Schools',
      description: 'Major state universities across all 50 states',
      status: 'planned',
      quarter: 'Q2 2026',
      category: 'Geographic',
      icon: Database,
    },
    {
      id: 'd6',
      title: 'NPHC Organizations',
      description: 'Adding Divine Nine and other historically Black Greek organizations',
      status: 'planned',
      quarter: 'Q2 2026',
      category: 'Organization Type',
      icon: Users,
    },
  ];

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'shipped':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Shipped
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <Target className="w-3 h-3 mr-1" />
            Planned
          </span>
        );
    }
  };

  const renderRoadmapSection = (items: RoadmapItem[], title: string) => {
    const sections = [
      { status: 'shipped' as Status, title: 'Recently Shipped' },
      { status: 'in-progress' as Status, title: 'In Progress' },
      { status: 'planned' as Status, title: 'Planned' },
    ];

    return (
      <div className="space-y-8">
        {sections.map((section) => {
          const sectionItems = items.filter((item) => item.status === section.status);
          if (sectionItems.length === 0) return null;

          return (
            <div key={section.status}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {sectionItems.map((item) => {
                  const Icon = item.icon || Rocket;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        </div>
                        {item.quarter && (
                          <span className="text-sm font-medium text-gray-600">{item.quarter}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Product Roadmap</h1>
        </div>
        <p className="text-blue-100 max-w-3xl">
          See what we're building next! Track new features, data coverage, and improvements.
          Have a suggestion? Let us know at{' '}
          <a href="mailto:feedback@fraternitybase.com" className="underline hover:text-white">
            feedback@fraternitybase.com
          </a>
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('features')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'features'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Features & Products
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'data'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4" />
              Schools & Data Coverage
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'features' && renderRoadmapSection(featureRoadmap, 'Features')}
          {activeTab === 'data' && renderRoadmapSection(dataRoadmap, 'Data Coverage')}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Have a feature request?</h3>
            <p className="text-sm text-gray-600 mb-3">
              We'd love to hear your ideas! Your feedback helps shape our roadmap and build features that matter most to you.
            </p>
            <a
              href="mailto:feedback@fraternitybase.com?subject=Feature Request"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Your Ideas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRoadmapPage;

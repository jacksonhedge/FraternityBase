import { useState, useEffect } from 'react';
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
  Lock,
  Edit,
  Trash2,
  Plus,
  X,
  Save
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
  icon?: string;
}

const initialFeatureRoadmap: RoadmapItem[] = [
  {
    id: 'api',
    title: 'FraternityBase API',
    description: 'Full REST API access to our entire database of 5,000+ chapters, universities, and contacts. Programmatically search, filter, and integrate our data into your CRM, marketing automation, or custom tools. Enterprise Plan only - pricing TBD.',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'Enterprise',
    icon: 'Code',
  },
  {
    id: '1',
    title: 'User Activity Tracking',
    description: 'Track which companies are clicking through chapters, colleges, and features for better insights',
    status: 'shipped',
    quarter: 'Q4 2025',
    category: 'Analytics',
    icon: 'TrendingUp',
  },
  {
    id: '2',
    title: 'Ambassador Network',
    description: 'Connect with student ambassadors at target chapters for authentic intros and partnerships',
    status: 'in-progress',
    quarter: 'Q1 2026',
    category: 'Networking',
    icon: 'Users',
  },
  {
    id: '3',
    title: 'Advanced Search & Filters',
    description: 'Filter chapters by size, engagement score, location, and custom criteria',
    status: 'in-progress',
    quarter: 'Q1 2026',
    category: 'Core Features',
    icon: 'Target',
  },
  {
    id: '4',
    title: 'Warm Intro Requests',
    description: 'Request personalized introductions to chapter leadership through our network',
    status: 'planned',
    quarter: 'Q1 2026',
    category: 'Outreach',
    icon: 'MessageSquare',
  },
  {
    id: '5',
    title: 'Pricing & Credits System',
    description: 'Flexible credit-based pricing for unlocking chapters and premium features',
    status: 'shipped',
    quarter: 'Q4 2025',
    category: 'Platform',
    icon: 'DollarSign',
  },
  {
    id: '6',
    title: 'Engagement Scoring',
    description: 'AI-powered scoring to identify the most active and engaged chapters',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'Analytics',
    icon: 'Zap',
  },
  {
    id: '7',
    title: 'Admin Dashboard',
    description: 'Comprehensive admin panel for managing users, companies, data, and platform analytics',
    status: 'in-progress',
    quarter: 'Q1 2026',
    category: 'Platform',
    icon: 'Target',
  },
];

const initialDataRoadmap: RoadmapItem[] = [
  {
    id: 'd1',
    title: 'Complete SEC Coverage',
    description: 'All fraternities and sororities at SEC schools (Alabama, LSU, Georgia, Tennessee, etc.)',
    status: 'shipped',
    quarter: 'Q4 2025',
    category: 'Conference',
    icon: 'CheckCircle2',
  },
  {
    id: 'd2',
    title: 'Big Ten Expansion',
    description: 'Adding chapters from Michigan, Ohio State, Penn State, and other Big Ten schools',
    status: 'in-progress',
    quarter: 'Q1 2026',
    category: 'Conference',
    icon: 'Clock',
  },
  {
    id: 'd3',
    title: 'ACC & Big 12 Coverage',
    description: 'Expanding to ACC (Clemson, UNC, Duke) and Big 12 (Texas, Oklahoma) schools',
    status: 'planned',
    quarter: 'Q1 2026',
    category: 'Conference',
    icon: 'MapPin',
  },
  {
    id: 'd4',
    title: 'Top 50 Private Universities',
    description: 'Stanford, Northwestern, Vanderbilt, USC, and other elite private schools',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'School Type',
    icon: 'Globe2',
  },
  {
    id: 'd5',
    title: 'Regional State Schools',
    description: 'Major state universities across all 50 states',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'Geographic',
    icon: 'Database',
  },
  {
    id: 'd6',
    title: 'NPHC Organizations',
    description: 'Adding Divine Nine and other historically Black Greek organizations',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'Organization Type',
    icon: 'Users',
  },
];

const iconMap: Record<string, any> = {
  Code, TrendingUp, Users, Target, MessageSquare, DollarSign, Zap, CheckCircle2,
  Clock, MapPin, Globe2, Database, Rocket
};

const ProductRoadmapPage = () => {
  const [activeTab, setActiveTab] = useState<RoadmapTab>('features');
  const [featureRoadmap, setFeatureRoadmap] = useState<RoadmapItem[]>(initialFeatureRoadmap);
  const [dataRoadmap, setDataRoadmap] = useState<RoadmapItem[]>(initialDataRoadmap);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RoadmapItem>>({
    title: '',
    description: '',
    status: 'planned',
    quarter: '',
    category: '',
    icon: 'Rocket'
  });

  useEffect(() => {
    // Check if user is admin
    const adminToken = sessionStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);

    // Load from localStorage if available
    const savedFeatures = localStorage.getItem('roadmap_features');
    const savedData = localStorage.getItem('roadmap_data');

    if (savedFeatures) setFeatureRoadmap(JSON.parse(savedFeatures));
    if (savedData) setDataRoadmap(JSON.parse(savedData));
  }, []);

  const saveToLocalStorage = (features: RoadmapItem[], data: RoadmapItem[]) => {
    localStorage.setItem('roadmap_features', JSON.stringify(features));
    localStorage.setItem('roadmap_data', JSON.stringify(data));
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (activeTab === 'features') {
      const updated = featureRoadmap.map(item =>
        item.id === editingItem.id ? editingItem : item
      );
      setFeatureRoadmap(updated);
      saveToLocalStorage(updated, dataRoadmap);
    } else {
      const updated = dataRoadmap.map(item =>
        item.id === editingItem.id ? editingItem : item
      );
      setDataRoadmap(updated);
      saveToLocalStorage(featureRoadmap, updated);
    }
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    if (activeTab === 'features') {
      const updated = featureRoadmap.filter(item => item.id !== id);
      setFeatureRoadmap(updated);
      saveToLocalStorage(updated, dataRoadmap);
    } else {
      const updated = dataRoadmap.filter(item => item.id !== id);
      setDataRoadmap(updated);
      saveToLocalStorage(featureRoadmap, updated);
    }
  };

  const handleAddItem = () => {
    const item: RoadmapItem = {
      id: Date.now().toString(),
      title: newItem.title || '',
      description: newItem.description || '',
      status: newItem.status || 'planned',
      quarter: newItem.quarter,
      category: newItem.category,
      icon: newItem.icon || 'Rocket'
    };

    if (activeTab === 'features') {
      const updated = [...featureRoadmap, item];
      setFeatureRoadmap(updated);
      saveToLocalStorage(updated, dataRoadmap);
    } else {
      const updated = [...dataRoadmap, item];
      setDataRoadmap(updated);
      saveToLocalStorage(featureRoadmap, updated);
    }

    setShowAddModal(false);
    setNewItem({
      title: '',
      description: '',
      status: 'planned',
      quarter: '',
      category: '',
      icon: 'Rocket'
    });
  };

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
                  const Icon = iconMap[item.icon || 'Rocket'] || Rocket;
                  const isEditing = editingItem?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingItem.title}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
                            placeholder="Title"
                          />
                          <textarea
                            value={editingItem.description}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={3}
                            placeholder="Description"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editingItem.quarter || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, quarter: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Quarter (e.g., Q1 2026)"
                            />
                            <select
                              value={editingItem.status}
                              onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as Status })}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="planned">Planned</option>
                              <option value="in-progress">In Progress</option>
                              <option value="shipped">Shipped</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Icon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                {item.quarter && (
                                  <span className="text-sm font-medium text-gray-600">{item.quarter}</span>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </>
                      )}
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

  const currentItems = activeTab === 'features' ? featureRoadmap : dataRoadmap;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Product Roadmap</h1>
              {isAdmin && (
                <span className="px-3 py-1 bg-white/20 text-xs font-semibold rounded-full">
                  Admin Mode
                </span>
              )}
            </div>
            <p className="text-blue-100 max-w-3xl">
              See what we're building next! Track new features, data coverage, and improvements.
              Have a suggestion? Let us know at{' '}
              <a href="mailto:feedback@fraternitybase.com" className="underline hover:text-white">
                feedback@fraternitybase.com
              </a>
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          )}
        </div>
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
          {renderRoadmapSection(currentItems, activeTab === 'features' ? 'Features' : 'Data Coverage')}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Roadmap Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Feature or data item title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Detailed description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
                  <input
                    type="text"
                    value={newItem.quarter}
                    onChange={(e) => setNewItem({ ...newItem, quarter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Q1 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as Status })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Analytics, Platform, etc."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddItem}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRoadmapPage;

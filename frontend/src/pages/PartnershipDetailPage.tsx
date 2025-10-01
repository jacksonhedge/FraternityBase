import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Building2, DollarSign, Calendar, Users, TrendingUp,
  CheckCircle, Award, Star, Target, BarChart3, Mail, Phone,
  Globe, Shield, Zap, Heart, Package, MessageSquare
} from 'lucide-react';
import { partnershipDetails } from '../data/demoData';

const PartnershipDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'metrics' | 'contact'>('overview');

  // Get partnership data based on ID or use first partnership as default
  const partnership = partnershipDetails[id as keyof typeof partnershipDetails] || partnershipDetails['nike-partnership'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/app/partnerships"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">{partnership.company}</h1>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  Active Partnership
                </span>
              </div>
              <p className="text-xl mt-2 text-white/90">{partnership.type}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{partnership.value}</p>
            <p className="text-white/80">{partnership.duration}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {'socialReach' in partnership.performanceMetrics ? partnership.performanceMetrics.socialReach : partnership.performanceMetrics.eventsHosted}
              </p>
              <p className="text-sm text-gray-600">{'socialReach' in partnership.performanceMetrics ? 'Social Reach' : 'Events Hosted'}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {'salesGenerated' in partnership.performanceMetrics ? partnership.performanceMetrics.salesGenerated : partnership.performanceMetrics.fundsRaised}
              </p>
              <p className="text-sm text-gray-600">{'salesGenerated' in partnership.performanceMetrics ? 'Sales Generated' : 'Funds Raised'}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {'eventAttendance' in partnership.performanceMetrics ? partnership.performanceMetrics.eventAttendance : partnership.performanceMetrics.studentEngagement}
              </p>
              <p className="text-sm text-gray-600">{'eventAttendance' in partnership.performanceMetrics ? 'Event Attendance' : 'Student Engagement'}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {'brandSentiment' in partnership.performanceMetrics ? partnership.performanceMetrics.brandSentiment : partnership.performanceMetrics.appDownloads}
              </p>
              <p className="text-sm text-gray-600">{'brandSentiment' in partnership.performanceMetrics ? 'Brand Sentiment' : 'App Downloads'}</p>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {['overview', 'benefits', 'metrics', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Partnership Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Partnership Type</h4>
                    <p className="text-gray-600">{partnership.type}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contract Value</h4>
                    <p className="text-gray-600">{partnership.value}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Start Date</h4>
                    <p className="text-gray-600">{partnership.startDate}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">End Date</h4>
                    <p className="text-gray-600">{partnership.endDate}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Partnership Deliverables</h4>
                <div className="space-y-2">
                  {partnership.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-600">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Partnership Status</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Contract Progress</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-64 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">45% Complete</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Time Remaining</p>
                    <p className="text-lg font-semibold text-gray-900">3.5 years</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Partnership Benefits</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partnership.benefits.map((benefit, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{benefit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Exclusive Perks</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900">Priority Access</p>
                    <p className="text-sm text-gray-600 mt-1">First access to new products and releases</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Package className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900">Custom Products</p>
                    <p className="text-sm text-gray-600 mt-1">Exclusive Greek life merchandise designs</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900">Direct Support</p>
                    <p className="text-sm text-gray-600 mt-1">Dedicated account manager and support team</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Engagement Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Social Media Reach</span>
                        <span className="text-sm font-semibold">{'socialReach' in partnership.performanceMetrics ? partnership.performanceMetrics.socialReach : partnership.performanceMetrics.eventsHosted}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Event Participation</span>
                        <span className="text-sm font-semibold">{'eventAttendance' in partnership.performanceMetrics ? partnership.performanceMetrics.eventAttendance : partnership.performanceMetrics.studentEngagement}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Brand Sentiment</span>
                        <span className="text-sm font-semibold">{'brandSentiment' in partnership.performanceMetrics ? partnership.performanceMetrics.brandSentiment : partnership.performanceMetrics.appDownloads}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Financial Performance</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Annual Sales Generated</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{'salesGenerated' in partnership.performanceMetrics ? partnership.performanceMetrics.salesGenerated : partnership.performanceMetrics.fundsRaised}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ROI</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">+285%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost Per Acquisition</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">$12.50</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Monthly Performance Trend</h4>
                <div className="grid grid-cols-6 gap-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                    <div key={month} className="text-center">
                      <div className="bg-blue-600 rounded" style={{ height: `${Math.random() * 100 + 50}px` }}></div>
                      <p className="text-xs text-gray-600 mt-1">{month}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Partnership Contact</h3>

              <div className="border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{partnership.contact.name}</h4>
                    <p className="text-gray-600">{partnership.contact.title}</p>

                    <div className="mt-4 space-y-2">
                      <a href={`mailto:${partnership.contact.email}`} className="flex items-center text-blue-600 hover:text-blue-700">
                        <Mail className="w-5 h-5 mr-2" />
                        {partnership.contact.email}
                      </a>
                      <a href={`tel:${partnership.contact.phone}`} className="flex items-center text-blue-600 hover:text-blue-700">
                        <Phone className="w-5 h-5 mr-2" />
                        {partnership.contact.phone}
                      </a>
                    </div>
                  </div>

                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Schedule Meeting
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      Request Partnership Report
                    </button>
                    <button className="w-full px-4 py-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      Submit Feedback
                    </button>
                    <button className="w-full px-4 py-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      View Contract Details
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Support Resources</h4>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-700">
                      <Globe className="w-5 h-5 mr-2" />
                      Partner Portal
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-700">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Analytics Dashboard
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-700">
                      <Package className="w-5 h-5 mr-2" />
                      Order Management
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Expand Your Partnership</h3>
            <p className="text-white/90">Explore additional opportunities to grow together</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              View Opportunities
            </button>
            <button className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">
              Contact Partner Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipDetailPage;
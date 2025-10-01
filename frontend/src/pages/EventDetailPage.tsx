import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users, DollarSign, Award, Clock,
  CheckCircle, Star, TrendingUp, Building2, Mail, Phone, Globe,
  Ticket, Trophy, Heart, Target, Share2, Download
} from 'lucide-react';
import { eventDetails } from '../data/demoData';

const EventDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'sponsors' | 'results'>('overview');

  // Get event data based on ID or use first event as default
  const eventData = eventDetails[id as keyof typeof eventDetails] || eventDetails['greek-week-2025'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/app/events"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold">{eventData.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {eventData.date}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {eventData.location}
                </span>
              </div>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Register Now
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{eventData.attendance.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Expected Attendance</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{eventData.participatingOrgs}</p>
              <p className="text-sm text-gray-600">Organizations</p>
            </div>
            <Building2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{eventData.fundsRaised}</p>
              <p className="text-sm text-gray-600">Funds Raised</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{eventData.schedule.length}</p>
              <p className="text-sm text-gray-600">Days of Events</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{eventData.sponsors.length}</p>
              <p className="text-sm text-gray-600">Sponsors</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {['overview', 'schedule', 'sponsors', 'results'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
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
                <h3 className="text-xl font-bold text-gray-900 mb-4">About This Event</h3>
                <p className="text-gray-600 leading-relaxed">{eventData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Event Type</h4>
                  <p className="text-gray-600">{eventData.type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Beneficiary</h4>
                  <p className="text-gray-600">{eventData.beneficiary}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Competitions & Activities</h4>
                <div className="space-y-2">
                  {eventData.competitions.map((competition, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-600">{competition}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Schedule</h3>
              {eventData.schedule.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-purple-600">{item.day}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{item.time}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mt-1">{item.event}</h4>
                      <p className="text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {item.location}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                      Add to Calendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sponsors' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Sponsors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {eventData.sponsors.map((sponsor, index) => (
                  <div key={index} className={`border rounded-lg p-6 text-center ${
                    sponsor.level === 'Platinum' ? 'border-gray-400 bg-gray-50' :
                    sponsor.level === 'Gold' ? 'border-yellow-400 bg-yellow-50' :
                    'border-gray-300 bg-white'
                  }`}>
                    <div className={`text-sm font-semibold mb-2 ${
                      sponsor.level === 'Platinum' ? 'text-gray-700' :
                      sponsor.level === 'Gold' ? 'text-yellow-700' :
                      'text-gray-600'
                    }`}>
                      {sponsor.level} Sponsor
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{sponsor.name}</h4>
                    <p className="text-lg font-semibold text-purple-600 mt-2">{sponsor.amount}</p>
                  </div>
                ))}
              </div>

              <div className="bg-purple-50 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Become a Sponsor</h4>
                <p className="text-gray-600 mb-4">
                  Join our distinguished sponsors in supporting this incredible event and making a difference in our community.
                </p>
                <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                  View Sponsorship Packages
                </button>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Impact</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Heart className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{eventData.fundsRaised}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Raised for {eventData.beneficiary}</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{eventData.attendance.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Participants</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{eventData.participatingOrgs}</p>
                  <p className="text-sm text-gray-600 mt-1">Organizations Involved</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Competition Winners</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <Trophy className="w-6 h-6 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">Overall Champion</p>
                        <p className="text-sm text-gray-600">Alpha Phi & Sigma Chi</p>
                      </div>
                    </div>
                    <span className="text-yellow-600 font-bold">1st Place</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Award className="w-6 h-6 text-gray-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">Greek Sing Winners</p>
                        <p className="text-sm text-gray-600">Delta Delta Delta</p>
                      </div>
                    </div>
                    <span className="text-gray-600 font-bold">2nd Place</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center">
                      <Award className="w-6 h-6 text-orange-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">Philanthropy Award</p>
                        <p className="text-sm text-gray-600">Kappa Kappa Gamma</p>
                      </div>
                    </div>
                    <span className="text-orange-600 font-bold">3rd Place</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Don't Miss Next Year's Event!</h3>
            <p className="text-white/90">Be part of the largest Greek life event in the nation</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Get Updates
            </button>
            <button className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">
              <Share2 className="w-5 h-5 inline mr-2" />
              Share Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
// import { useSelector } from 'react-redux';
// import { RootState } from '../store/store';
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle
} from 'lucide-react';

const DashboardPage = () => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const user = { firstName: 'Demo', lastName: 'User' };

  const stats = [
    {
      label: 'Active Partnerships',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'primary'
    },
    {
      label: 'Upcoming Events',
      value: '8',
      change: '3 this week',
      trend: 'neutral',
      icon: Calendar,
      color: 'blue'
    },
    {
      label: 'Total Reach',
      value: '45.2K',
      change: '+18%',
      trend: 'up',
      icon: Target,
      color: 'green'
    },
    {
      label: 'Partnership Value',
      value: '$125K',
      change: '+$15K',
      trend: 'up',
      icon: DollarSign,
      color: 'purple'
    }
  ];

  const recentActivities = [
    {
      type: 'partnership',
      title: 'New partnership with Sigma Chi - University of Alabama',
      time: '2 hours ago',
      status: 'new'
    },
    {
      type: 'event',
      title: 'Spring Formal sponsorship confirmed - Kappa Kappa Gamma',
      time: '5 hours ago',
      status: 'confirmed'
    },
    {
      type: 'application',
      title: '3 new ambassador applications received',
      time: '1 day ago',
      status: 'pending'
    },
    {
      type: 'message',
      title: 'Message from Delta Delta Delta regarding philanthropy event',
      time: '2 days ago',
      status: 'unread'
    }
  ];

  const upcomingEvents = [
    {
      name: 'Greek Week 2024',
      organization: 'University of Georgia IFC',
      date: 'March 15-22',
      type: 'Major Event',
      attendees: '5,000+'
    },
    {
      name: 'Spring Philanthropy Gala',
      organization: 'Chi Omega - Auburn',
      date: 'March 18',
      type: 'Philanthropy',
      attendees: '300'
    },
    {
      name: 'Rush Week Kickoff',
      organization: 'Ole Miss Panhellenic',
      date: 'March 25',
      type: 'Rush Event',
      attendees: '1,200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your Greek life partnerships today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                {stat.trend === 'up' && (
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </span>
                )}
                {stat.trend === 'down' && (
                  <span className="flex items-center text-red-600 text-sm font-medium">
                    <ArrowDown className="w-4 h-4 mr-1" />
                    {stat.change}
                  </span>
                )}
                {stat.trend === 'neutral' && (
                  <span className="text-gray-600 text-sm">
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-600" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.status === 'new' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    )}
                    {activity.status === 'confirmed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {activity.status === 'pending' && (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    {activity.status === 'unread' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-primary-600 text-sm font-medium hover:text-primary-700">
              View all activity →
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Upcoming Partnership Events
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-medium text-gray-900">{event.name}</h4>
                  <p className="text-sm text-gray-600">{event.organization}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">{event.date}</span>
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-500">{event.attendees} attendees</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-primary-600 text-sm font-medium hover:text-primary-700">
              View all events →
            </button>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Partnership Performance
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Partnership performance chart will be displayed here</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary-600 rounded-lg shadow-sm p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Browse Chapters</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Find Events</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Award className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Create Program</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Target className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
import { useState, useEffect } from 'react';
import { Activity, MousePointer, Eye, Search, Unlock, Calendar, User, Building2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ActivityLog {
  id: string;
  user_id?: string;
  company_id?: string;
  session_id: string;
  event_type: string;
  page_path: string;
  element_type?: string;
  element_text?: string;
  element_id?: string;
  metadata?: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

interface ActivityStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  uniqueUsers: number;
  uniqueCompanies: number;
  period: {
    start: string;
    end: string;
    days: number;
  };
}

const ActivityLogsTab = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [daysFilter, setDaysFilter] = useState<number>(7);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        offset: '0',
      });

      if (selectedEventType !== 'all') {
        params.append('event_type', selectedEventType);
      }

      const response = await fetch(`${API_URL}/activity/recent?${params}`);
      const data = await response.json();

      if (data.success) {
        setActivityLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/activity/stats?days=${daysFilter}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
    fetchStats();
  }, [selectedEventType, daysFilter]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'click':
        return <MousePointer className="w-4 h-4 text-blue-500" />;
      case 'page_view':
        return <Eye className="w-4 h-4 text-green-500" />;
      case 'chapter_view':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'chapter_unlock':
        return <Unlock className="w-4 h-4 text-yellow-500" />;
      case 'search':
        return <Search className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Companies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueCompanies}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Period</p>
                <p className="text-2xl font-bold text-gray-900">{stats.period.days}d</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Event Type Breakdown */}
      {stats && Object.keys(stats.eventsByType).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Event Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.eventsByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                {getEventIcon(type)}
                <div>
                  <p className="text-sm font-medium capitalize">{type.replace('_', ' ')}</p>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Events</option>
            <option value="click">Clicks</option>
            <option value="page_view">Page Views</option>
            <option value="chapter_view">Chapter Views</option>
            <option value="chapter_unlock">Chapter Unlocks</option>
            <option value="search">Searches</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <button
          onClick={() => {
            fetchActivityLogs();
            fetchStats();
          }}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Element
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User/Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading activity logs...
                  </td>
                </tr>
              ) : activityLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getEventIcon(log.event_type)}
                        <span className="text-sm capitalize">{log.event_type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.page_path}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.element_type && (
                        <div>
                          <span className="text-xs text-gray-500">{log.element_type}</span>
                          {log.element_text && (
                            <p className="text-xs truncate max-w-xs">{log.element_text}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.user_id && <p className="text-xs">User: {log.user_id.substring(0, 8)}...</p>}
                      {log.company_id && <p className="text-xs">Company: {log.company_id.substring(0, 8)}...</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-blue-600">View metadata</summary>
                          <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto max-w-xs">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsTab;

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, RefreshCcw } from 'lucide-react';

interface AnalyticsEvent {
  id: string;
  created_at: string;
  user_email: string | null;
  company_name: string | null;
  event_type: string;
  event_category: string;
  event_name: string;
  event_data: any;
  page_url: string;
  page_path: string;
}

const AdminAnalyticsEventsPage = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today'); // 'today', 'week', 'month', 'all'
  const [totalCount, setTotalCount] = useState(0);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('analytics_events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply date filter
      const now = new Date();
      if (dateRange === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        query = query.gte('created_at', startOfDay);
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
        query = query.gte('created_at', weekAgo);
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.setDate(now.getDate() - 30)).toISOString();
        query = query.gte('created_at', monthAgo);
      }

      const { data, error, count } = await query.limit(1000);

      if (error) {
        console.error('Error fetching analytics events:', error);
        return;
      }

      setEvents(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [dateRange]);

  const copyToClipboard = () => {
    // Format data for Claude analysis
    const formatted = events.map(event => {
      const eventData = typeof event.event_data === 'string'
        ? JSON.parse(event.event_data)
        : event.event_data;

      return {
        timestamp: event.created_at,
        user: event.user_email || 'Anonymous',
        company: event.company_name || 'N/A',
        event_type: event.event_type,
        category: event.event_category,
        event_name: event.event_name,
        page: event.page_path,
        data: eventData
      };
    });

    const text = JSON.stringify(formatted, null, 2);
    navigator.clipboard.writeText(text);
    alert(`Copied ${events.length} events to clipboard!`);
  };

  const downloadCSV = () => {
    // Create CSV
    const headers = ['Timestamp', 'User', 'Company', 'Event Type', 'Category', 'Event Name', 'Page', 'Data'];
    const rows = events.map(event => {
      const eventData = typeof event.event_data === 'string'
        ? JSON.parse(event.event_data)
        : event.event_data;

      return [
        event.created_at,
        event.user_email || 'Anonymous',
        event.company_name || 'N/A',
        event.event_type,
        event.event_category,
        event.event_name,
        event.page_path,
        JSON.stringify(eventData)
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Events</h1>
        <p className="text-gray-600">View and export all user activity for Claude analysis</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="pt-7">
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              📋 Copy for Claude
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{events.length}</span> of{' '}
          <span className="font-semibold">{totalCount}</span> total events
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No events found for the selected time range
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => {
                  const eventData = typeof event.event_data === 'string'
                    ? JSON.parse(event.event_data)
                    : event.event_data;

                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {event.user_email || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {event.company_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.event_category === 'conversion' ? 'bg-green-100 text-green-800' :
                          event.event_category === 'error' ? 'bg-red-100 text-red-800' :
                          event.event_category === 'engagement' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.event_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {event.event_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {event.page_path}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">View</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(eventData, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsEventsPage;

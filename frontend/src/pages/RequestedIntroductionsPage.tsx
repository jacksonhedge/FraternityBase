import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Link } from 'react-router-dom';
import {
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  AlertCircle,
  LayoutList,
  LayoutGrid,
  Search
} from 'lucide-react';

interface WarmIntroRequest {
  id: string;
  chapter_id: string;
  message: string;
  preferred_contact_method: string;
  urgency: string;
  amount_paid: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  admin_notes?: string;
  chapters?: {
    chapter_name: string;
    universities?: {
      name: string;
    };
  };
}

const RequestedIntroductionsPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [requests, setRequests] = useState<WarmIntroRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'flow'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      if (!token || !user?.companyId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/credits/warm-intro/requests?companyId=${user.companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch intro requests');
      }

      const result = await response.json();
      if (result.success && result.requests) {
        setRequests(result.requests);
      }
    } catch (error) {
      console.error('Error fetching intro requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this introduction request? This action cannot be undone.')) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      if (!token) return;

      // For now, we'd need an endpoint to cancel. Since we don't have one yet,
      // we'll just show a message. In production, this would call the backend.
      alert('Cancel functionality requires admin approval. Please contact support to cancel this request.');

      // TODO: Add backend endpoint: PATCH /credits/warm-intro/:id/cancel
      // const response = await fetch(`${API_URL}/credits/warm-intro/${requestId}/cancel`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // if (response.ok) {
      //   fetchRequests(); // Refresh list
      // }
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  // Filter and search logic
  const filteredRequests = requests.filter(request => {
    // Filter by status
    if (filterStatus !== 'all' && request.status !== filterStatus) {
      return false;
    }

    // Search by chapter name or university
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const chapterName = request.chapters?.chapter_name?.toLowerCase() || '';
      const universityName = request.chapters?.universities?.name?.toLowerCase() || '';

      return chapterName.includes(searchLower) || universityName.includes(searchLower);
    }

    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {getStatusIcon(status)}
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getContactIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'text':
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your requested introductions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Handshake className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Requested Introductions</h1>
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-600'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'flow'
                  ? 'bg-white text-emerald-600'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-emerald-50 text-sm">
          Track all your warm introduction requests and their status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
            <Handshake className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by chapter or university</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chapters..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {(searchTerm || filterStatus !== 'all') && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredRequests.length} of {requests.length} requests
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Requests Views */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Handshake className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {requests.length === 0 ? 'No Introduction Requests Yet' : 'No Matching Requests'}
            </h3>
            <p className="text-gray-600 mb-6">
              {requests.length === 0
                ? 'When you request warm introductions to chapters, they\'ll appear here.'
                : 'Try adjusting your filters or search terms.'}
            </p>
            {requests.length === 0 && (
              <Link
                to="/app/chapters"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <Building2 className="w-4 h-4" />
                Browse Chapters
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === 'flow' ? (
        /* Flow View - Kanban Style */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending Column */}
          <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Pending</h3>
              <span className="ml-auto bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            </div>
            <div className="space-y-3">
              {filteredRequests.filter(r => r.status === 'pending').map((request) => (
                <div key={request.id} className="bg-white rounded-lg border border-yellow-200 p-4 shadow-sm">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {request.chapters?.chapter_name || 'Chapter'}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {request.chapters?.universities?.name || 'University'}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold">${request.amount_paid.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">In Progress</h3>
              <span className="ml-auto bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                {requests.filter(r => r.status === 'in_progress').length}
              </span>
            </div>
            <div className="space-y-3">
              {filteredRequests.filter(r => r.status === 'in_progress').map((request) => (
                <div key={request.id} className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {request.chapters?.chapter_name || 'Chapter'}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {request.chapters?.universities?.name || 'University'}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold">${request.amount_paid.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Completed</h3>
              <span className="ml-auto bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                {requests.filter(r => r.status === 'completed').length}
              </span>
            </div>
            <div className="space-y-3">
              {filteredRequests.filter(r => r.status === 'completed').map((request) => (
                <div key={request.id} className="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {request.chapters?.chapter_name || 'Chapter'}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {request.chapters?.universities?.name || 'University'}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold">${request.amount_paid.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.chapters?.chapter_name || 'Chapter'}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{request.chapters?.universities?.name || 'University'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">${request.amount_paid.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">paid</p>
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Requested</p>
                    <p className="text-sm text-gray-900">
                      {new Date(request.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  {getContactIcon(request.preferred_contact_method)}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contact Method</p>
                    <p className="text-sm text-gray-900 capitalize">{request.preferred_contact_method}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {request.message && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Your Message</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.message}</p>
                </div>
              )}

              {/* Admin Notes */}
              {request.admin_notes && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">Update from Team</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.admin_notes}</p>
                </div>
              )}

              {/* Completion Info */}
              {request.status === 'completed' && request.completed_at && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Introduction Completed</p>
                    <p className="text-xs text-green-700 mt-1">
                      Completed on {new Date(request.completed_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Pending Info */}
              {request.status === 'pending' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">Processing Your Request</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Our team will contact you within 24-48 hours to facilitate this introduction.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelRequest(request.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                  >
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestedIntroductionsPage;

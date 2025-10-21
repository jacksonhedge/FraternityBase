import React, { useEffect, useState } from 'react';
import { Handshake, Users, Download, Search, Calendar, Building2, CheckCircle, Clock, XCircle, Edit2, Save } from 'lucide-react';

interface IntroductionRequest {
  id: string;
  company_id: string;
  chapter_id: string;
  status: string;
  message?: string;
  campaign_description?: string;
  preferred_contact_method?: string;
  budget_range?: string;
  timeline?: string;
  urgency?: string;
  amount_paid: number;
  admin_notes?: string;
  created_at: string;
  completed_at?: string;
  request_type: 'warm_intro' | 'ambassador';
  companies: {
    name: string;
  };
  chapters: {
    chapter_name: string;
    universities: {
      name: string;
      state: string;
    };
    greek_organizations: {
      name: string;
      organization_type: string;
    };
  };
}

const IntroductionRequestsTab = () => {
  const [requests, setRequests] = useState<IntroductionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/introduction-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch introduction requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, requestType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/introduction-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, request_type: requestType })
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const saveNotes = async (id: string, requestType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/introduction-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admin_notes: editNotes,
          request_type: requestType,
          status: requests.find(r => r.id === id)?.status || 'pending'
        })
      });

      if (response.ok) {
        setEditingId(null);
        setEditNotes('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.companies?.name?.toLowerCase().includes(search.toLowerCase()) ||
      request.chapters?.greek_organizations?.name?.toLowerCase().includes(search.toLowerCase()) ||
      request.chapters?.universities?.name?.toLowerCase().includes(search.toLowerCase()) ||
      request.chapters?.chapter_name?.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || request.request_type === filterType;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Edit2 },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Company', 'Chapter', 'Organization', 'University', 'State', 'Status', 'Amount Paid', 'Message/Description'];
    const rows = filteredRequests.map(request => [
      formatDate(request.created_at),
      request.request_type === 'warm_intro' ? 'Warm Introduction' : 'Ambassador Referral',
      request.companies?.name || 'Unknown',
      request.chapters?.chapter_name || 'Unknown',
      request.chapters?.greek_organizations?.name || 'Unknown',
      request.chapters?.universities?.name || 'Unknown',
      request.chapters?.universities?.state || '',
      request.status,
      `$${request.amount_paid.toFixed(2)}`,
      request.request_type === 'warm_intro' ? (request.message || '') : (request.campaign_description || '')
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `introduction-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalRevenue = requests.reduce((sum, r) => sum + Number(r.amount_paid), 0);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  if (loading) {
    return <div className="text-center py-12">Loading introduction requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{requests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Handshake className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, chapter, university..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="warm_intro">Warm Intros</option>
              <option value="ambassador">Ambassador Referrals</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No introduction requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.request_type === 'warm_intro'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.request_type === 'warm_intro' ? '🤝 Warm Intro' : '👥 Ambassador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.companies?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{request.chapters?.greek_organizations?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{request.chapters?.chapter_name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{request.chapters?.universities?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{request.chapters?.universities?.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ${Number(request.amount_paid).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={request.status}
                          onChange={(e) => updateStatus(request.id, e.target.value, request.request_type)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-3">
                        <div className="space-y-2 text-sm">
                          {request.request_type === 'warm_intro' ? (
                            <>
                              {request.message && (
                                <div>
                                  <span className="font-medium text-gray-700">Message:</span>
                                  <p className="text-gray-600 mt-1">{request.message}</p>
                                </div>
                              )}
                              {request.urgency && (
                                <div>
                                  <span className="font-medium text-gray-700">Urgency:</span> {request.urgency}
                                </div>
                              )}
                              {request.preferred_contact_method && (
                                <div>
                                  <span className="font-medium text-gray-700">Preferred Contact:</span> {request.preferred_contact_method}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {request.campaign_description && (
                                <div>
                                  <span className="font-medium text-gray-700">Campaign Description:</span>
                                  <p className="text-gray-600 mt-1">{request.campaign_description}</p>
                                </div>
                              )}
                              {request.budget_range && (
                                <div>
                                  <span className="font-medium text-gray-700">Budget:</span> {request.budget_range}
                                </div>
                              )}
                              {request.timeline && (
                                <div>
                                  <span className="font-medium text-gray-700">Timeline:</span> {request.timeline}
                                </div>
                              )}
                            </>
                          )}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-700">Admin Notes:</span>
                              {editingId === request.id ? (
                                <button
                                  onClick={() => saveNotes(request.id, request.request_type)}
                                  className="text-green-600 hover:text-green-700 flex items-center gap-1"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingId(request.id);
                                    setEditNotes(request.admin_notes || '');
                                  }}
                                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                            </div>
                            {editingId === request.id ? (
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="Add admin notes..."
                              />
                            ) : (
                              <p className="text-gray-600">{request.admin_notes || 'No notes yet'}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 text-center">
        Showing {filteredRequests.length} of {requests.length} total requests
      </div>
    </div>
  );
};

export default IntroductionRequestsTab;

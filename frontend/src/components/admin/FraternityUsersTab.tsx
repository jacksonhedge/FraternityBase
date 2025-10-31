import { useState, useEffect } from 'react';
import { Check, X, Trash2, Eye, AlertCircle, Users, Heart } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAdminHeaders = () => {
  const adminToken = sessionStorage.getItem('adminToken') || import.meta.env.VITE_ADMIN_TOKEN || '';
  return {
    'Content-Type': 'application/json',
    'x-admin-token': adminToken
  };
};

interface FraternityUser {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  college: string;
  fraternity_or_sorority: string;
  position: string;
  instagram?: string;
  website?: string;
  preferred_payment_method?: string;
  has_upcoming_event: boolean;
  event_name?: string;
  event_date?: string;
  event_type?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

const FraternityUsersTab = () => {
  const [fraternityUsers, setFraternityUsers] = useState<FraternityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedUser, setSelectedUser] = useState<FraternityUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchFraternityUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }

      const res = await fetch(`${API_URL}/fraternity/admin/users?${queryParams}`, {
        headers: getAdminHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to fetch fraternity users');
      }

      const data = await res.json();
      setFraternityUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching fraternity users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraternityUsers();
  }, [filterStatus]);

  const handleApprove = async (userId: string) => {
    if (!confirm('Approve this fraternity user?')) return;

    try {
      const res = await fetch(`${API_URL}/fraternity/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: getAdminHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to approve user');
      }

      await fetchFraternityUsers();
    } catch (err: any) {
      alert('Error approving user: ' + err.message);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    try {
      const res = await fetch(`${API_URL}/fraternity/admin/users/${userId}/reject`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!res.ok) {
        throw new Error('Failed to reject user');
      }

      await fetchFraternityUsers();
    } catch (err: any) {
      alert('Error rejecting user: ' + err.message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this fraternity user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`${API_URL}/fraternity/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchFraternityUsers();
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fraternity users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading fraternity users</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Fraternity & Sorority Users</h2>
        </div>
        <p className="text-gray-600">Manage fraternity and sorority sign-ups</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({fraternityUsers.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Users Table */}
      {fraternityUsers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No fraternity users found</h3>
          <p className="text-gray-600">
            {filterStatus !== 'all'
              ? `No ${filterStatus} users to display`
              : 'Fraternity and sorority sign-ups will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Organization</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase">College</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Position</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Created</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fraternityUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{user.fraternity_or_sorority}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{user.college}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{user.position}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.approval_status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {user.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">College</label>
                    <p className="font-medium text-gray-900">{selectedUser.college}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Organization</label>
                    <p className="font-medium text-gray-900">{selectedUser.fraternity_or_sorority}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Position</label>
                    <p className="font-medium text-gray-900">{selectedUser.position}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedUser.approval_status)}</div>
                  </div>
                </div>
              </div>

              {/* Chapter Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Chapter Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Instagram</label>
                    <p className="font-medium text-gray-900">
                      {selectedUser.instagram ? (
                        <a
                          href={`https://instagram.com/${selectedUser.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          {selectedUser.instagram}
                        </a>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Website</label>
                    <p className="font-medium text-gray-900">
                      {selectedUser.website ? (
                        <a
                          href={selectedUser.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          {selectedUser.website}
                        </a>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Preferred Payment Method</label>
                    <p className="font-medium text-gray-900">
                      {selectedUser.preferred_payment_method || <span className="text-gray-400">Not provided</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              {selectedUser.has_upcoming_event && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Upcoming Event</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Event Name</label>
                      <p className="font-medium text-gray-900">{selectedUser.event_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Event Type</label>
                      <p className="font-medium text-gray-900">{selectedUser.event_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Event Date</label>
                      <p className="font-medium text-gray-900">
                        {selectedUser.event_date
                          ? new Date(selectedUser.event_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Info */}
              {selectedUser.approval_status !== 'pending' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Approval Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.approved_at && (
                      <div>
                        <label className="text-sm text-gray-600">
                          {selectedUser.approval_status === 'approved' ? 'Approved At' : 'Rejected At'}
                        </label>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedUser.approved_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedUser.rejection_reason && (
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600">Rejection Reason</label>
                        <p className="font-medium text-gray-900">{selectedUser.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {selectedUser.approval_status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedUser.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedUser.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraternityUsersTab;

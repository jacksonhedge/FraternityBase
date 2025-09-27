import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Mail, Building2, FileText, Calendar, User } from 'lucide-react';
import Navbar from '../components/Navbar';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  companyName: string;
  companyDescription: string;
  signupDate: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt: string | null;
  verifiedBy: string | null;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    // Load users from localStorage
    const loadedUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    setUsers(loadedUsers);
  }, []);

  const handleApprove = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: 'approved' as const,
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'Admin'
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorage.setItem('pendingUsers', JSON.stringify(updatedUsers));

    // If this is the current user, update their session
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        status: 'approved',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Admin'
      }));
    }
  };

  const handleReject = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: 'rejected' as const,
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'Admin'
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorage.setItem('pendingUsers', JSON.stringify(updatedUsers));
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage and verify new user signups</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Signups</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <User className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md capitalize transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status} ({status === 'all' ? stats.total : stats[status]})
              </button>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {filter === 'all' ? '' : filter} users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {user.companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={user.companyDescription}>
                            {user.companyDescription}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.signupDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : user.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {user.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {user.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="text-green-600 hover:text-green-900 font-medium text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(user.id)}
                                className="text-red-600 hover:text-red-900 font-medium text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              {user.verifiedAt && `${user.verifiedBy} on ${new Date(user.verifiedAt).toLocaleDateString()}`}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
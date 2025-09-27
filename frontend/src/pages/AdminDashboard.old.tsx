import { useState } from 'react';
import {
  Users,
  Building2,
  UserPlus,
  Instagram,
  Database,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  Download
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('chapters');
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs = [
    { id: 'chapters', label: 'Chapters', icon: Building2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'instagram', label: 'Instagram Data', icon: Instagram },
    { id: 'users', label: 'User Management', icon: UserPlus },
    { id: 'analytics', label: 'Analytics', icon: Database },
  ];

  const mockChapters = [
    {
      id: '1',
      name: 'Sigma Chi',
      university: 'University of Alabama',
      memberCount: 156,
      instagramHandle: '@sigmachi_ua',
      contactEmail: 'president@sigmachi-ua.edu',
      status: 'active'
    },
    {
      id: '2',
      name: 'Kappa Kappa Gamma',
      university: 'University of Georgia',
      memberCount: 198,
      instagramHandle: '@kkg_uga',
      contactEmail: 'president@kkg-uga.edu',
      status: 'active'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Manage chapters, contacts, and platform data</p>
            </div>
            <button className="btn bg-white text-gray-900 hover:bg-gray-100">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div>
            {/* Actions Bar */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="search"
                    placeholder="Search chapters..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select className="input">
                  <option>All Universities</option>
                  <option>University of Alabama</option>
                  <option>University of Georgia</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </button>
                <button className="btn-outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Chapter
                </button>
              </div>
            </div>

            {/* Chapters Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instagram
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockChapters.map((chapter) => (
                    <tr key={chapter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{chapter.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{chapter.university}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{chapter.memberCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={`https://instagram.com/${chapter.instagramHandle.slice(1)}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-sm text-primary-600 hover:text-primary-900">
                          {chapter.instagramHandle}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{chapter.contactEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {chapter.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Chapter Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Chapter</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Organization Name</label>
                  <input type="text" className="input" placeholder="Sigma Chi" />
                </div>
                <div>
                  <label className="label">Greek Letters</label>
                  <input type="text" className="input" placeholder="ΣΧ" />
                </div>
                <div>
                  <label className="label">University</label>
                  <select className="input">
                    <option>Select University</option>
                    <option>University of Alabama</option>
                    <option>University of Georgia</option>
                  </select>
                </div>
                <div>
                  <label className="label">Chapter Name</label>
                  <input type="text" className="input" placeholder="Alpha Iota" />
                </div>
                <div>
                  <label className="label">Member Count</label>
                  <input type="number" className="input" placeholder="150" />
                </div>
                <div>
                  <label className="label">Instagram Handle</label>
                  <input type="text" className="input" placeholder="@sigmachi_ua" />
                </div>
                <div className="col-span-2">
                  <label className="label">Main Contact</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" className="input" placeholder="Name" />
                    <input type="email" className="input" placeholder="Email" />
                    <input type="tel" className="input" placeholder="Phone" />
                  </div>
                </div>
                <div>
                  <label className="label">Partnership Openness</label>
                  <select className="input">
                    <option>Open</option>
                    <option>Selective</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Engagement Score</label>
                  <input type="number" className="input" placeholder="85" min="0" max="100" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button className="btn-primary">
                  Add Chapter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Content */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Management</h2>
            <p className="text-gray-600">Manage chapter officers and contacts here.</p>
          </div>
        )}

        {activeTab === 'instagram' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Instagram Data Integration</h2>
            <p className="text-gray-600">Configure Instagram API and sync profile data.</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">Manage platform users and their subscription tiers.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Analytics</h2>
            <p className="text-gray-600">View platform usage statistics and insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
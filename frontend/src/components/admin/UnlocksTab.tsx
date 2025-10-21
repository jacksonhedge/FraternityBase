import React, { useEffect, useState } from 'react';
import { Unlock, Download, Search, Calendar, Building2, Users } from 'lucide-react';

interface UnlockData {
  id: string;
  company_id: string;
  chapter_id: string;
  unlock_type: string;
  unlocked_at: string;
  amount_paid: number;
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
  balance_transactions: {
    amount_credits: number;
    created_at: string;
  } | null;
}

const UnlocksTab = () => {
  const [unlocks, setUnlocks] = useState<UnlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchUnlocks();
  }, []);

  const fetchUnlocks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/unlocks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setUnlocks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch unlocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnlocks = unlocks.filter(unlock => {
    const matchesSearch =
      unlock.companies?.name?.toLowerCase().includes(search.toLowerCase()) ||
      unlock.chapters?.greek_organizations?.name?.toLowerCase().includes(search.toLowerCase()) ||
      unlock.chapters?.universities?.name?.toLowerCase().includes(search.toLowerCase()) ||
      unlock.chapters?.chapter_name?.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || unlock.unlock_type === filterType;

    return matchesSearch && matchesType;
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

  const getTierBadge = (credits: number) => {
    if (credits === 0) return { label: 'Subscription', color: 'bg-purple-100 text-purple-800' };
    if (Math.abs(credits) >= 9) return { label: '5.0⭐ Premium', color: 'bg-green-100 text-green-800' };
    if (Math.abs(credits) >= 7) return { label: '4.5+ Quality', color: 'bg-blue-100 text-blue-800' };
    if (Math.abs(credits) >= 5) return { label: '4.0+ Good', color: 'bg-yellow-100 text-yellow-800' };
    return { label: '3.0+ Basic', color: 'bg-gray-100 text-gray-800' };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Company', 'Chapter', 'Organization', 'University', 'State', 'Unlock Type', 'Credits', 'Amount Paid'];
    const rows = filteredUnlocks.map(unlock => [
      formatDate(unlock.unlocked_at),
      unlock.companies?.name || 'Unknown',
      unlock.chapters?.chapter_name || 'Unknown',
      unlock.chapters?.greek_organizations?.name || 'Unknown',
      unlock.chapters?.universities?.name || 'Unknown',
      unlock.chapters?.universities?.state || '',
      unlock.unlock_type,
      unlock.balance_transactions?.amount_credits || 0,
      `$${unlock.amount_paid.toFixed(2)}`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unlocks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalRevenue = unlocks.reduce((sum, u) => sum + Number(u.amount_paid), 0);
  const totalCreditsUsed = unlocks.reduce((sum, u) =>
    sum + Math.abs(u.balance_transactions?.amount_credits || 0), 0
  );

  if (loading) {
    return <div className="text-center py-12">Loading unlocks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Unlocks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{unlocks.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Unlock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credits Used</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalCreditsUsed}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Companies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {new Set(unlocks.map(u => u.company_id)).size}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
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
              <option value="full">Full Access</option>
              <option value="roster">Roster Only</option>
              <option value="officers">Officers Only</option>
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

      {/* Unlocks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUnlocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No unlocks found
                  </td>
                </tr>
              ) : (
                filteredUnlocks.map((unlock) => {
                  const credits = unlock.balance_transactions?.amount_credits || 0;
                  const tier = getTierBadge(credits);
                  const isFree = Number(unlock.amount_paid) === 0;

                  return (
                    <tr key={unlock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(unlock.unlocked_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {unlock.companies?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{unlock.chapters?.greek_organizations?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{unlock.chapters?.chapter_name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{unlock.chapters?.universities?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{unlock.chapters?.universities?.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                          {unlock.unlock_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isFree ? (
                          <span className="text-purple-600 font-semibold">Free</span>
                        ) : (
                          <span>{Math.abs(credits)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {isFree ? (
                          <span className="text-purple-600">$0.00</span>
                        ) : (
                          `$${Number(unlock.amount_paid).toFixed(2)}`
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 text-center">
        Showing {filteredUnlocks.length} of {unlocks.length} total unlocks
      </div>
    </div>
  );
};

export default UnlocksTab;

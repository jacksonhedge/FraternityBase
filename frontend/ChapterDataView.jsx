// CHAPTER DATA VIEW - The money maker!
// This is what users see when viewing a chapter

import React, { useState, useEffect } from 'react';
import { Lock, Users, Mail, Phone, Download, TrendingUp, Calendar } from 'lucide-react';

const ChapterDataView = ({ chapterId, chapterName, university }) => {
  const [chapterData, setChapterData] = useState(null);
  const [accessLevel, setAccessLevel] = useState({});
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Credit costs
  const COSTS = {
    roster: 100,
    contacts: 500,
    officers: 80,
    export: 200
  };

  useEffect(() => {
    loadChapterData();
    checkAccess();
    loadCredits();
  }, [chapterId]);

  const loadChapterData = async () => {
    // Load basic chapter data (free)
    const res = await fetch(`/api/chapters/${chapterId}/preview`);
    const data = await res.json();
    setChapterData(data);
  };

  const checkAccess = async () => {
    // Check what user has already unlocked
    const res = await fetch(`/api/chapters/${chapterId}/access`);
    const access = await res.json();
    setAccessLevel(access);
  };

  const loadCredits = async () => {
    const res = await fetch('/api/credits/balance');
    const data = await res.json();
    setCredits(data.balance);
  };

  const unlockData = async (unlockType) => {
    setLoading(true);

    const res = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId,
        unlockType
      })
    });

    const result = await res.json();

    if (res.status === 402) {
      // Insufficient credits
      setShowPurchaseModal(true);
    } else if (result.success) {
      // Refresh access and credits
      await checkAccess();
      await loadCredits();
      await loadChapterData();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {chapterName} - {university}
            </h1>
            <div className="flex gap-6 mt-4 text-gray-600">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {chapterData?.memberCount || '---'} Members
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {chapterData?.engagementScore || '--'}% Engagement
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Updated {chapterData?.lastUpdated || 'Recently'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Your Credits</div>
            <div className="text-2xl font-bold text-blue-600">{credits}</div>
            <button
              onClick={() => window.location.href = '/credits/purchase'}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Buy More Credits
            </button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Roster View */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Chapter Roster
            </h2>
            <p className="text-gray-600 mt-1">
              View all {chapterData?.memberCount} members with details
            </p>
          </div>

          {accessLevel.roster ? (
            // Show roster data
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chapterData?.members?.slice(0, 10).map(member => (
                  <div key={member.id} className="border rounded-lg p-3">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">
                      {member.position} • {member.major} • Class of {member.gradYear}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Showing 10 of {chapterData?.memberCount} members
              </div>
            </div>
          ) : (
            // Locked state
            <div className="p-6 bg-gray-50">
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Unlock Full Roster
                </h3>
                <p className="text-gray-600 mb-4">
                  Access names, positions, majors, and graduation years
                </p>
                <button
                  onClick={() => unlockData('chapter_roster')}
                  disabled={loading || credits < COSTS.roster}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    credits >= COSTS.roster
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Processing...' : `Unlock for ${COSTS.roster} Credits`}
                </button>
                {credits < COSTS.roster && (
                  <p className="text-red-600 text-sm mt-2">
                    You need {COSTS.roster - credits} more credits
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="w-6 h-6 text-green-600" />
              Contact Information
            </h2>
            <p className="text-gray-600 mt-1">
              Emails, phone numbers, and social media
            </p>
          </div>

          {accessLevel.contacts ? (
            // Show contact data
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-900 mb-2">
                    ✅ Full Access Granted
                  </div>
                  <div className="text-sm text-green-800">
                    You have access to all contact information for this chapter
                  </div>
                </div>

                <div className="grid gap-3">
                  <button className="flex items-center gap-2 text-blue-600 hover:underline">
                    <Mail className="w-4 h-4" />
                    Export all emails
                  </button>
                  <button className="flex items-center gap-2 text-blue-600 hover:underline">
                    <Phone className="w-4 h-4" />
                    Export all phone numbers
                  </button>
                  <button className="flex items-center gap-2 text-blue-600 hover:underline">
                    <Download className="w-4 h-4" />
                    Download full CSV
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Locked state with options
            <div className="p-6 bg-gray-50">
              <div className="space-y-4">
                {/* Officer contacts option */}
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-semibold mb-2">Officer Contacts Only</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get email & phone for ~10 officers
                  </p>
                  <button
                    onClick={() => unlockData('officer_contacts')}
                    disabled={loading || credits < COSTS.officers}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Unlock for {COSTS.officers} Credits
                  </button>
                </div>

                {/* Full contacts option */}
                <div className="border rounded-lg p-4 bg-white border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">All Member Contacts</h4>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      BEST VALUE
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Get email & phone for all {chapterData?.memberCount} members
                  </p>
                  <button
                    onClick={() => unlockData('chapter_contacts')}
                    disabled={loading || credits < COSTS.contacts}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Unlock for {COSTS.contacts} Credits
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Chapter Analytics</h2>

          <div className="space-y-4">
            {/* Major Distribution */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Top Majors
              </h3>
              <div className="space-y-2">
                {chapterData?.topMajors?.map(major => (
                  <div key={major.name} className="flex justify-between">
                    <span className="text-sm">{major.name}</span>
                    <span className="text-sm font-semibold">{major.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graduation Years */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Class Distribution
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[2024, 2025, 2026, 2027].map(year => (
                  <div key={year} className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">{year}</div>
                    <div className="font-semibold">
                      {chapterData?.classCounts?.[year] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

          <div className="space-y-3">
            <button
              className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => unlockData('export_chapter')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Export Full Chapter</div>
                  <div className="text-sm text-gray-600">Download complete CSV</div>
                </div>
                <div className="text-lg font-bold">{COSTS.export} credits</div>
              </div>
            </button>

            <button
              className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => window.location.href = `/chapters/${chapterId}/events`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">View Upcoming Events</div>
                  <div className="text-sm text-gray-600">Sponsorship opportunities</div>
                </div>
                <div className="text-sm text-gray-500">Free</div>
              </div>
            </button>

            <button
              className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => window.location.href = `/chapters/${chapterId}/partnership`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Send Partnership Inquiry</div>
                  <div className="text-sm text-gray-600">Direct message to officers</div>
                </div>
                <div className="text-lg font-bold">25 credits</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <h3 className="text-xl font-semibold mb-4">Insufficient Credits</h3>
            <p className="text-gray-600 mb-6">
              You need more credits to unlock this data. Purchase credits to continue.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.href = '/credits/purchase'}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterDataView;
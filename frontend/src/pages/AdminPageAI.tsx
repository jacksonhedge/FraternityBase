/**
 * Admin Page with AI Data Import
 *
 * This demonstrates how to use the AIDataImporter component
 * to import unformatted data from CSVs, Google Sheets, etc.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Building2, Users, UserCheck, LogOut, Wand2, Sparkles } from 'lucide-react';
import AIDataImporter from '../components/AIDataImporter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAdminHeaders = () => {
  const adminToken = sessionStorage.getItem('adminToken') || import.meta.env.VITE_ADMIN_TOKEN || '';
  return {
    'Content-Type': 'application/json',
    'x-admin-token': adminToken
  };
};

function AdminPageAI() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fraternities' | 'chapters' | 'officers' | 'universities'>('chapters');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleFraternityData = async (formattedData: any[]) => {
    setImportStatus({ type: null, message: '' });

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const fraternity of formattedData) {
        try {
          const response = await fetch(`${API_URL}/greek-organizations`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(fraternity)
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to save fraternity:', await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error('Error saving fraternity:', error);
        }
      }

      setImportStatus({
        type: errorCount === 0 ? 'success' : 'error',
        message: `Imported ${successCount} fraternities/sororities. ${errorCount > 0 ? `${errorCount} failed.` : ''}`
      });

    } catch (error: any) {
      setImportStatus({
        type: 'error',
        message: `Import failed: ${error.message}`
      });
    }
  };

  const handleChapterData = async (formattedData: any[]) => {
    setImportStatus({ type: null, message: '' });

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const chapter of formattedData) {
        try {
          const response = await fetch(`${API_URL}/chapters`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(chapter)
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to save chapter:', await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error('Error saving chapter:', error);
        }
      }

      setImportStatus({
        type: errorCount === 0 ? 'success' : 'error',
        message: `Imported ${successCount} chapters. ${errorCount > 0 ? `${errorCount} failed.` : ''}`
      });

    } catch (error: any) {
      setImportStatus({
        type: 'error',
        message: `Import failed: ${error.message}`
      });
    }
  };

  const handleOfficerData = async (formattedData: any[]) => {
    setImportStatus({ type: null, message: '' });

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const officer of formattedData) {
        try {
          const response = await fetch(`${API_URL}/officers`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(officer)
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to save officer:', await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error('Error saving officer:', error);
        }
      }

      setImportStatus({
        type: errorCount === 0 ? 'success' : 'error',
        message: `Imported ${successCount} officers. ${errorCount > 0 ? `${errorCount} failed.` : ''}`
      });

    } catch (error: any) {
      setImportStatus({
        type: 'error',
        message: `Import failed: ${error.message}`
      });
    }
  };

  const handleUniversityData = async (formattedData: any[]) => {
    setImportStatus({ type: null, message: '' });

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const university of formattedData) {
        try {
          const response = await fetch(`${API_URL}/universities`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(university)
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to save university:', await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error('Error saving university:', error);
        }
      }

      setImportStatus({
        type: errorCount === 0 ? 'success' : 'error',
        message: `Imported ${successCount} universities. ${errorCount > 0 ? `${errorCount} failed.` : ''}`
      });

    } catch (error: any) {
      setImportStatus({
        type: 'error',
        message: `Import failed: ${error.message}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">AI-Powered Data Import</h1>
                <p className="text-purple-100 text-sm">Paste messy data, get perfect formatting</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('fraternities')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'fraternities'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Fraternities/Sororities</span>
              </button>
              <button
                onClick={() => setActiveTab('chapters')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'chapters'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Chapters</span>
              </button>
              <button
                onClick={() => setActiveTab('officers')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'officers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span>Officers</span>
              </button>
              <button
                onClick={() => setActiveTab('universities')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'universities'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Universities</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Import Status */}
        {importStatus.type && (
          <div className={`mb-6 p-4 rounded-lg ${
            importStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {importStatus.message}
          </div>
        )}

        {/* AI Data Importer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'fraternities' && (
            <AIDataImporter
              entityType="fraternity"
              onDataFormatted={handleFraternityData}
              customInstructions="If organization type is not specified, infer from the name (e.g., 'Sigma Chi' = fraternity, 'Alpha Phi' = sorority)"
            />
          )}

          {activeTab === 'chapters' && (
            <AIDataImporter
              entityType="chapter"
              onDataFormatted={handleChapterData}
              customInstructions="Default status is 'active'. If member count is not provided, estimate based on university size (large university = 150-200, medium = 100-150, small = 50-100)"
            />
          )}

          {activeTab === 'officers' && (
            <AIDataImporter
              entityType="officer"
              onDataFormatted={handleOfficerData}
              customInstructions="If graduation year is provided as class year (Freshman, Sophomore, etc), convert to actual year. President should be is_primary_contact = true"
            />
          )}

          {activeTab === 'universities' && (
            <AIDataImporter
              entityType="university"
              onDataFormatted={handleUniversityData}
              customInstructions="Ensure state is always a 2-letter code. Format location as 'City, State' (e.g., 'State College, PA')"
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Brain className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <h3 className="font-semibold mb-2">How the AI Memory Works</h3>
              <p className="mb-2">
                The AI learns from each successful import you make. After confirming an import, it saves
                that example to improve future formatting. The more you use it, the smarter it gets!
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>First imports may need manual review</li>
                <li>After 3-5 imports, accuracy dramatically improves</li>
                <li>You can clear memory if patterns change</li>
                <li>Memory is stored locally in your browser</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPageAI;

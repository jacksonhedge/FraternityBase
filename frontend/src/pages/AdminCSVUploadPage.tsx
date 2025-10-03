import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Brain, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAdminHeaders = (contentType = 'application/json') => {
  const adminToken = sessionStorage.getItem('adminToken') || import.meta.env.VITE_ADMIN_TOKEN || '';
  return {
    'Content-Type': contentType,
    'x-admin-token': adminToken
  };
};

interface ProcessedData {
  chapterId: string;
  chapterName: string;
  universityName: string;
  members: Array<{
    name: string;
    position: string;
    email: string;
    phone: string;
    linkedin: string;
    graduation_year: number | null;
    major: string;
    member_type: string;
    is_primary_contact: boolean;
  }>;
  explanation: string;
  warnings: string[];
  confidence: 'high' | 'medium' | 'low';
}

export default function AdminCSVUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const processWithClaude = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('csv', selectedFile);

      const response = await fetch(`${API_URL}/admin/process-csv-with-claude`, {
        method: 'POST',
        headers: {
          'x-admin-token': getAdminHeaders().['x-admin-token']
        },
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to process CSV');
      }

      setProcessedData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV');
    } finally {
      setProcessing(false);
    }
  };

  const confirmUpload = async () => {
    if (!processedData) return;

    setUploading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/chapters/${processedData.chapterId}/upload-roster`,
        {
          method: 'POST',
          headers: {
            'x-admin-token': getAdminHeaders().['x-admin-token']
          },
          body: (() => {
            const formData = new FormData();
            const csvContent = [
              'name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact',
              ...processedData.members.map(m =>
                `${m.name},${m.position},${m.email},${m.phone},${m.linkedin},${m.graduation_year || ''},${m.major},${m.member_type},${m.is_primary_contact}`
              )
            ].join('\n');
            formData.append('csv', new Blob([csvContent], { type: 'text/csv' }), 'processed.csv');
            return formData;
          })()
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload roster');
      }

      setUploadResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to upload roster');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setProcessedData(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered CSV Upload</h1>
              <p className="text-gray-600">Let Claude parse, validate, and format your roster data</p>
            </div>
          </div>
        </div>

        {/* Upload Success */}
        {uploadResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Upload Successful!</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-green-700 font-medium">Inserted</p>
                    <p className="text-2xl font-bold text-green-900">{uploadResult.insertedCount}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Updated</p>
                    <p className="text-2xl font-bold text-green-900">{uploadResult.updatedCount}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Total Records</p>
                    <p className="text-2xl font-bold text-green-900">{uploadResult.totalRecords}</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        {!processedData && !uploadResult && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">
                Drop CSV file here or click to browse
              </p>
              <p className="text-gray-600 mb-6">
                Upload a chapter roster CSV and Claude will handle the rest
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Select CSV File
              </label>
            </div>

            {selectedFile && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={processWithClaude}
                    disabled={processing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing with Claude...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Process with Claude
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview & Confirmation */}
        {processedData && !uploadResult && (
          <div className="space-y-6">
            {/* Claude's Analysis */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Claude's Analysis</h3>
                  <p className="text-gray-700">{processedData.explanation}</p>

                  {processedData.warnings.length > 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ Warnings:</p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {processedData.warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      processedData.confidence === 'high'
                        ? 'bg-green-100 text-green-800'
                        : processedData.confidence === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {processedData.confidence.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Chapter</p>
                  <p className="text-lg font-medium text-gray-900">{processedData.chapterName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">University</p>
                  <p className="text-lg font-medium text-gray-900">{processedData.universityName}</p>
                </div>
              </div>
            </div>

            {/* Member Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Members ({processedData.members.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processedData.members.slice(0, 10).map((member, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{member.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.position}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {processedData.members.length > 10 && (
                  <p className="text-sm text-gray-500 text-center py-3">
                    ...and {processedData.members.length - 10} more
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={reset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={uploading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Upload to Database
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

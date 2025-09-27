import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Download, FileText, AlertCircle, Check, X, Info } from 'lucide-react';

interface CSVUploaderProps {
  type: 'fraternities' | 'chapters' | 'contacts';
  onDataParsed: (data: any[]) => void;
}

const CSVUploader = ({ type, onDataParsed }: CSVUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // CSV Templates
  const templates = {
    fraternities: {
      headers: ['name', 'greekLetters', 'founded', 'headquarters', 'totalChapters', 'totalMembers', 'website', 'description'],
      example: [
        'Sigma Chi', 'ΣΧ', '1855', 'Evanston, IL', '241', '350000', 'https://www.sigmachi.org', 'International fraternity founded at Miami University'
      ]
    },
    chapters: {
      headers: ['fraternityName', 'collegeName', 'collegeState', 'chapterName', 'founded', 'size', 'avgGPA', 'website', 'instagram', 'addressLine1', 'city', 'state', 'zipCode'],
      example: [
        'Sigma Chi', 'Penn State University', 'PA', 'Beta Psi', '1994', '156', '3.45', 'https://pennstatesigmachi.com', '@psusigmachi', '618 W College Ave', 'State College', 'PA', '16801'
      ]
    },
    contacts: {
      headers: ['fraternityName', 'collegeName', 'position', 'name', 'emails', 'phone', 'major', 'year', 'linkedIn'],
      example: [
        'Sigma Chi', 'Penn State University', 'President', 'John Smith', 'jsmith@psu.edu;john.smith@sigmachi.org', '(814) 555-0123', 'Business Administration', 'Senior', 'https://linkedin.com/in/johnsmith'
      ]
    }
  };

  const downloadTemplate = () => {
    const template = templates[type];
    const csvContent = [
      template.headers.join(','),
      template.example.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV file'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadStatus({
            type: 'error',
            message: `Error parsing CSV: ${results.errors[0].message}`
          });
          setIsUploading(false);
          return;
        }

        // Validate and process data
        const processedData = processCSVData(results.data);

        if (processedData.length === 0) {
          setUploadStatus({
            type: 'error',
            message: 'No valid data found in CSV'
          });
          setIsUploading(false);
          return;
        }

        setParsedData(processedData);
        setShowPreview(true);
        setUploadStatus({
          type: 'success',
          message: `Successfully parsed ${processedData.length} ${type} records`
        });
        setIsUploading(false);
      },
      error: (error) => {
        setUploadStatus({
          type: 'error',
          message: `Error reading file: ${error.message}`
        });
        setIsUploading(false);
      }
    });
  };

  const processCSVData = (data: any[]) => {
    const processed: any[] = [];
    const template = templates[type];

    data.forEach((row, index) => {
      // Skip empty rows
      if (Object.values(row).every(val => !val)) return;

      const processedRow: any = {};
      let isValid = true;

      // Process based on type
      if (type === 'fraternities') {
        processedRow.name = row.name?.trim();
        processedRow.greekLetters = row.greekLetters?.trim();
        processedRow.founded = row.founded?.trim();
        processedRow.headquarters = row.headquarters?.trim();
        processedRow.totalChapters = row.totalChapters?.trim();
        processedRow.totalMembers = row.totalMembers?.trim();
        processedRow.website = row.website?.trim();
        processedRow.description = row.description?.trim();

        if (!processedRow.name) isValid = false;
      } else if (type === 'chapters') {
        processedRow.fraternityName = row.fraternityName?.trim();
        processedRow.collegeName = row.collegeName?.trim();
        processedRow.collegeState = row.collegeState?.trim();
        processedRow.chapterName = row.chapterName?.trim();
        processedRow.founded = row.founded?.trim();
        processedRow.size = row.size?.trim();
        processedRow.avgGPA = row.avgGPA?.trim();
        processedRow.website = row.website?.trim();
        processedRow.instagram = row.instagram?.trim();
        processedRow.addressLine1 = row.addressLine1?.trim();
        processedRow.city = row.city?.trim();
        processedRow.state = row.state?.trim();
        processedRow.zipCode = row.zipCode?.trim();

        if (!processedRow.fraternityName || !processedRow.collegeName || !processedRow.collegeState) {
          isValid = false;
        }
      } else if (type === 'contacts') {
        processedRow.fraternityName = row.fraternityName?.trim();
        processedRow.collegeName = row.collegeName?.trim();
        processedRow.position = row.position?.trim();
        processedRow.name = row.name?.trim();
        // Split emails by semicolon or comma
        processedRow.emails = row.emails?.split(/[;,]/).map((e: string) => e.trim()).filter(Boolean) || [];
        processedRow.phone = row.phone?.trim();
        processedRow.major = row.major?.trim();
        processedRow.year = row.year?.trim();
        processedRow.linkedIn = row.linkedIn?.trim();

        if (!processedRow.fraternityName || !processedRow.collegeName || !processedRow.name || !processedRow.position) {
          isValid = false;
        }
      }

      if (isValid) {
        processedRow.rowNumber = index + 2; // +2 because header is row 1
        processed.push(processedRow);
      }
    });

    return processed;
  };

  const confirmImport = () => {
    onDataParsed(parsedData);
    setShowPreview(false);
    setParsedData([]);
    setUploadStatus({
      type: 'info',
      message: `${parsedData.length} records have been added to the form. Review and save them below.`
    });

    // Reset file input
    const fileInput = document.getElementById(`csv-upload-${type}`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const cancelImport = () => {
    setShowPreview(false);
    setParsedData([]);
    setUploadStatus({ type: null, message: '' });

    // Reset file input
    const fileInput = document.getElementById(`csv-upload-${type}`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor={`csv-upload-${type}`} className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload CSV file or{' '}
                <span className="text-primary-600 hover:text-primary-700">browse</span>
              </span>
              <input
                id={`csv-upload-${type}`}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">CSV files only</p>

          <button
            onClick={downloadTemplate}
            className="mt-4 inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus.type && (
        <div className={`p-4 rounded-lg flex items-start space-x-2 ${
          uploadStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          uploadStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {uploadStatus.type === 'success' && <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />}
          {uploadStatus.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
          {uploadStatus.type === 'info' && <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />}
          <span className="text-sm">{uploadStatus.message}</span>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && parsedData.length > 0 && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview: {parsedData.length} {type} records
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review the data before importing. Scroll to see all fields.
              </p>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      {Object.keys(parsedData[0] || {}).filter(k => k !== 'rowNumber').map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
                        {Object.entries(row).filter(([k]) => k !== 'rowNumber').map(([key, value]) => (
                          <td key={key} className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                            {Array.isArray(value) ? value.join(', ') : String(value || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing first 10 of {parsedData.length} records
                </p>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={cancelImport}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Import {parsedData.length} Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
import { useState } from 'react';
import {
  Wand2,
  Upload,
  AlertCircle,
  Check,
  Info,
  X,
  Trash2,
  Eye,
  Save,
  Brain,
  Loader
} from 'lucide-react';
import {
  formatDataWithAI,
  saveFormattingExample,
  loadFormattingExamples,
  clearFormattingMemory,
  type DataFormattingContext,
  type FormattingResult
} from '../utils/aiDataFormatter';

interface AIDataImporterProps {
  entityType: 'fraternity' | 'sorority' | 'chapter' | 'officer' | 'university';
  onDataFormatted: (data: any[]) => void;
  customInstructions?: string;
}

const AIDataImporter = ({ entityType, onDataFormatted, customInstructions }: AIDataImporterProps) => {
  const [rawData, setRawData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FormattingResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasMemory, setHasMemory] = useState(loadFormattingExamples(entityType).length > 0);

  const handleFormat = async () => {
    if (!rawData.trim()) {
      setResult({
        success: false,
        errors: ['Please paste some data to format']
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    const context: DataFormattingContext = {
      entityType,
      schema: {},
      previousExamples: loadFormattingExamples(entityType),
      customInstructions
    };

    const formattingResult = await formatDataWithAI(rawData, context);
    setResult(formattingResult);
    setShowResult(true);
    setIsProcessing(false);
  };

  const handleConfirmImport = () => {
    if (result?.data && result.data.length > 0) {
      // Save this as a successful example for future context
      saveFormattingExample(entityType, rawData, result.data[0]);
      setHasMemory(true);

      // Pass formatted data to parent
      onDataFormatted(result.data);

      // Clear form
      setRawData('');
      setResult(null);
      setShowResult(false);
    }
  };

  const handleClearMemory = () => {
    if (confirm(`Clear all formatting memory for ${entityType}? This will remove learned patterns.`)) {
      clearFormattingMemory(entityType);
      setHasMemory(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Memory Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className={`w-5 h-5 ${hasMemory ? 'text-green-600' : 'text-gray-400'}`} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI-Powered Data Import</h3>
            <p className="text-xs text-gray-500">
              {hasMemory
                ? `AI has learned from ${loadFormattingExamples(entityType).length} previous imports`
                : 'AI will learn from your imports to improve formatting'}
            </p>
          </div>
        </div>
        {hasMemory && (
          <button
            onClick={handleClearMemory}
            className="text-xs text-gray-600 hover:text-red-600 flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Memory</span>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy data from your CSV, Google Sheet, or any source</li>
              <li>Paste it in the text area below (any format works)</li>
              <li>Click "Format with AI" - Claude will intelligently structure it</li>
              <li>Review the formatted data and confirm import</li>
            </ol>
            <p className="mt-2 text-xs">
              💡 The AI understands messy data, missing columns, and various formats. It learns from each import!
            </p>
          </div>
        </div>
      </div>

      {/* Data Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Paste Unformatted Data
        </label>
        <textarea
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder={`Example for ${entityType}:

Penn State, Sigma Chi, Beta Psi Chapter, 156 members, 3.45 GPA
Contact: John Smith, President, jsmith@psu.edu, (814) 555-1234
Founded: 1994, Website: pennstatesigmachi.com

...or paste from Excel/Google Sheets/CSV - any format!`}
          className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          disabled={isProcessing}
        />
        <p className="text-xs text-gray-500">
          {rawData.length} characters • Supports CSV, TSV, JSON, or plain text
        </p>
      </div>

      {/* Custom Instructions (Optional) */}
      {customInstructions && (
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
          <span className="font-semibold">Custom instructions active:</span> {customInstructions}
        </div>
      )}

      {/* Format Button */}
      <button
        onClick={handleFormat}
        disabled={isProcessing || !rawData.trim()}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all ${
          isProcessing || !rawData.trim()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>AI is formatting your data...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span>Format with AI</span>
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Status Banner */}
          {result.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">
                    Successfully formatted {result.data?.length || 0} records
                  </p>
                  {result.aiExplanation && (
                    <p className="text-xs text-green-700 mt-1">{result.aiExplanation}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">Formatting failed</p>
                  {result.errors && result.errors.length > 0 && (
                    <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900">Warnings:</p>
                  <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                    {result.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview Data */}
          {result.success && result.data && result.data.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    Preview ({result.data.length} records)
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white max-h-96 overflow-auto">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {result.success && result.data && result.data.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmImport}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <Save className="w-5 h-5" />
                <span>Import {result.data.length} Records</span>
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setShowResult(false);
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* API Key Warning */}
      {!import.meta.env.VITE_ANTHROPIC_API_KEY && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-900">
              <p className="font-semibold">Anthropic API Key Required</p>
              <p className="text-xs mt-1">
                Add <code className="bg-orange-100 px-1 rounded">VITE_ANTHROPIC_API_KEY</code> to your .env file to use AI formatting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDataImporter;

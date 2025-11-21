import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileSpreadsheet, Download, Filter, AlertCircle, CheckCircle, ExternalLink, Zap, Search } from 'lucide-react';

export default function DataExportGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={() => navigate('/admin/crm')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CRM
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Large Data Export Guide</h1>
        <p className="text-gray-600 mt-2">
          How to work with large member database exports (30,000+ lines) without crashing your browser
        </p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Why This Matters */}
        <Section
          icon={<AlertCircle className="w-6 h-6 text-amber-600" />}
          title="Why Large JSON Files Cause Problems"
          color="amber"
        >
          <p className="text-gray-700 mb-4">
            When you export member data from 75+ chapters with 30,000+ rows, rendering all that JSON in a browser tab will:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">⚠️</span>
              <span><strong>Freeze your browser</strong> - Rendering thousands of lines blocks the main thread</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">⚠️</span>
              <span><strong>Use excessive memory</strong> - Large DOM trees consume gigabytes of RAM</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">⚠️</span>
              <span><strong>Become unsearchable</strong> - Browser find function (Cmd+F) breaks on massive files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">⚠️</span>
              <span><strong>Risk data loss</strong> - Tab crashes before you can save or process the data</span>
            </li>
          </ul>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>The solution:</strong> Download the data directly to a file, then use specialized tools designed for large datasets.
            </p>
          </div>
        </Section>

        {/* Quick Solutions */}
        <Section
          icon={<Zap className="w-6 h-6 text-blue-600" />}
          title="Quick Solutions by Use Case"
          color="blue"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SolutionCard
              title="Need to analyze in Excel/Sheets"
              steps={[
                'Download JSON file directly (see Method 1 below)',
                'Use online converter: json-csv.com',
                'Upload CSV to Google Sheets or Excel'
              ]}
              recommended={true}
            />
            <SolutionCard
              title="Need to search/filter data"
              steps={[
                'Use API with filters (see Method 2)',
                'Or load JSON into SQLite (Method 3)',
                'Query with SQL for precise results'
              ]}
            />
            <SolutionCard
              title="Need to share with non-technical team"
              steps={[
                'Export as CSV (Method 1 → converter)',
                'Upload to Google Sheets',
                'Share read-only link'
              ]}
            />
            <SolutionCard
              title="Need to process programmatically"
              steps={[
                'Download JSON directly',
                'Use Python pandas or Node.js',
                'Process in chunks to avoid memory issues'
              ]}
            />
          </div>
        </Section>

        {/* Method 1: Direct Download */}
        <Section
          icon={<Download className="w-6 h-6 text-green-600" />}
          title="Method 1: Direct Download (Recommended)"
          color="green"
        >
          <StepByStep
            steps={[
              {
                title: 'Use curl or wget to download',
                code: `curl "${import.meta.env.VITE_API_URL}/admin/members/export?format=json" \\
  -o members_export.json`,
                description: 'This downloads the file directly to disk without rendering in browser'
              },
              {
                title: 'Convert to CSV for spreadsheet use',
                description: 'Visit json-csv.com or use command line:',
                code: `# Using jq (install via: brew install jq)
cat members_export.json | jq -r '
  (.[0] | keys_unsorted) as $keys |
  $keys, (.[] | [.[ $keys[] ]]) | @csv
' > members.csv`
              },
              {
                title: 'Open in Excel or Google Sheets',
                description: 'Import the CSV file - it will handle 30,000+ rows easily'
              }
            ]}
          />
          <div className="mt-4 flex gap-3">
            <a
              href="https://json-csv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Open JSON to CSV Converter
            </a>
          </div>
        </Section>

        {/* Method 2: Filtered API Requests */}
        <Section
          icon={<Filter className="w-6 h-6 text-purple-600" />}
          title="Method 2: Use Filters to Reduce Data"
          color="purple"
        >
          <p className="text-gray-700 mb-4">
            Instead of exporting everything, filter on the backend first:
          </p>
          <StepByStep
            steps={[
              {
                title: 'Export specific chapters only',
                code: `curl "${import.meta.env.VITE_API_URL}/admin/members/export?chapter=Sigma Chi" \\
  -o sigma_chi_members.json`
              },
              {
                title: 'Export by university',
                code: `curl "${import.meta.env.VITE_API_URL}/admin/members/export?university=Penn State" \\
  -o penn_state_members.json`
              },
              {
                title: 'Export by date range',
                code: `curl "${import.meta.env.VITE_API_URL}/admin/members/export?since=2024-01-01" \\
  -o recent_members.json`
              },
              {
                title: 'Paginate for huge datasets',
                code: `# Get first 1000 records
curl "${import.meta.env.VITE_API_URL}/admin/members/export?limit=1000&offset=0"

# Get next 1000
curl "${import.meta.env.VITE_API_URL}/admin/members/export?limit=1000&offset=1000"`
              }
            ]}
          />
        </Section>

        {/* Method 3: SQLite Database */}
        <Section
          icon={<Database className="w-6 h-6 text-indigo-600" />}
          title="Method 3: Load into SQLite (Advanced)"
          color="indigo"
        >
          <p className="text-gray-700 mb-4">
            For complex queries and analysis, load the data into a local SQLite database:
          </p>
          <StepByStep
            steps={[
              {
                title: 'Download JSON export',
                code: `curl "${import.meta.env.VITE_API_URL}/admin/members/export?format=json" \\
  -o members.json`
              },
              {
                title: 'Create SQLite database',
                code: `sqlite3 members.db`
              },
              {
                title: 'Import JSON using Python script',
                code: `import json
import sqlite3

# Load JSON
with open('members.json') as f:
    data = json.load(f)

# Connect to SQLite
conn = sqlite3.connect('members.db')
cursor = conn.cursor()

# Create table
cursor.execute('''
    CREATE TABLE members (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        chapter TEXT,
        university TEXT,
        join_date TEXT
    )
''')

# Insert data
for member in data:
    cursor.execute(
        'INSERT INTO members VALUES (?, ?, ?, ?, ?, ?)',
        (member['id'], member['name'], member['email'],
         member['chapter'], member['university'], member['join_date'])
    )

conn.commit()
print(f"Imported {len(data)} members")`,
                language: 'python'
              },
              {
                title: 'Query the database',
                code: `-- Find all Sigma Chi members
SELECT * FROM members WHERE chapter = 'Sigma Chi';

-- Count by university
SELECT university, COUNT(*) as total
FROM members
GROUP BY university
ORDER BY total DESC;

-- Find recent joins
SELECT * FROM members
WHERE join_date > '2024-01-01'
ORDER BY join_date DESC;`
              }
            ]}
          />
        </Section>

        {/* Method 4: Google Sheets Import */}
        <Section
          icon={<FileSpreadsheet className="w-6 h-6 text-green-600" />}
          title="Method 4: Direct Import to Google Sheets"
          color="green"
        >
          <StepByStep
            steps={[
              {
                title: 'Get the API endpoint URL',
                code: `${import.meta.env.VITE_API_URL}/admin/members/export?format=csv`,
                description: 'This URL returns CSV format directly'
              },
              {
                title: 'In Google Sheets, use IMPORTDATA',
                code: `=IMPORTDATA("${import.meta.env.VITE_API_URL}/admin/members/export?format=csv")`,
                description: 'Paste this formula in cell A1'
              },
              {
                title: 'Wait for import (may take 30-60 seconds)',
                description: 'Google Sheets will fetch and parse the data automatically'
              }
            ]}
          />
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> IMPORTDATA has a limit of ~10MB. For larger exports, use Method 1 (download then upload).
            </p>
          </div>
        </Section>

        {/* Best Practices */}
        <Section
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          title="Best Practices"
          color="green"
        >
          <div className="space-y-4">
            <BestPractice
              title="Always filter before exporting"
              description="Export only what you need. Use chapter, university, or date filters to reduce data size."
            />
            <BestPractice
              title="Use CSV for spreadsheets"
              description="Excel and Google Sheets handle CSV better than JSON. Always convert large datasets."
            />
            <BestPractice
              title="Paginate huge exports"
              description="For 50,000+ records, use offset and limit parameters to export in batches of 5,000."
            />
            <BestPractice
              title="Download, don't render"
              description="Never try to view 30,000+ lines in a browser. Download directly to disk using curl or wget."
            />
            <BestPractice
              title="Use the right tool"
              description="Spreadsheet analysis → CSV/Excel. Complex queries → SQLite. Programming → JSON with streaming."
            />
          </div>
        </Section>

        {/* Quick Links */}
        <Section
          icon={<Search className="w-6 h-6 text-blue-600" />}
          title="Helpful Tools & Resources"
          color="blue"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolLink
              name="JSON to CSV Converter"
              url="https://json-csv.com"
              description="Convert large JSON files to CSV format"
            />
            <ToolLink
              name="DB Browser for SQLite"
              url="https://sqlitebrowser.org"
              description="Visual interface for SQLite databases"
            />
            <ToolLink
              name="jq (JSON processor)"
              url="https://stedolan.github.io/jq/"
              description="Command-line JSON processor for filtering/transforming"
            />
            <ToolLink
              name="Google Sheets IMPORTDATA docs"
              url="https://support.google.com/docs/answer/3093335"
              description="Documentation for importing data into Sheets"
            />
          </div>
        </Section>

        {/* Need Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 mb-4">
            If you're still having trouble with large exports, reach out to the development team with:
          </p>
          <ul className="text-blue-800 space-y-1 mb-4">
            <li>• What you're trying to accomplish</li>
            <li>• How many records you're exporting</li>
            <li>• What error or issue you're experiencing</li>
          </ul>
          <button
            onClick={() => navigate('/admin/crm')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to CRM
          </button>
        </div>

      </div>
    </div>
  );
}

// Helper Components

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  const colors = {
    amber: 'bg-amber-50 border-amber-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} border rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StepByStep({ steps }: { steps: Array<{ title: string; code?: string; description?: string; language?: string }> }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
            {step.description && <p className="text-sm text-gray-600 mb-2">{step.description}</p>}
            {step.code && (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                <code>{step.code}</code>
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function SolutionCard({ title, steps, recommended }: { title: string; steps: string[]; recommended?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border-2 ${recommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      {recommended && (
        <div className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-2">
          RECOMMENDED
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <ol className="space-y-2 text-sm">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-2">
            <span className="text-blue-600 font-bold">{index + 1}.</span>
            <span className="text-gray-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BestPractice({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ToolLink({ name, url, description }: { name: string; url: string; description: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </a>
  );
}

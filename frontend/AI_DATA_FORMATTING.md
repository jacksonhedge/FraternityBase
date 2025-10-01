# AI-Powered Data Formatting System

## Overview

This system uses Claude AI to intelligently format unstructured data from CSVs, Google Sheets, or any text source before inserting it into your database. The AI learns from your previous imports to continuously improve formatting accuracy.

## Features

✨ **Smart Formatting**: Handles messy data, missing columns, and inconsistent formats
🧠 **Memory/Context**: Learns from each successful import to improve future formatting
📋 **Multiple Sources**: Supports CSV, TSV, JSON, Google Sheets, or plain text
🎯 **Schema Validation**: Ensures data matches your exact database schema
⚠️ **Error Detection**: Identifies and warns about potential data issues
🔄 **Iterative Learning**: Gets smarter with each import you make

## Setup

### 1. Get an Anthropic API Key

1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key

### 2. Add API Key to Environment

Add to your `.env` file:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### 3. Import the Component

```tsx
import AIDataImporter from '../components/AIDataImporter';

// In your admin page:
<AIDataImporter
  entityType="chapter"
  onDataFormatted={(data) => {
    // Handle formatted data
    console.log('Formatted data:', data);
    setChapters([...chapters, ...data]);
  }}
  customInstructions="Optional: any special formatting rules"
/>
```

## Usage Examples

### Example 1: Messy Chapter Data

**Input (unformatted):**
```
Penn State, Sigma Chi, Beta Psi, 156 members
Contact: John Smith pres jsmith@psu.edu 8145551234
Founded 1994, site: pennstatesigmachi.com
3.45 gpa, very active
```

**AI Output (formatted):**
```json
{
  "greek_organization_id": "lookup:Sigma Chi",
  "university_id": "lookup:Penn State",
  "chapter_name": "Beta Psi",
  "member_count": 156,
  "status": "active",
  "charter_date": "1994-01-01",
  "website": "https://pennstatesigmachi.com",
  "contact_email": "jsmith@psu.edu",
  "phone": "(814) 555-1234",
  "avg_gpa": 3.45,
  "engagement_score": 95
}
```

### Example 2: Google Sheets Copy-Paste

**Input (tab-separated from Google Sheets):**
```
Name	Position	Email	Phone	Year
John Smith	President	jsmith@psu.edu	814-555-1234	Senior
Jane Doe	VP Finance	jdoe@psu.edu	8145555678	Junior
```

**AI Output:**
```json
[
  {
    "chapter_id": "current_chapter",
    "name": "John Smith",
    "position": "President",
    "email": "jsmith@psu.edu",
    "phone": "(814) 555-1234",
    "graduation_year": 2024,
    "is_primary_contact": true
  },
  {
    "chapter_id": "current_chapter",
    "name": "Jane Doe",
    "position": "VP Finance",
    "email": "jdoe@psu.edu",
    "phone": "(814) 555-5678",
    "graduation_year": 2025,
    "is_primary_contact": false
  }
]
```

### Example 3: CSV Data

**Input (CSV format):**
```
Sigma Chi,ΣΧ,1855,Evanston IL,241,350000,https://sigmachi.org
Alpha Phi,ΑΦ,1872,Evanston IL,175,225000,https://alphaphi.org
```

**AI Output:**
```json
[
  {
    "name": "Sigma Chi",
    "greek_letters": "ΣΧ",
    "organization_type": "fraternity",
    "founded_year": 1855,
    "headquarters": "Evanston, IL",
    "total_chapters": 241,
    "total_members": 350000,
    "national_website": "https://sigmachi.org"
  },
  {
    "name": "Alpha Phi",
    "greek_letters": "ΑΦ",
    "organization_type": "sorority",
    "founded_year": 1872,
    "headquarters": "Evanston, IL",
    "total_chapters": 175,
    "total_members": 225000,
    "national_website": "https://alphaphi.org"
  }
]
```

## How the AI Memory/Context Works

### Learning Process

1. **Initial Import**: AI uses only the database schema and built-in formatting rules
2. **Successful Import**: Example is saved to localStorage
3. **Future Imports**: AI uses previous examples to understand your data patterns
4. **Continuous Improvement**: Each import teaches the AI more about your data style

### What Gets Remembered

- Common field name variations you use
- Your preferred formatting styles
- Typical data structures in your imports
- Successful mappings between messy and clean data

### Memory Storage

Examples are stored in browser localStorage:
```javascript
// View saved examples
loadFormattingExamples('chapter');

// Clear memory for a specific type
clearFormattingMemory('chapter');

// Clear all memory
clearFormattingMemory();
```

## Supported Entity Types

### 1. Fraternity/Sorority
Required: `name`, `organization_type`
Optional: `greek_letters`, `founded_year`, `headquarters`, `national_website`, etc.

### 2. Chapter
Required: `greek_organization_id`, `university_id`, `chapter_name`, `status`
Optional: `member_count`, `charter_date`, `website`, `contact_email`, etc.

### 3. Officer
Required: `chapter_id`, `name`, `position`
Optional: `email`, `phone`, `linkedin_profile`, `graduation_year`, etc.

### 4. University
Required: `name`, `location`, `state`
Optional: `student_count`, `greek_percentage`, `website`, `logo_url`

## Advanced Features

### Custom Instructions

Pass special formatting rules:

```tsx
<AIDataImporter
  entityType="chapter"
  customInstructions="All phone numbers should include country code +1. Default status is 'active' unless specified."
  onDataFormatted={handleData}
/>
```

### Batch Processing

The AI can handle multiple records in a single paste:

```
Row 1: Penn State, Sigma Chi, Beta Psi, 156
Row 2: Ohio State, Sigma Chi, Theta Theta, 142
Row 3: Michigan, Sigma Chi, Alpha Alpha, 189
```

All three will be parsed and formatted automatically.

### Error Handling

The AI provides detailed errors and warnings:

```json
{
  "errors": [
    "Row 3: Missing required field 'university_id'"
  ],
  "warnings": [
    "Row 1: Could not confidently identify chapter name, assumed 'Beta Psi'",
    "Row 2: Phone number format unusual, best guess applied"
  ]
}
```

## Best Practices

### 1. Start with Good Examples
The first few imports teach the AI your data patterns. Try to use well-formatted data initially.

### 2. Review Before Importing
Always review the AI's formatted output before clicking "Import". The AI is smart but not perfect.

### 3. Provide Context
Use the `customInstructions` prop for any special rules or patterns in your data.

### 4. Clear Memory Periodically
If the AI starts making consistent mistakes, clear the memory and start fresh.

### 5. Include Headers
When pasting from spreadsheets, include the header row so the AI knows what each column represents.

## Troubleshooting

### AI Returns Errors

1. Check that your Anthropic API key is set correctly
2. Verify the data isn't completely empty or malformed
3. Try simplifying the data (fewer columns/rows)
4. Check browser console for detailed error messages

### Wrong Formatting

1. Clear the memory for that entity type
2. Add custom instructions to clarify expectations
3. Try providing more structured data (like CSV with headers)

### Missing Required Fields

The AI will warn you about missing required fields. Either:
- Add the missing data to your input
- Modify the data after import
- Update your database schema to make fields optional

## API Cost

This uses Claude 3.5 Sonnet. Estimated costs:
- **Small import** (1-10 records): ~$0.01
- **Medium import** (10-100 records): ~$0.05
- **Large import** (100-1000 records): ~$0.25

## Integration Example

Full integration in your admin page:

```tsx
import { useState } from 'react';
import AIDataImporter from '../components/AIDataImporter';

function AdminPage() {
  const [chapters, setChapters] = useState([]);

  const handleAIFormattedData = async (formattedData) => {
    // Validate formatted data
    console.log('AI formatted data:', formattedData);

    // Save to database
    for (const chapter of formattedData) {
      try {
        const response = await fetch(`${API_URL}/chapters`, {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify(chapter)
        });

        if (response.ok) {
          const saved = await response.json();
          setChapters(prev => [...prev, saved]);
        }
      } catch (error) {
        console.error('Error saving chapter:', error);
      }
    }
  };

  return (
    <div>
      <h2>Import Chapters</h2>
      <AIDataImporter
        entityType="chapter"
        onDataFormatted={handleAIFormattedData}
        customInstructions="Default status is 'active'. Estimate member count if not provided based on university size."
      />
    </div>
  );
}
```

## Future Enhancements

- [ ] Support for image/PDF OCR
- [ ] Automatic duplicate detection
- [ ] Batch validation with existing database records
- [ ] Export formatted data as CSV template
- [ ] AI suggestions for improving data quality
- [ ] Multi-language support
- [ ] Auto-geocoding for addresses

## Support

For issues or questions, check the browser console for detailed error messages. The AI will provide explanations of its formatting decisions in the "explanation" field.

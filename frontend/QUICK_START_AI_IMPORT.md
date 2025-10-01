# Quick Start: AI Data Import

## 🚀 Setup in 3 Steps

### Step 1: Get Anthropic API Key (2 minutes)

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Click "API Keys" in the sidebar
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-`)

### Step 2: Add to Environment (.env file)

Open `/frontend/.env` and add:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 3: Use in Your Admin Page

```tsx
import AIDataImporter from '../components/AIDataImporter';

function YourAdminPage() {
  const handleFormattedData = async (data) => {
    // Save to database
    for (const item of data) {
      await fetch(`${API_URL}/chapters`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(item)
      });
    }
  };

  return (
    <div>
      <h2>Import Chapters</h2>
      <AIDataImporter
        entityType="chapter"
        onDataFormatted={handleFormattedData}
      />
    </div>
  );
}
```

## 💡 Example Usage

### Scenario: You have messy chapter data in a Google Sheet

**Copy this from your spreadsheet:**
```
Penn State    Sigma Chi    Beta Psi    156 members
Contact: John Smith president jsmith@psu.edu 8145551234
Founded 1994, site pennstatesigmachi.com 3.45 gpa

Ohio State    Sigma Chi    Theta Theta    142
jdoe@osu.edu (614)555-5678, VP Operations

Michigan    Sigma Chi    Alpha Alpha    189 members
website: umichsigmachi.com, instagram @umichsigchi
```

**Paste into AI Data Importer → Click "Format with AI"**

**AI Returns:**
```json
[
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
    "avg_gpa": 3.45
  },
  {
    "greek_organization_id": "lookup:Sigma Chi",
    "university_id": "lookup:Ohio State",
    "chapter_name": "Theta Theta",
    "member_count": 142,
    "status": "active",
    "contact_email": "jdoe@osu.edu",
    "phone": "(614) 555-5678"
  },
  {
    "greek_organization_id": "lookup:Sigma Chi",
    "university_id": "lookup:Michigan",
    "chapter_name": "Alpha Alpha",
    "member_count": 189,
    "status": "active",
    "website": "https://umichsigmachi.com",
    "instagram_handle": "@umichsigchi"
  }
]
```

**Click "Import 3 Records" → Done!** ✅

## 🧠 How Memory Works

The AI learns from each successful import:

1. **First Import**: You paste messy data, AI formats it, you review and confirm
2. **AI Saves Example**: Your import pattern is saved to browser localStorage
3. **Future Imports**: AI uses your past patterns to format new data better
4. **Continuous Improvement**: After 3-5 imports, accuracy becomes excellent

**Example of Learning:**

First time you import with field "mbrs":
```
Penn State, Beta Psi, 156 mbrs
```

AI learns "mbrs" = "member_count"

Next time you use "mbrs", AI automatically knows what it means!

## 📊 What Can It Handle?

✅ CSV files (comma-separated)
✅ TSV files (tab-separated from Excel/Google Sheets)
✅ Plain text with any delimiter
✅ JSON data
✅ Mixed formats in the same paste
✅ Missing fields (uses smart defaults)
✅ Phone numbers in any format
✅ URLs with or without https://
✅ Emails in various formats
✅ State names or abbreviations
✅ Greek letters from text names

## 🎯 Pro Tips

1. **Include Headers**: When pasting from spreadsheets, include the header row
2. **Use Custom Instructions**: Add rules specific to your data
3. **Review First Few**: Always review the first 2-3 imports carefully
4. **Clear Memory**: If AI makes mistakes, clear memory and start fresh
5. **Batch Import**: You can paste 100+ rows at once

## 🔍 Custom Instructions Examples

```tsx
<AIDataImporter
  entityType="chapter"
  customInstructions="
    - Default status is 'active'
    - If member count > 200, flag as 'needs_review'
    - Instagram handles should not include 'instagram.com'
    - Phone numbers must include area code
  "
/>
```

## 💰 Cost

Claude 3.5 Sonnet pricing:
- **Small** (1-10 records): ~$0.01
- **Medium** (10-100 records): ~$0.05
- **Large** (100-1000 records): ~$0.25

## 🆘 Troubleshooting

**Q: "API key not configured" error**
A: Make sure `VITE_ANTHROPIC_API_KEY` is in your .env file

**Q: AI is making wrong assumptions**
A: Clear memory with the "Clear Memory" button and try again

**Q: Required fields are missing**
A: Add those fields to your source data or fill them in after import

**Q: Format is inconsistent**
A: Use custom instructions to specify exact formatting rules

## 📚 Full Documentation

See `AI_DATA_FORMATTING.md` for complete documentation including:
- Full schema definitions
- Advanced features
- Memory management
- API reference
- Integration examples

## 🎉 That's It!

You're now ready to import data 10x faster with AI assistance. The system learns from you and gets better over time.

**Try it out**: Go to your admin page, paste some messy data, and watch the magic happen! ✨

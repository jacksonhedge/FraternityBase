/**
 * AI Data Formatter with Memory/Context Management
 *
 * This system uses Claude AI to intelligently format unstructured data
 * before inserting it into the database. It maintains context about your
 * database schema, past formatting decisions, and common patterns.
 */

export interface DataFormattingContext {
  entityType: 'fraternity' | 'sorority' | 'chapter' | 'officer' | 'university';
  schema: Record<string, any>;
  previousExamples?: Array<{ input: string; output: any }>;
  customInstructions?: string;
}

export interface FormattingResult {
  success: boolean;
  data?: any[];
  errors?: string[];
  warnings?: string[];
  aiExplanation?: string;
}

// Database schema definitions with field descriptions
export const DATABASE_SCHEMAS = {
  fraternity: {
    name: { type: 'string', required: true, description: 'Full official name of the fraternity' },
    greek_letters: { type: 'string', required: false, description: 'Greek letters representation (e.g., ΣΧ)' },
    organization_type: { type: 'enum', values: ['fraternity', 'sorority'], required: true, description: 'Type of Greek organization' },
    founded_year: { type: 'number', required: false, description: 'Year the organization was founded' },
    national_website: { type: 'url', required: false, description: 'Official national website URL' },
    headquarters: { type: 'string', required: false, description: 'Location of national headquarters' },
    total_chapters: { type: 'number', required: false, description: 'Total number of chapters nationally' },
    total_members: { type: 'number', required: false, description: 'Total number of members nationally' },
    description: { type: 'text', required: false, description: 'Brief description of the organization' }
  },

  chapter: {
    greek_organization_id: { type: 'uuid', required: true, description: 'ID of the parent fraternity/sorority' },
    university_id: { type: 'uuid', required: true, description: 'ID of the university' },
    chapter_name: { type: 'string', required: true, description: 'Chapter designation (e.g., Beta Psi, Alpha Chapter)' },
    member_count: { type: 'number', required: false, description: 'Current number of active members' },
    status: { type: 'enum', values: ['active', 'inactive', 'probation'], required: true, description: 'Current status of the chapter' },
    charter_date: { type: 'date', required: false, description: 'Date the chapter was chartered (YYYY-MM-DD)' },
    house_address: { type: 'string', required: false, description: 'Physical address of chapter house' },
    instagram_handle: { type: 'string', required: false, description: 'Instagram handle (with or without @)' },
    website: { type: 'url', required: false, description: 'Chapter website URL' },
    contact_email: { type: 'email', required: false, description: 'Primary contact email' },
    phone: { type: 'phone', required: false, description: 'Contact phone number' },
    avg_gpa: { type: 'number', required: false, description: 'Average GPA of chapter members (0.0-4.0)' },
    engagement_score: { type: 'number', required: false, description: 'Engagement score (0-100)' },
    partnership_openness: { type: 'enum', values: ['very_open', 'open', 'selective', 'not_interested'], required: false, description: 'Openness to partnerships' }
  },

  officer: {
    chapter_id: { type: 'uuid', required: true, description: 'ID of the chapter' },
    name: { type: 'string', required: true, description: 'Full name of the officer' },
    position: { type: 'string', required: true, description: 'Officer position/title (e.g., President, VP of Finance)' },
    email: { type: 'email', required: false, description: 'Officer email address' },
    phone: { type: 'phone', required: false, description: 'Officer phone number' },
    linkedin_profile: { type: 'url', required: false, description: 'LinkedIn profile URL' },
    graduation_year: { type: 'number', required: false, description: 'Expected graduation year' },
    major: { type: 'string', required: false, description: 'Academic major' },
    is_primary_contact: { type: 'boolean', required: false, description: 'Is this the primary contact for the chapter?' }
  },

  university: {
    name: { type: 'string', required: true, description: 'Official university name' },
    location: { type: 'string', required: true, description: 'City, State format (e.g., State College, PA)' },
    state: { type: 'string', required: true, description: 'Two-letter state code (e.g., PA, CA, TX)' },
    student_count: { type: 'number', required: false, description: 'Total number of students' },
    greek_percentage: { type: 'number', required: false, description: 'Percentage of students in Greek life (0-100)' },
    website: { type: 'url', required: false, description: 'University website URL' },
    logo_url: { type: 'url', required: false, description: 'URL to university logo image' }
  }
};

// Common formatting patterns learned from previous imports
export const FORMATTING_PATTERNS = {
  phone: [
    { input: '8145551234', output: '(814) 555-1234' },
    { input: '814-555-1234', output: '(814) 555-1234' },
    { input: '(814)555-1234', output: '(814) 555-1234' }
  ],
  instagram: [
    { input: 'psusigmachi', output: '@psusigmachi' },
    { input: '@psusigmachi', output: '@psusigmachi' },
    { input: 'instagram.com/psusigmachi', output: '@psusigmachi' }
  ],
  url: [
    { input: 'www.example.com', output: 'https://www.example.com' },
    { input: 'example.com', output: 'https://example.com' }
  ],
  state: [
    { input: 'Pennsylvania', output: 'PA' },
    { input: 'penn', output: 'PA' },
    { input: 'Texas', output: 'TX' }
  ],
  greekLetters: [
    { input: 'Sigma Chi', output: 'ΣΧ' },
    { input: 'Alpha Phi', output: 'ΑΦ' },
    { input: 'Theta', output: 'Θ' }
  ]
};

// State name to abbreviation mapping
export const STATE_ABBREVIATIONS: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH',
  'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
  'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA',
  'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', 'tennessee': 'TN',
  'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
  'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

/**
 * Build the AI prompt with full context and memory
 */
export function buildFormattingPrompt(
  rawData: string,
  context: DataFormattingContext
): string {
  const schema = DATABASE_SCHEMAS[context.entityType] || context.schema;

  return `You are a data formatting assistant for a fraternity/sorority database system. Your job is to take unformatted data and convert it to match our exact database schema.

## DATABASE SCHEMA FOR ${context.entityType.toUpperCase()}:
${JSON.stringify(schema, null, 2)}

## FORMATTING RULES:
1. **Required fields**: ${Object.entries(schema).filter(([_, v]: any) => v.required).map(([k]) => k).join(', ')}
2. **Phone numbers**: Format as (XXX) XXX-XXXX
3. **URLs**: Always include https:// prefix
4. **Instagram**: Format as @username (remove full URLs if present)
5. **State codes**: Always use 2-letter abbreviations (PA, CA, TX, etc)
6. **Emails**: Validate format and lowercase
7. **Dates**: Format as YYYY-MM-DD
8. **Greek letters**: Convert text names to actual Greek symbols when possible
9. **Numbers**: Remove commas, currency symbols, and other formatting
10. **Status/Enum fields**: Must match exact allowed values

## COMMON PATTERNS TO RECOGNIZE:
${JSON.stringify(FORMATTING_PATTERNS, null, 2)}

${context.previousExamples ? `
## PREVIOUS SUCCESSFUL EXAMPLES:
${context.previousExamples.map((ex, i) => `
Example ${i + 1}:
Input: ${ex.input}
Output: ${JSON.stringify(ex.output, null, 2)}
`).join('\n')}
` : ''}

${context.customInstructions ? `
## CUSTOM INSTRUCTIONS:
${context.customInstructions}
` : ''}

## RAW DATA TO FORMAT:
${rawData}

## YOUR TASK:
1. Parse the raw data (it may be CSV, tab-separated, or unstructured text)
2. Identify which fields from the schema each piece of data corresponds to
3. Apply all formatting rules to clean and standardize the data
4. Handle missing data gracefully (use null for optional fields)
5. Flag any data that cannot be confidently mapped
6. Return a JSON array of formatted objects

## IMPORTANT:
- If data has multiple rows/records, return an array
- If unsure about a mapping, include it in a "warnings" array
- If required fields are missing, include details in "errors" array
- Be intelligent about fuzzy matching (e.g., "Penn State" = "Pennsylvania State University")

## RESPONSE FORMAT (JSON):
{
  "success": true/false,
  "data": [ /* array of formatted objects */ ],
  "errors": [ /* array of error messages for critical issues */ ],
  "warnings": [ /* array of warnings for uncertain mappings */ ],
  "explanation": "Brief explanation of what you did and any assumptions made"
}`;
}

/**
 * Call Claude API to format the data
 */
export async function formatDataWithAI(
  rawData: string,
  context: DataFormattingContext,
  apiKey?: string
): Promise<FormattingResult> {
  const claudeApiKey = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!claudeApiKey) {
    return {
      success: false,
      errors: ['Anthropic API key not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file']
    };
  }

  try {
    const prompt = buildFormattingPrompt(rawData, context);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        errors: [`AI API error: ${error}`]
      };
    }

    const result = await response.json();
    const aiResponse = result.content[0].text;

    // Parse the AI's JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        errors: ['Could not parse AI response as JSON'],
        aiExplanation: aiResponse
      };
    }

    const formattedResult = JSON.parse(jsonMatch[0]);

    return {
      success: formattedResult.success,
      data: formattedResult.data || [],
      errors: formattedResult.errors || [],
      warnings: formattedResult.warnings || [],
      aiExplanation: formattedResult.explanation
    };

  } catch (error: any) {
    return {
      success: false,
      errors: [`Error calling AI API: ${error.message}`]
    };
  }
}

/**
 * Save formatting examples to local storage for future context
 */
export function saveFormattingExample(
  entityType: string,
  input: string,
  output: any
): void {
  const key = `formatting_examples_${entityType}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');

  existing.push({
    input: input.substring(0, 200), // Store first 200 chars
    output,
    timestamp: new Date().toISOString()
  });

  // Keep only last 10 examples
  if (existing.length > 10) {
    existing.shift();
  }

  localStorage.setItem(key, JSON.stringify(existing));
}

/**
 * Load previous formatting examples for context
 */
export function loadFormattingExamples(entityType: string): Array<{ input: string; output: any }> {
  const key = `formatting_examples_${entityType}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Clear formatting memory/examples
 */
export function clearFormattingMemory(entityType?: string): void {
  if (entityType) {
    localStorage.removeItem(`formatting_examples_${entityType}`);
  } else {
    // Clear all
    Object.keys(DATABASE_SCHEMAS).forEach(type => {
      localStorage.removeItem(`formatting_examples_${type}`);
    });
  }
}

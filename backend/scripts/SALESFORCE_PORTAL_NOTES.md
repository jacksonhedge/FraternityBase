# Sigma Chi Salesforce Portal - Scraper Notes

## Portal Details

**URL**: https://portal.sigmachi.org/s/searchdirectory?id=a2bVH0000006Pbd

**Type**: Salesforce Lightning Community Portal

## What's Different

The Sigma Chi portal uses **Salesforce Lightning**, which means:
- Data loads dynamically via JavaScript
- Standard Salesforce table components (`.slds-table`)
- May have pagination/infinite scroll
- May require search/filter interactions to show all data

## Scraper Updates

I've updated the scraper to:

1. **Navigate directly** to your roster URL
2. **Wait for Lightning components** to load (3 second delay + selector waiting)
3. **Detect Salesforce table structures** automatically
4. **Print row data to console** so you can see the column order
5. **Extract and map** data based on column positions

## Testing Steps

### Step 1: Run the Scraper

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run scrape:sigmachi
```

### Step 2: Watch the Console Output

The scraper will print each row it finds like this:
```
Row 1: Alpha Chapter | Miami University | Oxford | OH | ΑΑ | ...
Row 2: Beta Chapter | Wooster College | Wooster | OH | Β | ...
```

### Step 3: Identify Column Order

Based on the console output, identify which column contains which data:
- Column 0 (cellTexts[0]): ?
- Column 1 (cellTexts[1]): ?
- Column 2 (cellTexts[2]): ?
- etc.

### Step 4: Update Field Mapping

Edit `scripts/scrape-sigma-chi.ts` around line 321 and update the mapping:

```typescript
const chapterData: ChapterData = {
  chapterName: cellTexts[0] || '',      // Update this index
  university: cellTexts[1] || '',       // Update this index
  greekLetters: cellTexts[4] || '',     // Add if Greek letters column exists
  city: cellTexts[2] || '',             // Update this index
  state: cellTexts[3] || '',            // Update this index
  province: cellTexts[5] || '',         // Add if province column exists
  status: cellTexts[6] || 'active',     // Add if status column exists
  // Add more fields as needed
};
```

### Step 5: Handle Pagination/Filtering

If the page shows only 10-20 results and there's a "Show More" button or pagination:

1. Check the screenshot (`sigma-chi-roster-page.png`)
2. Look for pagination controls
3. Update the scraper to click "Next" or "Show All"

Example code to add before scraping:

```typescript
// Try to show all results
const showAllButton = await page.$('button:has-text("Show All")');
if (showAllButton) {
  await showAllButton.click();
  await page.waitForTimeout(2000);
}

// Or handle pagination
let hasNextPage = true;
while (hasNextPage) {
  // Scrape current page
  // ...

  const nextButton = await page.$('button.slds-button[title*="Next"]');
  if (nextButton && await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForTimeout(2000);
  } else {
    hasNextPage = false;
  }
}
```

## Common Salesforce Selectors

If the automatic detection doesn't work, try these selectors manually:

**Table rows**:
- `table.slds-table tbody tr`
- `lightning-datatable tbody tr`
- `[role="grid"] [role="row"]:not([role="columnheader"])`

**Table cells**:
- `td.slds-cell`
- `th[data-label]`

**Pagination**:
- `button[title="Next Page"]`
- `.slds-pagination button`

**Show All**:
- `select.slds-select option[value="All"]`
- `button:has-text("Show All")`

## Troubleshooting

### No rows found?
- Check if login is working
- Look at the screenshot - is the data visible?
- Check if there's a search button to click
- Try increasing the wait time after navigation

### Wrong data extracted?
- Check the console output to see column order
- Update the cellTexts[] index mapping
- Some cells might be nested (links, buttons, etc.)

### Partial data?
- There's likely pagination
- Add pagination handling (see example above)
- Or look for a "Show All" control

## Files to Check After Run

1. **sigma-chi-roster-page.png** - Visual of what the scraper sees
2. **sigma-chi-page-source.html** - Full HTML source code
3. **Console output** - See the row data being extracted

## Next Steps

1. Run the scraper and check outputs
2. Update field mapping based on column order
3. Test export: `npm run scrape:sigmachi -- --export=test.json`
4. Review test.json
5. Import: `npm run scrape:sigmachi -- --import`

## Example Field Mapping

Based on common Sigma Chi roster structures, columns might be:

```typescript
// Common pattern
chapterName: cellTexts[0],        // e.g., "Alpha Alpha Chapter"
university: cellTexts[1],         // e.g., "Miami University"
city: cellTexts[2],               // e.g., "Oxford"
state: cellTexts[3],              // e.g., "OH"
greekLetters: cellTexts[4],       // e.g., "ΑΑ"
province: cellTexts[5],           // e.g., "Province I"
charterDate: cellTexts[6],        // e.g., "06/28/1855"
status: cellTexts[7],             // e.g., "Active"
```

But **you must verify this** by looking at your actual console output!

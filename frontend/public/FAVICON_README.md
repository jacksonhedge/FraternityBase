# Favicon Files Needed

The current implementation uses an emoji SVG (🧢) as a favicon, which may not render consistently across browsers.

## Required Files

To properly implement favicons, create and add these files to `/public/`:

### 1. Standard Favicons
- `favicon.ico` - 16x16, 32x32, 48x48 (multi-size ICO file)
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG

### 2. Apple Touch Icons
- `apple-touch-icon.png` - 180x180 PNG
- `apple-touch-icon-precomposed.png` - 180x180 PNG (optional fallback)

### 3. Android/PWA Icons
- `android-chrome-192x192.png` - 192x192 PNG
- `android-chrome-512x512.png` - 512x512 PNG

### 4. Web App Manifest
- `site.webmanifest` - JSON file for PWA configuration

## How to Generate

### Option 1: Online Generator
Use https://realfavicongenerator.net/
1. Upload your logo/brand image (at least 260x260px)
2. Customize appearance for different platforms
3. Download generated package
4. Extract files to `/public/` directory

### Option 2: Design Tool
1. Create square logo in Figma/Photoshop (at least 512x512px)
2. Export as PNG at various sizes listed above
3. Use tool like https://favicon.io/ to convert PNG to ICO

## Current HTML References

Update `/index.html` to reference proper favicons:

```html
<!-- Replace current emoji favicons with: -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

## Design Recommendations

- Use FraternityBase brand colors
- Keep design simple and recognizable at small sizes
- Ensure good contrast for visibility
- Consider using the cap emoji (🧢) as inspiration but as a proper graphic
- Test at multiple sizes before finalizing

# CRITICAL: Extension Icons Required

## IMMEDIATE ACTION NEEDED

The extension **WILL NOT LOAD** without PNG icon files. You must create these 4 files:

### Required Files (All PNG format):

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

### FASTEST Solution (2 minutes):

1. **Use any image editor** (Paint, GIMP, Photoshop, or online tool)
2. **Create square images** with these exact names and sizes
3. **Use green background** (#4CAF50) with "CU" text in white
4. **Save in the `icons/` folder**

### Alternative - Use Online Generator:

1. Go to: https://favicon.io/favicon-generator/
2. Text: "CU"
3. Background: Green (#4CAF50)
4. Download all sizes
5. Rename to: icon16.png, icon32.png, icon48.png, icon128.png

### Or Use the HTML Generator:

1. Open `generate_icons.html` in Chrome
2. Right-click each canvas
3. "Save image as..." with correct names

## ⚠️ CRITICAL WARNING

**The extension cannot be installed or tested without these PNG files.** The manifest.json references them and Chrome will reject the extension if they're missing.

**This is a HARD BLOCKER for your project review.**

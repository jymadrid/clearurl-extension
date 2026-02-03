# Setup Instructions

## Quick Start Guide

### 1. Update Repository URLs

Before uploading to GitHub, update these placeholder URLs with your actual repository:

**Files to update:**

- `README.md` - Replace `YOUR-USERNAME` with your GitHub username
- `package.json` - Update repository URLs and author information
- `CONTRIBUTING.md` - Update GitHub links
- `SECURITY.md` - Update contact information

**Find and replace:**

```
YOUR-USERNAME → your-github-username
```

### 2. Create Extension Icons

The extension needs icon files to work properly:

**Option A: Use the HTML generator**

1. Open `icons/generate_icons.html` in your browser
2. Right-click each icon and save as PNG files
3. Save as: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

**Option B: Create manually**

- Create square images with green background (#4CAF50)
- Add "CU" text in white
- Sizes: 16x16, 32x32, 48x48, 128x128 pixels

### 3. Install Development Dependencies

```bash
npm install
```

### 4. Test the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project directory
5. Test on URLs with tracking parameters

### 5. Ready for GitHub

Once icons are created and URLs updated, the project is ready for GitHub upload and can be used to apply for developer benefits.

## Development Commands

```bash
npm run lint          # Check code quality
npm run test          # Run tests (when implemented)
npm run build         # Build extension package
npm run format        # Format code
```

## Production Checklist

- [ ] Icons created and present in `/icons/` directory
- [ ] Repository URLs updated with your GitHub username
- [ ] Extension loads without errors in Chrome
- [ ] All lint checks pass
- [ ] Documentation reviewed and customized
- [ ] License and contact information updated
- [ ] GitHub repository created and code pushed

The project is designed to pass developer program reviews and demonstrate real value to the open-source community.

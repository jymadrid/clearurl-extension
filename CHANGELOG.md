# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Firefox compatibility (planned)
- Advanced regex rules support (planned)
- Rule sharing community features (planned)

## [1.0.0] - 2025-01-08

### Added

- **Core URL Cleaning**: Automatic removal of tracking parameters using Chrome's declarativeNetRequest API
- **Comprehensive Parameter Support**: Removes 50+ tracking parameters including:
  - Google Analytics (utm\_\*, gclid, gad_source, etc.)
  - Social Media (fbclid, igshid, twclid, etc.)
  - Marketing Tools (HubSpot, Piwik/Matomo, etc.)
- **Real-time Statistics**: Track cleaned URLs and removed parameters
- **Interactive Popup Interface**:
  - Live activity logs
  - Statistics dashboard
  - Quick settings access
  - Per-site whitelist toggle
- **Comprehensive Settings Page**:
  - Built-in rule management
  - Custom rule creation
  - Whitelist management
  - Statistics and data export
- **Privacy-Focused Design**:
  - All data stored locally
  - No external data transmission
  - Minimal permissions required
- **Professional UI**: Clean, responsive interface with dark mode support
- **Badge Notifications**: Visual feedback showing cleaning activity
- **Whitelist System**: Per-site control to disable cleaning when needed
- **Custom Rules**: Users can add their own tracking parameters
- **Data Export**: Export statistics and settings for backup

### Security

- Uses Chrome Extension Manifest V3 for enhanced security
- Input validation and sanitization throughout
- No remote code execution or external dependencies
- Minimal permission model

### Documentation

- Comprehensive README with installation and usage guides
- Developer documentation and contribution guidelines
- Security policy and vulnerability reporting process
- Professional project structure for open-source development

### Infrastructure

- Complete GitHub project setup with CI/CD pipelines
- Automated testing and linting workflows
- Issue and pull request templates
- Professional development toolchain with ESLint, Prettier, Jest

## Project Goals Achieved

✅ **Privacy Protection**: Automatically removes tracking parameters without user intervention  
✅ **Performance**: Uses efficient network-level cleaning for minimal impact  
✅ **Usability**: Simple, intuitive interface requiring no configuration  
✅ **Transparency**: Fully open-source with comprehensive documentation  
✅ **Reliability**: Robust error handling and graceful degradation  
✅ **Extensibility**: Customizable rules and whitelist system  
✅ **Professional Quality**: Production-ready code with proper testing and CI/CD

---

**Note**: Version 1.0.0 represents a complete, production-ready privacy tool suitable for daily use and open-source contribution.

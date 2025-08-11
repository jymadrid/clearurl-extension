# ClearURL: Privacy-Focused URL Cleaner

A lightweight browser extension that automatically removes tracking parameters from URLs to enhance your privacy while browsing.

ClearURL is an open-source Chrome extension that helps protect user privacy by automatically removing tracking parameters from URLs. Built with modern web standards and designed for performance, it operates transparently in the background to clean URLs without impacting browsing experience.

## 🎯 Purpose

Online tracking has become increasingly sophisticated, with companies embedding tracking parameters in URLs to monitor user behavior across websites. ClearURL addresses this privacy concern by automatically identifying and removing these parameters, helping users maintain better privacy without manual intervention.

## ⚡ Technical Architecture

ClearURL leverages Chrome's modern `declarativeNetRequest` API for efficient URL processing at the network layer. This approach provides better performance compared to traditional JavaScript-based solutions while maintaining a minimal memory footprint.

## 🚀 Key Features

### 🎯 **Automatic URL Cleaning**
- Real-time parameter removal using Chrome's declarativeNetRequest API
- Zero-latency processing with minimal performance impact
- Smart parameter detection with comprehensive rule coverage

### 📊 **Privacy Analytics**  
- Activity tracking with transparent statistics
- Recent cleanup history for user awareness
- Quantified protection metrics to understand privacy improvements

### ⚙️ **Flexible Configuration**
- Customizable rule engine for advanced users
- Whitelist functionality for site-specific exceptions
- Easy toggle controls for quick activation/deactivation

### 🏠 **Site Management**
- Per-domain control for granular privacy settings
- One-click site exemptions for trusted domains
- Global controls with site-specific overrides

### 🔔 **User Feedback**
- Optional notification system for transparency
- Badge indicators showing cleanup activity
- Unobtrusive privacy protection with minimal interface

## 🚀 Installation

### 📦 **Chrome Web Store**
1. Visit the Chrome Web Store (coming soon)
2. Click "Add to Chrome" 
3. Confirm permissions when prompted
4. The extension icon will appear in your browser toolbar

### 🔧 **Development Installation**
For developers or advanced users who want to install from source:

1. Clone this repository:
   ```bash
   git clone https://github.com/jymadrid/clearurl-extension.git
   cd clearurl-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the extension directory

5. The extension should now appear in your extensions list

## 🏗️ Technical Implementation

### **Core Technologies**
- **JavaScript (ES2022+)** - Modern language features with async/await
- **Chrome Extension Manifest V3** - Latest extension platform standards
- **declarativeNetRequest API** - Efficient network-level URL processing
- **Chrome Storage API** - Persistent settings and statistics storage

### **Architecture Overview**
The extension uses a modular architecture with clear separation of concerns:

#### **🎯 Service Worker (`background.js`)**
- Handles URL processing and cleanup logic
- Manages extension statistics and user preferences
- Provides messaging interface for UI components
- Implements rule-based parameter detection

#### **💻 Popup Interface (`popup.html/js/css`)**
- Displays real-time privacy statistics
- Provides quick access to extension controls
- Shows recent cleanup activity
- Offers one-click site management

#### **⚙️ Options Page (`options.html/js/css`)**
- Comprehensive settings management
- Advanced rule configuration
- Whitelist management interface
- Data export and import capabilities

#### **📋 Rule Configuration (`rules.json`)**
- Declarative rules for network request processing
- Optimized regex patterns for parameter matching
- Designed for performance and maintainability

## 🎯 Supported Tracking Parameters

ClearURL automatically removes over 50 common tracking parameters from URLs:

### **🔍 Analytics Platforms**
- **Google Analytics**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`
- **Google Ads**: `gclid`, `gad_source`, `gbraid`, `wbraid` - *Click tracking parameters*

### **📱 Social Media Platforms**
- **Facebook**: `fbclid` - *Facebook click identifier*
- **Instagram**: `igshid` - *Instagram share identifier*  
- **Twitter**: `twclid` - *Twitter click tracking*
- **Microsoft**: `msclkid` - *Microsoft advertising click tracking*

### **🎮 Marketing & Analytics Tools**
- **Google Analytics Enhanced**: `_ga`, `_gl` - *Client and link tracking*
- **HubSpot**: `_hsenc`, `_hsmi`, `hsCtaTracking`, `hsa_*` - *HubSpot tracking suite*
- **Piwik/Matomo**: `pk_*`, `piwik_*` - *Open-source analytics tracking*
- **Email Marketing**: Various campaign and source tracking parameters

*For a complete list of supported parameters, see [background.js:107-120](background.js#L107-L120)*

## ⚙️ Usage & Configuration

### **🎛️ Main Controls**
- **Extension Toggle**: Enable/disable URL cleaning globally
- **Statistics Display**: View real-time cleaning activity and metrics  
- **Recent Activity**: See recently cleaned URLs and removed parameters

### **🛡️ Site Management**
- **Whitelist Control**: Add trusted sites that should be exempted from cleaning
- **Per-Domain Settings**: Configure cleaning behavior for specific websites
- **Quick Toggle**: Easily enable/disable cleaning for the current site

### **🏴 Advanced Options**
- **Custom Rules**: Define additional tracking parameters to remove
- **Export/Import**: Backup and restore extension settings
- **Statistics Reset**: Clear accumulated usage data

## 🔒 Privacy & Security

### **🛡️ Privacy-First Design**
ClearURL is built with privacy as the core principle:
- **🚫 No External Communication** - All processing happens locally on your device
- **🔐 Local Data Storage** - Statistics and settings stored securely in your browser  
- **👻 Transparent Operation** - No hidden data collection or transmission
- **🕵️ Minimal Permissions** - Only requests necessary browser permissions

### **🔑 Required Permissions**
- **`declarativeNetRequest`**: Process and clean URLs at the network level
- **`storage`**: Save user preferences and statistics locally
- **`activeTab`**: Access current page information for site-specific controls
- **`<all_urls>`**: Monitor and clean URLs across all websites

*Each permission serves a specific privacy protection function and is essential for the extension's operation.*

## 🤝 Contributing

We welcome contributions from developers, privacy advocates, and users who want to help improve online privacy. There are many ways to contribute:

### 🐛 Reporting Issues
1. Check [existing issues](https://github.com/jymadrid/clearurl-extension/issues) first
2. Create detailed bug reports including:
   - Browser version and operating system
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Screenshots or error messages if applicable

### 📝 Improving Documentation
- Help translate the extension to other languages
- Improve README documentation and examples
- Add educational content about online privacy
- Create user guides and tutorials

### 🔧 Adding New Tracking Parameters
1. Research the parameter and document its purpose
2. Test that removing it doesn't break website functionality
3. Submit a pull request with:
   - Parameter name and description
   - Documentation or source references
   - Test cases demonstrating the change

### 💻 Code Contributions
1. Fork the repository and create a feature branch
2. Make your changes with appropriate tests
3. Follow the existing code style and conventions
4. Submit a pull request with a detailed description

### 🧪 Testing & Quality Assurance
- Test the extension on different websites
- Report compatibility issues
- Help with performance testing
- Contribute to automated testing efforts

### Development Setup

```bash
# Clone the repository
git clone https://github.com/jymadrid/clearurl-extension.git
cd clearurl-extension

# Install development dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## 📈 Development Roadmap

We're committed to continuously improving ClearURL based on community feedback and evolving privacy needs.

### Version 1.1.0 - Enhanced Functionality
- [ ] **Firefox Compatibility** - Extend support to Firefox users
- [ ] **Settings Import/Export** - Backup and restore configuration
- [ ] **Advanced Regex Rules** - User-defined custom tracking parameters
- [ ] **Performance Dashboard** - Detailed metrics and impact analysis
- [ ] **Bulk Whitelist Management** - Import/export whitelist configurations

### Version 1.2.0 - Community Features
- [ ] **Rule Sharing Platform** - Community-contributed tracking parameter definitions
- [ ] **Automatic Rule Updates** - Keep up with new tracking methods automatically
- [ ] **Privacy Tool Integration** - Work seamlessly with other privacy extensions
- [ ] **Mobile Browser Support** - Extend to mobile browsing platforms
- [ ] **Educational Content** - In-app privacy education and tips

### Version 2.0.0 - Advanced Privacy Features
- [ ] **AI-Powered Detection** - Machine learning for new tracking pattern recognition
- [ ] **Network Analysis** - Deep inspection of tracking behavior patterns
- [ ] **Privacy Score** - Quantified privacy protection metrics
- [ ] **Integration APIs** - Allow other privacy tools to leverage ClearURL

### Community Priorities
We regularly review community feedback to prioritize development. Popular requests include:
- Better visualization of cleaned URLs
- Integration with password managers
- Corporate deployment features
- Advanced logging and auditing

*Have a feature request? [Open an issue](https://github.com/jymadrid/clearurl-extension/issues) and let's discuss it!*

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License ensures this project remains open source and free for everyone to use, modify, and distribute.

## 🙏 Acknowledgments

ClearURL is built with appreciation for:

- **Chrome Extension APIs** - Google's comprehensive extension platform
- **Privacy Research Community** - Researchers who identify and document tracking methods
- **Open Source Contributors** - Developers who contribute code, documentation, and feedback
- **Privacy Advocates** - Users who help test and improve the extension
- **Web Standards Groups** - Organizations working to improve web privacy standards

## 📞 Support & Community

### Getting Help
- **📖 Documentation**: [Extension wiki and guides](https://github.com/jymadrid/clearurl-extension/wiki)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/jymadrid/clearurl-extension/issues)
- **💬 Discussions**: [Community Q&A](https://github.com/jymadrid/clearurl-extension/discussions)
- **📧 Contact**: For security issues, email jymadrid@protonmail.com

### Community Guidelines
We're committed to maintaining a welcoming, inclusive community:
- Be respectful and constructive in discussions
- Focus on technical merit and user benefit
- Help newcomers learn about privacy protection
- Collaborate openly and share knowledge

### Security & Privacy Issues
If you discover a security vulnerability, please report it privately to jymadrid@protonmail.com rather than opening a public issue.

---

**Built with ❤️ for digital privacy**

*Helping users take control of their online privacy, one URL at a time.*

**Stars ⭐ and contributions are greatly appreciated!**
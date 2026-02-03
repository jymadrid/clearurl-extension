# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The ClearURL team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **security-reports@protonmail.com**

If you don't receive a response within 48 hours, please follow up via the backup contact method:

- Create an issue with the title "Security Issue - Please Contact Privately"
- Include minimal details and request private communication

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths** of source file(s) related to the manifestation of the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial response**: Within 48 hours
- **Detailed response**: Within 7 days
- **Resolution timeline**: Depends on severity and complexity

### Security Measures

ClearURL implements several security measures:

#### Data Protection

- **No external data transmission** - All data stays on your device
- **Local storage only** - Settings and statistics stored locally
- **No analytics or tracking** - The extension doesn't track users
- **Minimal permissions** - Only requests necessary browser permissions

#### Code Security

- **Input validation** - All user inputs are validated and sanitized
- **Secure APIs** - Uses modern Chrome Extension Manifest V3
- **Regular updates** - Dependencies and security practices reviewed regularly
- **Open source** - All code is publicly auditable

#### Privacy Protection

- **URL cleaning only** - Extension only modifies URLs, doesn't read page content
- **No personal data collection** - No personal information is collected or stored
- **User control** - Users can disable/enable features and whitelist sites

### Scope

This security policy applies to:

- The ClearURL browser extension code
- Official distribution channels (Chrome Web Store, Firefox Add-ons)
- Related infrastructure and documentation

### Out of Scope

The following are typically out of scope:

- Issues in third-party dependencies (unless directly exploitable)
- Issues requiring physical access to a user's device
- Issues in unsupported browsers or versions
- Social engineering attacks

### Recognition

We value security research and will acknowledge your contribution:

- **Hall of Fame** - Recognition in our security acknowledgments
- **Coordination** - We'll work with you on public disclosure timing
- **Credit** - Public credit for your discovery (if desired)

### Legal

We commit to:

- Not pursue legal action against security researchers who follow this policy
- Work with researchers to understand and resolve issues
- Credit researchers for their valuable contributions

### Security Best Practices for Users

To maximize your security while using ClearURL:

1. **Keep Updated** - Always use the latest version
2. **Verify Source** - Only install from official stores
3. **Review Permissions** - Understand what permissions the extension needs
4. **Report Issues** - Report any suspicious behavior immediately
5. **Use HTTPS** - Ensure you're visiting secure websites

### Security Features

ClearURL includes these security-focused features:

- **Manifest V3 Compliance** - Uses the latest, most secure extension platform
- **Minimal Attack Surface** - Limited functionality reduces potential vulnerabilities
- **No Remote Code** - All code is included in the extension package
- **Permission Minimization** - Only requests necessary permissions
- **Transparent Operation** - Open source for security auditing

### Threat Model

ClearURL protects against:

- **URL-based tracking** - Removes tracking parameters from links
- **Cross-site tracking** - Prevents parameter-based user correlation
- **Privacy invasion** - Blocks common tracking mechanisms

ClearURL does NOT protect against:

- **Cookies or local storage** - Use other privacy tools for these
- **Fingerprinting** - Browser fingerprinting requires different solutions
- **Network-level tracking** - Use VPN or proxy for network privacy
- **Malicious websites** - Use antivirus and safe browsing practices

### Contact Information

For security-related matters:

- **Security Email**: security-reports@protonmail.com
- **Response Time**: Within 48 hours

For general issues:

- **GitHub Issues**: [Report non-security bugs](https://github.com/jymadrid/clearurl-extension/issues)
- **Discussions**: [General questions and discussions](https://github.com/jymadrid/clearurl-extension/discussions)

---

Thank you for helping keep ClearURL and its users safe! 🛡️

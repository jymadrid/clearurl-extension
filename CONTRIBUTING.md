# Contributing to ClearURL

Thank you for your interest in contributing to ClearURL! This document provides guidelines and information about contributing to this project.

## 🤝 How to Contribute

### Reporting Bugs

1. **Search existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information**:
   - Browser version and OS
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Screenshots if applicable
   - Console errors (if any)

### Suggesting Features

1. **Check the roadmap** and existing feature requests
2. **Use the feature request template**
3. **Describe the problem** your feature would solve
4. **Provide use cases** and examples
5. **Consider implementation complexity**

### Contributing Code

#### Prerequisites

- Familiarity with JavaScript, HTML, CSS
- Understanding of Chrome Extension APIs
- Git and GitHub knowledge

#### Setup Development Environment

1. **Fork the repository**

   ```bash
   git clone https://github.com/jymadrid/clearurl-extension.git
   cd clearurl-extension
   ```

2. **Install dependencies** (if package.json exists)

   ```bash
   npm install
   ```

3. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

#### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style and patterns
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   - Test manually in multiple scenarios
   - Verify no existing functionality is broken
   - Test on different websites with tracking parameters

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

#### Commit Message Guidelines

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

- `feat: add custom rule validation`
- `fix: resolve popup display issue on Firefox`
- `docs: update installation instructions`

#### Pull Request Process

1. **Update documentation** if needed
2. **Ensure all tests pass** (if tests exist)
3. **Update the README** if you've added features
4. **Create a pull request** with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Testing instructions

## 📋 Code Style Guidelines

### JavaScript

- Use ES6+ features (async/await, arrow functions, etc.)
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Handle errors gracefully with try-catch blocks
- Follow existing patterns in the codebase

### HTML/CSS

- Use semantic HTML elements
- Follow BEM methodology for CSS classes
- Ensure responsive design
- Maintain accessibility standards

### Code Example

```javascript
/**
 * Adds a new tracking parameter to the custom rules
 * @param {string} parameter - The parameter to add
 * @returns {boolean} - Success status
 */
async function addCustomRule(parameter) {
  try {
    if (!this.validateParameter(parameter)) {
      throw new Error('Invalid parameter format');
    }

    this.customRules.push(parameter);
    await this.saveSettings();
    return true;
  } catch (error) {
    console.error('Failed to add custom rule:', error);
    return false;
  }
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup interface displays correctly
- [ ] Settings page functions properly
- [ ] URL cleaning works on test websites
- [ ] Statistics update correctly
- [ ] Whitelist functionality works
- [ ] Custom rules can be added/removed

### Test URLs

Use these URLs to test the extension:

```
https://example.com?utm_source=test&utm_medium=email&utm_campaign=newsletter
https://example.com?fbclid=test123&gclid=test456
https://example.com?ref=reddit&source=google&click_id=abc123
```

## 📝 Adding Tracking Parameters

When adding new tracking parameters:

1. **Research the parameter**
   - Document what service uses it
   - Verify it's actually used for tracking
   - Check if removing it breaks functionality

2. **Add to the appropriate list**
   - Built-in rules for common parameters
   - Test the parameter removal thoroughly

3. **Update documentation**
   - Add to the README parameter list
   - Include source/reference information

## 🔒 Security Considerations

- Never log or transmit user data
- Validate all user inputs
- Use secure coding practices
- Test for XSS vulnerabilities
- Review permissions carefully

## 📖 Documentation

- Keep README.md up to date
- Update CHANGELOG.md for significant changes
- Comment complex code sections
- Include examples in documentation

## 🎯 Project Goals

When contributing, keep these project goals in mind:

- **Privacy-first**: Protect user data and browsing habits
- **Performance**: Minimize impact on browsing speed
- **Usability**: Keep the interface simple and intuitive
- **Reliability**: Ensure the extension works consistently
- **Transparency**: Maintain open-source principles

## ❓ Questions?

- Check existing [Issues](https://github.com/jymadrid/clearurl-extension/issues)
- Start a [Discussion](https://github.com/jymadrid/clearurl-extension/discussions)
- Review the [Documentation](README.md)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Please read and follow these guidelines to ensure a welcoming environment for all contributors.

---

Thank you for contributing to ClearURL! Every contribution helps make the web more private and secure. 🛡️

<p align="right">
  <a href="README_zh.md">简体中文</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/jymadrid/clearurl-extension/main/icons/icon128.png" alt="ClearURL Logo" width="128" height="128">
</p>

<h1 align="center">ClearURL</h1>

<p align="center">
  <strong>Reshape links, return to purity.</strong>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg" />
  <a href="https://github.com/jymadrid/clearurl-extension/stargazers">
    <img alt="Stargazers" src="https://img.shields.io/github/stars/jymadrid/clearurl-extension.svg?style=social&label=Star"/>
  </a>
</p>

<p align="center">
  <a href="#why-choose-clearurl">Philosophy</a> •
  <a href="#installation-guide">Installation</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#join-us">Contribute</a>
</p>

---

> The digital world should be as free as thought. But somewhere along the way, every click and every redirect became shackled with invisible chains—tracking parameters in URLs. They record, analyze, and define us, weaving the open internet into a giant net of precision marketing.
>
> **ClearURL was born from a simple belief: to return the power of links to every user.**
>
> It's not just another tool; it's a rediscovery of the pure browsing experience. It works silently but firmly to erase every digital tracking footprint, ensuring that your journey across the web is about the content itself, and nothing else.

## Why Choose ClearURL?

| Core Philosophy          | Implementation                                                                                                                                                                                                                         |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Seamless Experience**  | **True power is feeling its absence.** Built on Chrome's latest `declarativeNetRequest` engine, ClearURL rewrites rules at the lowest level of network communication. This means the cleaning process is instantaneous, with zero latency and no interference, offering a silky-smooth, traceless browsing experience. |
| **Absolute Privacy**     | **Your privacy is sacred.** All of ClearURL's operations are performed 100% on your local device. It doesn't rely on any cloud servers and will never collect, upload, or analyze any of your browsing data. Simply put, we stay out of your world. |
| **Open Source Core**     | **Trust comes from complete transparency.** We've made our entire codebase public for developers worldwide to review, scrutinize, and contribute to. We believe that only absolute transparency can build absolute security. |
| **Intelligent Evolution**| **As tracking technology evolves, so does our protection.** ClearURL's rule set is sourced from the collective wisdom of the global privacy community and is continuously updated. It accurately identifies and removes various parameters, from ad tracking to social sharing, ensuring effective cleaning without breaking core website functionality. |

## 📦 Installation Guide

### **Official Store (Coming Soon)**
A little more patience, and you'll be able to install it with one click from the Chrome Web Store for official convenience and security.

### **Pioneer Experience (Developer Mode)**
If you can't wait to get started, you can install it from the source code:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/jymadrid/clearurl-extension.git
    ```
2.  **Go to the Chrome Extensions page**
    Enter `chrome://extensions/` in your address bar and press Enter.

3.  **Enable Developer Mode**
    Activate the "Developer mode" switch in the top-right corner.

4.  **Load the extension**
    Click "Load unpacked" and select the `clearurl-extension` folder you just cloned.

That's it. The ClearURL icon will quietly appear in your browser's toolbar, ready to begin its mission.

## 🛠️ How It Works

Behind ClearURL's simplicity lies powerful technology.

- **Manifest V3**: We use Google's latest extension specification, ensuring higher security, stability, and performance from the ground up.
- **Service Worker (`background.js`)**: As the extension's intelligent core, it runs in a separate background thread, handling logic and state management to keep the main thread fluid.
- **Declarative Net Request**: This is the core technology that delivers a "zero-latency" experience. By using predefined declarative rules, we delegate the heavy lifting of URL cleaning entirely to the browser's core for efficient processing, completely eliminating the performance bottlenecks of traditional JavaScript-based blocking methods.

## 💖 Join Us

ClearURL is more than just a project; it's a movement for digital freedom. Every user and every contributor is a part of this movement.

- **Submit an Issue**: Found a new tracking parameter or a bug? Please let us know.
- **Join a Discussion**: Have ideas for future features? Share them with the community.
- **Contribute Code**: Whether it's fixing a bug or implementing a new feature, your contributions are more than welcome.

We believe that small pieces of code can come together to create a powerful force that changes the digital world.

---

<p align="center">
  <strong>ClearURL — Born for every pure click.</strong>
</p>

<p align="center">
  If ClearURL resonates with you, please show your support with a ⭐ Star.
</p>

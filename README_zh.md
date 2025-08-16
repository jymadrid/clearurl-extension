<p align="right">
  <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/jymadrid/clearurl-extension/main/icons/icon128.png" alt="ClearURL Logo" width="128" height="128">
</p>

<h1 align="center">ClearURL</h1>

<p align="center">
  <strong>重塑链接，回归纯粹。</strong>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg" />
  <a href="https://github.com/jymadrid/clearurl-extension/stargazers">
    <img alt="Stargazers" src="https://img.shields.io/github/stars/jymadrid/clearurl-extension.svg?style=social&label=Star"/>
  </a>
</p>

<p align="center">
  <a href="#-为什么选择-clearurl">理念</a> •
  <a href="#-安装指南">安装</a> •
  <a href="#-工作原理">原理</a> •
  <a href="#-加入我们">贡献</a>
</p>

---

> 数字世界，本应如思想般自由。但不知从何时起，我们每一次的点击、跳转，都被附上了无形的枷锁——链接中的跟踪参数。它们记录、分析、定义我们，将开放的互联网，编织成一张张精准营销的巨网。
>
> **ClearURL 诞生于一个简单的信念：将链接的权利，归还给每一位用户。**
>
> 它不是一款普通的工具，而是一次对纯粹浏览体验的重新探索。它无声地工作，却坚定地为您抹去数字世界中的每一个追踪印记，让您的每一次网络漫游，都只关乎内容本身，无关其他。

## 为什么选择 ClearURL？

| 核心理念 | 实现方式 |
| :--- | :--- |
| **非凡体验，如若无物** | **真正的强大，是让你感觉不到它的存在。** ClearURL 基于 Chrome 最新的 `declarativeNetRequest` 引擎构建，在网络通信的最底层重写规则。这意味着净化过程在瞬间完成，无延迟、零干扰，为您带来如丝般顺滑的无痕浏览体验。|
| **绝对隐私，本地为王** | **您的隐私，是不可侵犯的领域。** ClearURL 的所有运算，100% 在您的本地设备进行。它不依赖任何云端服务器，也绝不收集、上传或分析您的任何浏览数据。简单说，您的世界，我们从不打扰。|
| **开源核心，极致透明** | **信任，源于毫无保留的开放。** 我们将全部代码公开，邀请全世界的开发者共同审视、监督和贡献。我们坚信，只有绝对的透明，才能构建绝对的安全感。 |
| **智能进化，精准守护** | **追踪技术在变，我们的守护也在进化。** ClearURL 的规则库源于全球隐私保护社区的集体智慧，并持续更新。它能精准识别并移除从广告追踪到社交分享的各类参数，确保净化效果，同时绝不破坏网站的核心功能。 |

## 📦 安装指南

### **官方商店 (即将发布)**
片刻等待，即可在 Chrome 网上应用店一键安装，享受官方带来的便捷与安全。

### **先锋体验 (开发者模式)**
如果您迫不及待，希望立即体验，可以从源代码进行安装：

1.  **克隆仓库**
    ```bash
    git clone https://github.com/jymadrid/clearurl-extension.git
    ```
2.  **进入 Chrome 扩展管理页面**
    在地址栏输入 `chrome://extensions/` 并回车。

3.  **开启开发者模式**
    激活页面右上角的“开发者模式”开关。

4.  **加载扩展**
    点击“加载已解压的扩展程序”，然后选中您刚刚克隆的 `clearurl-extension` 文件夹。

完成。ClearURL 图标将静静地出现在您的浏览器工具栏，开始它的守护使命。

## 🛠️ 工作原理：纯净之力，源自精尖科技

ClearURL 的简约背后，是强大技术的支撑。

- **Manifest V3**: 我们采用 Google 最新的扩展规范，从架构上保证了更高的安全性、稳定性和性能。
- **Service Worker (`background.js`)**: 作为扩展的智能中枢，它在独立的后台线程中运行，负责逻辑处理与状态管理，确保主线程的流畅。
- **Declarative Net Request**: 这是实现“零延迟”体验的核心技术。我们通过预设的声明式规则，将 URL 净化这一繁重任务，完全交由浏览器内核高效处理，彻底告别了传统 JavaScript 阻断方式带来的性能瓶颈。

## 💖 加入我们，共建一片更纯净的网络

ClearURL 不仅仅是一个项目，更是一场追求数字自由的运动。每一位用户、每一位贡献者，都是这场运动的参与者。

- **提交一个 Issue**: 发现了新的追踪参数，或是程序中的瑕疵？请让我们知道。
- **参与一次讨论**: 对未来的功能有何创想？欢迎与社区分享。
- **贡献一份代码**: 无论是修复一个BUG，还是实现一个新功能，我们都无比欢迎。

我们相信，微小的代码，可以汇聚成改变数字世界的巨大力量。

---

<p align="center">
  <strong>ClearURL — 为每一次纯粹的点击而生。</strong>
</p>

<p align="center">
  如果 ClearURL 触动了您，请用一个 ⭐ Star 来表达您的支持。
</p>

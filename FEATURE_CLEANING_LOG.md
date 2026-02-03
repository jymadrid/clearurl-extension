# 净化日志功能说明

## 功能概述

净化日志功能让扩展的工作过程可视化，用户可以清晰地看到哪些链接被净化了，移除了哪些参数。这极大地增强了信任感和产品的价值感。

## 功能特性

### 1. 实时记录

- 自动记录每次URL净化操作
- 显示原始URL和被移除的参数
- 显示网站图标（favicon）
- 显示净化时间

### 2. 详细信息

每条日志记录包含：

- **网站图标**：自动获取网站的 favicon
- **域名**：被净化的网站域名
- **原始URL**：完整的原始URL（支持悬停查看）
- **移除的参数**：以标签形式显示所有被移除的参数
- **时间戳**：净化发生的时间（相对时间显示）

### 3. 日志管理

- **自动限制**：只保留最新的100条记录
- **清空日志**：一键清空所有日志记录
- **刷新日志**：手动刷新日志列表

## 技术实现

### 核心机制

#### 1. 监听标签页更新

使用 `chrome.tabs.onUpdated` API 监听标签页URL变化：

```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  this.handleTabUpdate(tabId, changeInfo, tab);
});
```

#### 2. 模拟净化过程

当检测到URL变化时，使用现有的 `cleanUrl()` 方法模拟净化：

```javascript
async handleTabUpdate(tabId, changeInfo, tab) {
  if (!changeInfo.url || !this.isEnabled) return;

  const originalUrl = changeInfo.url;
  const cleanedUrl = this.cleanUrl(originalUrl);

  if (originalUrl !== cleanedUrl) {
    // 记录净化日志
  }
}
```

#### 3. 计算被移除的参数

比较原始URL和净化后的URL，找出被移除的参数：

```javascript
const originalParams = new URLSearchParams(urlObj.search);
const cleanedParams = new URLSearchParams(new URL(cleanedUrl).search);

const removedParams = [];
for (const [key] of originalParams) {
  if (!cleanedParams.has(key)) {
    removedParams.push(key);
  }
}
```

#### 4. 存储日志

将日志记录存储到 `chrome.storage.local`：

```javascript
const logEntry = {
  id: Date.now() + Math.random(),
  originalUrl,
  cleanedUrl,
  hostname,
  domain: hostname,
  removedParams,
  timestamp: Date.now(),
  favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
};

this.cleaningLog.unshift(logEntry);
if (this.cleaningLog.length > 100) {
  this.cleaningLog = this.cleaningLog.slice(0, 100);
}
```

### 数据结构

#### 日志条目结构

```javascript
{
  id: 1234567890.123,                    // 唯一ID
  originalUrl: "https://...",            // 原始URL
  cleanedUrl: "https://...",             // 净化后的URL
  hostname: "example.com",               // 主机名
  domain: "example.com",                 // 域名
  removedParams: ["utm_source", "..."],  // 被移除的参数列表
  timestamp: 1234567890000,              // 时间戳
  favicon: "https://..."                 // 网站图标URL
}
```

### UI实现

#### 日志列表渲染

```javascript
updateCleaningLogUI() {
  const logList = document.getElementById('cleaningLogList');

  logList.innerHTML = this.cleaningLog.map((log) => {
    // 如果参数超过5个，只显示前5个
    const paramsHtml = log.removedParams.length > 5
      ? `
        ${log.removedParams.slice(0, 5).map(param =>
          `<span class="log-item-param-tag">${param}</span>`
        ).join('')}
        <span class="log-item-param-count">+${log.removedParams.length - 5} more</span>
      `
      : log.removedParams.map(param =>
          `<span class="log-item-param-tag">${param}</span>`
        ).join('');

    return `
      <div class="log-item">
        <div class="log-item-header">
          <img src="${log.favicon}" class="log-item-favicon">
          <span class="log-item-domain">${log.domain}</span>
          <span class="log-item-time">${this.formatTime(log.timestamp)}</span>
        </div>
        <div class="log-item-url" title="${log.originalUrl}">
          ${log.originalUrl}
        </div>
        <div class="log-item-params">
          ${paramsHtml}
        </div>
      </div>
    `;
  }).join('');
}
```

## 使用方法

### 查看净化日志

1. 点击扩展图标打开弹出窗口
2. 切换到"净化日志"标签页
3. 查看最近的净化记录

### 清空日志

1. 在"净化日志"标签页
2. 点击"清空日志"按钮
3. 确认清空操作

### 刷新日志

1. 在"净化日志"标签页
2. 点击"刷新"按钮
3. 日志列表将更新为最新数据

## 性能优化

### 1. 日志数量限制

- 最多保留100条记录
- 自动删除最旧的记录
- 减少存储空间占用

### 2. 按需加载

- 只在切换到日志标签页时渲染
- 避免不必要的DOM操作

### 3. 参数显示优化

- 超过5个参数时只显示前5个
- 使用"+N more"显示剩余数量
- 减少DOM元素数量

## 样式设计

### 日志项布局

```
┌─────────────────────────────────────┐
│ [图标] example.com        2m ago    │
│ https://example.com?utm_source=...  │
│ [utm_source] [utm_medium] [fbclid]  │
└─────────────────────────────────────┘
```

### 颜色方案

- **参数标签**：黄色背景 (#fff3cd)，棕色文字 (#856404)
- **域名**：深灰色 (#333)，加粗显示
- **URL**：中灰色 (#666)，等宽字体
- **时间**：浅灰色 (#888)

## 注意事项

### 1. 隐私保护

- 日志仅存储在本地
- 不会上传到任何服务器
- 用户可随时清空日志

### 2. 存储限制

- 最多100条记录
- 每条记录约1-2KB
- 总存储空间约100-200KB

### 3. 性能影响

- 监听标签页更新事件
- 每次URL变化都会触发检查
- 对浏览器性能影响极小

## 故障排除

### 问题1：日志不显示

**可能原因**：

- 扩展被禁用
- 网站在白名单中
- URL没有跟踪参数

**解决方案**：

1. 检查扩展是否启用
2. 检查网站是否在白名单中
3. 访问带有跟踪参数的URL

### 问题2：日志显示不完整

**可能原因**：

- 日志数量超过100条
- 存储空间不足

**解决方案**：

1. 清空旧日志
2. 检查浏览器存储空间

### 问题3：favicon不显示

**可能原因**：

- 网站没有favicon
- Google favicon服务不可用

**解决方案**：

- 这是正常现象，不影响功能
- favicon会自动隐藏（onerror处理）

## 未来改进方向

1. **导出功能**
   - 导出日志为CSV/JSON格式
   - 方便数据分析

2. **过滤功能**
   - 按域名过滤
   - 按时间范围过滤
   - 按参数类型过滤

3. **统计分析**
   - 最常见的跟踪参数
   - 最常净化的网站
   - 净化趋势图表

4. **搜索功能**
   - 搜索特定URL
   - 搜索特定参数
   - 搜索特定域名

5. **详细视图**
   - 点击日志项查看详细信息
   - 显示完整的原始URL和净化后URL
   - 显示所有被移除的参数

## 技术细节

### 事件流程

```
用户访问URL
    ↓
chrome.tabs.onUpdated 触发
    ↓
handleTabUpdate() 处理
    ↓
检查是否启用 & 是否在白名单
    ↓
调用 cleanUrl() 模拟净化
    ↓
比较原始URL和净化后URL
    ↓
计算被移除的参数
    ↓
创建日志条目
    ↓
存储到 cleaningLog 数组
    ↓
保存到 chrome.storage.local
```

### 消息通信

**Popup → Background**

```javascript
// 获取日志
chrome.runtime.sendMessage({ action: 'getCleaningLog' });

// 清空日志
chrome.runtime.sendMessage({ action: 'clearCleaningLog' });
```

**Background → Popup**

```javascript
// 返回日志数据
sendResponse({ cleaningLog: this.cleaningLog });

// 返回操作结果
sendResponse({ success: true });
```

## 文件修改清单

1. **popup.html**
   - 添加"净化日志"标签页
   - 添加日志列表容器
   - 添加清空和刷新按钮

2. **popup.css**
   - 添加日志项样式
   - 添加参数标签样式
   - 添加favicon样式

3. **popup.js**
   - 添加 `cleaningLog` 属性
   - 添加 `updateCleaningLogUI()` 方法
   - 添加 `clearLog()` 方法
   - 添加 `refreshLog()` 方法

4. **background.js**
   - 添加 `cleaningLog` 数组
   - 添加 `handleTabUpdate()` 方法
   - 添加标签页更新监听器
   - 添加日志相关的消息处理

## 测试建议

### 基本功能测试

1. 访问带跟踪参数的URL
2. 切换到净化日志标签页
3. 验证日志记录是否正确显示

### 参数显示测试

1. 访问包含多个跟踪参数的URL
2. 验证参数标签是否正确显示
3. 验证超过5个参数时的显示

### 清空功能测试

1. 记录一些日志
2. 点击清空按钮
3. 验证日志是否被清空

### 刷新功能测试

1. 在其他标签页访问URL
2. 切换回净化日志标签页
3. 点击刷新按钮
4. 验证新日志是否显示

### 数量限制测试

1. 访问超过100个不同的URL
2. 验证日志数量是否限制在100条
3. 验证最旧的记录是否被删除

---

**净化日志功能让用户清楚地看到扩展的工作效果，增强了信任感和价值感！** 📊

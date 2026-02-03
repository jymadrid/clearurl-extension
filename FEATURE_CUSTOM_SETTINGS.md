# 用户自定义设置功能说明

## 功能概述

本次更新为 ClearURL 扩展添加了用户自定义设置功能，包括：

1. **白名单管理**：允许用户将特定网站排除在URL净化范围之外
2. **自定义规则**：允许用户添加自己的URL参数净化规则

## 实现架构

### 1. 用户界面 (popup.html)

扩展的弹出界面现在包含三个标签页：

- **概览**：显示统计信息和最近活动
- **白名单**：管理白名单网站
- **自定义规则**：管理自定义净化参数

### 2. 数据存储

使用 `chrome.storage.local` 持久化存储用户设置：

```javascript
{
  "whitelist": ["docs.google.com", "partner.example.net"],
  "customRules": ["aff_id", "promo_code"]
}
```

### 3. 核心逻辑：动态规则更新

#### updateRules() 函数流程

这是整个功能的核心，实现了动态更新 declarativeNetRequest 规则：

```javascript
async updateRules() {
  // 1. 删除所有现有的动态规则
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRules.map(rule => rule.id)
  });

  // 2. 如果扩展被禁用，不添加任何规则
  if (!this.isEnabled) return;

  // 3. 加载静态规则并添加白名单排除
  const newRules = [];
  for (const staticRule of this.staticRules) {
    const rule = JSON.parse(JSON.stringify(staticRule));
    if (this.whitelist.size > 0) {
      rule.condition.excludedRequestDomains = Array.from(this.whitelist);
    }
    newRules.push(rule);
  }

  // 4. 创建自定义规则
  if (this.customRules.length > 0) {
    const customRule = {
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            queryTransform: {
              removeParams: this.customRules
            }
          }
        }
      },
      condition: {
        resourceTypes: ['main_frame', 'sub_frame', ...],
        excludedRequestDomains: Array.from(this.whitelist)
      }
    };
    newRules.push(customRule);
  }

  // 5. 应用所有新规则
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: newRules
  });
}
```

#### 触发时机

`updateRules()` 函数在以下情况下被调用：

1. 扩展首次启动时（`initialize()` 中）
2. 用户添加/删除白名单网站时
3. 用户添加/删除自定义规则时
4. 用户切换扩展启用/禁用状态时

## 使用方法

### 白名单功能

1. 点击扩展图标打开弹出窗口
2. 切换到"白名单"标签页
3. 在输入框中输入域名（例如：`example.com`）
4. 点击"添加"按钮
5. 该网站的URL将不再被净化

**快捷方式**：在"概览"标签页中，可以直接点击"Add to Whitelist"按钮将当前网站添加到白名单。

### 自定义规则功能

1. 点击扩展图标打开弹出窗口
2. 切换到"自定义规则"标签页
3. 在输入框中输入要移除的参数名（例如：`utm_custom`）
4. 点击"添加"按钮
5. 该参数将在所有网站的URL中被移除

## 技术细节

### 白名单实现

白名单通过 `excludedRequestDomains` 属性实现：

```javascript
rule.condition.excludedRequestDomains = Array.from(this.whitelist);
```

这使得 declarativeNetRequest 跳过对这些域名的所有净化规则。

### 自定义规则实现

自定义规则通过创建一个新的 declarativeNetRequest 规则实现：

```javascript
{
  action: {
    type: 'redirect',
    redirect: {
      transform: {
        queryTransform: {
          removeParams: this.customRules  // 用户自定义的参数列表
        }
      }
    }
  }
}
```

### 数据验证

- **域名验证**：使用正则表达式验证域名格式
- **参数名验证**：只允许字母、数字、下划线和连字符
- **重复检查**：防止添加重复的白名单或规则

## 文件修改清单

1. **popup.html**：添加标签页导航和新的UI元素
2. **popup.css**：添加标签页和列表样式
3. **popup.js**：实现标签页切换和用户交互逻辑
4. **background.js**：实现动态规则更新核心逻辑

## 测试建议

### 白名单测试

1. 添加一个网站到白名单
2. 访问该网站的带有跟踪参数的URL
3. 验证参数没有被移除

### 自定义规则测试

1. 添加一个自定义参数（例如：`test_param`）
2. 访问包含该参数的URL（例如：`https://example.com?test_param=123&other=456`）
3. 验证 `test_param` 被移除，但 `other` 保留

### 组合测试

1. 添加白名单和自定义规则
2. 验证白名单网站不受自定义规则影响
3. 验证非白名单网站应用自定义规则

## 注意事项

1. **存储限制**：`chrome.storage.local` 有存储限制，建议白名单和自定义规则总数不超过100个
2. **规则ID管理**：动态规则ID从1000开始，避免与静态规则冲突
3. **性能考虑**：每次修改设置都会重新生成所有规则，频繁修改可能影响性能
4. **数据持久化**：使用 `chrome.storage.local` 而非 `chrome.storage.sync`，因为规则数据可能较大

## 未来改进方向

1. 支持正则表达式自定义规则
2. 导入/导出白名单和自定义规则
3. 规则优先级管理
4. 批量添加功能
5. 规则生效统计

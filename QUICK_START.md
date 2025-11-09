# ClearURL 自定义设置 - 快速开始

## 🚀 新功能概览

ClearURL 现在支持用户自定义设置！您可以：
- ✅ 将特定网站添加到白名单，保留其URL参数
- ✅ 添加自定义的URL参数净化规则
- ✅ 灵活控制哪些网站和参数需要被净化

## 📦 安装步骤

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目的根目录

## 🎯 使用方法

### 白名单功能

**场景**：某些网站的URL参数对功能很重要，不希望被移除

**操作步骤**：
1. 点击浏览器工具栏中的 ClearURL 图标
2. 切换到"白名单"标签页
3. 输入域名（例如：`docs.google.com`）
4. 点击"添加"按钮

**快捷方式**：
- 在"概览"标签页中，直接点击"Add to Whitelist"按钮即可将当前网站添加到白名单

**效果**：
- 白名单中的网站URL参数将不会被移除
- 例如：`https://docs.google.com?id=123&share=abc` 的所有参数都会保留

### 自定义规则功能

**场景**：发现某些跟踪参数没有被默认规则覆盖

**操作步骤**：
1. 点击浏览器工具栏中的 ClearURL 图标
2. 切换到"自定义规则"标签页
3. 输入参数名（例如：`my_tracking_id`）
4. 点击"添加"按钮

**效果**：
- 该参数将在所有网站的URL中被移除
- 例如：`https://example.com?my_tracking_id=123&normal=keep`
  - 变为：`https://example.com?normal=keep`

## 💡 使用示例

### 示例 1：保护 Google Docs 链接

Google Docs 的分享链接包含重要的文档ID参数，不应该被移除：

```
原始URL: https://docs.google.com/document/d/abc123/edit?usp=sharing
```

**解决方案**：
1. 将 `docs.google.com` 添加到白名单
2. 现在所有 Google Docs 链接的参数都会被保留

### 示例 2：移除自定义跟踪参数

您的公司使用自定义的跟踪参数 `company_track_id`：

```
原始URL: https://example.com?company_track_id=xyz&product=laptop
期望URL: https://example.com?product=laptop
```

**解决方案**：
1. 在"自定义规则"中添加 `company_track_id`
2. 该参数将在所有网站被移除

### 示例 3：组合使用

某些网站需要保留所有参数，但其他网站需要移除特定参数：

**配置**：
- 白名单：`partner.example.com`
- 自定义规则：`affiliate_id`, `promo_code`

**效果**：
- `https://partner.example.com?affiliate_id=123` → 参数保留（白名单）
- `https://shop.com?affiliate_id=123&product=item` → `https://shop.com?product=item`（移除自定义参数）

## 🔍 验证功能

### 检查白名单是否生效

1. 添加一个网站到白名单
2. 访问该网站的带参数URL
3. 检查浏览器地址栏，参数应该保留

### 检查自定义规则是否生效

1. 添加一个自定义参数
2. 访问包含该参数的URL
3. 检查浏览器地址栏，该参数应该被移除

## 📊 查看统计

在"概览"标签页中，您可以看到：
- **URLs Cleaned**：已净化的URL总数
- **Parameters Removed**：已移除的参数总数
- **Recent Activity**：最近的净化记录

## ⚙️ 管理设置

### 删除白名单网站

1. 切换到"白名单"标签页
2. 找到要删除的网站
3. 点击右侧的"删除"按钮

### 删除自定义规则

1. 切换到"自定义规则"标签页
2. 找到要删除的规则
3. 点击右侧的"删除"按钮

### 清除统计数据

1. 在"概览"标签页
2. 点击"Clear Statistics"按钮
3. 确认清除

### 临时禁用扩展

1. 在"概览"标签页
2. 点击右上角的开关按钮
3. 扩展将被禁用，徽章显示"OFF"

## 🐛 故障排除

### 问题：规则不生效

**检查清单**：
- ✅ 扩展是否启用（开关是否打开）
- ✅ 网站是否在白名单中
- ✅ 参数名是否正确
- ✅ 刷新页面后重试

### 问题：无法添加白名单

**可能原因**：
- 域名格式不正确（不要包含 `http://` 或 `https://`）
- 域名已存在于白名单中

**正确格式**：
- ✅ `example.com`
- ✅ `sub.example.com`
- ❌ `https://example.com`
- ❌ `example.com/path`

### 问题：无法添加自定义规则

**可能原因**：
- 参数名包含非法字符
- 规则已存在

**正确格式**：
- ✅ `my_param`
- ✅ `param-name`
- ✅ `param123`
- ❌ `param name`（包含空格）
- ❌ `param@name`（包含特殊字符）

## 📝 注意事项

1. **数据持久化**：所有设置都会自动保存，关闭浏览器后不会丢失
2. **存储限制**：建议白名单和自定义规则总数不超过100个
3. **性能影响**：大量规则可能会轻微影响浏览器性能
4. **规则优先级**：白名单优先级最高，白名单网站不受任何规则影响

## 🎓 高级技巧

### 技巧 1：批量管理

虽然界面不支持批量操作，但您可以通过浏览器控制台批量添加：

```javascript
// 在扩展的 Service Worker 控制台中运行
const domains = ['example1.com', 'example2.com', 'example3.com'];
domains.forEach(domain => {
  chrome.runtime.sendMessage({
    action: 'addToWhitelist',
    hostname: domain
  });
});
```

### 技巧 2：导出设置

```javascript
// 导出当前设置
chrome.storage.local.get(['whitelist', 'customRules'], (data) => {
  console.log(JSON.stringify(data, null, 2));
  // 复制输出的 JSON 保存到文件
});
```

### 技巧 3：导入设置

```javascript
// 导入设置
const settings = {
  whitelist: ['example1.com', 'example2.com'],
  customRules: ['param1', 'param2']
};
chrome.storage.local.set(settings, () => {
  console.log('Settings imported');
  // 需要重新加载扩展以应用设置
});
```

## 📚 更多资源

- **功能详细说明**：查看 `FEATURE_CUSTOM_SETTINGS.md`
- **测试指南**：查看 `TESTING_GUIDE.md`
- **问题反馈**：在 GitHub 上提交 Issue

## 🤝 贡献

欢迎提交 Pull Request 或报告问题！

---

**享受更清洁、更私密的浏览体验！** 🎉

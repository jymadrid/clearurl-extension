# ClearURL 自定义设置功能测试指南

## 安装扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"（右上角）
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

## 测试场景

### 场景 1：白名单功能测试

#### 测试步骤
1. 打开扩展弹出窗口
2. 切换到"白名单"标签页
3. 添加域名：`example.com`
4. 访问：`https://example.com?utm_source=test&utm_medium=email&normal_param=keep`
5. 检查URL是否保持不变（所有参数都应该保留）

#### 预期结果
- 白名单列表中显示 `example.com`
- URL参数不被移除
- 统计数据不增加

#### 测试删除功能
1. 在白名单列表中点击"删除"按钮
2. 再次访问带参数的URL
3. 验证参数被正常移除

### 场景 2：自定义规则功能测试

#### 测试步骤
1. 打开扩展弹出窗口
2. 切换到"自定义规则"标签页
3. 添加自定义参数：`my_tracking_id`
4. 访问：`https://test.com?my_tracking_id=12345&normal_param=keep`
5. 检查URL变化

#### 预期结果
- 自定义规则列表中显示 `my_tracking_id`
- URL变为：`https://test.com?normal_param=keep`
- `my_tracking_id` 参数被移除
- `normal_param` 参数保留

#### 测试多个自定义规则
1. 添加多个自定义参数：`custom1`, `custom2`, `custom3`
2. 访问：`https://test.com?custom1=a&custom2=b&custom3=c&keep=d`
3. 验证所有自定义参数被移除，`keep` 参数保留

### 场景 3：白名单与自定义规则组合测试

#### 测试步骤
1. 添加白名单：`example.com`
2. 添加自定义规则：`my_param`
3. 访问白名单网站：`https://example.com?my_param=123&utm_source=test`
4. 访问非白名单网站：`https://other.com?my_param=123&utm_source=test`

#### 预期结果
- 白名单网站：所有参数保留
- 非白名单网站：`my_param` 和 `utm_source` 都被移除

### 场景 4：快速添加白名单测试

#### 测试步骤
1. 访问任意网站（例如：`https://github.com`）
2. 打开扩展弹出窗口（概览标签页）
3. 点击"Add to Whitelist"按钮
4. 切换到"白名单"标签页验证

#### 预期结果
- 当前网站域名被添加到白名单
- 按钮文字变为"Remove from Whitelist"
- 白名单列表中显示该域名

### 场景 5：数据持久化测试

#### 测试步骤
1. 添加几个白名单网站和自定义规则
2. 关闭浏览器
3. 重新打开浏览器
4. 打开扩展弹出窗口

#### 预期结果
- 所有白名单和自定义规则都被保留
- 统计数据保持不变

### 场景 6：输入验证测试

#### 白名单输入验证
测试以下输入：
- ✅ 有效：`example.com`
- ✅ 有效：`sub.example.com`
- ✅ 有效：`example.co.uk`
- ❌ 无效：`http://example.com`（包含协议）
- ❌ 无效：`example.com/path`（包含路径）
- ❌ 无效：`-example.com`（以连字符开头）
- ❌ 无效：空字符串

#### 自定义规则输入验证
测试以下输入：
- ✅ 有效：`my_param`
- ✅ 有效：`param-name`
- ✅ 有效：`param123`
- ❌ 无效：`param name`（包含空格）
- ❌ 无效：`param@name`（包含特殊字符）
- ❌ 无效：空字符串

### 场景 7：扩展启用/禁用测试

#### 测试步骤
1. 在概览标签页关闭扩展（切换开关）
2. 访问带跟踪参数的URL
3. 验证参数不被移除
4. 重新启用扩展
5. 再次访问相同URL

#### 预期结果
- 禁用时：所有参数保留，徽章显示"OFF"
- 启用时：参数正常移除，徽章显示数字

### 场景 8：统计数据测试

#### 测试步骤
1. 清除统计数据（点击"Clear Statistics"）
2. 访问多个带跟踪参数的URL
3. 查看统计数据更新

#### 预期结果
- URLs Cleaned 数字增加
- Parameters Removed 数字增加
- Recent Activity 列表显示最近的清理记录

## 测试URL示例

### 通用测试URL
```
https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=test&normal=keep
https://test.com?fbclid=123456&gclid=789012&ref=social&keep=this
https://shop.com?aff_id=partner&promo_code=SAVE20&product=item123
```

### 自定义规则测试URL
```
https://example.com?my_tracking_id=12345&custom_param=test&normal=keep
https://test.com?custom1=a&custom2=b&custom3=c&keep=d
```

## 调试技巧

### 查看控制台日志
1. 打开 `chrome://extensions/`
2. 找到 ClearURL 扩展
3. 点击"Service Worker"查看后台日志
4. 点击"检查视图"查看弹出窗口日志

### 查看动态规则
在 Service Worker 控制台中运行：
```javascript
chrome.declarativeNetRequest.getDynamicRules().then(rules => {
  console.log('Dynamic Rules:', JSON.stringify(rules, null, 2));
});
```

### 查看存储数据
在 Service Worker 控制台中运行：
```javascript
chrome.storage.local.get(null).then(data => {
  console.log('Storage Data:', JSON.stringify(data, null, 2));
});
```

## 常见问题排查

### 问题 1：规则不生效
- 检查扩展是否启用
- 检查网站是否在白名单中
- 查看控制台是否有错误信息
- 验证规则是否正确加载

### 问题 2：白名单不工作
- 确认域名格式正确（不包含协议和路径）
- 检查是否使用了正确的域名（不是子域名）
- 查看动态规则中的 `excludedRequestDomains`

### 问题 3：自定义规则不生效
- 确认参数名格式正确
- 检查是否有重复的规则
- 验证规则是否被正确添加到动态规则中

### 问题 4：数据丢失
- 检查 `chrome.storage.local` 是否有权限
- 查看是否有存储错误日志
- 验证数据是否超过存储限制

## 性能测试

### 测试大量规则
1. 添加50个白名单网站
2. 添加50个自定义规则
3. 访问多个网站
4. 观察性能影响

### 测试频繁切换
1. 快速添加/删除多个规则
2. 观察是否有延迟或错误
3. 检查内存使用情况

## 测试报告模板

```markdown
## 测试报告

**测试日期**：YYYY-MM-DD
**测试人员**：[姓名]
**浏览器版本**：Chrome [版本号]

### 测试结果

| 场景 | 状态 | 备注 |
|------|------|------|
| 白名单功能 | ✅/❌ | |
| 自定义规则 | ✅/❌ | |
| 组合测试 | ✅/❌ | |
| 快速添加 | ✅/❌ | |
| 数据持久化 | ✅/❌ | |
| 输入验证 | ✅/❌ | |
| 启用/禁用 | ✅/❌ | |
| 统计数据 | ✅/❌ | |

### 发现的问题

1. [问题描述]
   - 重现步骤：
   - 预期结果：
   - 实际结果：

### 建议

[改进建议]
```

## 自动化测试（可选）

如果需要自动化测试，可以使用以下工具：
- Puppeteer：用于浏览器自动化
- Jest：用于单元测试
- Selenium：用于端到端测试

示例测试代码（使用 Puppeteer）：
```javascript
const puppeteer = require('puppeteer');

async function testWhitelist() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  const page = await browser.newPage();

  // 测试逻辑...

  await browser.close();
}
```

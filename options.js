class OptionsManager {
  constructor() {
    this.builtinRules = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
      'gclid', 'fbclid', 'msclkid', 'twclid', '_ga', '_gl', 'mc_eid', 'igshid',
      'ref_', 'referrer', 'source', 'campaign', 'click_id', 'trk', 'pk_campaign',
      'pk_kwd', 'pk_source', 'pk_medium', 'pk_content', 'mtm_source', 'mtm_medium',
      'mtm_campaign', 'mtm_keyword', 'mtm_content', 'at_medium', 'at_campaign',
      'ncid', 'cid', 'yclid', '_hsenc', '_hsmi', 'hsCtaTracking', 'hsa_acc',
      'hsa_ad', 'hsa_cam', 'hsa_grp', 'hsa_kw', 'hsa_mt', 'hsa_net', 'hsa_src',
      'hsa_tgt', 'hsa_ver', 'vero_conv', 'vero_id', 'wickedid', 'oly_anon_id',
      'oly_enc_id', '__s', 'rb_clickid', 's_cid', 'ml_subscriber', 'ml_subscriber_hash',
      'kenshoo_clickid', 'zanpid', 'awesm', 'WT.mc_id', 'pk_vid', 'piwik_campaign',
      'piwik_kwd', 'redirect_log_mongo_id', 'redirect_mongo_id', 'sb_referer_host',
      'mkwid', 'pcrid', 'ef_id', 's_kwcid', 'c', 'dclid', 'gad_source', 'gbraid', 'wbraid'
    ];
    
    this.settings = {
      extensionEnabled: true,
      showNotifications: true,
      logActivity: true,
      customRules: [],
      disabledRules: new Set()
    };
    
    this.initialize();
  }

  async initialize() {
    await this.loadSettings();
    this.setupEventListeners();
    this.setupTabs();
    this.renderUI();
  }

  async loadSettings() {
    try {
      const data = await chrome.storage.sync.get([
        'isEnabled', 'showNotifications', 'logActivity', 
        'customRules', 'disabledRules', 'stats', 'recentCleanups', 'whitelist'
      ]);
      
      this.settings.extensionEnabled = data.isEnabled !== false;
      this.settings.showNotifications = data.showNotifications !== false;
      this.settings.logActivity = data.logActivity !== false;
      this.settings.customRules = data.customRules || [];
      this.settings.disabledRules = new Set(data.disabledRules || []);
      
      this.stats = data.stats || { totalCleaned: 0, parametersRemoved: 0, sessionsCleared: 0 };
      this.recentCleanups = data.recentCleanups || [];
      this.whitelist = data.whitelist || [];
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        isEnabled: this.settings.extensionEnabled,
        showNotifications: this.settings.showNotifications,
        logActivity: this.settings.logActivity,
        customRules: this.settings.customRules,
        disabledRules: Array.from(this.settings.disabledRules)
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('extensionEnabled').addEventListener('change', (e) => {
      this.settings.extensionEnabled = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('showNotifications').addEventListener('change', (e) => {
      this.settings.showNotifications = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('logActivity').addEventListener('change', (e) => {
      this.settings.logActivity = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('resetRules').addEventListener('click', () => {
      this.resetRules();
    });

    document.getElementById('addRule').addEventListener('click', () => {
      this.addCustomRule();
    });

    document.getElementById('newRuleInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addCustomRule();
      }
    });

    document.getElementById('addWhitelist').addEventListener('click', () => {
      this.addWhitelistItem();
    });

    document.getElementById('newWhitelistInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addWhitelistItem();
      }
    });

    document.getElementById('exportStats').addEventListener('click', () => {
      this.exportStats();
    });

    document.getElementById('clearAllStats').addEventListener('click', () => {
      this.clearAllStats();
    });

    document.getElementById('reportIssue').addEventListener('click', () => {
      window.open('https://github.com/jymadrid/clearurl-extension/issues', '_blank');
    });

    document.getElementById('showHelp').addEventListener('click', () => {
      this.showHelp();
    });
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
      });
    });
  }

  renderUI() {
    this.renderGeneralSettings();
    this.renderRules();
    this.renderWhitelist();
    this.renderStats();
  }

  renderGeneralSettings() {
    document.getElementById('extensionEnabled').checked = this.settings.extensionEnabled;
    document.getElementById('showNotifications').checked = this.settings.showNotifications;
    document.getElementById('logActivity').checked = this.settings.logActivity;
  }

  renderRules() {
    this.renderBuiltinRules();
    this.renderCustomRules();
  }

  renderBuiltinRules() {
    const container = document.getElementById('builtinRules');
    container.innerHTML = this.builtinRules.map(rule => `
      <div class="rule-item">
        <span>${rule}</span>
        <input type="checkbox" class="rule-toggle" 
               ${!this.settings.disabledRules.has(rule) ? 'checked' : ''} 
               onchange="optionsManager.toggleRule('${rule}', this.checked)">
      </div>
    `).join('');
  }

  renderCustomRules() {
    const container = document.getElementById('customRules');
    if (this.settings.customRules.length === 0) {
      container.innerHTML = '<div class="no-items">No custom rules added yet.</div>';
      return;
    }
    
    container.innerHTML = this.settings.customRules.map(rule => `
      <div class="rule-item">
        <span>${rule}</span>
        <button class="rule-remove" onclick="optionsManager.removeCustomRule('${rule}')">&times;</button>
      </div>
    `).join('');
  }

  renderWhitelist() {
    const container = document.getElementById('whitelistList');
    if (this.whitelist.length === 0) {
      container.innerHTML = '<div class="no-items">No whitelisted sites.</div>';
      return;
    }
    
    container.innerHTML = this.whitelist.map(domain => `
      <div class="whitelist-item">
        <span class="whitelist-domain">${domain}</span>
        <button class="whitelist-remove" onclick="optionsManager.removeWhitelistItem('${domain}')">Remove</button>
      </div>
    `).join('');
  }

  renderStats() {
    document.getElementById('totalCleanedStat').textContent = this.formatNumber(this.stats.totalCleaned);
    document.getElementById('parametersRemovedStat').textContent = this.formatNumber(this.stats.parametersRemoved);
    document.getElementById('sessionsCleanedStat').textContent = this.formatNumber(this.stats.sessionsCleared);
    
    const activityLog = document.getElementById('activityLog');
    if (this.recentCleanups.length === 0) {
      activityLog.innerHTML = '<div class="no-items">No recent activity.</div>';
      return;
    }
    
    activityLog.innerHTML = this.recentCleanups.slice(0, 20).map(cleanup => `
      <div class="activity-item">
        <div class="activity-details">
          <div class="activity-site">${this.escapeHtml(cleanup.hostname)}</div>
          <div class="activity-params">${cleanup.parametersRemoved} parameter${cleanup.parametersRemoved !== 1 ? 's' : ''} removed</div>
        </div>
        <div class="activity-time">${this.formatTime(cleanup.timestamp)}</div>
      </div>
    `).join('');
  }

  toggleRule(rule, enabled) {
    if (enabled) {
      this.settings.disabledRules.delete(rule);
    } else {
      this.settings.disabledRules.add(rule);
    }
    this.saveSettings();
  }

  resetRules() {
    if (confirm('Reset all rules to default settings? This will remove all custom rules and re-enable all built-in rules.')) {
      this.settings.customRules = [];
      this.settings.disabledRules.clear();
      this.saveSettings();
      this.renderRules();
    }
  }

  addCustomRule() {
    const input = document.getElementById('newRuleInput');
    const rule = input.value.trim();
    
    if (!rule) return;
    
    if (this.builtinRules.includes(rule) || this.settings.customRules.includes(rule)) {
      alert('This rule already exists.');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(rule)) {
      alert('Rule must contain only letters, numbers, underscores, and hyphens.');
      return;
    }
    
    this.settings.customRules.push(rule);
    this.saveSettings();
    this.renderCustomRules();
    input.value = '';
  }

  removeCustomRule(rule) {
    this.settings.customRules = this.settings.customRules.filter(r => r !== rule);
    this.saveSettings();
    this.renderCustomRules();
  }

  addWhitelistItem() {
    const input = document.getElementById('newWhitelistInput');
    const domain = input.value.trim().toLowerCase();
    
    if (!domain) return;
    
    if (this.whitelist.includes(domain)) {
      alert('This domain is already whitelisted.');
      return;
    }
    
    try {
      new URL(`https://${domain}`);
    } catch {
      alert('Please enter a valid domain name.');
      return;
    }
    
    chrome.runtime.sendMessage({ 
      action: 'addToWhitelist', 
      hostname: domain 
    }).then(() => {
      this.whitelist.push(domain);
      this.renderWhitelist();
      input.value = '';
    });
  }

  removeWhitelistItem(domain) {
    chrome.runtime.sendMessage({ 
      action: 'removeFromWhitelist', 
      hostname: domain 
    }).then(() => {
      this.whitelist = this.whitelist.filter(d => d !== domain);
      this.renderWhitelist();
    });
  }

  exportStats() {
    const data = {
      stats: this.stats,
      recentCleanups: this.recentCleanups,
      whitelist: this.whitelist,
      customRules: this.settings.customRules,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearurl-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async clearAllStats() {
    if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearStats' });
        this.stats = { totalCleaned: 0, parametersRemoved: 0, sessionsCleared: 0 };
        this.recentCleanups = [];
        this.renderStats();
      } catch (error) {
        console.error('Failed to clear stats:', error);
        alert('Failed to clear statistics. Please try again.');
      }
    }
  }

  showHelp() {
    alert(`ClearURL Help

This extension automatically removes tracking parameters from URLs to protect your privacy.

Features:
• Automatic URL cleaning using browser APIs
• Real-time statistics and activity logs
• Customizable rules and whitelist
• Privacy-focused design

For more help, visit our GitHub repository or report issues there.`);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

let optionsManager;

document.addEventListener('DOMContentLoaded', () => {
  optionsManager = new OptionsManager();
});
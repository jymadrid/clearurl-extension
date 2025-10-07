class PopupManager {
  constructor() {
    this.currentHostname = '';
    this.isWhitelisted = false;
    this.initialize();
  }

  async initialize() {
    await this.loadCurrentTab();
    await this.loadData();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        this.currentHostname = new URL(tab.url).hostname;
      }
    } catch (error) {
      console.error('Error loading current tab:', error);
      this.currentHostname = 'Unknown';
    }
  }

  async loadData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      this.stats = response.stats || { totalCleaned: 0, parametersRemoved: 0 };
      this.recentCleanups = response.recentCleanups || [];
      this.isEnabled = response.isEnabled !== false;

      const whitelistResponse = await chrome.runtime.sendMessage({ action: 'getWhitelist' });
      this.whitelist = new Set(whitelistResponse.whitelist || []);
      this.isWhitelisted = this.whitelist.has(this.currentHostname);
    } catch (error) {
      console.error('Error loading data:', error);
      this.stats = { totalCleaned: 0, parametersRemoved: 0 };
      this.recentCleanups = [];
      this.isEnabled = true;
      this.whitelist = new Set();
      this.isWhitelisted = false;
    }
  }

  setupEventListeners() {
    const enableToggle = document.getElementById('enableToggle');
    const clearStatsBtn = document.getElementById('clearStats');
    const openOptionsBtn = document.getElementById('openOptions');
    const whitelistBtn = document.getElementById('whitelistBtn');

    enableToggle.addEventListener('change', () => this.toggleEnabled());
    clearStatsBtn.addEventListener('click', () => this.clearStats());
    openOptionsBtn.addEventListener('click', () => this.openOptions());
    whitelistBtn.addEventListener('click', () => this.toggleWhitelist());
  }

  updateUI() {
    this.updateStats();
    this.updateActivity();
    this.updateToggle();
    this.updateCurrentSite();
  }

  updateStats() {
    document.getElementById('totalCleaned').textContent = this.formatNumber(
      this.stats.totalCleaned,
    );
    document.getElementById('parametersRemoved').textContent = this.formatNumber(
      this.stats.parametersRemoved,
    );
  }

  updateActivity() {
    const activityList = document.getElementById('activityList');

    if (!this.recentCleanups || this.recentCleanups.length === 0) {
      activityList.innerHTML = '<div class="no-activity">No recent activity</div>';
      return;
    }

    const recentItems = this.recentCleanups.slice(0, 10);
    activityList.innerHTML = recentItems
      .map(
        (cleanup) => `
      <div class="activity-item">
        <div class="activity-site">${this.truncateUrl(cleanup.hostname)}</div>
        <div class="activity-params">${cleanup.parametersRemoved} parameter${cleanup.parametersRemoved !== 1 ? 's' : ''} removed</div>
        <div class="activity-time">${this.formatTime(cleanup.timestamp)}</div>
      </div>
    `,
      )
      .join('');
  }

  updateToggle() {
    document.getElementById('enableToggle').checked = this.isEnabled;
  }

  updateCurrentSite() {
    document.getElementById('currentSite').textContent = this.currentHostname;

    const whitelistBtn = document.getElementById('whitelistBtn');
    const whitelistText = whitelistBtn.querySelector('.whitelist-text');

    if (this.isWhitelisted) {
      whitelistBtn.classList.add('whitelisted');
      whitelistText.textContent = 'Remove from Whitelist';
    } else {
      whitelistBtn.classList.remove('whitelisted');
      whitelistText.textContent = 'Add to Whitelist';
    }
  }

  async toggleEnabled() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'toggleEnabled' });
      this.isEnabled = response.isEnabled;
      this.updateToggle();
    } catch (error) {
      console.error('Error toggling enabled state:', error);
    }
  }

  async clearStats() {
    if (confirm('Are you sure you want to clear all statistics?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearStats' });
        this.stats = { totalCleaned: 0, parametersRemoved: 0 };
        this.recentCleanups = [];
        this.updateUI();
      } catch (error) {
        console.error('Error clearing stats:', error);
      }
    }
  }

  openOptions() {
    chrome.runtime.openOptionsPage();
  }

  async toggleWhitelist() {
    try {
      if (this.isWhitelisted) {
        await chrome.runtime.sendMessage({
          action: 'removeFromWhitelist',
          hostname: this.currentHostname,
        });
        this.whitelist.delete(this.currentHostname);
        this.isWhitelisted = false;
      } else {
        await chrome.runtime.sendMessage({
          action: 'addToWhitelist',
          hostname: this.currentHostname,
        });
        this.whitelist.add(this.currentHostname);
        this.isWhitelisted = true;
      }
      this.updateCurrentSite();
    } catch (error) {
      console.error('Error toggling whitelist:', error);
    }
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
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

  truncateUrl(url) {
    if (url.length > 25) {
      return `${url.substring(0, 22)}...`;
    }
    return url;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

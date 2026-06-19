/**
 * @jest-environment jsdom
 */

describe('ClearURLService runtime behavior', () => {
  let ClearURLService;

  const staticRules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            queryTransform: {
              removeParams: ['utm_source', 'fbclid'],
            },
          },
        },
      },
      condition: {
        resourceTypes: ['main_frame'],
      },
    },
  ];

  beforeEach(() => {
    jest.resetModules();
    globalThis.__CLEARURL_DISABLE_AUTO_START = true;
    window.__CLEARURL_DISABLE_AUTO_START = true;

    global.chrome = {
      runtime: {
        getURL: jest.fn((path) => path),
        onMessage: { addListener: jest.fn() },
        onInstalled: { addListener: jest.fn() },
        onStartup: { addListener: jest.fn() },
      },
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue(),
        },
        onChanged: { addListener: jest.fn() },
      },
      declarativeNetRequest: {
        getDynamicRules: jest.fn().mockResolvedValue([{ id: 42 }]),
        updateDynamicRules: jest.fn().mockResolvedValue(),
        updateEnabledRulesets: jest.fn().mockResolvedValue(),
        onRuleMatchedDebug: { addListener: jest.fn() },
      },
      webNavigation: {
        onBeforeNavigate: { addListener: jest.fn() },
      },
      tabs: {
        onUpdated: { addListener: jest.fn() },
        update: jest.fn(),
      },
      action: {
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
        onClicked: { addListener: jest.fn() },
      },
      alarms: {
        create: jest.fn(),
        clear: jest.fn(),
        onAlarm: { addListener: jest.fn() },
      },
      notifications: {
        create: jest.fn(),
      },
    };

    ({ ClearURLService } = require('../background.js'));
  });

  afterEach(() => {
    delete globalThis.__CLEARURL_DISABLE_AUTO_START;
    delete window.__CLEARURL_DISABLE_AUTO_START;
  });

  function createService() {
    const service = new ClearURLService({ autoInitialize: false });
    service.staticRules = staticRules;
    return service;
  }

  test('updateRules disables the static ruleset and uses whitelist-aware dynamic rules', async () => {
    const service = createService();
    service.whitelist = new Set(['example.com']);

    await service.updateRules();

    expect(chrome.declarativeNetRequest.updateEnabledRulesets).toHaveBeenCalledWith({
      disableRulesetIds: ['tracking_rules'],
    });
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [42],
      addRules: [
        expect.objectContaining({
          id: 1000,
          condition: expect.objectContaining({
            excludedRequestDomains: ['example.com'],
          }),
        }),
      ],
    });
  });

  test('updateRules removes dynamic rules without adding replacements when disabled', async () => {
    const service = createService();
    service.isEnabled = false;

    await service.updateRules();

    expect(chrome.declarativeNetRequest.updateEnabledRulesets).toHaveBeenCalledWith({
      disableRulesetIds: ['tracking_rules'],
    });
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledTimes(1);
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [42],
    });
  });

  test('updateRules falls back to the static ruleset when dynamic rules cannot be built', async () => {
    const service = createService();
    service.staticRules = [];

    await service.updateRules();

    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [42],
    });
    expect(chrome.declarativeNetRequest.updateEnabledRulesets).toHaveBeenCalledWith({
      enableRulesetIds: ['tracking_rules'],
    });
  });

  test('updateRules does not use static fallback when whitelist exclusions are active', async () => {
    const service = createService();
    service.staticRules = [];
    service.whitelist = new Set(['example.com']);

    await service.updateRules();

    expect(chrome.declarativeNetRequest.updateEnabledRulesets).toHaveBeenCalledWith({
      disableRulesetIds: ['tracking_rules'],
    });
  });

  test('custom rules are normalized before regex and DNR rules are rebuilt', async () => {
    const service = createService();
    const sendResponse = jest.fn();

    await service.handleMessage({ action: 'addCustomRule', rule: ' custom_param ' }, null, sendResponse);
    await service.handleMessage({ action: 'addCustomRule', rule: 'bad[param' }, null, sendResponse);

    expect(service.customRules).toEqual(['custom_param']);
    expect(sendResponse).toHaveBeenLastCalledWith({ success: false, error: 'invalidRule' });
  });

  test('cleanUrl removes built-in and custom tracking parameters while preserving safe params', () => {
    const service = createService();
    service.customRules = ['custom_param'];
    service.rebuildCustomRulePatterns();

    const cleanedUrl = service.cleanUrl(
      'https://example.com/path?utm_source=news&custom_param=1&page=2#section',
    );

    expect(cleanedUrl).toBe('https://example.com/path?page=2#section');
  });

  test('clipboard alarm uses Chrome minimum periodic alarm granularity', () => {
    const service = createService();

    service.startClipboardAlarm();

    expect(chrome.alarms.create).toHaveBeenCalledWith('clipboardCheck', {
      periodInMinutes: 0.5,
    });
  });

  test('storage changes refresh rule state when options messaging is unavailable', () => {
    const service = createService();
    service.updateRules = jest.fn();
    service.updateBadge = jest.fn();

    service.setupClipboardMonitoring();
    const onChanged = chrome.storage.onChanged.addListener.mock.calls[0][0];

    onChanged(
      {
        isEnabled: { newValue: false },
        whitelist: { newValue: ['example.com'] },
      },
      'local',
    );

    expect(service.isEnabled).toBe(false);
    expect(service.whitelist.has('example.com')).toBe(true);
    expect(service.updateRules).toHaveBeenCalled();
    expect(service.updateBadge).toHaveBeenCalled();
  });
});

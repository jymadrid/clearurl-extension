const fs = require('fs');
const path = require('path');

// Define paths.
const rawDataPath = path.join(__dirname, 'data.min.json');
const rulesPath = path.join(__dirname, 'rules.json');

console.log(`Reading raw rules from: ${rawDataPath}`);

// Check if the source file exists before trying to read it.
if (!fs.existsSync(rawDataPath)) {
  console.error(`Error: Raw data file not found at ${rawDataPath}`);
  console.error('Please ensure data.min.json from the ClearURLs repository is present in the project root directory.');
  process.exit(1); // Exit with an error code
}

const rawRulesContent = fs.readFileSync(rawDataPath, 'utf-8');
const rawData = JSON.parse(rawRulesContent);

const newRules = [];
let ruleId = 1;

// Helper to extract a representative domain from the regex pattern for the requestDomains condition.
function extractDomains(pattern) {
    // Correctly escape backslashes for the regex string.
    let cleanPattern = pattern.replace(new RegExp('^\\^https?://'), '').replace(/\$$/, '');
    // A more robust way to find domain-like patterns, avoiding false positives.
    const domainMatches = cleanPattern.match(/([\w-]+\.(?:[a-z]{2,}|[a-z]{2,}\.[a-z]{2,}))/g);
    if (domainMatches) {
        // Using a Set to avoid duplicate domains from complex regex.
        return [...new Set(domainMatches)];
    }
    // Fallback for simple hostnames.
    const basicDomain = cleanPattern.split('/')[0];
    if (basicDomain && basicDomain.includes('.')) {
        return [basicDomain];
    }
    return [];
}

for (const providerName in rawData.providers) {
  const provider = rawData.providers[providerName];

  // Handle providers that are marked for complete blocking.
  if (provider.completeProvider) {
    const domains = extractDomains(provider.urlPattern);
    if (domains.length > 0) {
      newRules.push({
        id: ruleId++,
        priority: 1,
        action: { type: 'block' },
        condition: {
          requestDomains: domains,
          // Block a wide range of resource types for comprehensive tracking prevention.
          resourceTypes: [
            'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other'
          ]
        }
      });
    }
    continue; // Proceed to the next provider.
  }

  const paramsToRemove = [
    ...(provider.rules || []),
    ...(provider.referralMarketing || []),
  ].filter(p => p && typeof p === 'string' && p.length > 0); // Ensure params are valid, non-empty strings

  if (paramsToRemove.length > 0 && provider.urlPattern) {
    const domains = extractDomains(provider.urlPattern);

    if (providerName === 'globalRules') {
         // For global rules, we don't specify `requestDomains` to apply it to all sites.
         const rule = {
              id: ruleId++,
              priority: 1, // Lower priority for global rules
              action: {
                type: 'redirect',
                redirect: {
                  transform: {
                    queryTransform: {
                      removeParams: paramsToRemove,
                    },
                  },
                },
              },
              condition: {
                // Apply to a wide range of resource types where tracking params are common.
                resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet'],
              },
         };
         newRules.push(rule);

    } else if (domains.length > 0) {
         const rule = {
              id: ruleId++,
              priority: 2, // Higher priority for domain-specific rules
              action: {
                type: 'redirect',
                redirect: {
                  transform: {
                    queryTransform: {
                      removeParams: paramsToRemove,
                    },
                  },
                },
              },
              condition: {
                requestDomains: domains,
                resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet'],
              },
            };
            newRules.push(rule);
    }
  }
}

fs.writeFileSync(rulesPath, JSON.stringify(newRules, null, 2));

console.log(`Successfully generated ${newRules.length} rules and saved to ${rulesPath}`);
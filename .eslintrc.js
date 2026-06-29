module.exports = {
  env: {
    browser: true,
    es2022: true,
    webextensions: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [],
  globals: {
    chrome: 'readonly',
    module: 'readonly',
    __dirname: 'readonly',
    process: 'readonly',
    global: 'readonly',
  },
  rules: {
    // Error prevention
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'error',
    'no-undef': 'off',
    'no-redeclare': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'warn',
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-unreachable': 'error',

    // Best practices
    eqeqeq: 'error',
    curly: 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // Modern JavaScript
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'prefer-template': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/__tests__/**/*.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};

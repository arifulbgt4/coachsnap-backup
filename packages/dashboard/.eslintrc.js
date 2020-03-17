module.exports = {
  settings: {
    'import/resolver': {
      alias: {
        map: [['src', './src']],
        extensions: ['.ts', '.js', '.jsx', '.json'],
      },
    },
  },
  extends: [
    'airbnb',
    'prettier',
    'prettier/react',
    'plugin:cypress/recommended',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      impliedStrict: true,
      classes: true,
    },
  },
  env: {
    browser: true,
    node: true,
    jquery: true,
    jest: true,
    mocha: true,
  },
  globals: {
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true,
    chrome: true,
  },
  rules: {
    // TODO: disabling spaced comment for cypress, find alternative
    'spaced-comment': 0,
    // needed a bitwise operator & not && in some case
    'no-bitwise': 0,
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    // we have multiple "for with async await" and functions cases
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-loop-func': 'off',

    // only required for some testing
    'no-unused-expressions': 0,

    // some algorithm uses this
    'no-plusplus': 0,

    // TODO: Ignoring this until we find a way to ignore devDependencies for "tests"
    'import/no-extraneous-dependencies': 0,

    // we have multiple methods without 'this'
    // but will obviously fail with static
    'class-methods-use-this': 0,
    // TODO: come back to these rules and apply them for more stable version
    'consistent-return': 0,
    'no-return-assign': 0,
    'react/require-default-props': 0,
    'import/prefer-default-export': 0,
    'jsx-a11y/no-autofocus': 0,
    'react/jsx-props-no-spreading': 0,
    // TODO: This is for dashboard only. We must remove this.
    'react/prop-types': 0,
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx'],
      },
    ],

    // these are simple formatting, like space, quotes etc.
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 80,
      },
    ],

    // TODO: probably should use a debugging tool instead
    'no-console': ['error', { allow: ['warn', 'error'] }],

    // NOTE: these two rules must not be removed if we are using hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  plugins: ['html', 'prettier', 'react-hooks'],
};

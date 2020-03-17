module.exports = {
  extends: ['airbnb', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      impliedStrict: true,
      classes: true,
    },
  },
  env: {
    node: true,
  },
  rules: {
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
  },
  plugins: ['html', 'prettier'],
};

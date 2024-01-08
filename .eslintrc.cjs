module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  parserOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    ecmaVersion: '2022',
    ecmaFeatures: {
      jsx: false,
    },
  },

  env: {
    es2021: true,
    node: true,
  },

  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard',
  ],

  plugins: [
    '@typescript-eslint',
  ],

  globals: {
    process: 'readonly',
  },

  // add your custom rules here
  rules: {

    // allow async-await
    'generator-star-spacing': 'off',
    // allow paren-less arrow functions
    'arrow-parens': 'off',
    'one-var': 'off',
    'no-void': 'off',
    'multiline-ternary': 'off',

    'import/first': 'off',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',

    'no-eval': 'warn',

    'no-async-promise-executor': 'off',

    // to prevent false positives in diffs
    'comma-dangle': ['error', 'always-multiline'],

    // to prevent issues with typescript linting
    'func-call-spacing': 'off',

    // The core 'import/named' rules
    // does not work with type definitions
    'import/named': 'off',

    'prefer-promise-reject-errors': 'off',

    quotes: ['warn', 'single', { avoidEscape: true }],

    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',

    'no-use-before-define': 'off',

    // this rule, if on, would require explicit return type on the `render` function
    '@typescript-eslint/explicit-function-return-type': 'off',

    '@typescript-eslint/no-empty-interface': 'off',

    // in plain CommonJS modules, you can't use `import foo = require('foo')` to pass this rule, so it has to be disabled
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    '@typescript-eslint/no-unused-vars': 'warn',

    // The core 'no-unused-vars' rules (in the eslint:recommended ruleset)
    // does not work with type definitions
    'no-unused-vars': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
}

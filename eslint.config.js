const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
      // We intentionally set state inside async fetches inside useEffect.
      // This rule is overly aggressive for data-fetching screens.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);

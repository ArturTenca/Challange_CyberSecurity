// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/app/index.jsx", "src/app/specs.jsx", "src/components/FordRangerRaptor.jsx"],
    rules: {
      "react/no-unknown-property": "off",
    },
  },
]);

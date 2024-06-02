import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import solid from "eslint-plugin-solid";
import panda from "@pandacss/eslint-plugin";
import * as tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      solid,
      panda,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
      },
      globals: globals.browser,
    },
    rules: {
      "solid/components-return-once": "error",
      "solid/event-handlers": "error",
      "solid/imports": "error",
      "solid/jsx-no-duplicate-props": "error",
      "solid/jsx-no-undef": "error",
      "solid/jsx-uses-vars": "error",
      "solid/no-array-handlers": "error",
      "solid/no-destructure": "error",
      "solid/no-innerhtml": "error",
      "solid/no-proxy-apis": "error",
      "solid/no-react-deps": "error",
      "solid/no-react-specific-props": "error",
      "solid/no-unknown-namespaces": "error",
      "solid/prefer-classlist": "error",
      "solid/prefer-for": "error",
      "solid/prefer-show": "error",
      "solid/reactivity": "error",
      "solid/self-closing-comp": "error",
      "solid/style-prop": "error",
      "panda/file-not-included": "error",
      "panda/no-config-function-in-source": "error",
      "panda/no-debug": "error",
      "panda/no-dynamic-styling": "error",
      "panda/no-escape-hatch": "error",
      "panda/no-hardcoded-color": "error",
      "panda/no-important": "error",
      "panda/no-invalid-token-paths": "error",
      "panda/no-invalid-nesting": "error",
      "panda/no-margin-properties": "error",
      "panda/no-physical-properties": "error",
      "panda/no-property-renaming": "error",
      "panda/no-unsafe-token-fn-usage": "error",
      "panda/prefer-longhand-properties": "off",
      "panda/prefer-shorthand-properties": "off",
      "panda/prefer-atomic-propertis": "off",
      "panda/prefer-composite-properties": "off",
      "panda/prefer-unified-property-style": "off",
    },
  },
];

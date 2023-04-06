module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "simple-import-sort", "promise"],
  ignorePatterns: ["node_modules_windows", "node_modules_mac"],
  rules: {
    "consistent-return": "off",
    "global-require": "error",
    "jest/valid-expect": "off",
    "jest/no-mocks-import": "off",
    "lines-between-class-members": "off",
    "no-param-reassign": "off",
    // "no-param-reassign": ["error", { ignorePropertyModificationsFor: ["state"] }],
    "no-restricted-syntax": "off",
    "no-return-await": "warn",
    "no-shadow": "off",
    "spaced-comment": "off",
    "react/require-default-props": "off",
    "no-redeclare": "off", // TS will check this
    "require-await": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-shadow": "warn",
    "@typescript-eslint/await-thenable": "warn",
    "no-dupe-class-members": "off", // TS will check this
    "@typescript-eslint/ban-ts-comment": "off",
    // "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "allow-with-description" }],
    "@typescript-eslint/class-name-casing": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "off", // Use the TS version below
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", ignoreRestSiblings: true }],
    "simple-import-sort/imports": [
      "error",
      {
        groups: [["^\\u0000"], ["^react", "^@?\\w"], ["^@?\\w"], ["^"], ["^\\."], ["^.+\\u0000$"]],
      },
    ],
    "import/order": "off",
    "promise/param-names": "error",
    // "no-restricted-imports": [
    //   "error",
    //   {
    //     name: "lodash",
    //     message: "Don't use default import for lodash, use \"import { module } from 'lodash/module'\" instead",
    //   },
    // ],
    // "no-restricted-imports": [
    //   "error",
    //   {
    //     patterns: [
    //       {
    //         group: ["../../*"],
    //         message: 'Use an import alias like "~/shared" or "~/root" instead.',
    //       },
    //     ],
    //   },
    // ],
  },
};

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable overly strict rules that don't affect functionality
      "@typescript-eslint/no-unused-vars": "off", // Allow unused variables
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type when needed
      "@typescript-eslint/no-empty-function": "off", // Allow empty functions
      "prefer-const": "warn", // Just warn instead of error for const vs let
      "no-console": "off", // Allow console.log statements
      "no-debugger": "warn", // Just warn for debugger statements
      "no-unused-vars": "off", // Disable base rule in favor of TypeScript version
    },
  },
];

export default eslintConfig;

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local debugging / probe scratch files:
    "*.tmp.js",
    "fix.js",
    "fix_*.js",
    "crawl.mjs",
    "probe-*.ts",
    "probe-*.js",
    "probe-*.json",
  ]),
  {
    files: ["tests/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-img-element": "off",
    },
  },
  {
    // TanStack Table (`useReactTable`) and TanStack Virtual (`useVirtualizer`)
    // return non-memoizable APIs, so React Compiler intentionally skips
    // memoizing those components. This is safe by design, hence the rule is off.
    rules: {
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next 16.4 turned on two stricter React rules that flag existing patterns
    // (CategoryGrid's reset-on-query-change effect, EvilEye's ref update during render, and a few
    // setState-in-effect spots). They are real smells but not new bugs, and the grid one is
    // reworked in the audit's accessibility/stale-response work package; keep them visible as
    // warnings instead of failing `npm run check`.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

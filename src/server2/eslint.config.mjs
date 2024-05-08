"use strict";
// @ts-check

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

// Docs for ESLint configuration >= 9.0.0
// https://eslint.org/docs/latest/use/getting-started

export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                project: "./tsconfig.eslint.json",
            },
        }
    },

];
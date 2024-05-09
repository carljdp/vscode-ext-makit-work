"use strict";
// @ts-check

// Note:
// This ESLint >=v9.0.0 `eslint.config.mjs` file serves as 
// the base configuration for all ESLint configurations in the project,
// as this is a monorepo, all other ESLint configurations should extend
// from this base configuration.

import EsLint_Js from "@eslint/js";
import EsLint_Ts from "typescript-eslint";

import globals from "globals";


// Docs for ESLint configuration >= 9.0.0
// https://eslint.org/docs/latest/use/getting-started

/** @type {import("typescript-eslint").Config} */
const baseRecommendations = [
    EsLint_Js.configs.recommended,
    ...EsLint_Ts.configs.recommended
];

/** @type {import("typescript-eslint").Config} */
export default [
    ...baseRecommendations,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                project: ["tsconfig.eslint.json"],
            },
        },
    },
    {
        rules: {
            // Note: you must disable the base rule
            // as it can report incorrect errors
            // see: https://typescript-eslint.io/rules/no-unused-expressions#how-to-use
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "warn",
        }
    }

];

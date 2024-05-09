"use strict";
// @ts-check

// Note:
// This ESLint >=v9.0.0 `eslint.config.js` file serves as 
// the base configuration for all ESLint configurations in the project,
// as this is a monorepo, all other ESLint configurations should extend
// from this base configuration.

import EsLint_Js from "@eslint/js";
import EsLint_Ts from "typescript-eslint";

import globals from "globals";


// Docs for ESLint configuration >= 9.0.0
// https://eslint.org/docs/latest/use/getting-started

const baseRecommendations = [
    EsLint_Js.configs.recommended,
    ...EsLint_Ts.configs.recommended
];

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

];

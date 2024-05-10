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


/**
 * @typedef { typeof import("@eslint/js").configs.recommended } EsLintJsConfig
 * @typedef { typeof import("typescript-eslint").configs.recommended[0] } EsLintTsConfig
 * @typedef { EsLintJsConfig | EsLintTsConfig } EsLintConfig
 * @typedef { EsLintConfig[] } EsLintConfigs
 */

/** @type {EsLintConfigs} */
const baseRecommendations = [
    EsLint_Js.configs.recommended,
    ...EsLint_Ts.configs.recommended
];

/** @type {EsLintConfigs} */
const rootConfig = [
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

export default rootConfig;
export {
    rootConfig
};

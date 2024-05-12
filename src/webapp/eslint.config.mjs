"use strict";
// @ts-check

import globals from "globals";

import { rootConfig } from "../../eslint.config.mjs";

export default [
    ...rootConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser
            },
            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },
    },
];
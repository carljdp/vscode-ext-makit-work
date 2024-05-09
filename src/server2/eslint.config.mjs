"use strict";
// @ts-check

import globals from "globals";

import { rootConfig } from "../../eslint.config.mjs";

export default [
    ...rootConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node
            },
            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },
    },
];
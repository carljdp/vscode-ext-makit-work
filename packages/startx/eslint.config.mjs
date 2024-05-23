"use strict";
// @ts-check

import globals from "globals";

import { rootConfig, MOD_SYS } from "../../eslint.config.mjs";

console.log("Bootstrap MOD_SYS:", MOD_SYS);

export default [
    // ...rootConfig,
    // {
    //     languageOptions: {
    //         globals: {
    //             ...globals.node
    //         },
    //         parserOptions: {
    //             project: ["./tsconfig.cjs.json"],
    //         },
    //     },
    // },
];
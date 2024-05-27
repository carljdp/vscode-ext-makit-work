"use strict";
// @ts-check


import { inspect } from 'node:util';

import { getLogTag } from '../../packages/startx/devt/common/locations.js';
const logTag = getLogTag();


// CONSTANTS & SETTINGS


const DEBUG = false;
const DEBUG_PAUSE = false;
const LOG_VERBOSE = false;


// IMPLEMENTATION


if (DEBUG) { 
    console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);
}    

import { makeConfig, RuleSet, SourceType, LangType } from "../../eslint.config.mjs";
const configs = [
        // src / <esm|cjs> / ts
        makeConfig(RuleSet.src.id, SourceType.module.id, LangType.ts.id, ['src'], ['dist'], false ),
        makeConfig(RuleSet.src.id, SourceType.commonjs.id, LangType.ts.id, ['src'], ['dist'], false ),

        // src / <esm|cjs> / js
        makeConfig(RuleSet.src.id, SourceType.module.id, LangType.js.id, ['src'], ['dist'], false ),
        makeConfig(RuleSet.src.id, SourceType.commonjs.id, LangType.js.id, ['src'], ['dist'], false ),

        // dist / <esm|cjs> / js
        makeConfig(RuleSet.dist.id, SourceType.module.id, LangType.js.id, ['dist'], ['src'], false ),
        makeConfig(RuleSet.dist.id, SourceType.commonjs.id, LangType.js.id, ['dist'], ['src'], false ),
];


if (LOG_VERBOSE) {
    console.log(`[${logTag}] Configurations:`);
    for (const cfg of configs) {
        console.log(`\n[${logTag}] --------------------------------`);

        const logInfo = {
            ...cfg,

            languageOptions: {
                ... cfg.languageOptions,
                parser: '{ ommitted for brevity }',
                globals: '{ ommitted for brevity }',
            },

            plugins: cfg.plugins ? `[${Object.keys(cfg.plugins).join(', ')}]` : cfg.plugins,
            files: Array.isArray(cfg.files) ? `[${cfg.files.join(', ')}]` : cfg.files,
            ignores: Array.isArray(cfg.ignores) ? `[${cfg.ignores.join(', ')}]` : cfg.ignores,
            rules: '{ ommitted for brevity }',
        };

        console.log( inspect( logInfo, { depth: 3 } ));
    }
}


export default configs;


if (DEBUG) { 
    console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);

    if (DEBUG_PAUSE) {

        debugger;

        // or
        // console.log(`[${logTag}] Pausing...`);
        // process.stdin.resume();
    }

}

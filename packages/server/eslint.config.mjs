"use strict";
// @ts-check


import { inspect } from 'node:util';

import { getLogTag } from '../../packages/startx/devt/common/locations.js';
const logTag = getLogTag();

// CONSTANTS

/** 
 * @constant {boolean} DEBUG_THIS - Manual debug flag for this script.
 */
const DEBUG_THIS = false;

/** 
 * @constant {boolean} DEBUG_PAUSE - Whether to hit a breakpoint at the end of the script.
 */
const DEBUG_PAUSE = false;

/** 
 * @constant {boolean} LOG_VERBOSE - Whether to log out the configurations in detail.
 * These verbose logs are not nested inside `DEBUG` blocks, as it can be useful even when `DEBUG` is false.
 */
const LOG_VERBOSE = false;


// IMPLEMENTATION


if (process.env.DEBUG && DEBUG_THIS) console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);


import { makeConfig, RuleSet, SourceType, LangType } from "../../eslint.config.mjs";


const theUsualSuspects = [
    'node_modules',
    '.history',
    '.cache',
];

const configs = [
        // src / <esm|cjs> / ts
        makeConfig(RuleSet.src.id, SourceType.module.id, LangType.ts.id, ['src'], ['dist', ...theUsualSuspects], false ),
        makeConfig(RuleSet.src.id, SourceType.commonjs.id, LangType.ts.id, ['src'], ['dist', ...theUsualSuspects], false ),

        // src / <esm|cjs> / js
        makeConfig(RuleSet.src.id, SourceType.module.id, LangType.js.id, ['src'], ['dist', ...theUsualSuspects], false ),
        makeConfig(RuleSet.src.id, SourceType.commonjs.id, LangType.js.id, ['src'], ['dist', ...theUsualSuspects], false ),

        // dist / <esm|cjs> / js
        makeConfig(RuleSet.dist.id, SourceType.module.id, LangType.js.id, ['dist'], ['src', ...theUsualSuspects], false ),
        makeConfig(RuleSet.dist.id, SourceType.commonjs.id, LangType.js.id, ['dist'], ['src', ...theUsualSuspects], false ),
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


// EXPORTS


export default configs;


if (process.env.DEBUG && DEBUG_THIS) console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);
if (process.env.DEBUG && DEBUG_THIS && DEBUG_PAUSE) debugger;

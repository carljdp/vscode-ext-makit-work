// src-file: ./preloader/src/index.ts

import { inspect } from 'node:util';
import { register as tsNodeRegister } from 'ts-node';
import { tsConfig } from './tsConfig.js';

import { merge } from 'lodash';

import { config } from 'dotenv';

// TODO: should not be hardcoded
const logTag = `preloader`

const cliArgsRaw = process.argv
    .slice(2)
    .filter(arg => arg.startsWith('--preloader-args='))
    .map(arg => arg.split('=')[1]);

const cliArgsParsed = cliArgsRaw
    .map(arg => {
        try { return JSON.parse(arg); } catch (e) {
            console.error(`[${logTag}] Invalid JSON: ${arg}`);
            return undefined;
        }
    })
    .filter(arg => arg !== undefined);

const cliArgsParsedFlat = cliArgsParsed
    .reduce((prev, curr) => merge(prev, curr), {});

const LOG_VERBOSE = cliArgsParsedFlat.log === 'verbose';
const DOTENV_FILE = cliArgsParsedFlat.dotenv || '.env';

const dotenvResult = config({ path: DOTENV_FILE });

if (LOG_VERBOSE) {
    console.log(`\n[${logTag}] --preloader-args=\n${JSON.stringify(cliArgsParsedFlat, null, 4)}`);
    console.log(`[${logTag}] dotenv: ${JSON.stringify(dotenvResult, null, 4)}`);
}

console.log(`\n[${logTag}] Registering modules with Node ..`);

const serivce = tsNodeRegister(tsConfig);

if (LOG_VERBOSE) {
    console.log(`[${logTag}] Module 'ts-node' ${serivce.enabled()}`);
    console.log(`[${logTag}]  - enabled ? ${serivce.enabled()}`);
    console.log(`[${logTag}]  - options ? ${inspect(serivce.options)}`);

    console.log(`[${logTag}] Finished registering modules with Node ..`);
}

console.log(`[${logTag}] Done!\n`);


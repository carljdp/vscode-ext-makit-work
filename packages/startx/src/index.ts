
/**
 * @fileoverview A Node.js script to bootstrap a Node.js application with common configurations.
 * 
 * - Register SWC's ESM loader with Node.js (to support loading TypeScript files)
 * - Load environment variables from a `.env` file
 */


import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

import { config } from 'dotenv';

import Lodash from 'lodash';
const { merge } = Lodash;

import { getLogTag } from '../devt/common/locations.js';
const logTag = getLogTag();


// CONSTANTS


const DEBUG = false;


// IMPLEMENTATION

if (DEBUG && process.env.DEBUG) { 
    console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);
}


interface RegisterOptions {
    parentURL: string | URL;
    data: any | undefined;
    transferList: any[] | undefined;
};

const baseOptions: RegisterOptions = {
    parentURL: pathToFileURL('./'),
    data: undefined,
    transferList: undefined,
};

const modulesToRegister: Map<string, RegisterOptions> = new Map([
    ['@swc-node/register/esm', {
        ...baseOptions,
        //
        // TODO: Add other options
        // - once we can find the docs for this
    }],
]);


// Parse CLI arguments

const cliArgsRaw = process.argv
    .slice(2)
    .filter(arg => arg.startsWith('--startx-args='))
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


// dotenv

const dotenvResult = config({ path: DOTENV_FILE });

// log configuration

console.log(``);
if (LOG_VERBOSE) {
    console.log(`[${logTag}] --startx-args=\n${JSON.stringify(cliArgsParsedFlat, null, 4)}`);
    console.log(`[${logTag}] dotenv: ${JSON.stringify(dotenvResult, null, 4)}`);
}

// Register modules

console.log(`[${logTag}] Registering modules with Node.js ..`);

modulesToRegister.forEach((options, specifier) => {
    console.log(`[${logTag}] -> ${specifier}`);
    register(specifier, options);
});

console.log(`[${logTag}] Done.`);
console.log(``);


if (DEBUG && process.env.DEBUG) { 
    console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);
}
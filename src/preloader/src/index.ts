// src-file: ./src/preloader/src/index.ts



// import { inspect } from 'node:util';
// import { register as tsNodeRegister } from 'ts-node';
// import { tsConfig } from './tsConfig.js';

import lodash from 'lodash';
const { merge } = lodash;

import { config } from 'dotenv';

const logTag = `preloader`

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

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

console.log(``);
if (LOG_VERBOSE) {
    console.log(`[${logTag}] --preloader-args=\n${JSON.stringify(cliArgsParsedFlat, null, 4)}`);
    console.log(`[${logTag}] dotenv: ${JSON.stringify(dotenvResult, null, 4)}`);
}

console.log(`[${logTag}] Registering modules with Node.js ..`);

// const serivce = tsNodeRegister(tsConfig);
// if (LOG_VERBOSE) {
//     console.log(`[${logTag}] Module 'ts-node' ${serivce.enabled()}`);
//     console.log(`[${logTag}]  - enabled ? ${serivce.enabled()}`);
//     console.log(`[${logTag}]  - options ? ${inspect(serivce.options)}`);
// }

modulesToRegister.forEach((options, specifier) => {
    console.log(`[${logTag}] -> ${specifier}`);
    register(specifier, options);
});

console.log(`[${logTag}] Done.`);
console.log(``);


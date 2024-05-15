// @ts-check

/**
 * @typedef {Object} RegisterOptions
 * @property {string | URL} parentURL - The parent URL.
 * @property {any | undefined} [data] - The data.
 * @property {any[] | undefined} [transferList] - The transfer list.
 */

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

const logTag = 'bootstrap';

/** @type {RegisterOptions} */
const baseOptions = {
    parentURL: pathToFileURL('./')
};

/** @type {Map<string, RegisterOptions>} */
const modulesToRegister = new Map([
    ['@swc-node/register/esm', {
        ...baseOptions,
        //
        // TODO: Add other options
        // - once we can find the docs for this
    }],
]);

console.log(``);
console.log(`[${logTag}] Registering modules with Node.js ..`);

modulesToRegister.forEach((options, specifier) => {
    console.log(`[${logTag}] -> ${specifier}`);
    register(specifier, options);
});

console.log(`[${logTag}] Done.`);
console.log(``);


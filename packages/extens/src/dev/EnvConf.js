// file: dev/EnvConf.js
/**
 * -------------------------------------------------------------------------- *
 * NOTE: This file is intentionally a plain JavaScript file, so that it can   *
 *        be used in both the NodeJS and Webpack config files.                 *
 * -------------------------------------------------------------------------- *
 * 
 * @module EnvConf
 * 
 * @fileoverview Environment variables are used to determine the current 
 *  environment of the application, for both the build and runtime 
 *  environments.
 * 
 * We attempt to parse the following environment variables:
 * 
 * - `NODE_ENV`: A NodeJS environment variable, indicating the current 
 *     environment
 * 
 * - `DEBUG`: Our own custom environment variable, indicating whether debug
 *     mode is enabled
 * 
 */


/** @typedef { (env: NodeJS.ProcessEnv) => boolean } EnvParseFn */

/** @type {boolean} */
const _isDebug_ = (/** @type {EnvParseFn} */(env) => {
    const originalValue = JSON.stringify(process.env.DEBUG || '')
        .replace(/['"]+/g, '').trim();
    const lowerValue = originalValue.toLowerCase();
    const truthy = ['true', '1', 'on', 'y', 'yes', 'enable', 'enabled'];
    const falsy = ['false', '0', 'off', 'n', 'no', 'disable', 'disabled'];
    const isTruthy = truthy.includes(lowerValue);
    const isFalsy = falsy.includes(lowerValue);
    return (isTruthy && !isFalsy);
})(process.env);

/** @type {boolean} */
const _isDev_ = (/** @type {EnvParseFn} */(env) => {
    const value = JSON.stringify(process.env.NODE_ENV || '')
        .replace(/['"]+/g, '').trim();
    return ['development', 'develop', 'dev'].includes(value.toLowerCase());
})(process.env);

/** @type {boolean} */
const _isProd_ = (/** @type {EnvParseFn} */(env) => {
    const value = JSON.stringify(process.env.NODE_ENV || '')
        .replace(/['"]+/g, '').trim();
    return ['production', 'prod'].includes(value.toLowerCase());
})(process.env);


// Quick polyfill for NodeJS assert module
const assert = {
    ok: (/** @type {any} */ value, /** @type {string | undefined} */ message) => {
        if (!value) {
            throw new Error(message);
        }
    }
};

assert.ok(((_isDebug_ === true) || (_isDebug_ === false)),
    `[Environment] Parse error: Environment variable: 'DEBUG'`);

assert.ok(((_isDev_ === true) || (_isDev_ === false)),
    `[Environment] Parse error: Environment variable: 'NODE_ENV'`);

assert.ok(((_isProd_ === true) || (_isProd_ === false)),
    `[Environment] Parse error: Environment variable: 'NODE_ENV'`);

assert.ok((_isProd_ && _isDev_) === false,
    `[Environment] Combination error: Environment variable: ` +
    `'NODE_ENV'`);

assert.ok((_isProd_ && _isDebug_) === false,
    `[Environment] Combination error: Environment variables: ` +
    `'NODE_ENV', 'DEBUG'`);


module.exports = {
    _isDebug_,
    _isDev_,
    _isProd_,
};

import Path from 'node:path';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import Lodash from 'lodash';
const { cloneDeep, forIn } = Lodash;

import { JsonFile } from './fs-utils.js';







/**
 * @typedef {import('type-fest').PackageJson} PackageJson
 * 
 * @typedef {boolean|null|undefined} MaskSpecifier
 * // - `true` - required
 * // - `false` - never
 * // - `null` - zero it / empty it / default it
 * // - `undefined` - leave it as is
 * 
 * @typedef { { [key: string]: MaskSpecifier } } GenericMask
 * 
 * @typedef { { [key in keyof PackageJson]: MaskSpecifier } } PackageJsonMask
 */


/**
 * @param {PackageJson} obj
 * @param {GenericMask & PackageJsonMask} mask
 * @returns {Partial<PackageJson>}
 */
const applyMask = (obj, mask) => {
    /** @type {Partial<PackageJson>} */
    const result = {};
    Lodash.forIn(mask, (value, key) => {
        if (value === false) {
            // dont add it
        }
        else if (value === true) {
            // add it as is, or fallback to default value
            result[key] = obj[key] || ""; // TODO: fallback to default value
        }
        else if (value === null) {
            // add it as null / placeholder / default value
            result[key] = null; // TODO: zero it / empty it / default it
        }
        else if (value === undefined) {
            // add it as is, if it exists
            if (key in obj) {
                result[key] = obj[key];
            }
        }
        else {
            throw new Error(`Invalid mask value for key '${key}'`);
        }
    });
    return result;
};

/** @type {PackageJsonMask} */
const packageJsonEmpty = {
    name: undefined,
    version: undefined,
    description: undefined,
    keywords: undefined,
    homepage: undefined,
    bugs: undefined,
    license: undefined,
    author: undefined,
    contributors: undefined,
    funding: undefined,
    files: undefined,
    main: undefined,
    browser: undefined,
    bin: undefined,
    man: undefined,
    directories: undefined,
    repository: undefined,
    scripts: undefined,
    config: undefined,
    dependencies: undefined,
    devDependencies: undefined,
    peerDependencies: undefined,
    bundledDependencies: undefined,
    optionalDependencies: undefined,
    engines: undefined,
    engineStrict: undefined,
    os: undefined,
    cpu: undefined,
    preferGlobal: undefined,
    private: undefined,
    publishConfig: undefined,
}

/**
 * Set all values of an object to a given value
 * @param {PackageJsonMask} obj 
 * @param {MaskSpecifier} [value]
 */
const copyWithAll = (obj, value) => {
    const clone = cloneDeep(obj);
    return (value === undefined)
        ? clone
        : forIn(clone, (_, key, obj) => {
            obj[key] = value;
        });
}


const mask = Object.assign(copyWithAll(packageJsonEmpty, false), {
    name: true,
    version: true,
    main: true,
});


const packageJson = new JsonFile({
    fileDir: Path.resolve(__dirname, '../../'),
    fileName: 'package.json'
});

/** @type {PackageJson} */
const packageJsonData = packageJson.readIn().parse().parsedContent;

if (typeof packageJsonData !== 'object') {
    throw new Error('Invalid package.json content');
}

const result = applyMask(packageJsonData, mask);

// replace the main entry with the esm entry
result.main = Path.basename(result.main || '');


/**
 * @param {Partial<PackageJson>} packageJson 
 * @param {'module'|'commonjs'} moduleSpecifier 
 * @returns {Partial<PackageJson>}
 */
const typedPackageJson = (packageJson, moduleSpecifier) => {
    packageJson.type = moduleSpecifier;
    return packageJson;
}

const esmPackageJson = typedPackageJson(result, 'module');

const esmPackageJsonFile = new JsonFile({
    fileDir: Path.resolve(__dirname, '../../tmp/'),
    fileName: 'package.esm.json',
    fileContent: esmPackageJson
}).parse().writeOut();

const cjsPackageJson = typedPackageJson(result, 'commonjs');
const cjsPackageJsonFile = new JsonFile({
    fileDir: Path.resolve(__dirname, '../../tmp/'),
    fileName: 'package.cjs.json',
    fileContent: cjsPackageJson
}).parse().writeOut();


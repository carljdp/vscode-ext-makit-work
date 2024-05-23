"use strict";
// @ts-check

/**
 * @fileoverview This script is intended to be run in the root directory of a package.
 * 
 * @description
 * It copies the package.json file to the "dist" directory, and creates two new package.json files
 * in the "dist/cjs" and "dist/esm" directories, respectively.
 * 
 * The new package.json files are modified to have the "main" and "module" fields point to the
 * respective entry points in the "cjs" and "esm" directories.
 * 
 * The script will exit with an error if/when:
 * - it is not confident that the root directory is a package root.
 * - the package.json file is not found in the package root.
 * - the package name in the package.json file does not match the directory name.
 */

import Path from 'node:path';
import { mkdir } from 'node:fs/promises';

import Lodash from 'lodash';

import { readDirSync, readFileAsync, writeFileAsync, pathExistsAsync } from './common/fs-utils.js';
import { Location as LocationClass, getLogTag } from "./common/locations.js";

// just an experiment, not really needed
const Location = LocationClass.staticClone();
Location.pinDrop();

const logTag = getLogTag();


// CONSTANTS


const DEBUG = true;


// arbitrary number, but it should be high enough to be confident that this is the root of a package
const THRESHOLD_SCORE = 12;


// IMPLEMENTATION


if (DEBUG && process.env.DEBUG) { 
    console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);
}

const scriptMeta = new Location();

const thisFilePath = scriptMeta.originLocation.toPath();
const thisDirPath = Path.dirname(thisFilePath);
const parentDirPath = Path.dirname(thisDirPath);

const processCwd = process.cwd();
console.log(`[${logTag}] process.cwd(): ${processCwd}`);


const ChanceIs = {
    veryGood: 2,
    good: 1,
    neutral: 0,
    bad: -1,
    veryBad: -2,
};


// files expected to be present in the root dir of a package
const contextIndicators = [
    {
        name: /^node_modules$/,
        isFile: false,
        isPackageRoot: ChanceIs.veryGood
    },
    {
        name: /^src$/,
        isFile: false,
        isPackageRoot: ChanceIs.good
    },
    {
        name: /^(dist|build)$/,
        isFile: false,
        isPackageRoot: ChanceIs.good
    },
    {
        name: /^\.(vscode|idea)$/,
        isFile: false,
        isPackageRoot: ChanceIs.good
    },
    {
        name: /^package\.json$/,
        isFile: true,
        isPackageRoot: ChanceIs.veryGood
    },
    {
        name: /^\.gitignore$/,
        isFile: true,
        isPackageRoot: ChanceIs.good
    },
    {
        name: /^(readme|license)(\.md)?$/i,
        isFile: true,
        isPackageRoot: ChanceIs.good
    },
    {
        name: /^(tsconfig|eslint|\.swc).*$/i,
        isFile: true,
        isPackageRoot: ChanceIs.good
    },
];


const dirContents = readDirSync(parentDirPath);

const score = dirContents
    .map((entry) => {
        contextIndicators.forEach((indicator) => {
            return (indicator.name.test(entry.name) && indicator.isFile === entry.isFile())
                ? indicator.isPackageRoot
                : ChanceIs.neutral;
        });
    })
    .reduce((prev, curr) => prev + curr, 0);

if (score < THRESHOLD_SCORE) {
        console.error(`[${logTag}] Not confident that this is the root of a package`);
        process.exit(1);
}

// still here? then we can proceed with (relative) confidence ..
const packageRootPath = parentDirPath;
console.log(`[${logTag}] Found a package root at "${packageRootPath}"`);


const main = async (packageRootPath) => {

    let rootPackageJson;

const rootPackageJsonPath = Path.join(packageRootPath, 'package.json');
if (!await pathExistsAsync(rootPackageJsonPath)) {
    console.error(`[${logTag}] Expected to find a package.json file in the package root`);
    process.exit(1);
}
else {
    const packageJson = await readFileAsync(rootPackageJsonPath);
    const parsed = JSON.parse(packageJson);
    if (parsed && parsed.name !== Path.basename(packageRootPath)) {
        console.error(`[${logTag}] This script should be in the "scripts" directory of the "${packageName}" package`);
        process.exit(1);
    }
    rootPackageJson = parsed;
}

const distPackageJson = Lodash.omit(Lodash.merge({}, rootPackageJson), [
    'scripts',
    'devDependencies',
    'workspaces',
]);
for (const key in distPackageJson) {
    if (key.startsWith('_')) {
        delete distPackageJson[key];
    }
    if (key === 'main' || key === 'module') {
        distPackageJson[key] = distPackageJson[key].replace(/^(\.\/)?(src|dist)\//, '');
    }
}

const distCjsPackageJson = {
    type: 'commonjs',
    main: (distPackageJson.main || 'cjs/index.js').replace(/^(\.\/)?cjs\//, ''),
    dependencies: rootPackageJson.dependencies || {},
    $schema: rootPackageJson.$schema || 'https://json.schemastore.org/package.json',
};

const distEsmPackageJson = {
    type: 'module',
    module: (distPackageJson.module || 'esm/index.js').replace(/^(\.\/)?esm\//, ''),
    dependencies: rootPackageJson.dependencies || {},
    $schema: rootPackageJson.$schema || 'https://json.schemastore.org/package.json',
};

// make sure dirs exist

const distPath = Path.join(packageRootPath, 'dist');
if (!await pathExistsAsync(distPath)) {
    await mkdir(distPath);
}

const distCjsPath = Path.join(distPath, 'cjs');
if (!await pathExistsAsync(distCjsPath)) {
    await mkdir(distCjsPath);
}

const distEsmPath = Path.join(distPath, 'esm');
if (!await pathExistsAsync(distEsmPath)) {
    await mkdir(distEsmPath);
}

// read and write package.json files

const distPackageJsonPath = Path.join(distPath, 'package.json');
if (!await pathExistsAsync(distPackageJsonPath)) {
    await writeFileAsync(distPackageJsonPath, JSON.stringify(distPackageJson, null, 4));
}
else {
    // read and merge
    const existing = await readFileAsync(distPackageJsonPath);
    const parsed = JSON.parse(existing);
    const merged = Lodash.merge({}, parsed, distPackageJson);
    await writeFileAsync(distPackageJsonPath, JSON.stringify(merged, null, 4));
}

const distCjsPackageJsonPath = Path.join(distCjsPath, 'package.json');
if (!await pathExistsAsync(distCjsPackageJsonPath)) {
    await writeFileAsync(distCjsPackageJsonPath, JSON.stringify(distCjsPackageJson, null, 4));
}
else {
    // read and merge
    const existing = await readFileAsync(distCjsPackageJsonPath);
    const parsed = JSON.parse(existing);
    const merged = Lodash.merge({}, parsed, distCjsPackageJson);
    await writeFileAsync(distCjsPackageJsonPath, JSON.stringify(merged, null, 4));
}

const distEsmPackageJsonPath = Path.join(distEsmPath, 'package.json');
if (!await pathExistsAsync(distEsmPackageJsonPath)) {
    await writeFileAsync(distEsmPackageJsonPath, JSON.stringify(distEsmPackageJson, null, 4));
}
else {
    // read and merge
    const existing = await readFileAsync(distEsmPackageJsonPath);
    const parsed = JSON.parse(existing);
    const merged = Lodash.merge({}, parsed, distEsmPackageJson);
    await writeFileAsync(distEsmPackageJsonPath, JSON.stringify(merged, null, 4));
}

}


await main(packageRootPath);


if (DEBUG && process.env.DEBUG) { 
    console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);
}



// ----------------------------------------------------------------------------


// Other experiments and snippets:


// const selectiveReport = () => {
//     const r = process.report;
//     return {
//         envVars: r.environmentVariables,
//         jsStack: r.javascriptStack.stack,
//         commandLine: r.header.commandLine,
//         cwd: r.header.cwd,
//         filename: r.header.filename,
//         host: r.header.host,
//         netIfs: r.header.networkInterfaces.filter(ni => ni.family === 'IPv4'),
//         nodeV: r.header.nodeVersion,
//         arch: r.header.arch,
//         pointerSize: r.header.wordSize,
//         osM: r.header.osMachine,
//         osN: r.header.osName,
//         osR: r.header.osRelease,
//         osV: r.header.osVersion,
//         platform: r.header.platform,
//         dumpTimeStamp: r.header.dumpEventTimeStamp,
//         dumpTimePretty: r.header.dumpEventTime,
//     }
// }

// const info = {
//     arch: process.arch,
//     argv0: process.argv0,
//     argv: process.argv,
//     execPath: process.execPath,
//     execArgv: process.execArgv,
//     cwd: process.cwd(),
//     domain: process.domain,
//     env: process.env,
//     isDebug: process.features.debug,
//     jsDebugIsRegistered: global.$jsDebugIsRegistered,
//     isInspect: process.features.inspector,
//     hasUncaughtCb: process.hasUncaughtExceptionCaptureCallback(),
//     pid: process.pid,
//     ppid: process.ppid,
//     platform: process.platform,
//     preLoadedModules: process._preload_modules,
//     debugPort: process.debugPort,
//     nodeV: process.version,
//     languages: global.navigator.languages,
// }

// function createModule(code, filename) {
//     const m = new Module(filename);
//     // m.load("./packages/startx/devt/common/module-meta.js")
//     m._compile(code, filename);
//     return m.exports;
// }

// const file = new File(["foo"], "foo.txt", {
//     type: "text/plain",
//   });
  

// // Rehydrate the function
// const code = `module.exports = ${getContextFnStr};`;
// const filename = 'dynamic-context-module.mjs';
// const contextModule = createModule(code, filename);
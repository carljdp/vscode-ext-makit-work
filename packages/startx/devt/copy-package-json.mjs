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


const DEBUG = false;


// an arbitrary number, but it should be high enough
// to be confident that this is the root of a package
const THRESHOLD_SCORE = 12;


const STRINGIFY_PAD = 4;


const File = {
    packageJson: 'package.json',
    fallbackEntry: 'index.js',
};


const Dir = {
    src: 'src',
    dist: 'dist',
}


const ModSys = {
    cjs: {
        dir: 'cjs',
        sourceType: 'commonjs',
        entryPointKey: 'main',
    },
    esm: {
        dir: 'esm',
        sourceType: 'module',
        entryPointKey: 'module',
    },
}


// IMPLEMENTATION


if (process.env.DEBUG && DEBUG) console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);


/** @enum {number} A simple enum to represent the confidence level of a context indicator */
const ChanceIs = {
    veryGood: 2,
    good: 1,
    neutral: 0,
    bad: -1,
    veryBad: -2,
};

/** An array of context indicators that help us determine if directory under inspection is a package root.
 * @type {Array<{name: RegExp, isFile: boolean, isPackageRoot: ChanceIs}>} */
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


// ---------------------------------------------------------------
//
// I think this section only applies in the specific case where
// this script is run from the <root>/packages/startx directory
// as was most likely the case during initial development
// - we should read dir contents depending on the context -> the cwd()!
// - not the 'context' of the script itself
//
// Old / deprecated code segment:
// const scriptMeta = new Location();
// const thisFilePath = scriptMeta.originLocation.toPath();
// const thisDirPath = Path.dirname(thisFilePath);
// const parentDirPath = Path.dirname(thisDirPath);
// const dirContents = readDirSync(parentDirPath);
//
// New / revised code segment:
const processCwd = process.cwd();
const dirContents = readDirSync(processCwd);
// ---------------------------------------------------------------


/** The score that we will use to determine the probability that the directory under inspection is a package root 
 * @type {number} */
const score = dirContents
    .map((entry) => {
        contextIndicators.forEach((indicator) => {
            return (indicator.name.test(entry.name) && indicator.isFile === entry.isFile())
                ? indicator.isPackageRoot
                : ChanceIs.neutral;
        });
    })
    .reduce((prev, curr) => prev + curr, 0);


// if the score is below the (arbitrary) threshold, 
if (score < THRESHOLD_SCORE) {
    // then we are not confident that the directory under inspection is a package root
    console.error(`[${logTag}] Not confident that this is the root of a package`);
    process.exit(1);
}
else {
    // relatively confident that the directory under inspection is a package root
    if (process.env.DEBUG && DEBUG) {
        console.log(`[${logTag}] Relatively confident (score: ${score}) that this is the root of a package`);
        console.log(`[${logTag}] cwd(): ${processCwd}`);
    }
}


// rest is in main() because of async/await


const main = async (rootPath) => {

    let _rootPackageJsonParsed;

    // last checks to make sure we are in the right context

    const rootPackageJsonPath = Path.join(rootPath, `${File.packageJson}`);
    if (!await pathExistsAsync(rootPackageJsonPath)) {
        // fail
        console.error(`[${logTag}] Expected to find a package.json file in the package root.`);
        process.exit(1);
    }
    else {
        
        // we're not try-catch'ing this parse because we want to exit if this fails
        const packageJson = await readFileAsync(rootPackageJsonPath);
        const parsed = JSON.parse(packageJson);

        const dirName = Path.basename(rootPath);
        if (parsed && parsed.name !== dirName) {
            // fail
            console.error(`[${logTag}] '${parsed.name}' !== '${dirName}'`);
            console.error(`[${logTag}] Expected the package name in package.json to match the directory name.`);
            process.exit(1);
        }
        else {
            // success
            console.log(`[${logTag}] Package name: ${parsed.name}`);
            _rootPackageJsonParsed = parsed;
        }

        
    }

    // all checks passed, let's proceed

    const distPackageJson = Lodash.omit(Lodash.merge({}, _rootPackageJsonParsed,
        {
            $schema: _rootPackageJsonParsed.$schema || 'https://json.schemastore.org/package.json',
            name: `${_rootPackageJsonParsed.name}-${Dir.dist}`
        }
    ), [
        'scripts',
        'devDependencies', 
        'workspaces',
        // Important! keep 'dependencies' field
    ]);

    // clean up package.json
    for (const key in distPackageJson) {

        // remove custom keys
        if (key.startsWith('_')) {
            delete distPackageJson[key];
        }

        // remove 'src/' and 'dist/' from 'main' and 'module' fields (if present)
        if (key in Object.values(ModSys).map(mod => mod.entryPointKey)) {
            distPackageJson[key] = distPackageJson[key]
                .replace(new RegExp(`^(\.\/)?(${Dir.src}|${Dir.dist})\/`), '');
        }

        // TODO: (later)
        // Remove other non-standard fields i.e. configs of tools, etc.
    }

    // minimal base package.json files for cjs and esm directories
    // - ensures fields like author, license, etc. are present
    const reducedDistPackageJson = Lodash.omit(Lodash.merge({}, distPackageJson), [
        'main', // will be re-added
        'module', // will be re-added
        'type', // will be re-added
        'keywords', // meh? or keep but remove terms like: esm, cjs, dist, src, etc?
        // Important! keep 'dependencies' field
    ]);

    const distCjsPackageJson = {
        ...reducedDistPackageJson,
        name: `${distPackageJson.name}-${ModSys.cjs.dir}`,
        main: (
            // remove 'cjs/' from 'main' field (if present)
            distPackageJson.main || `${ModSys.cjs.dir}/${File.fallbackEntry}`)
            .replace(new RegExp(`^(\.\/)?${ModSys.cjs.dir}\/`), ''),
        type: `${ModSys.cjs.sourceType}`,
    };

    const distEsmPackageJson = {
        ...reducedDistPackageJson,
        name: `${distPackageJson.name}-${ModSys.esm.dir}`,
        module: (
            // remove 'esm/' from 'module' field (if present)
            distPackageJson.module || `${ModSys.esm.dir}/${File.fallbackEntry}`)
                .replace(new RegExp(`^(\.\/)?${ModSys.esm.dir}\/`), ''
        ),
        type: `${ModSys.esm.sourceType}`,
    };

    // make sure dirs exist

    const distPath = Path.join(rootPath, `${Dir.dist}`);
    if (!await pathExistsAsync(distPath)) {
        await mkdir(distPath);
    }

    const distCjsPath = Path.join(distPath, `${ModSys.cjs.dir}`);
    if (!await pathExistsAsync(distCjsPath)) {
        await mkdir(distCjsPath);
    }

    const distEsmPath = Path.join(distPath, `${ModSys.esm.dir}`);
    if (!await pathExistsAsync(distEsmPath)) {
        await mkdir(distEsmPath);
    }

    // read/merge/write package.json files

    const distPackageJsonPath = Path.join(distPath, `${File.packageJson}`);
    if (!await pathExistsAsync(distPackageJsonPath)) {
        await writeFileAsync(distPackageJsonPath, JSON.stringify(distPackageJson, null, STRINGIFY_PAD));
    }
    else {
        // read and merge
        const existing = await readFileAsync(distPackageJsonPath);
        const parsed = JSON.parse(existing);
        const merged = Lodash.merge({}, parsed, distPackageJson);
        // write
        await writeFileAsync(distPackageJsonPath, JSON.stringify(merged, null, STRINGIFY_PAD));
    }

    const distCjsPackageJsonPath = Path.join(distCjsPath, `${File.packageJson}`);
    if (!await pathExistsAsync(distCjsPackageJsonPath)) {
        await writeFileAsync(distCjsPackageJsonPath, JSON.stringify(distCjsPackageJson, null, STRINGIFY_PAD));
    }
    else {
        // read and merge
        const existing = await readFileAsync(distCjsPackageJsonPath);
        const parsed = JSON.parse(existing);
        const merged = Lodash.merge({}, parsed, distCjsPackageJson);
        // write
        await writeFileAsync(distCjsPackageJsonPath, JSON.stringify(merged, null, STRINGIFY_PAD));
    }

    const distEsmPackageJsonPath = Path.join(distEsmPath, `${File.packageJson}`);
    if (!await pathExistsAsync(distEsmPackageJsonPath)) {
        await writeFileAsync(distEsmPackageJsonPath, JSON.stringify(distEsmPackageJson, null, STRINGIFY_PAD));
    }
    else {
        // read and merge
        const existing = await readFileAsync(distEsmPackageJsonPath);
        const parsed = JSON.parse(existing);
        const merged = Lodash.merge({}, parsed, distEsmPackageJson);
        // write
        await writeFileAsync(distEsmPackageJsonPath, JSON.stringify(merged, null, STRINGIFY_PAD));
    }

}


await main(processCwd);


if (process.env.DEBUG && DEBUG) console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);



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
// file: <package-root>/.dev/swc-configs-generate.mjs
"use strict";

import Fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import Lodash from 'lodash';
const { merge, cloneDeep } = Lodash;

import { SwcConfigs, SwcPresets } from './swc-configs-defaults.js';






/**
 * @typedef {typeof SwcConfigs._rcExtendedDefaults} SwcRcConfig
 * @typedef {typeof SwcConfigs._cliBaseDefaults} SwcCliConfig
 * @typedef {typeof SwcPresets.buildTargets[0]} BuildTargetDetails
 */

/** @type {Partial<SwcRcConfig>} */
const sharedAcrossTargets = {
    jsc: {
        parser: {
            syntax: 'typescript',
            decorators: true,
        },
    },
    sourceMaps: true,

    isModule: true,
}

/** 
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {Partial<SwcRcConfig>}
 */
const compileSharedTarget = (buildTargetDetails) => {
    return {
        jsc: {
            target: 'es2022', // es2015 == es6
        },
        module: {
            type: buildTargetDetails.swcModuleTypeSpecifier,
            strictMode: true,
        }
    }
}


/** 
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {SwcRcConfig}
 */
const composeRcConfigFileObj = (buildTargetDetails) => {
    return merge(
        cloneDeep(SwcConfigs._rcExtendedDefaults),
        sharedAcrossTargets,
        compileSharedTarget(buildTargetDetails)
    );
}

/** 
 * Write file relative to the cwd()
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {void}
 */
const writeRcConfigFile = (buildTargetDetails) => {
    Fs.writeFileSync(
        `./.swcrc.${buildTargetDetails.key}.json`,
        JSON.stringify(composeRcConfigFileObj(buildTargetDetails), null, 4)
    );
}

/**
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {SwcCliConfig}
 */
const composeCliConfigFileObj = (buildTargetDetails) => {
    /** @type {SwcCliConfig} */
    const overrides = {

        configFile: `.swcrc.${buildTargetDetails.key}.json`,
        outDir: `dist/${buildTargetDetails.key}`,

        stripLeadingPaths: true,
        deleteDirOnStart: true,
        copyFiles: true,
        includeDotfiles: true,
        sourceMaps: true,

    }
    return merge(
        cloneDeep(SwcConfigs._cliBaseDefaults),
        overrides);
}

/** 
 * Write file relative to the cwd()
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {void}
 */
const writeCliConfigFile = (buildTargetDetails) => {
    Fs.writeFileSync(
        `./.swc.cli.${buildTargetDetails.key}.json`,
        JSON.stringify(composeCliConfigFileObj(buildTargetDetails), null, 4));
}


SwcPresets.buildTargets
    .map(target => {
        writeRcConfigFile(target);
        writeCliConfigFile(target);
    });

console.info(`[compile-pre] Regenerated @swc config files for build targets: ${SwcPresets.buildTargets.map(t => t.key).join(', ')}`);
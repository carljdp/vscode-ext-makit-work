"use strict";
// @ts-check

/**
 * @fileoverview This script is intended to be run in the root directory of a package.
 * It generates the SWC configs (and CLI configs) for each respective build target.
 * 
 * @description
 * // TODO: Add description
 * 
 * @todo
 * - Should tripple check we are:
 *   - not overwriting existing files
 *   - in the correct directory/context (see also copy-package-json.mjs)
 */


/** Top-level @typedefs for Intellisense
 * @typedef {typeof SwcConfigs._rcExtendedDefaults} SwcRcConfig
 * @typedef {typeof SwcConfigs._cliBaseDefaults} SwcCliConfig
 * @typedef {typeof SwcPresets.buildTargets[0]} BuildTargetDetails
 */


// IMPORTS


import FsSync from 'node:fs';
import Lodash from 'lodash';
import { SwcConfigs, SwcPresets } from './swc-configs-defaults.js';


// CONSTANTS


/** Common config options shared across all build targets 
 * @type {Partial<SwcRcConfig>}
 */
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


// FUNCTIONS


/** Compose the shared RC Config for a given build target
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {Partial<SwcRcConfig>}
 */
const composeSharedRcConfig = (buildTargetDetails) => {
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


/** Compose the RC config file object for a given build target 
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {SwcRcConfig}
 */
const composeRcConfigFileObj = (buildTargetDetails) => {
    return Lodash.merge(
        Lodash.cloneDeep(SwcConfigs._rcExtendedDefaults),
        sharedAcrossTargets,
        composeSharedRcConfig(buildTargetDetails)
    );
}


/** Compose the CLI config file object for a given build target
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
    return Lodash.merge(
        Lodash.cloneDeep(SwcConfigs._cliBaseDefaults),
        overrides);
}


/** Write file relative to './'
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {void}
 */
const writeRcConfigFile = (buildTargetDetails) => {
    FsSync.writeFileSync(
        `./.swcrc.${buildTargetDetails.key}.json`,
        JSON.stringify(composeRcConfigFileObj(buildTargetDetails), null, 4)
    );
}


/** Write file relative to './'
 * @param {BuildTargetDetails} buildTargetDetails
 * @returns {void}
 */
const writeCliConfigFile = (buildTargetDetails) => {
    FsSync.writeFileSync(
        `./.swc.cli.${buildTargetDetails.key}.json`,
        JSON.stringify(composeCliConfigFileObj(buildTargetDetails), null, 4));
}


// MAIN

/**
 * Generates the SWC config files for each build target and writes them to disk relative to the current working directory.
 * @returns {void}
 */
const main = () => {

    SwcPresets.buildTargets
        .map(target => {
            writeRcConfigFile(target);
            writeCliConfigFile(target);
        });

    console.info(`[compile-pre] Regenerated @swc config files for build targets: ` + 
        `${SwcPresets.buildTargets.map(t => t.key).join(', ')}`);

}


main();
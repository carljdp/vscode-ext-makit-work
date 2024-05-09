import fs from 'fs';

import lodash from 'lodash';
const { cloneDeep, merge } = lodash;

const factoryDefaults = {

    /** @type {import('@swc/types').Config} */
    rcConfig: {
        jsc: {
            parser: {
                syntax: 'ecmascript',
                dynamicImport: false,
                decorators: false,
            },
            transform: {},
            target: 'es5',
            loose: false,
            externalHelpers: false,
            keepClassNames: false
        },
        isModule: false,
        module: {
            strict: false,
            strictMode: true,
            lazy: false,
            noInterop: false,
            ignoreDynamic: undefined
        }
    },


    cliConfig: {
        /** @type {string} */
        outDir: '',
        /** @type {string} */
        outFile: '',
        /** @type {boolean} */
        stripLeadingPaths: false,
        /** @type {string} */
        filename: '',
        /** @type {string[]} */
        filenames: [],
        /** @type {boolean|undefined} */
        sync: false,
        /** @type {number|undefined} */
        workers: undefined,
        /** @type {any|undefined} */
        sourceMapTarget: undefined,
        /** @type {string[]} */
        extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx", ".cts", ".mts"],
        /** @type {boolean} */
        watch: false,
        /** @type {boolean} */
        copyFiles: false,
        /** @type {string} */
        outFileExtension: 'js',
        /** @type {boolean} */
        includeDotfiles: false,
        /** @type {boolean} */
        deleteDirOnStart: false,
        /** @type {boolean} */
        quiet: false,
        /** @type {string[]} */
        only: [],
        /** @type {string[]} */
        ignore: [],

        /** @type {boolean} */
        debug: false,

        configFile: undefined,
        jsc: {
            parser: undefined,
            transform: {}
        },
        sourceFileName: undefined,
        sourceMaps: undefined,
        sourceRoot: undefined,
        swcrc: true,
    }
}


/** @type {Partial<import('@swc/types').Config>} */
const sourceSharedOptions = {
    jsc: {
        parser: {
            syntax: 'typescript',
            decorators: true,
        },
    },
    isModule: true,
}

/** @type {Partial<import('@swc/types').Config>} */
const compileSharedBase = {
    module: {
        strictMode: true,
    },
}

/** @type {Partial<import('@swc/types').Config>} */
const compileSharedOptimize = {
    // jsc: {
    //     minify: {
    //         compress: true,
    //         mangle: true
    //     }
    // },
    // module: {
    //     lazy: true,
    // },
    // minify: true,
}

/** @type {Partial<import('@swc/types').Config>} */
const compileSharedDev = {
    sourceMaps: true,
}


/** @returns {Partial<import('@swc/types').Config>} */
const compileSharedTarget = (buildTarget) => {
    return {
        jsc: {
            target: 'es2015', // es2015 aka es6
        },
        module: {
            type: `${buildTarget.modTypeSpecifier}`
        }
    }
}


/** @returns {import('@swc/types').Config} */
const composeRcConfigFileObj = (buildTarget) => {
    return merge(cloneDeep(factoryDefaults.rcConfig),
        sourceSharedOptions,
        compileSharedBase,
        compileSharedOptimize,
        compileSharedDev,
        compileSharedTarget(buildTarget)
    );
}

const writeRcConfigFile = (buildTarget) => {
    fs.writeFileSync(
        `./.swcrc.${buildTarget.modSysAbbr}.json`,
        JSON.stringify(composeRcConfigFileObj(buildTarget), null, 4)
    );
}

const composeCliConfigFileObj = (buildTarget) => {
    return merge(cloneDeep(factoryDefaults.cliConfig),
        {
            configFile: `.swcrc.${buildTarget.modSysAbbr}.json`,
            outDir: `dist/${buildTarget.modSysAbbr}`,

            // Not yet sure if the below are implemented, didn't see them in the source code?
            stripLeadingPaths: true,
            deleteDirOnStart: true,
            copyFiles: true,
            sourceMaps: true,
        });
}

const writeCliConfigFile = (buildTarget) => {
    fs.writeFileSync(
        `./.swc.cli.${buildTarget.modSysAbbr}.json`,
        JSON.stringify(composeCliConfigFileObj(buildTarget), null, 4));
}

const buildTargets = new Map([
    ['cjs', {
        modSysDisplay: 'CommonJS',
        modSysAbbr: 'cjs',
        modTypeSpecifier: 'commonjs'
    }],
    ['esm', {
        modSysDisplay: 'ES Module',
        modSysAbbr: 'esm',
        modTypeSpecifier: 'es6'
    }],
]);

for (const [key, value] of buildTargets) {
    writeRcConfigFile(value);
    writeCliConfigFile(value);
}

console.info(`[compile-pre] Regenerated @swc config files for build targets: ${[...buildTargets.keys()].join(', ')}`)
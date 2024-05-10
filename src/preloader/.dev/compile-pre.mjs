import fs from 'fs';

import lodash from 'lodash';
const { cloneDeep, merge } = lodash;



/**
 * @typedef {object} cliCommonOpts
 * 
 * @property {string} [filename]
 * `--filename` 
 * The filename to use when reading from stdin - this will be used in source-maps, errors etc.
 * - Default: `undefined`
 *   
 * @property {string} [configFile]
 * `--config-file` Path to a `.swcrc` file to use.
 * - Default: `'.swcrc'`
 * 
 * @property {string} [envName]
 * `--env-name` The environment to use.
 * - Default: `'development'`
 * 
 * @property {boolean} [swcrc]
 * `--[no-]swcrc` Whether or not to look up `.swcrc` files.
 * - Default: `true`
 * 
 * @property {string[]} [ignore]
 * `--ignore` List of glob paths to not compile.
 * - Default: `[]`
 *   
 * @property {string[]} [only]
 * `--only` Only compile files that match specified glob patterns.
 * - Default: `[]`
 *   
 * @property {boolean} [watch]
 * `--watch` Recompile files when they change. Requires `chokidar`
 * - Default: `false`
 *   
 * @property {boolean} [quiet]
 * `--quiet` Suppress all log output.
 * - Default: `false`
 *   
 * @property {'true'|'false'|'inline'|'both'} [sourceMaps]
 * `--source-maps` Generate source maps.
 * - Default: `'false'`
 * 
 * @property {string} [sourceMapTarget]
 * `--source-map-target` Define the file for the source map.
 * - Default: `undefined`
 *   
 * @property {string} [sourceFileName]
 * `--source-file-name` Set `sources[0]` on returned source map.
 * - Default: `undefined`
 * 
 * @property {string} [sourceRoot]
 * `--source-root` The root from which all sources are relative.
 * - Default: `./`
 *   
 * @property {boolean} [copyFiles]
 * `--copy-files` When compiling a directory, copy over non-compilable files.
 * - Default: `false`
 *   
 * @property {boolean} [includeDotfiles]
 * `--include-dotfiles` Include dotfiles when compiling and copying non-compilable files.
 * - Default: `false`
 * 
 * @property {string[]} [config]
 * `--config` Override a config from `.swcrc` file. Allows multiple `'key.name=val'`.
 * - Default: `[]`
 *   
 * @property {boolean} [sync]
 * `--sync` Invoke swc synchronously. Useful for debugging.
 * - Default: `false`
 *   
 * @property {boolean} [logWatchCompilation]
 * `--log-watch-compilation` Log a message when a watched file is successfully compiled.
 * - Default: `true`
 *   
 * @property {string[]} [extensions]
 * `--extensions` Use specific extensions.
 * - Default: `['.js','.jsx','.es6','.es','.mjs','.ts','.tsx','.cts','.mts']`
 *   
 * @property {boolean} [stripLeadingPaths]
 * `--strip-leading-paths` Removes leading directory paths from the output path.
 * - Default: `false`
 * 
 * @property {boolean} [deleteDirOnStart]
 * `--delete-dir-on-start` Whether or not delete output directory on start.
 * - not published in online docs / only via cli help
 * - Default: `false`
 *   
 * @property {string} [outFileExtension]
 * `--out-file-extension` Use a specific extension for the output files.
 * - not published in online docs / only via cli help
 * - Default: `'js'`
 *   
 * @property {number|undefined} [workers]
 * `--workers` The number of workers for parallel processing.
 * - not published in online docs / only via cli help
 * - Default: `undefined`
 * 
 * @property {string[]} [filenames] **&lt;undocumented&gt;** Assuption: The remaining args as file names?
 * - not in any docs / only in source code
 * - Default: `undefined`
 *   
 * @property {boolean} [debug] **&lt;undocumented&gt;** Enable debug mode for more detailed error information.
 * - not in any docs / only in source code
 * - Default: `undefined`
 *   
 * 
 * @typedef {object} cliOutDir
 * @property {string} outDir
 * `--out-dir` The output directory. If not set, files are compiled in place.
 * - Default: `undefined`
 * 
 * 
 * @typedef {object} cliOutFile
 * @property {string} outFile
 * `--out-file` The output file. Combines all input files into one if specified.
 * - Default: `undefined`
 * 
 */



/**
 * @typedef {{ "_NOTE_": "This file is generated - changes will be overwritten." }} GeneratedJsonFileNote
 * 
 * @typedef {cliCommonOpts & (cliOutFile|cliOutDir) & GeneratedJsonFileNote } SwcCliConfig
 * - the contents of a json file passed via `--cli-config-file`
 * - types manually derived from source code
 * 
 * 
 * @typedef { import('@swc/types').Config } SwcRcConfigBase
 * - the (base) contents of a json file passed via `--config-file`
 * - types imported from source code
 * 
 * 
 * @typedef { import('@swc/types').Options & { $schema: "https://swc.rs/schema.json" } & GeneratedJsonFileNote } SwcRcConfigExtended
 * - the (extended) contents of a json file passed via `--config-file`
 * - Contains properties that might only be populated at runtime by the CLI, e.g `filename` the file currently being compiled
 * - extends {@linkcode SwcRcConfigBase}
 * - published schema: https://swc.rs/schema.json
 * 
 * 
 * @typedef {'cjs'|'esm'} BuildTargetName
 * The name of the build target for which details are provided
 * 
 * 
 * @typedef {object} BuildTargetDetails
 * Just a simple object to hold the details of a build target
 * @property {string} modSysDisplay 
 * A friendly display name for the module system
 * @property {string} modSysAbbr 
 * An abbreviation for the module system, used in filenames. Preferably 3 characters.
 * @property {'es6' | 'commonjs' | 'umd' | 'amd' | 'nodenext' | 'systemjs'} modTypeSpecifier 
 * The module type specifier for the target as used internally by SWC.
 * 
 * 
 * @typedef { Map<BuildTargetName, BuildTargetDetails> } BuildTargets
 * 
 * 
 * @typedef { ( buildTarget: BuildTargetDetails ) => (SwcRcConfigExtended|SwcRcConfigExtended[]) } SwcRcConfigExtendedFileFactory
 * Compose/generate the swc config object(s) for the specified build target
 * 
 * 
 * @typedef { ( buildTarget: BuildTargetDetails ) => SwcCliConfig } SwcCliConfigFileFactory
 * Compose/generate the swc cli config object for the specified build target
 * 
 * 
 * @typedef { ( buildTarget: BuildTargetDetails ) => void } ConfigFileWriter
 * Compose/generate and then write a config file for the specified build target
 * 
 */



/** 
 * @type {SwcRcConfigBase & GeneratedJsonFileNote}
 * An empty base object to build upon
 */
const rcConfigBaseEmpty = {
    _NOTE_: "This file is generated - changes will be overwritten.",
    env: undefined,
    jsc: undefined,
    module: undefined,
    minify: undefined,
    test: undefined,
    exclude: undefined,
    sourceMaps: undefined,
    inlineSourcesContent: undefined
};

/**
 * @type {SwcRcConfigExtended}
 * An empty base object to build upon
 */
const rcConfigExtendedEmpty = {
    ...rcConfigBaseEmpty,
    _NOTE_: "This file is generated - changes will be overwritten.",

    envName: undefined,
    script: undefined,
    isModule: undefined,
    filename: undefined,
    rootMode: undefined,
    cwd: undefined,
    root: undefined,
    swcrcRoots: undefined,
    swcrc: undefined,
    configFile: undefined,
    inputSourceMap: true,
    sourceFileName: undefined,
    sourceRoot: undefined,
    outputPath: undefined,

    // undocumented
    plugin: undefined,

    // `caller` & `caller.name` is not optional, and not documented,
    // so hopefully this default doesn't break everything.
    caller: {
        name: '',
    },

    // for completeness, but not documented
    $schema: "https://swc.rs/schema.json",
};

/** 
 * @type {SwcRcConfigBase & GeneratedJsonFileNote}
 * The default options for composing a .swcrc config json file
 */
const factoryRcConfigBase = {
    ...rcConfigBaseEmpty,
    _NOTE_: "This file is generated - changes will be overwritten.",

    // $schema: "https://json.schemastore.org/swcrc",
    // defaults: https://swc.rs/docs/configuration/swcrc#compilation

    env: {
        targets: undefined,
        mode: undefined,
        debug: undefined,
        dynamicImport: undefined,
        loose: undefined,
        skip: undefined,
        include: undefined,
        exclude: undefined,
        coreJs: undefined,
        path: undefined,
        shippedProposals: undefined,
        forceAllTransforms: undefined,
        bugfixes: undefined,
    },

    jsc: {
        // https://swc.rs/docs/configuration/compilation#jscexternalhelpers
        externalHelpers: undefined, // depends on @swc/helpers

        // https://swc.rs/docs/configuration/compilation#jscparser
        parser: {
            syntax: 'ecmascript', // or 'typescript'
            jsx: false,
            dynamicImport: false,
            privateMethod: false,
            functionBind: false,
            exportDefaultFrom: false,
            exportNamespaceFrom: false,
            decorators: false,
            decoratorsBeforeExport: false,
            topLevelAwait: false,
            importMeta: false,
            importAssertions: false,
        },
        transform: {
            constModules: {
                // globals: {
                //     // example from: https://swc.rs/docs/configuration/compilation#jsctransformconstmodules
                //     // "@ember/env-flags": {
                //     //     "DEBUG": "true"
                //     // },
                // }
            },
            decoratorMetadata: undefined,
            legacyDecorator: undefined,
            optimizer: {
                // // see examples: https://swc.rs/docs/configuration/compilation#jsctransformoptimizer
                // globals: {
                //     vars: {
                //         // example from: https://swc.rs/docs/configuration/compilation#jsctransform
                //         // "__DEBUG__": "true"
                //     }
                // }
            },
            react: undefined,
            treatConstEnumAsEnum: undefined,
            useDefineForClassFields: undefined,
            decoratorVersion: '2021-12'
        },
        target: 'es3',
        loose: undefined,

        keepClassNames: undefined,
        baseUrl: undefined, // absolute path!
        paths: undefined, // requires baseUrl!
        minify: undefined,
        preserveAllComments: undefined,
    },

    module: {
        strict: false,
        strictMode: true,
        lazy: false,
        noInterop: false,
        type: 'es6', // default is not documented
        importInterop: "swc",
        exportInteropAnnotation: false,
        ignoreDynamic: undefined,
        allowTopLevelThis: undefined,
        preserveImportMeta: undefined,
    },

    minify: undefined,

    // webpack like 'test' option
    // Regex / Regex[] (type only in online docs, not in source code?)
    // https://swc.rs/docs/configuration/compilation#test
    test: undefined, // e.g. ".*\\.ts$"

    exclude: undefined,
    sourceMaps: undefined,
    inlineSourcesContent: undefined,

    // in docs, but not in source code
    // https://swc.rs/docs/configuration/compilation#ismodule
    //isModule: false,
};

/**
 * @type {SwcRcConfigExtended}
 * The default options for composing a swc programatic options object
 * - An extended version of the `SwcRcConfig` with additional runtime options
 */
const factoryRcConfigExtended = {
    ...rcConfigExtendedEmpty,
    ...factoryRcConfigBase,
    _NOTE_: "This file is generated - changes will be overwritten.",

    envName: undefined, // fallback to `SWC_ENV || NODE_ENV || "development"`

    script: undefined,
    isModule: undefined,

    // the file currently being compiled?
    filename: undefined,

    // Traversal mode
    // - recommends `'upward'` for mono-repos
    rootMode: "root",

    cwd: undefined, // fallback to `process.cwd()`
    root: undefined, // fallback to 'opts.cwd'
    swcrcRoots: undefined, // fallback to 'opts.root'

    swcrc: undefined, // fallback to `true` if `filename` is set
    configFile: undefined, // fallback to `cwd` + `'.swcrc'`

    // source maps related
    inputSourceMap: true,
    sourceFileName: undefined, // fallback to 'opts.filenameRelative'
    sourceRoot: undefined,
    outputPath: undefined,
};

/** 
 * @type {cliCommonOpts & GeneratedJsonFileNote}
 * An empty base object to build upon
 */
const factoryCliConfigEmpty = {
    _NOTE_: "This file is generated - changes will be overwritten.",
    extensions: undefined,
    envName: undefined,
    swcrc: undefined,
    configFile: undefined,
    config: undefined,
    filename: undefined,
    quiet: undefined,
    sync: undefined,
    logWatchCompilation: undefined,
    sourceMaps: undefined,
    sourceMapTarget: undefined,
    sourceFileName: undefined,
    sourceRoot: undefined,
    watch: undefined,
    only: undefined,
    ignore: undefined,
    stripLeadingPaths: undefined,
    copyFiles: undefined,
    includeDotfiles: undefined,
    deleteDirOnStart: undefined,
    outFileExtension: undefined,
    workers: undefined,
    filenames: undefined,
    debug: undefined,
};

/** 
 * @type {cliCommonOpts & GeneratedJsonFileNote}
 * The default options for composing a swc cli config json file
 */
const factoryCliConfig = {
    ...factoryCliConfigEmpty,
    _NOTE_: "This file is generated - changes will be overwritten.",

    extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx", ".cts", ".mts"],
    envName: 'development',

    swcrc: true,
    configFile: '.swcrc',
    config: [],

    filename: undefined,

    quiet: false,
    sync: false,
    logWatchCompilation: true,

    sourceMaps: 'false',
    sourceMapTarget: undefined,
    sourceFileName: undefined,

    sourceRoot: './',
    watch: false,
    only: [],
    ignore: [],

    stripLeadingPaths: false,
    copyFiles: false,
    includeDotfiles: false,

    // only cli docs
    deleteDirOnStart: false,
    outFileExtension: 'js',
    workers: undefined,

    // no docs
    filenames: undefined,
    debug: undefined,
};


/** @type {SwcRcConfigBase} */
const sharedAcrossTargets = {
    jsc: {
        parser: {
            syntax: 'typescript',
            decorators: true,
        },
    },
    sourceMaps: true,
}

/** @type {SwcRcConfigExtendedFileFactory} */
const compileSharedTarget = (buildTarget) => {
    return {
        ...rcConfigExtendedEmpty,
        jsc: {
            target: 'es2022', // es2015 == es6
        },
        module: {
            type: `${buildTarget.modTypeSpecifier}`,
            strictMode: true,
        }
    }
}


/** @type {SwcRcConfigExtendedFileFactory} */
const composeRcConfigFileObj = (buildTarget) => {
    return merge(
        cloneDeep(factoryRcConfigExtended),
        sharedAcrossTargets,
        compileSharedTarget(buildTarget)
    );
}

/** @type {ConfigFileWriter} */
const writeRcConfigFile = (buildTarget) => {
    fs.writeFileSync(
        `./.swcrc.${buildTarget.modSysAbbr}.json`,
        JSON.stringify(composeRcConfigFileObj(buildTarget), null, 4)
    );
}

/** @type {SwcCliConfigFileFactory} */
const composeCliConfigFileObj = (buildTarget) => {
    /** @type {SwcCliConfig} */
    const overrides = {
        ...factoryCliConfig,

        configFile: `.swcrc.${buildTarget.modSysAbbr}.json`,
        outDir: `dist/${buildTarget.modSysAbbr}`,

        // Not yet sure if the below are implemented, didn't see them in the source code?
        stripLeadingPaths: true,
        deleteDirOnStart: true,
        copyFiles: true,
        sourceMaps: 'true',
    }
    return merge(
        cloneDeep(factoryCliConfig),
        overrides);
}

/** @type {ConfigFileWriter} */
const writeCliConfigFile = (buildTarget) => {
    fs.writeFileSync(
        `./.swc.cli.${buildTarget.modSysAbbr}.json`,
        JSON.stringify(composeCliConfigFileObj(buildTarget), null, 4));
}


/** @type {BuildTargets} */
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

console.info(`[compile-pre] Regenerated @swc config files for build targets: ${[...buildTargets.keys()].join(', ')}`);
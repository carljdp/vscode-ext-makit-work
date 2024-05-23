// file: <package-root>/.dev/swc-configs-defaults.mjs
"use strict";

/**
 *
 * @typedef {object} _SwcCliConfigBase
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
 * @property {boolean|'inline'|'both'} [sourceMaps]
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
 * @typedef {object} CliOutDir
 * @property {string} outDir
 * `--out-dir` The output directory. If not set, files are compiled in place.
 * - Default: `''`
 * 
 *
 * @typedef {object} CliOutFile
 * @property {string} outFile
 * `--out-file` The output file. Combines all input files into one if specified.
 * - Default: `''`
 * 
 * 
 */

export class SwcConfigs {
    constructor() {
        throw new Error('This class is not meant to be instantiated');
    }

    /** 
     * @type {_SwcRcConfigBase}
     * An empty base object to build upon
     */
    static _rcBaseEmpty = {
        env: undefined,
        jsc: undefined,
        module: undefined,
        minify: undefined,
        test: undefined,
        exclude: undefined,
        sourceMaps: undefined,
        inlineSourcesContent: undefined

        // inputSourceMap: undefined, (below)
        // isModule: undefined, (below)

        // schema: undefined, (below/nowhere)

        // emitSourceMapColumns: undefined, (nowhere)
        // error: undefined, (nowhere)
    };

    /**
     * @type {SwcRcConfig}
     * An empty base object to build upon
     */
    // @ts-expect-error - The type says `caller` is required, but it's not in the source code or docs and breaks validation at runtime?
    static _rcExtendedEmpty = {
        ...this._rcBaseEmpty,

        envName: undefined,
        script: undefined,
        isModule: undefined,
        filename: undefined,
        // rootMode: undefined, // breaks validation
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
        // BUT: adding it also makes validation fail :()
        // caller: {
        //     name: '',
        // },

        // for completeness, but not in docs or source code
        $schema: "https://swc.rs/schema.json",
    };


    /** 
     * @type {_SwcRcConfigBase}
     * The default options for composing a .swcrc config json file
     */
    static _rcBaseDefaults = {
        ...this._rcBaseEmpty,

        // $schema: "https://json.schemastore.org/swcrc",
        // defaults: https://swc.rs/docs/configuration/swcrc#compilation

        env: undefined, // can not be used with `jsc.target`
        // env: {
        //     targets: undefined,
        //     mode: undefined,
        //     debug: undefined,
        //     dynamicImport: undefined,
        //     loose: undefined,
        //     skip: undefined,
        //     include: undefined,
        //     exclude: undefined,
        //     coreJs: undefined,
        //     path: undefined,
        //     shippedProposals: undefined,
        //     forceAllTransforms: undefined,
        //     bugfixes: undefined,
        // },

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
     * @type {SwcRcConfig}
     * The default options for composing a swc programatic options object
     * - An extended version of the base config with additional runtime options
     */
    static _rcExtendedDefaults = {
        ...this._rcExtendedEmpty,
        ...this._rcBaseDefaults,

        envName: undefined, // fallback to `SWC_ENV || NODE_ENV || "development"`

        script: undefined,
        isModule: undefined,

        // the file currently being compiled?
        filename: undefined,

        // Traversal mode
        // - recommends `'upward'` for mono-repos
        // BUT: breaks validation at runtime
        // rootMode: "root",

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
     * @type {_SwcCliConfigBase}
     * An empty base object to build upon
     */
    static _cliBaseEmpty = {
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
     * @type {SwcCliConfig}
     * The default options for composing a swc cli config json file
     */
    static _cliBaseDefaults = {
        ...this._cliBaseEmpty,

        extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx", ".cts", ".mts"],
        envName: 'development',

        swcrc: true,
        configFile: '.swcrc',
        config: [],

        filename: undefined,
        outDir: '',

        quiet: false,
        sync: false,
        logWatchCompilation: true,

        sourceMaps: false,
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

}

/**
 * @typedef {'_'} EmptyEnumKey
 * The key used to identify an object that is only included to serve as a jsdoc type
 * 
 * @typedef { {[key in EmptyEnumKey]: string} } EmptyEnumKeyObj
 */

/** @type {EmptyEnumKeyObj} */
const emptyEnumKeyObj = {
    _: '_'
}

/**
 * @typedef {'cjs' | 'esm' } ModuleSystemEnumKeys
 * The name of the build target for which details are provided
 * 
 * @typedef { {[key in ModuleSystemEnumKeys]: string} } ModuleSystemEnumKeysObj
 */

// /** @type {ModuleSystemEnumKeysObj} */
// const moduleSystemEnumKeysObj = {
//     esm: 'esm',
//     cjs: 'cjs',
// }

// /** @type {ModuleSystemEnumKeysObj & EmptyEnumKeyObj} */
// const moduleSystemEnumKeysObjWithEmpty = {
//     ...moduleSystemEnumKeysObj,
//     ...emptyEnumKeyObj
// }

/**
 * @typedef {'es6' | 'commonjs' | 'umd' | 'amd' | 'nodenext' | 'systemjs'} SwcModuleTypeEnumKeys
 * The module type specifier for the target as used internally by SWC.
 * 
 * @typedef { {[key in SwcModuleTypeEnumKeys]: string} } SwcModuleTypeEnumKeysObj
 */

// /** @type {SwcModuleTypeEnumKeysObj} */
// const swcModuleTypeEnumKeysObj = {
//     es6: 'es6',
//     commonjs: 'commonjs',
//     umd: 'umd',
//     amd: 'amd',
//     nodenext: 'nodenext',
//     systemjs: 'systemjs',
// }


// /** @type {SwcModuleTypeEnumKeysObj & EmptyEnumKeyObj} */
// const swcModuleTypeEnumKeysObjWithEmpty = {
//     ...swcModuleTypeEnumKeysObj,
//     ...emptyEnumKeyObj
// }




/**
 *
 * @typedef { import('@swc/types').Config } _swc_types_Config
 * @typedef { _swc_types_Config } _SwcRcConfigBase
 * - the (base) contents the .swcrc file
 * - types imported from source code
 * 
 *
 * @typedef { import('@swc/types').Options } _swc_types_Options
 * @typedef { _SwcRcConfigBase
 *     & _swc_types_Options 
 *     & { $schema: "https://swc.rs/schema.json" } 
 * } SwcRcConfig
 * - the (extended) contents of a json file passed via `--config-file`
 * - Contains properties that might only be populated at runtime by the CLI, e.g `filename` the file currently being compiled
 * - extends {@linkcode _SwcRcConfigBase}
 * - published {@link https://swc.rs/schema.json `.swcrc` json schema}
 * 
 * @typedef {CliOutFile|CliOutDir} _SwcCliOutMode
 * @typedef {_SwcCliConfigBase 
 *     & _SwcCliOutMode 
 * } SwcCliConfig
 * - the contents of a json file passed via `--cli-config-file`
 * - types manually derived from source code
 * 
 * 
 * @typedef {object} BuildTargetDetails
 * Just a simple object to hold the details of a build target
 * @property {ModuleSystemEnumKeys} key 
 * The key used to identify the build target (packaged alongside the details)
 * @property {string} description 
 * A description just for clarity, e.g. 'CommonJS' or 'ES Module'
 * @property {SwcModuleTypeEnumKeys} swcModuleTypeSpecifier 
 * The module type specifier for the target as used internally by SWC.
 * 
 * 
 * @typedef {object} BuildTargetDetailsEmpty
 * @property {EmptyEnumKey} key 
 * @property {string} description 
 * @property {EmptyEnumKey} swcModuleTypeSpecifier 
 *
 * 
 * @typedef { {[key in ModuleSystemEnumKeys]: BuildTargetDetails } & {[key in EmptyEnumKey]: BuildTargetDetailsEmpty }} BuildTargetEnumsObj
 * @typedef { BuildTargetDetails[] } BuildTargets
 * 
 *
 * @typedef { ( buildTarget: BuildTargetDetails ) => (SwcRcConfig|SwcRcConfig[]) } SwcRcConfigExtendedFileFactory
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


export class SwcPresets {
    constructor() {
        throw new Error('This class is not meant to be instantiated');
    }

    /** 
     * @readonly
     * @enum {BuildTargetEnumsObj} */
    static get buildTarget() {
        /** @type {BuildTargetEnumsObj} */
        const targets = {
            _: {
                key: '_',
                description: 'Empty',
                swcModuleTypeSpecifier: '_'
            },
            cjs: {
                key: 'cjs',
                description: 'CommonJS',
                swcModuleTypeSpecifier: 'commonjs'
            },
            esm: {
                key: 'esm',
                description: 'ES Module',
                swcModuleTypeSpecifier: 'es6'
            }
        };
        return targets;
    }


    /** @type {BuildTargets} */
    static get buildTargets() {

        /** @type {BuildTargets} */
        // @ts-expect-error - We filtered out the empty object
        const nonEmptyTargets = Object.values(this.buildTarget)
            .filter(target => target.key !== emptyEnumKeyObj._);

        return nonEmptyTargets;
    }

}
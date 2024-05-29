'use strict';
// @ts-check

// NOTE:
//
// This file is deprecated and will be removed in the future.
//
// As far as I can tell, this file is no-longer used in the project.
//
// We migrated to using SWC and EsLint for linting and transpiling.
//


/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @typedef {import('webpack').PathData} PathData **/
/** @typedef {import('webpack').AssetInfo} AssetInfo **/

import { _isProd_, _isDev_, _isDebug_ } from './src/dev/EnvConf.js';


import EnvConf from './src/dev/EnvConf.js';
import AppConf from './src/dev/AppConf.js';

import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';
import assert from 'node:assert/strict';
import util from 'node:util';

import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

/** @type {boolean} Replace configs with null after printing */
const DRY_RUN = false;

/** @type {boolean} Log out resulting configs */
const ECHO_CONFIG = false;

/** @type {boolean} Log out webpack cli args */
const ECHO_ARGS = false;


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const _absProjRoot = resolve(__dirname);
// console.table({
//     __filename,
//     __dirname,
//     _absProjRoot,
//     'AppConf.PROJ_ROOT_ABS_PATH': AppConf.PROJ_ROOT_ABS_PATH
// });
assert.equal(_absProjRoot, AppConf.PROJ_ROOT_ABS_PATH, `Expected 'PROJ_ROOT_ABS_PATH' ${AppConf.PROJ_ROOT_ABS_PATH} to match __dirname ${_absProjRoot}`);

const _script = {
    fileName: basename(__filename),
    dirName: basename(__dirname),
}
const expected = {
    fileName: 'webpack.config.mjs',
    dirName: basename(AppConf.PROJ_ROOT_ABS_PATH),
}
assert.equal(_script.fileName, expected.fileName, `Incorrect __filename: Expected ${expected.fileName}, got ${_script.fileName}`);
assert.equal(_script.dirName, expected.dirName, `Incorrect __dirname: Expected ${expected.dirName}, got ${_script.dirName}`);


/** @type {Record<string, string|boolean|false>} */
const EnvDefault = {
    /** @type {string} */
    NODE_ENV: '',
    /** @type {string} */
    DEBUG: '',
    /** @type {boolean} */
    isDev: false,
    /** @type {boolean} */
    isDebug: false,
    /** @type {string|false} */
    devtool: false,
};

/** @type {string} String of env-var NODE_ENV */
const NODE_ENV = String(process.env.NODE_ENV || EnvDefault.NODE_ENV);

/** @type {string} String of env-var DEBUG */
const DEBUG = String(process.env.DEBUG || EnvDefault.DEBUG);

/** @type {string|false} If and how source maps are generated */
const devtool = (EnvConf._isDev_)
    ? 'source-map' //'source-map'
    : false;

/** @type {'development'|'production'} Webpack mode */
const mode = (EnvConf._isDev_)
    ? 'development'
    : 'production';

if (EnvConf._isDebug_) {
    console.table([
        { var: 'NODE_ENV', raw: NODE_ENV, parsed: `_isDev_ = ${EnvConf._isDev_}` },
        { var: 'DEBUG', raw: DEBUG, parsed: `_isDebug_ = ${EnvConf._isDebug_}` },
        { var: 'devtool', parsed: `devtool = ${devtool}` },
        { var: 'mode', parsed: `mode = ${mode}` },
    ]);
}


/**
 * @brief Empty configuration
 * @type {WebpackConfig}
 */
const emptyTemplate = {
    // https://webpack.js.org/configuration/other-options/#name
    name: 'emptyTemplate',

    // The base directory, an absolute path, for resolving entry points and
    // loaders from the configuration.
    // https://webpack.js.org/configuration/entry-context/#context
    context: _absProjRoot,

    // The point or points where to start the application bundling process.
    // https://webpack.js.org/configuration/entry-context/#entry
    entry: {},

    //  tells webpack to use its built-in optimizations accordingly.
    // https://webpack.js.org/configuration/mode/
    mode: 'none', // none -> no optimizations

    // How and where to output bundles/assets and anything else you bundle/load
    // https://webpack.js.org/configuration/output/
    output: {},

    // These options determine how the different types of modules within a
    // project will be treated.
    // https://webpack.js.org/configuration/module/
    module: {},

    // These options change how modules are resolved.
    // https://webpack.js.org/configuration/resolve/
    resolve: {},

    // Webpack runs optimizations for you depending on the chosen `mode`
    // https://webpack.js.org/configuration/optimization/
    optimization: {},

    // https://webpack.js.org/configuration/plugins/
    plugins: [],

    // This option controls if and how source maps are generated.
    // https://webpack.js.org/configuration/devtool/
    devtool: false, // false -> no source maps

    // Which target environment you are building for.
    // https://webpack.js.org/configuration/target/
    target: 'node', // can't be false without plugins

    // https://webpack.js.org/configuration/externals/
    externals: {},

    // https://webpack.js.org/configuration/performance/
    performance: {},

    // https://webpack.js.org/configuration/configuration-types/#dependencies
    dependencies: [],

    // https://webpack.js.org/configuration/infrastructureLogging/
    infrastructureLogging: {
        // At least level 'log' required for vscode problem matchers
        level: 'log',
    }
}

/** Return configuration if not in dry-run mode
 * @param {import('webpack').Configuration|(() => WebpackConfig)} config
 * @returns {import('webpack').Configuration|null}
 */
function nullIfDryRun(config) {
    const _config = (typeof config === 'function') ? config() : config;
    if (DRY_RUN) {
        console.log(`  ^^^ Dry-run: ${_config.name}`);
        return null;
    }
    return _config;
}

/** Log out configuration if ECHO_CONFIG is true
 * @param {import('webpack').Configuration|(() => WebpackConfig)} config
 * @returns {void}
 */
function logIfShould(config) {
    const _config = (typeof config === 'function') ? config() : config;
    if (ECHO_CONFIG) {
        console.log('\n' + util.inspect(_config, { depth: Infinity }));
    }
}

/** Generate a path to the output file based on the chunk info
 * @callback PathDataToString
 * @param {PathData} pathData - The path data.
 * @param {AssetInfo} [assetInfo] - Optional asset information.
 * @returns {string} The resulting string.
 */
function getPathToFileFromChunkInfo(pathData, assetInfo) {

    if ((pathData.chunk === undefined) || pathData.chunk.name !== undefined) {
        return `[name].js`
    }

    /** @type {string} */
    const chunkId = String(pathData.chunk.id);
    const needle = 'node_modules';
    const needleLen = needle.length;
    const nodeMod0 = chunkId.indexOf(needle);
    const nodeMod1 = chunkId.indexOf(needle, nodeMod0 + 1);

    const startIdx = (nodeMod1 === -1)
        ? (nodeMod0 === -1)
            ? 0
            : nodeMod0 + needleLen + 1
        : nodeMod1 + needleLen + 1;

    const extRegex = /_[mc]?js(?=(-|$))/g;
    let ext = 'js';
    let matchIdx = -1;
    let match;
    while ((match = extRegex.exec(chunkId)) !== null) {
        matchIdx = match.index;
        ext = match[0].slice(1);
    }
    const endIdx = (matchIdx === -1) ? chunkId.length : matchIdx;

    const extracted = chunkId.slice(startIdx, endIdx);
    const parts = extracted.split('_');

    return (parts.length > 0)
        ? `${parts.join('/')}.${ext}`
        : `[name].${ext}`;
}

/**
 * @brief Build configuration (shared base)
 * @type {WebpackConfig}
 */
const buildTemplate = {
    ...emptyTemplate,
    name: 'buildTemplate',

    // https://webpack.js.org/configuration/mode/
    mode: mode,

    // The resolver helps webpack find the module code that needs to be
    // included in the bundle for every require/import statement.
    // https://webpack.js.org/configuration/resolve/
    resolve: {

        //resolve.alias takes precedence over other module resolutions.
        alias: {
            // src
            // '@': join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR),
            // '@dev': join(_absProjRoot, AppConf.APP_ROOT_DEVTIME),
            // '@common': join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_COMMON_SRC_DIR),
            // '@extens': join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_EXTENS_SRC_DIR),
            // '@server': join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_SERVER_SRC_DIR),
            // '@webapp': join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_WEBAPP_SRC_DIR),


            // out (just for testing)
            // '#': join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR),
            // '#common': join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_COMMON_OUT_DIR),
            // '#extens': join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_EXTENS_OUT_DIR),
            // '#server': join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_SERVER_OUT_DIR),
            // '#webapp': join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_WEBAPP_OUT_DIR),

            // bundled vendor packages
            'vendor': resolve(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_VENDOR_OUT_DIR),
            '$vendor': resolve(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_VENDOR_OUT_DIR),
            '#vendor': resolve(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_VENDOR_OUT_DIR),
            '@vendor': resolve(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_VENDOR_OUT_DIR),

            'devtools$': resolve(_absProjRoot, AppConf.APP_ROOT_DEVTIME, 'tools'),
        },

        // When a imported module resolve has no extension, 
        // try these, in this order.
        extensions: ['.mts', '.cts', '.ts', '.mjs', '.cts', '.js'],
        // Add support for TypeScripts fully qualified ESM imports.
        extensionAlias: {
            '.js': ['.ts', '.js'],
            '.cjs': ['.cts', '.cjs'],
            '.mjs': ['.mts', '.mjs']
        }
    },

    // How and where to output bundles/assets and anything else you bundle/load
    // https://webpack.js.org/configuration/output/
    output: {
        // Dont clean the output directory before building!
        // -> it may contain files built by other tools.
        // -> unless you know what you are doing, and each build has its own output directory.
        clean: true,
        // The output directory as an absolute path.
        path: resolve(_absProjRoot, AppConf.APP_ROOT_OUT_DIR),
        // The `path/to/file.name` relative to `output.path` directory.
        filename: getPathToFileFromChunkInfo, // Try to duplicate src structure in dist
    },

    optimization: {

        // Try to duplicate src structure in dist
        splitChunks: {
            chunks: 'all',
        },

        // Disable minification
        // Due to problems with threeJs & other js libraries
        minimize: false,
    },

    // Source maps (depending on environment variables)
    devtool: devtool,

};

/** 
 * @brief Build the common code
 * @type {WebpackConfig}
 */
const commonConfigCjs = {
    ...buildTemplate,
    name: AppConf.APP_COMMON_SRC_DIR,
    context: join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_COMMON_SRC_DIR),
    target: 'web',

    entry: {
        index: './index.ts',
    },

    output: {
        ...buildTemplate.output,
        path: join((buildTemplate.output || {}).path || '', AppConf.APP_COMMON_OUT_DIR)
    },

    module: {
        rules: [
            {
                test: /\.([cm]?[jt]s)$/,
                include: (input) => {
                    const srcDir = join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, '/');
                    const result = input.startsWith(srcDir);
                    if (result) {
                        // console.log(`\t${input}`);
                    }
                    return result;
                },
                exclude: [
                    join(_absProjRoot, 'node_modules'),
                    join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR),
                    join(_absProjRoot, AppConf.APP_VENDOR_OUT_DIR)
                ],
                use: [{
                    loader: 'ts-loader',
                    options: {
                        // TODO: Hardcoded - bad
                        configFile: join(_absProjRoot, 'tsconfig.common.cjs.json'),
                        logInfoToStdOut: true,
                        logLevel: 'info'
                    }
                }]
            }
        ]
    },
};

/** 
 * @brief Build the common code
 * @type {WebpackConfig}
 */
const commonConfigEsm = {
    ...buildTemplate,
    name: AppConf.APP_COMMON_SRC_DIR,
    context: join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_COMMON_SRC_DIR),
    target: 'web',

    entry: {
        index: './index.ts',
    },

    output: {
        ...buildTemplate.output,
        path: join((buildTemplate.output || {}).path || '', AppConf.APP_COMMON_OUT_DIR)
    },

    module: {
        rules: [
            {
                test: /\.([cm]?[jt]s)$/,
                include: (input) => {
                    const srcDir = join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, '/');
                    const result = input.startsWith(srcDir);
                    if (result) {
                        // console.log(`\t${input}`);
                    }
                    return result;
                },
                exclude: [
                    join(_absProjRoot, 'node_modules'),
                    join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR),
                    join(_absProjRoot, AppConf.APP_VENDOR_OUT_DIR)
                ],
                use: [{
                    loader: 'ts-loader',
                    options: {
                        // TODO: Hardcoded - bad
                        configFile: join(_absProjRoot, 'tsconfig.common.esm.json'),
                        logInfoToStdOut: true,
                        logLevel: 'info'
                    }
                }]
            }
        ]
    },
};

/** 
 * @brief Build the vscode extension
 * @type {WebpackConfig}
 */
const extensConfig = {
    ...buildTemplate,
    name: AppConf.APP_EXTENS_SRC_DIR,
    context: join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_EXTENS_SRC_DIR),

    target: 'node',

    externals: {
        vscode: 'commonjs vscode'
    },

    entry: {
        index: './index.ts',
    },

    output: {
        ...buildTemplate.output,
        path: join((buildTemplate.output || {}).path || '', AppConf.APP_EXTENS_OUT_DIR),
        libraryTarget: 'commonjs2'
    },

    module: {
        rules: [
            {
                test: /\.([cm]?[jt]s)$/,
                include: (input) => {
                    const srcDir = join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, '/');
                    const result = input.startsWith(srcDir);
                    if (result) {
                        // console.log(`\t${input}`);
                    }
                    return result;
                },
                exclude: [
                    join(_absProjRoot, 'node_modules'),
                    join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR),
                    join(_absProjRoot, AppConf.APP_VENDOR_OUT_DIR)
                ],
                use: [{
                    loader: 'ts-loader',
                    options: {
                        // TODO: Hardcoded - bad
                        configFile: join(_absProjRoot, 'tsconfig.extens.json'),
                        logInfoToStdOut: true,
                        logLevel: 'info'
                    }
                }]
            }
        ]
    },

};

/** 
 * @brief Build the server
 * @type {WebpackConfig}
 */
const serverConfig = {
    ...buildTemplate,
    name: AppConf.APP_SERVER_SRC_DIR,
    context: join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_SERVER_SRC_DIR),

    target: 'node',

    entry: {
        index: './index.ts',
    },

    output: {
        ...buildTemplate.output,
        path: join((buildTemplate.output || {}).path || '', AppConf.APP_SERVER_OUT_DIR)
    },

    module: {
        rules: [
            {
                test: /\.([cm]?[jt]s)$/,
                include: (input) => {
                    const srcDir = join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, '/');
                    const result = input.startsWith(srcDir);
                    if (result) {
                        // console.log(`\t${input}`);
                    }
                    return result;
                },
                exclude: [
                    join(_absProjRoot, 'node_modules'),
                    join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR),
                    join(_absProjRoot, AppConf.APP_VENDOR_OUT_DIR)
                ],
                use: [{
                    loader: 'ts-loader',
                    options: {
                        // TODO: Hardcoded - bad
                        configFile: join(_absProjRoot, 'tsconfig.server.json'),
                        logInfoToStdOut: true,
                        logLevel: 'info'
                    }
                }]
            }
        ]
    },
};

/** 
 * @brief Copy packages from node_modules to dist/vendor
 * @type {WebpackConfig}
 */
const task_copyVendorPackages = {
    ...emptyTemplate,
    name: AppConf.APP_VENDOR_OUT_DIR,

    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    // Copy threeJs as-is
                    from: join(_absProjRoot, 'node_modules', 'three'),
                    to: join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR, AppConf.APP_VENDOR_OUT_DIR, 'three')
                }
            ]
        })
    ]
}

/** 
 * @brief Build the webapp
 * @type {WebpackConfig}
 */
const webappConfig = {
    name: AppConf.APP_WEBAPP_SRC_DIR,
    context: join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, AppConf.APP_WEBAPP_SRC_DIR),

    target: 'web',

    entry: {
        index: './index.ts'
    },

    externals: {
        'vendor/three': 'THREE',
        'vendor/three/examples/jsm/OrbitControls.js': 'OrbitControls'
    },

    output: {
        ...buildTemplate.output,
        path: join((buildTemplate.output || {}).path || '', AppConf.APP_WEBAPP_OUT_DIR),

    },

    module: {
        rules: [
            {
                test: /\.([cm]?[jt]s)$/,
                include: (input) => {
                    const srcDir = join(_absProjRoot, AppConf.APP_ROOT_SRC_DIR, '/');
                    const result = input.startsWith(srcDir);
                    if (result) {
                        // console.log(`\t${input}`);
                    }
                    return result;
                },
                exclude: [
                    join(_absProjRoot, 'node_modules'),
                    join(_absProjRoot, AppConf.APP_ROOT_OUT_DIR),
                    join(_absProjRoot, AppConf.APP_VENDOR_OUT_DIR)
                ],
                use: [{
                    loader: 'ts-loader',
                    options: {
                        // TODO: Hardcoded - bad
                        configFile: join(_absProjRoot, 'tsconfig.webapp.json'),
                        logInfoToStdOut: true,
                        logLevel: 'info'
                    }
                }]
            },
            {
                test: /\.ejs$/i,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: false },
                    },
                    {
                        loader: 'template-ejs-loader',
                        options: {
                            data: {
                                importMap: { // Define your import map here
                                    imports: {
                                        lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
                                        three: 'vendor/three/build/three.module.js',
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ]
    },

    plugins: [
        // no longer using this?
        // new HtmlWebpackPlugin({
        //     template: './index.ejs', // Path to your HTML template file
        //     filename: 'index.html', // Output HTML file name

        //     inject: 'body',
        //     scriptLoading: 'module',
        //     minify: false,
        // }),
        //
        // If you want to pass individual options per template, you can use the following:
        // also see: https://www.npmjs.com/package/template-ejs-loader#-passing-individual-values
        // new HtmlWebpackPlugin({
        //     filename: 'index.html',
        //     template: htmlWebpackPluginTemplateCustomizer({

        //         templatePath: './src/index.ejs', // ejs template path 

        //         htmlLoaderOption: {
        //             // you can set individual html-loader option here.
        //             // but preprocessor option is not supported.
        //         },
        //         templateEjsLoaderOption: { // set individual template-ejs-loader option here
        //             root: '', // this is for example, if not needed, just feel free to delete.
        //             data: { // example, too.
        //                 foo: 'test' // btw, you can have indivisual data injection for each .ejs file using data option
        //             }
        //         }
        //     }),
        // }),
    ],

}

export default function arrayOfConfigs(env, argv) {

    if (ECHO_ARGS) {

        console.log(util.inspect(env, { depth: Infinity }));
        // { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true }

        console.log(util.inspect(argv, { depth: Infinity }));
        // {
        //     progress: true,
        //     statsErrorDetails: true,
        //     env: { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true }
        // }
    }

    return [
        task_copyVendorPackages, // still required for OrbitControls, which is not yet bundled..
        { ...buildTemplate, ...commonConfigCjs },
        { ...buildTemplate, ...commonConfigEsm },
        { ...buildTemplate, ...extensConfig },
        { ...buildTemplate, ...serverConfig },
        { ...buildTemplate, ...webappConfig }
    ]
        .map((config) => {
            logIfShould(config);
            return nullIfDryRun(config);
        })
        .filter((config) => {
            return config !== null;
        });
};



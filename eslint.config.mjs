'use strict';
// @ts-check

/**
 * @fileoverview
 * - ESLint configuration for the entire monorepo
 * - Sub-packages should extend this configuration 
 * - Using ESLint >=v9.0.0 with the newer 'Flat' configuration format
 * 
 * Why a `.mjs` file?
 * - Because we are using ESM (ECMAScript Modules) in this project
 * - We intend to use ESM in the future for all our projects
 * - Also then Node does not have to guess out intensions,
 *   or have resort to looking for `type` in a nearby `package.json`
 */


import { inspect } from 'node:util';
// import { fileURLToPath } from 'node:url';
// import { dirname } from 'node:path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

import EsLintJs from '@eslint/js';
import EsLintTs from 'typescript-eslint';
import Globals from 'globals';
import Lodash from 'lodash';

import TsPlugin from '@typescript-eslint/eslint-plugin';
import TsParser from '@typescript-eslint/parser';

const DEBUG = false;

import { getLogTag } from './packages/startx/devt/common/locations.js';

const logTag = getLogTag();

if (DEBUG) { 
    console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);
}


// // Allow for specifying the 
// // see: https://eslint.org/docs/user-guide/configuring#specifying-environments
// // We will expect/use:
// // `MOD_SYS` of 'cjs' or 'esm' (default: 'cjs')
// const modSysEnvVarName = 'MOD_SYS';
// const modSysEnvVarDefault = 'cjs';
// let modSysEnvVar;
// if (process.env[modSysEnvVarName] && typeof process.env.MOD_SYS === 'string') {
//     const strVal = process.env[modSysEnvVarName].toLowerCase();
//     if (strVal === 'cjs' || strVal === 'esm') {
//         modSysEnvVar = strVal;
//     }
//     else {
//         throw new Error(`Invalid environment variable: ${modSysEnvVarName}=${strVal}`);
//     }
// }
// else {
//     console.warn(`Environment variable not set: ${modSysEnvVarName}, using default: ${modSysEnvVarDefault}`);
//     modSysEnvVar = modSysEnvVarDefault;
// }
// const MOD_SYS = modSysEnvVar;

/**
 * @typedef { import('@typescript-eslint/utils/ts-eslint').FlatConfig.Config } FlatConfigConfig
 * 
 * @typedef { import('@typescript-eslint/utils/ts-eslint').FlatConfig.Rules } FlatConfigRules
 * @typedef { { rules: FlatConfigRules } } ConfigRulesOnly
 * 
 * @typedef { import('@typescript-eslint/utils/ts-eslint').FlatConfig.FileSpec } FileSpec
 * @typedef { { files: ((FileSpec | FileSpec[])[]) } } ConfigFilesOnly
 * 
 * @typedef { import('@typescript-eslint/utils/ts-eslint').FlatConfig.GlobalsConfig } GlobalsConfig
 * @typedef { import('@typescript-eslint/utils/ts-eslint').FlatConfig.EcmaVersion } EcmaVersion
 * 
 * @typedef { import('@typescript-eslint/utils/ts-eslint').FlatConfig.LanguageOptions } LanguageOptions
 * @typedef { { languageOptions: LanguageOptions } } ConfigLanguageOptionsOnly
 * 
 * @typedef { FlatConfigConfig | ConfigRulesOnly | ConfigFilesOnly | ConfigLanguageOptionsOnly } ConfigAny
 */



/** 
 * Base `rules` for JavaScript
 * @type {FlatConfigConfig} */
const _recommendedBaseConfigJs = Lodash.merge({name: 'blank'},
    EsLintJs.configs.recommended,
    {name: 'recommended/javascript'}
)

/** 
 * Base `rules` for TypeScript, but also sets:
 * @description
 * name: 'typescript-eslint/eslint-recommended',    
 * parser: '@typescript-eslint/parser',
 * parserOptions: { sourceType: 'module' },
 * plugins: ['@typescript-eslint'],
 * files: [ '**\/*.ts', '**\/*.tsx', '**\/*.mts', '**\/*.cts']
 * rules: <many>
 * @type {FlatConfigConfig} */
const _recommendedBaseConfigTs = Lodash.merge({name: 'blank'},
    ...EsLintTs.configs.recommended,
    {name: 'recommended/typescript'}
)


const allExtensions = ['ts', 'cts', 'mts', 'js', 'cjs', 'mjs'];
const globify = (prefix, globs) => globs.map((glob) => `${prefix}${glob}`);



class PartialConfig {

    // /**
    //  * @param {'node' | 'browser' | 'any'} envName
    //  * @returns {ConfigLanguageOptionsOnly}
    //  */
    // static targetEnv = (env) => {
    //     return {
    //         env: {
    //             node: env === 'node' || env === 'any',
    //             browser: env === 'browser' || env === 'any',
    //         }
    //     }
    // }

    /** 
     * @param {EcmaVersion} esVersion Enable globals for a specific ECMAScript version
     * @param {'esm' | 'cjs' | '_'} modSys Indicates the mode of the JavaScript file being used
     * // see: https://eslint.org/docs/latest/use/configure/language-options#specifying-javascript-options
     * @param {GlobalsConfig} globals An object containing global variable specifications
     * @returns {ConfigLanguageOptionsOnly} */
    static targetGlobals = (esVersion, modSys, globals) => {
        const lookup = {
            'esm': 'module',
            'cjs': 'commonjs',
            '_': 'script',
        };

        return {
            languageOptions: {
                ecmaVersion: esVersion,
                sourceType: lookup[modSys],
                globals: globals,
            }
        };
    }

    /** 
     * Trying to set this explicitly to:
     * - avoid any confusion
     * - return defaults from {@link node_modules/eslint/lib/config/default-config.js}
     * @param {string[]} files
     * @returns {ConfigLanguageOptionsOnly} */
        static jsEslintPluginAndParser = () => { 
            return {
                // defaults
            };
        }

    /** 
     * Trying to set this explicitly to:
     * - avoid any confusion
     * @param {string[]} files
     * @returns {ConfigLanguageOptionsOnly} */
    static tsEslintPluginAndParser = () => { 
        return {
            plugins: { '@typescript-eslint': TsPlugin },
            languageOptions: {
                parser: TsParser,
            },
        };
    }

    /** 
     * @param {string[]} files
     * @returns {ConfigLanguageOptionsOnly} */
    static tsConfigProjects = (...files) => { 
        return {
            languageOptions: {
                parserOptions: {
                    // Set relative path to the tsconfig files
                    project: files,
                    // // Override tsconfig settings
                    // ecmaVersion: 2022,
                    // sourceType: "module",
                    // experimentalDecorators: true,
                },
            },
        };
    }

    /** 
     * @param {FileSpec[] | null} includes
     * @returns {ConfigFilesOnly} */
    static includeFiles = (includes) => {
        if (includes === null) {
            return {
                files: null,
            };
        }
        if (Array.isArray(includes)) {
        return {
            files: includes
        };
        }
        throw new Error('Expected array or null');
    }

    /** 
     * @param {FileSpec[] | null} excludes
     * @returns {ConfigFilesOnly} */
    static excludeFiles = (excludes) => {
        if (excludes === null) {
            return {
                ignores: null,
            };
        }
        if (Array.isArray(excludes)) {
        return {
            ignores: excludes
        };
        }
        throw new Error('Expected array or null');
    }

    /**
     * @param {string} relativePath
     * @returns {ConfigLanguageOptionsOnly}
     */
    static tsConfigRootDir = (relativePath) => {
        return {
            languageOptions: {
                parserOptions: {
                    tsconfigRootDir: relativePath
                }
            }
        }
    }


    // static unignore = (config, globs) => {
    //     return {
    //         ...config,
    //         ignores: [
    //             ...(config.ignores || []),
    //             ...globs.map((glob) => `!${glob}`)
    //         ]
    //     }
    // }

}

class ComposeConfig {
    /**
     * Deep-merge multiple partial configs into a single config object
     * @param  {...ConfigAny} partialConfigs 
     * @returns {ConfigAny}
     */
    static named(name, ...partialConfigs) {
        if (typeof name !== 'string' || name.length === 0) {
            name = '<composed>';
        }
        const target = {name: 'target'};
        Lodash.mergeWith(target, ...partialConfigs, {name: name}, (targetVal, srcValue) => {
            if (Lodash.isArray(targetVal)) {
              return targetVal.concat(srcValue);
            }
          });
        return target;
    }
}

const setRule = (rule, value) => {
    return {
        [rule]: 'off',
        [`@typescript-eslint/${rule}`]: value
    }
}

// TODO later
// Auto fixxes we can allow:
// - prefer-const 
//


// /** @type {ConfigRulesOnly} */
// const rulesSharedBase = ComposeConfig.named( 'rules/shared/base',
// {
//     rules: {
        
//         // we'll rely on the editor to show these as faded out
//         'no-unused-vars': 'off',
//         '@typescript-eslint/no-unused-vars': 'off',
        
//         'no-namespace': 'off',
//         '@typescript-eslint/no-namespace': 'off',

//         // Note sure why these are rules?
//         '@typescript-eslint/no-explicit-any': 'off',
//         '@typescript-eslint/ban-types': 'off',

//         // 'no-unnecessary-type-constraint': 'warn', // not found in '@' ?
//         // 'ban-ts-comment': 'warn', // not found in '@' ?
//         // 'no-this-alias': 'warn', // not found in '@' ?
//         // 'no-var-requires': 'warn', // not found in '@' ?

//         'prefer-rest-params': 'warn',
//         'no-constant-binary-expression': 'warn',
//         'no-constant-condition': 'warn',
//         'no-fallthrough': 'warn',
//         'no-useless-escape': 'warn',
//         'no-useless-catch': 'warn',
//         'no-prototype-builtins': 'warn',
        
        
//         // Re-enable or level-up these rules for production
//         'no-debugger': 'off',
//         'no-unused-private-class-members': 'off',
//     }
// });


/** @type {ConfigRulesOnly} */
const rulesDistAny = {
    rules: {
        'prefer-const': 'off',
        'no-var': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
    }
};

/** @type {ConfigRulesOnly} */
const rulesDistCjs = {
    rules: {
        ...setRule('no-var-requires', 'off'),
        'no-func-assign': 'off',
        'no-unreachable': 'off',
    }
};

/** @type {ConfigRulesOnly} */
const rulesDistEsm = {
    rules: {

    }
};


const rulesSrcAny = ComposeConfig.named( 'rules/src/any', 
    {
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'off', // OFF for dev-time
                {
                  'args': 'all',
                  'argsIgnorePattern': '^_',
                  'caughtErrors': 'all',
                  'caughtErrorsIgnorePattern': '^_',
                  'destructuredArrayIgnorePattern': '^_',
                  'varsIgnorePattern': '^_',
                  'ignoreRestSiblings': true
                }
              ],

            'no-debugger': 'off', // OFF for dev-time
        }
    }
);

const rulesSrcCjs = ComposeConfig.named( 'rules/src/cjs', 
    {
        rules: {
            ...setRule('no-var-requires', 'off'),
        }
    }
);

const rulesSrcEsm = ComposeConfig.named( 'rules/src/esm', 
    {
        rules: {
            'no-unused-private-class-members': 'off', // OFF for dev-time
            '@typescript-eslint/ban-types': 'off', // OFF for dev-time
            '@typescript-eslint/no-explicit-any': 'off', // OFF for dev-time
            '@typescript-eslint/no-namespace': 'off', // OFF for dev-time
        }
    }
);


class Glob {
    //
    //  - `{/,}?(.*|*)`  -> dirs&files, including hidden ones, limited to the current directory, leading `/` optional
    //  - `{/,}?(.*|*)/` -> dirs only, including hidden ones, limited to the current directory, leading `/` optional
    //
    //  - `?(.*|*)` -> visible or hidden
    //  - `?(!.*|*)` -> only visible 
    //  - `?(.*|!*)` -> only hidden
    //  - `?(.*|!*).*` -> only hidden, extension optional
    //  - `+(.*|!*).*` -> only hidden, extension required
    //
    //  - `{/,}...` -> makes the leading `/` optional 
    //
    //  - `/?(.)*/` -> any directory (including hidden directories), limited to the current directory
    //  - `**` or `**/*` -> everything that visible, at all levels
    //  - `!**` -> everything that includes a hidden part, at any level

    static EVERYTHING = '**/?(.*|*)**'; //  tested via eslint inspector
    
    /**
     * @private
     * @prop {string[]} _parts
     */
    _parts = [];
    
    /**
     * @param {...string} globs
     * @returns {Glob} for chaining
     */
    static from(...globs) {
        return new Glob(...globs); // for chaining
    }

    /**
     * @param {...string} globs
     * @returns {Glob} for chaining
     */
    static inclHidden(...globs) {
        if (globs.length === 0) {
            return new Glob('?(.)*'); // for chaining
        }
        else {
            return new Glob(globs[0], '?(.)*', ...globs.slice(1)); // for chaining
        }
    }

    /**
     * @param {...string} globs
     */
    constructor(...globs) {
        this.$(...globs);
    }
    
    /**
     * @param {...string} globs
     * @returns {Glob} for chaining
     * @chainable
     */
    $(...globs) {
        globs
            .filter((part) => typeof part === 'string' && part.length > 0)
            .forEach((part) => this._parts.push(part));
        return this; // for chaining
    }

    /**
     * Shorthand for `.$('**')`
     * @returns {Glob} for chaining
     * @chainable
     */
    recursive() {
        this.$('**');
        return this;
    }

    /**
     * @returns {Glob} for chaining
     * @chainable
     */
    any(includeHidden = true) {
        this.$(includeHidden ? '?(.)*' : '!(.)*');
        return this;
    }

    /**
     * @returns {Glob} for chaining
     * @chainable
     */
    anyDir(includeHidden = true) {
        this.$(includeHidden ? '?(.)*/' : '!(.)*/');
        return this;
    }

    /**
     * @returns {Glob} for chaining
     * @chainable
     */
    dir(dirName) {
        dirName = dirName || '*';
        this.$(!dirName.endsWith('/') ? `${dirName}/` : dirName);
        return this;
    }

    /**
     * @returns {Glob} for chaining
     * @chainable
     */
    hidden(dirOrFileName) {
        dirOrFileName = dirOrFileName || '*';
        this.$(`.${dirOrFileName}`);
        return this;
    }

    /**
     * @returns {Glob} for chaining
     * @chainable
     */
    visible(dirOrFileName) {
        dirOrFileName = dirOrFileName || '*';
        this.$(`!(.)${dirOrFileName}`);
        return this;
    }

    
    get get() {
        return this._parts
            .map((val, idx) => this._prep(val, idx !== 0, idx !== this._parts.length - 1))
            .join('/')
            .replace(/(\/)\/+/g, '$1') // remove duplicate sequencial `/`
            .replace(/(\*\*)\*+/g, '$1'); // remove duplicate sequencial `**`
    }

    get asAnyPattern() {
        return `${this.get}`
    }

    get asDirPattern() {
        return `${this.get}/`
    }

    
    /**
     * Prepare glob parts for joining with '/'
     * @param {string} part 
     * @param {boolean} start 
     * @param {boolean} end 
     */
    _prep(part, start, end) {
        if (start && part.startsWith('/')) {
            part = part.slice(1);
        }
        if (end && part.endsWith('/')) {
            part = part.slice(0, -1);
        }
        return part;
    }

    toString() {
        return this.get;
    }
    valueOf() {
        return this.get;
    }
    get [Symbol.toPrimitive]() {
        return (_hint) => {
            return this.get;
            }
        }
    get [Symbol.toStringTag]() {
        return this.get;
    }

}


const baseJs = ComposeConfig.named( 'lang/js/base',
    Lodash.pick(_recommendedBaseConfigJs, [
        'rules',
    ]),
    PartialConfig.jsEslintPluginAndParser(),
);

const baseTs = ComposeConfig.named( 'lang/ts/base',
    Lodash.pick(_recommendedBaseConfigTs, [
        'rules', 
    ]),
    PartialConfig.tsEslintPluginAndParser(),
);


/** 
 * @type {ConfigAny} */
const globalIncludes = ComposeConfig.named( 'global/includes',

    // undo built-in/hardcoded eslint defaults as needed:
    PartialConfig.includeFiles(null), // clear.

    PartialConfig.includeFiles([...globify(`**/*.`, allExtensions)]),
    PartialConfig.includeFiles([...globify(`**/.*.`, allExtensions)]),

    PartialConfig.includeFiles([...globify(`**/*/**/*.`, allExtensions)]),
    PartialConfig.includeFiles([...globify(`**/*/**/.*.`, allExtensions)]),

    PartialConfig.includeFiles([...globify(`**/.*/**/*.`, allExtensions)]),
    PartialConfig.includeFiles([...globify(`**/.*/**/.*.`, allExtensions)]),

);

/** 
 * When the only property is `ignores` it is treated specially
 * @see {@link https://github.com/eslint/eslint/blob/389744be255717c507fafc158746e579ac08d77e/docs/src/use/configure/configuration-files.md#globally-ignoring-files-with-ignores}
 * 
 * @description Special behavior of `ignores`:
 * - If ignores is used without any other keys in the configuration object,
 *   then the patterns act as global ignores.
 * - Non-global ignores patterns can only match file names. A pattern like 
 *   "dir-to-exclude/" will not ignore anything. To ignore everything in a 
 *   particular directory, a pattern like "dir-to-exclude/**" should be used
 *   instead.
 *  
 * @type {ConfigAny} */
const globalExcludes = ComposeConfig.named( 'global/excludes',
    PartialConfig.excludeFiles(null),
    PartialConfig.excludeFiles([
        // //
        // // generated by tools
        // `**/coverage/**`, // // mocha related
        // `**/.nyc_output/**`, // // mocha related
        // `**/.vscode-test/**`, // vscode extensions testing
        `**/.history/**`,  // vscode history extension
        // `**/.cache/**`,  // eslint cache
        // //
        // // Other optional default excludes you may want to consider:
        // // `**/build/**`,
        // // `**/dist/**`,
        // // `**/output/**`,
        // // `**/out/**`,
        // // `**/tests/**`,
        // // `**/test/**`,
        // // `**/temp/**`,
        // // `**/tmp/**`,
        // // `**/logs/**`,
        // // `**/log/**`,
        // //
        // // the usual suspects
        // `**/<node_internals>/**`,
        `**/node_modules/**`,
        // `**/.git/**`,

        // ...globify(`!*.`, allExtensions),
        // ...globify(`!.*.`, allExtensions),

        // `!*`,
        // `!.*`,
    ]),

    // // undo built-in/hardcoded eslint defaults as needed:
    // PartialConfig.excludeFiles([
    //     `!**/dist/**`,
    //     `!**/node_modules/**`,
    //     `!**/.git/**`
    // ]),
);

/** @type {ConfigAny[]} */
const config = [
    globalIncludes,
    globalExcludes,
    
    ComposeConfig.named( 'src/cjs',
        baseJs,
        baseTs,

        PartialConfig.includeFiles(null), // clear.
        PartialConfig.includeFiles([
            // in repo root
            ...globify(`*.`, ['cts', 'cjs']),
            ...globify(`.*.`, ['cts', 'cjs']),
            // in packages
            ...globify(`**/packages/*/**/*.`, ['cts', 'cjs']),
            ...globify(`**/packages/*/**/.*.`, ['cts', 'cjs']),
        ]),
        // PartialConfig.excludeFiles([
        //     ...globify(`**/${'dist'}/**/*.`, allExtensions),
        // ]),

        PartialConfig.targetGlobals(2022, 'cjs', Globals[`shared-node-browser`]),

        PartialConfig.tsConfigRootDir('./'),
        PartialConfig.tsConfigProjects(`./tsconfig.${'cjs'}.json`),

        rulesSrcAny,
        rulesSrcCjs,
    ),

    ComposeConfig.named( 'src/esm',
        baseJs,
        baseTs,

        PartialConfig.includeFiles([
            // in repo root
            ...globify(`*.`, ['ts', 'mts', 'js', 'mjs']),
            ...globify(`.*.`, ['ts', 'mts', 'js', 'mjs']),
            // in packages
            ...globify(`**/packages/*/**/*.`, ['ts', 'mts', 'js', 'mjs']),
            ...globify(`**/packages/*/**/.*.`, ['ts', 'mts', 'js', 'mjs']),
        ]),
        // PartialConfig.excludeFiles([
        //     ...globify(`**/${'dist'}/**/*.`, allExtensions),
        // ]),

        PartialConfig.targetGlobals(2022, 'esm', Globals[`shared-node-browser`]),

        PartialConfig.tsConfigRootDir('./'),
        PartialConfig.tsConfigProjects(`./tsconfig.${'esm'}.json`),

        rulesSrcAny,
        rulesSrcEsm,
    ),


    ComposeConfig.named( 'dist/cjs',
        baseJs,

        PartialConfig.includeFiles(null), // clear.
        PartialConfig.includeFiles([
            ...globify(`**/dist/cjs/**/*.`, ['js', 'cjs']),
        ]),
        // PartialConfig.excludeFiles([
        //     ...globify(`**/${'src'}/**/*.`, allExtensions),
        // ]),


        PartialConfig.targetGlobals(2022, 'cjs', Globals[`shared-node-browser`]),

        // PartialConfig.tsConfigProjects(`${'.'}/tsconfig.${'cjs'}.json`),

        rulesDistAny,
        rulesDistCjs,
    ),

    ComposeConfig.named( 'dist/esm',
        baseJs,

        PartialConfig.includeFiles(null), // clear.
        PartialConfig.includeFiles([
            ...globify(`**/dist/esm/**/*.`, ['js', 'mjs']),
        ]),
        // PartialConfig.excludeFiles([
        //     ...globify(`**/${'src'}/**/*.`, allExtensions),
        // ]),

        PartialConfig.targetGlobals(2022, 'esm', Globals[`shared-node-browser`]),

        // PartialConfig.tsConfigProjects(`${'.'}/tsconfig.${'esm'}.json`),

        rulesDistAny,
        rulesDistEsm,
    ),

];


export default config;
export {
    config as config,
    Globals as globals,
};


if (DEBUG) { 

    console.log(`[${logTag}] Configurations:`);
    for (const cfg of config) {
        console.log(`[${logTag}]`);
        console.log(` - ${cfg.name}`);
        console.log(` - Include: ${inspect(cfg.files)}`);
        console.log(` - Exclude: ${inspect(cfg.ignores)}`);
    }

    console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);
}
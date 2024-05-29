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


// Other todos:
//
// 1. Perhaps set a script level failure mode?
// - then return error obj, or throw an exception, or process.exit();
// - currently many process.exit() calls are scattered around
//
// 2. very few of the functions in this file are type checking or validating their inputs
// - at the time of writing we had other priorities
// - were not focussed on testing the code that generates configs to help test other code :D
//


import FsSync from 'node:fs';
import Path from 'node:path';

import EsLintJs from '@eslint/js';
import EsLintTs from 'typescript-eslint';
import Globals from 'globals';
import Lodash from 'lodash';


import { inspect } from 'node:util';
import { getLogTag } from './packages/startx/devt/common/locations.js';
const logTag = getLogTag();


// CONSTANTS


/** Manual debug flag for this script.
 * @constant {boolean} DEBUG_THIS */
const DEBUG_THIS = false;

/** Whether to hit a breakpoint at the end of the script.
 * @constant {boolean} DEBUG_PAUSE */
const DEBUG_PAUSE = false;

/** Whether to log out the configurations in detail.
 * These verbose logs are not nested inside `DEBUG` blocks, as it can be useful even when `DEBUG` is false.
 * @constant {boolean} LOG_VERBOSE */
const LOG_VERBOSE = false;


const ROOT_PACKAGES_DIR = 'packages';


// IMPLEMENTATION


if (process.env.DEBUG && DEBUG_THIS) console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);


// Parse CLI arguments (future / maybe)
//
// Expecting something like:
// `--custom-args={"modSys":"esm"}`
//
// ^^^ could be usefule for when needing to run a subset of the configurations
//
// const cliArgsRaw = process.argv
//     .slice(2)
//     .filter(arg => arg.startsWith('--startx-args='))
//     .map(arg => arg.split('=')[1]);
//
// const cliArgsParsed = cliArgsRaw
//     .map(arg => {
//         try { return JSON.parse(arg); } catch (e) {
//             console.error(`[${logTag}] Invalid JSON: ${arg}`);
//             return undefined;
//         }
//     })
//     .filter(arg => arg !== undefined);
//
// const cliArgsParsedFlat = cliArgsParsed
//     .reduce((prev, curr) => merge(prev, curr), {});


/** 
 * Unnecessary type-party :) Errors/Exceptions
 * 
 * @typedef { 'Exception' } ExceptionLong - Fatal error
 * @typedef { 'E!' } ExceptionShort
 * 
 * @typedef { 'Error' } ErrorLong - Non-fatal error
 * @typedef { 'E-' } ErrorShort
 * 
 */

/**
 * Unnecessary type-party :) Sets/Collections
 * 
 * @typedef { 'Common' } CommonLong - shared|common parts
 * @typedef { 'C' } CommonShort
 * 
 * @typedef { 'Inclusive' } InclusiveLong
 * @typedef { '&' } InclusiveShort
 * 
 * @typedef { 'Exclusive' } ExclusiveLong
 * @typedef { '|' } ExclusiveShort
 * 
 * @typedef { 'Constraint' } ConstraintLong
 * @typedef { '=' } ConstraintShort
 * 
 */


/** 
 * Unnecessary type-party :) Empty/Unknown/Optional/Conditional/Environment/Context/Constraint/Relation
 * 
 * @typedef { 'Empty' } EmptyLong - Empty / Placeholder
 * @typedef { '' } EmptyShort // akin to empty string?
 * 
 * @typedef { 'Unknown' } UnknownLong
 * @typedef { '~' } UnknownShort
 * 
 * @typedef { 'Required' } RequiredLong
 * @typedef { '!' } RequiredShort // akin to required in TypeScript syntax
 * 
 * @typedef { 'Any' } AnyLong
 * @typedef { '*' } AnyShort // akin to any in TypeScript syntax
 * 
 * @typedef { 'Optional' } OptionalLong
 * @typedef { '?' } OptionalShort // akin to optional in TypeScript syntax
 * 
 * @typedef { 'DontCare' } DontCareLong
 * @typedef { '_' } DontCareShort // akin to an ignored param?
 * 
 */

/**
 * Unnecessary type-party :) Environment Dependent
 * @typedef { 'EnvDependent' } EnvDepLong - Environment Dependent
 * @typedef { '.' } EnvDepShort // akin to '.' (i.e. 'here') in file paths * 
 */

/**
 * @type { { id: '.', name: 'EnvDependent' } }
 */
const EnvDependent = {
    id: '.',
    name: 'EnvDependent',
};


/**
 * 
 * @typedef { 'Library' | 'Bundle' } ProjectTypeLong
 * @typedef { 'lib' | 'bundle' } ProjectTypeShort
 * 
 * @typedef { 'Node' | 'Browser' | 'Electron' | 'ExtensionHost' | 'Worker' | 'ServiceWorker' | 'WebWorker' } RuntimeTargetTypeLong
 * @typedef { 'node' | 'browser' | 'electron' | 'extensionHost' | 'worker' | 'serviceWorker' | 'webWorker' } RuntimeTargetTypeShort
 * 
 * @typedef { 'CommonJs' | 'EsModule' | 'SystemJs' | 'Amd' | 'Umd' | 'Iife' } ModSysTypeLong
 * @typedef { 'cjs' | 'esm' | 'sys' | 'amd' | 'umd' | 'iif' } ModSysTypeId
 * 
 * @typedef { 'module' | 'commonjs' | 'script' } SourceTypeId as read from a package.json's `type` field
 * @typedef { 'esm' | 'cjs' | 'any' } SourceTypeAssModSysId a key in a lookup
 * @typedef { 'esm' | 'cjs' | '.' } SourceTypeAssDir return value in a lookup, for dir names
 * 
 * @typedef { 'SourceCode' | 'BuiltCode' | 'Anywhere' } ResourceLocationName
 * @typedef { 'src' | 'dist' | 'any' } ResourceLocationId a key in a lookup
 * @typedef { 'src' | 'dist' | '.' } ResourceLocationAssDirName return value in a lookup, for dir names
 * 
 * @typedef { 'JavaScript' | 'TypeScript' } LangTypeLong
 * @typedef { 'js' | 'ts' } LangTypeId
 * 
 * @typedef { 'js' | 'mjs' | 'cjs' } JsFileExtBare
 * @typedef {'.js' | '.mjs' | '.cjs' } JsFileExtDotted
 * 
 * @typedef { 'ts' | 'cts' | 'mts' } TsFileExtBare
 * @typedef { '.ts' | '.cts' | '.mts' } TsFileExtDotted
 * 
 * @typedef { JsFileExtBare | TsFileExtBare } AnyFileExtBare
 * @typedef { JsFileExtDotted | TsFileExtDotted } AnyFileExtDotted
 * 
 */





/**
 * @enum {Record<LangTypeId, { id: LangTypeId, name: LangTypeLong }>}
 */
const LangType = {
    js: {
        id: 'js',
        name: 'JavaScript',
    },
    ts: {
        id: 'ts',
        name: 'TypeScript',
    }
};

/**
 * @enum {Record<SourceTypeId, { id: SourceTypeId, name: SourceTypeId, assModSysId: SourceTypeAssModSysId, assDirName: SourceTypeAssDir }>}
 */
const SourceType = {
    module: {
        id: 'module',
        assModSysId: 'esm',
        assDirName: 'esm',
    },
    commonjs: {
        id: 'commonjs',
        assModSysId: 'cjs',
        assDirName: 'cjs',
    },
    script: {
        id: 'script',
        assModSysId: 'any',
        assDirName: '.',
    }
};


/**
 * @enum {Record<ModSysTypeId, { id: ModSysTypeId, name: ModSysTypeLong }>}
 */
const ModSysType = {
    cjs : {
        id: 'cjs',
        name: 'CommonJs',
    },
    esm : {
        id: 'esm',
        name: 'EsModule',
    },
    sys : {
        id: 'sys',
        name: 'SystemJs',
    },
    amd : {
        id: 'amd',
        name: 'Amd',
    },
    umd : {
        id: 'umd',
        name: 'Umd',
    },
    iif : {
        id: 'iif',
        name: 'Iife',
    }
};


/**
 * @enum {Record<AnyFileExtBare, {
 *      id: AnyFileExtBare,
 *      extension: AnyFileExtDotted,
 *      impliedModSysName: ModSysTypeLong | EnvDepLong,
 *      impliedModSysId: ModSysTypeId | EnvDepShort,
 *      supportedModSysIds: ModSysTypeId[],
 *      langName: LangTypeLong,
 *      langId: LangTypeId,
 * }>}
 */
const FileType = {
    js: {
        id: 'js',
        extension: '.js',
        impliedModSysName: 'EnvDependent',
        impliedModSysId: '.',
        supportedModSysIds: ['cjs', 'esm', 'sys', 'amd', 'umd', 'iif'],
        langName: 'JavaScript',
        langId: 'js',
    },
    cjs: {
        id: 'cjs',
        extension: '.cjs',
        impliedModSysName: 'CommonJs',
        impliedModSysId: 'cjs',
        supportedModSysIds: ['cjs'],
        langName: 'JavaScript',
        langId: 'js',
    },
    mjs: {
        id: 'mjs',
        extension: '.mjs',
        impliedModSysName: 'EsModule',
        impliedModSysId: 'esm',
        supportedModSysIds: ['esm'],
        langName: 'JavaScript',
        langId: 'js',
    },
    ts: {
        id: 'ts',
        extension: '.ts',
        impliedModSysName: 'EnvDependent',
        impliedModSysId: '.',
        supportedModSysIds: ['cjs', 'esm', 'sys', 'amd', 'umd', 'iif'],
        langName: 'TypeScript',
        langId: 'ts',
    },
    cts: {
        id: 'cts',
        extension: '.cts',
        impliedModSysName: 'CommonJs',
        impliedModSysId: 'cjs',
        supportedModSysIds: ['cjs'],
        langName: 'TypeScript',
        langId: 'ts',
    },
    mts: {
        id: 'mts',
        extension: '.mts',
        impliedModSysName: 'EsModule',
        impliedModSysId: 'esm',
        supportedModSysIds: ['esm'],
        langName: 'TypeScript',
        langId: 'ts',
    }
};

/**
 * @enum {Record< ResourceLocationId, { id: ResourceLocationId, name: ResourceLocationName, assDirName: ResourceLocationAssDirName }>}
 */
const ResourceLocation = {
    src: {
        id: 'src',
        name: 'SourceCode',
        assDirName: 'src'
    },
    dist: {
        id: 'dist',
        name: 'BuiltCode',
        assDirName: 'dist'
    },

    // using `any` for both /src and /dist code
    // - not using name 'common' to avoid confusion with `CommonJs`
    any: {
        id: 'any',
        name: 'Anywhere',
        assDirName: '.'
    },
}

/** Read the `type` field from the `package.json` file relative to the current working directory.
 * - The deciding factor for where we draw the line between
 * which file extensions (like .js or .ts) are meant to be
 * interpreted as ESM or CJS.
 * - This helps to make sure a file is matched with the correct
 * config or sub-config, and does not patch multiple conflicting
 * configurations.
 * @param { {startDir: string, fallbackModSysId: SourceTypeId} } [opts={}] 
 * @returns { SourceType['module']['id'] | SourceType['commonjs']['id'] }
 */
const getPackageSourceTypeId = (opts = {}) => {

    const _opts = Object.assign({
        startDir: process.cwd(),
        fallbackModSysId: SourceType.commonjs.id, // As Node.js defaults to CommonJS
    }, opts);

    const processCwd = process.cwd();
    const maxTreeTraversal = 4; // from <root>/packages/dist/esm/ back up to <root>/

    console.log();
    console.log(`[${logTag}] Attempting to resolve 'sourceType' from a package.json file`);
    console.log(`[${logTag}] - for virtual location: ${_opts.startDir}`);
    console.log(`[${logTag}] - and cwd: ${processCwd}`);  

    // TODO: Which package.json file should we read here??
    // - the one in the root of the repo? NO
    // - the one in the CWD? - that's what we are doing now?
    // - the one in the directory of the file being linted? - maybe, not sure?
    //
    // Going by what we are trying to determine from the output of this function:
    // - trying to determine the sourceType of the file being linted i.e. script, module, commonjs
    // - so, logically, which package.json file should we read?
    //   - does it then not actually mean that we should traverse up the tree for each file being linted?
    //   - up to the nearest package.json that indicates the sourceType for it's children?
    //
    // WHAT TO DO??

    // previous
    //const packageJson = require('./package.json');
    //
    // new


    // starting from `opts.startDir`, check if there is a `package.json` file
    // - if not, move up one directory and try again
    // - repeat until we reach the CWD

    
    let currentDir = _opts.startDir;
    let relativePathToCurrent = Path.relative(processCwd, currentDir);
    let currentDirIsDecendantOfCwd = !relativePathToCurrent.startsWith('..');
    
    let foundPackageJsonWithType = false;
    let treeStepCount = 0;
    
    let packageJsonPath;
    let packageJsonData;
    let packageJsonParsed;

    while (!foundPackageJsonWithType && currentDirIsDecendantOfCwd) {

        packageJsonPath = Path.resolve(currentDir, './package.json');

        console.log(`[${logTag}]   - Checking in: ${currentDir}`);
        

        if (FsSync.existsSync(packageJsonPath)) {
            
            // TODO: should file read & json parse be in a try-catch block?
            packageJsonData = FsSync.readFileSync(packageJsonPath, 'utf8');
            packageJsonParsed = JSON.parse(packageJsonData);
            
            if (packageJsonParsed && typeof packageJsonParsed.type === 'string' && packageJsonParsed.type.length > 0) {
                console.log(`[${logTag}]     - Found package.json with type: ${packageJsonParsed.type}`);
                // success
                foundPackageJsonWithType = true;
                break; 
            }
            
        }

        // short-circuit if not found after a few steps
        if (++treeStepCount > maxTreeTraversal) {
            // fail
            foundPackageJsonWithType = false;
            break; 
        }

        // prep for next while-iteration
        currentDir = Path.resolve(currentDir, '../');
        relativePathToCurrent = Path.relative(processCwd, currentDir);
        currentDirIsDecendantOfCwd = !relativePathToCurrent.startsWith('..');
    }

    if (!foundPackageJsonWithType) {
        console.warn(`[${logTag}] Could not find a package.json file, with a type property, in the starting directory '${_opts.startDir}' or any of the ${maxTreeTraversal} directories above it.`);
        console.info(`[${logTag}] Falling back to the default sourceType: ${_opts.fallbackModSysId}`)
    }

    // // this was moved inside the while loop right? commenting out for now
    // packageJsonData = FsSync.readFileSync(packageJsonPath, 'utf8');
    // packageJsonParsed = JSON.parse(packageJsonData);


    // TODO: We are ignoring the presence and content of `main` and `module` fields
    // - do we need to consider them?
    return (foundPackageJsonWithType)
        ? (SourceType[packageJsonParsed.type.toLowerCase().trim()] || {id: _opts.fallbackModSysId} ).id
        : _opts.fallbackModSysId;
}


/**
 * Prefix a string to each item in an array
 * @param {string} prefix - The string to use as a prefix
 * @param {string[]} strArr - The array of strings to add the prefix to
 * @returns {string[]}
 */
const prefixEach = (prefix, strArr) => strArr.map((glob) => `${prefix}${glob}`);



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



/** Normalize imported **JavaScript** ESLint configurations
 * Base `rules` for JavaScript
 * @type {FlatConfigConfig} */
const importedRecommendedBaseConfigJs = Lodash.merge({name: '_'},
    EsLintJs.configs.recommended,
    {name: 'eslint/recommended/javascript'}
)

/** Normalize imported **TypeScript** ESLint configurations
 * Base `rules` for TypeScript, but also sets:
 * @type {FlatConfigConfig} */
const importedRecommendedBaseConfigTs = Lodash.merge({name: '_'},
    ...EsLintTs.configs.recommendedTypeChecked,
    ...EsLintTs.configs.stylisticTypeChecked,
    {name: 'eslint/recommended/typescript'}
)


class PartialConfig {

    /** 
     * @param {EcmaVersion} esVersion Enable globals for a specific ECMAScript version
     * @param {ModSysTypeId | EmptyShort} modSys Indicates the mode of the JavaScript file being used
     * // see: https://eslint.org/docs/latest/use/configure/language-options#specifying-javascript-options
     * @param {GlobalsConfig} globals An object containing global variable specifications
     * @returns {ConfigLanguageOptionsOnly} */
    static targetGlobals = (esVersion, modSys, globals) => {

        /** @type {Record<(ModSysTypeId|EmptyShort), SourceTypeId>} */
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

        // plugin namespace according to convention mentioned in docs
        // see: https://eslint.org/docs/latest/use/configure/plugins#configure-plugins
        const pluginNs = EsLintTs.plugin.meta.name.replace(/\/?eslint-plugin-?/,'');

        return {
            plugins: { [pluginNs]: EsLintTs.plugin },
            languageOptions: {
                parser: EsLintTs.parser,
            },
        };
    }

    /** 
     * @param {string[]} args - paths to tsconfig files
     * @returns {ConfigLanguageOptionsOnly} */
    static tsConfigProjects = (...args) => { 
        if (args.length === 0) {
            throw new Error('Expected at least one file');
        }
        return {
            languageOptions: {
                parserOptions: {
                    // Set relative path to the tsconfig files
                    project: args.length === 1 ? args[0] : args,
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

const setBoth = (rule, value) => {
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
const ruleSetDistCommon = {
    rules: {
        'prefer-const': 'off',
        'no-var': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
    }
};

/** @type {ConfigRulesOnly} */
const ruleSetDistCjs = {
    rules: {
        ...setBoth('no-var-requires', 'off'),
        'no-func-assign': 'off',
        'no-unreachable': 'off',
    }
};

/** @type {ConfigRulesOnly} */
const ruleSetDistEsm = {
    rules: {

    }
};


const ruleSetSrcCommon = ComposeConfig.named( 'rules/src/any', 
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

const ruleSetSrcCjs = ComposeConfig.named( 'rules/src/cjs', 
    {
        rules: {
            ...setBoth('no-var-requires', 'off'),
        }
    }
);

const ruleSetSrcEsm = ComposeConfig.named( 'rules/src/esm', 
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


const langJsBaseRules = ComposeConfig.named( 'lang/js/base',
    Lodash.pick(importedRecommendedBaseConfigJs, [
        'rules',
    ]),
);

const langTsBaseRules = ComposeConfig.named( 'lang/ts/base',
    Lodash.pick(importedRecommendedBaseConfigTs, [
        'rules', 
    ]),
);


const allExtensionsDotless = Object.values(FileType).map((ft) => ft.id);

/** 
 * @type {ConfigAny} */
const globalIncludes = ComposeConfig.named( 'global/includes',

    // undo built-in/hardcoded eslint defaults as needed:
    PartialConfig.includeFiles(null), // clear.

    // visible or hidden in the root
    PartialConfig.includeFiles([...prefixEach(`**/*.`, allExtensionsDotless)]),
    PartialConfig.includeFiles([...prefixEach(`**/.*.`, allExtensionsDotless)]),

    // visible or hidden in any visible directory
    PartialConfig.includeFiles([...prefixEach(`**/*/**/*.`, allExtensionsDotless)]),
    PartialConfig.includeFiles([...prefixEach(`**/*/**/.*.`, allExtensionsDotless)]),

    // visible or hidden in any hidden directory
    PartialConfig.includeFiles([...prefixEach(`**/.*/**/*.`, allExtensionsDotless)]),
    PartialConfig.includeFiles([...prefixEach(`**/.*/**/.*.`, allExtensionsDotless)]),

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

/**
 * Compose a configuration object for a specific module system and language
 * @param {ResourceLocationId} resourceLocationId - Signals the location of the resources, and the set of rules to apply to them
 * @param {SourceTypeId} sourceTypeId - The sourceType of the resources
 * @param {LangTypeId} sourceLangId - The language family of the source files
 * @param {string[]} [inclWhereDir=[]] Generate include patterns for filepath containing a 'packages' dir
 * @param {string[]} [exclWhereDir=[]] Generate exclude patterns for filepath containing a 'dist' dir
 * @param {boolean} [isRootConf=false] Flag to indicate if this is the root of a monorepo with sub-packages. 
 * If true, will include /packages dir, instead or just defaulting the the contents of the CWD.
 * @returns 
 */
const makeConfig = (resourceLocationId, sourceTypeId, sourceLangId, inclWhereDir = [], exclWhereDir = [], isRootConf = false) => {

    // reverse map to get the associated module system id
    // that should be assumef for indescriminate file types
    // like .js or .ts (read from package.json or fallback to commonjs)
    const whereUnsureUseModSysId = SourceType[getPackageSourceTypeId({
        // specifying the path in which to start searching for the package.json file
        // - non-existent path like /src/esm/ is allowed, as the function will traverse up the tree
        startDir: (() => {
            const _startDir = Path.resolve(process.cwd(), ResourceLocation[resourceLocationId].assDirName, SourceType[sourceTypeId].assModSysId);
            return _startDir;
        })(),
    })].assModSysId;

    // reverse map to get the associated module system id
    // that's also used for the respective output dir name & config file names
    const sourceAssModSysId = SourceType[sourceTypeId].assModSysId;

    // We do these file-extension gymnastics to make sure we don't
    // accidentally match files that are meant to be interpreted
    // as a different module system.

    const allFileTypes = Object.values(FileType);
    const depFileTypes = allFileTypes.filter((ft) => ft.langId === sourceLangId && ft.impliedModSysId === EnvDependent.id);

    const depAddedToEsm = allFileTypes
        .filter((ft) => ft.langId === sourceLangId && ft.impliedModSysId === ModSysType.esm.id)
        .concat(whereUnsureUseModSysId === ModSysType.esm.id ? depFileTypes : []);

    const depAddedToCjs = allFileTypes
        .filter((ft) => ft.langId === sourceLangId && ft.impliedModSysId === ModSysType.cjs.id)
        .concat(whereUnsureUseModSysId === ModSysType.cjs.id ? depFileTypes : []);

    const targetFileTypes = whereUnsureUseModSysId === sourceAssModSysId
        ? depAddedToEsm
        : depAddedToCjs;

    const targetExtensionsDotted = targetFileTypes.map((ft) => ft.extension);

    // We do these glob-pattern gymnastics because the underlying
    // pattern-matching implementation is not as flexible as we'd like,
    // patricularly when it comes to matching hidden files & directories.

    const vF = `*`; // visible file
    const hF = `.*`; // hidden file

    const vD = `*`; // visible directory
    const hD = `.*`; // hidden directory

    const xx = `**`; // recursive / any level

    const CD = `.`; // current directory / specific level

    const monoWithVisibleSubPackage = `${ROOT_PACKAGES_DIR}/${vD}`;
    const monoWithHiddenSubPackage = `${ROOT_PACKAGES_DIR}/${hD}`;

    

    return ComposeConfig.named( `${resourceLocationId}/${sourceAssModSysId}/${sourceLangId}`,

        // plugins & parser
        sourceLangId === LangType.js.id ? PartialConfig.jsEslintPluginAndParser() : {},
        sourceLangId === LangType.ts.id ? PartialConfig.tsEslintPluginAndParser() : {},

        // include monorepo's sub-packages?
        isRootConf && ROOT_PACKAGES_DIR.length > 0
        ? ComposeConfig.named( '_inclSubPackages', 
            PartialConfig.includeFiles([
                // visible sub-packages
                // - top
                ...prefixEach(`${xx}/${monoWithVisibleSubPackage}/${vF}`, targetExtensionsDotted),
                ...prefixEach(`${xx}/${monoWithVisibleSubPackage}/${hF}`, targetExtensionsDotted),
                // - visible sub
                ...prefixEach(`${xx}/${monoWithVisibleSubPackage}/${vD}/${xx}/${vF}`, targetExtensionsDotted),
                ...prefixEach(`${xx}/${monoWithVisibleSubPackage}/${vD}/${xx}/${hF}`, targetExtensionsDotted),
                // - hidden sub
                ...prefixEach(`${xx}/${monoWithVisibleSubPackage}/${hD}/${xx}/${vF}`, targetExtensionsDotted),
                ...prefixEach(`${xx}/${monoWithVisibleSubPackage}/${hD}/${xx}/${hF}`, targetExtensionsDotted),

                // visible sub-packages
                // - top
                ...prefixEach(`${xx}/${monoWithHiddenSubPackage}/${vF}`, targetExtensionsDotted),
                ...prefixEach(`${xx}/${monoWithHiddenSubPackage}/${hF}`, targetExtensionsDotted),
                // - visible sub
                ...prefixEach(`${xx}/${monoWithHiddenSubPackage}/${vD}/${xx}/${vF}`, targetExtensionsDotted),
                ...prefixEach(`${xx}/${monoWithHiddenSubPackage}/${vD}/${xx}/${hF}`, targetExtensionsDotted),
                // - hidden sub
                ...prefixEach(`${xx}/${monoWithHiddenSubPackage}/${hD}/${xx}/${vF}`, targetExtensionsDotted),
                ...prefixEach(`${xx}/${monoWithHiddenSubPackage}/${hD}/${xx}/${hF}`, targetExtensionsDotted),
            ]))
        : {},

        // include: top level only (no sub-path)
        PartialConfig.includeFiles([
            ...prefixEach(`${CD}/${vF}`, targetExtensionsDotted),
            ...prefixEach(`${CD}/${hF}`, targetExtensionsDotted),
        ]),

        // include: specific sub-paths
        inclWhereDir.length > 0
            ? ComposeConfig.named( '_inclSubPaths', 
                ...inclWhereDir.map((subPath) => PartialConfig.includeFiles([
                    // - top
                    ...prefixEach(`${xx}/${subPath}/${vF}`, targetExtensionsDotted),
                    ...prefixEach(`${xx}/${subPath}/${hF}`, targetExtensionsDotted),
                    // - visible sub
                    ...prefixEach(`${xx}/${subPath}/${vD}/${xx}/${vF}`, targetExtensionsDotted),
                    ...prefixEach(`${xx}/${subPath}/${vD}/${xx}/${hF}`, targetExtensionsDotted),
                    // - hidden sub
                    ...prefixEach(`${xx}/${subPath}/${hD}/${xx}/${vF}`, targetExtensionsDotted),
                    ...prefixEach(`${xx}/${subPath}/${hD}/${xx}/${hF}`, targetExtensionsDotted),
                ])))
            : {},

        // exclude: specific sub-paths
        exclWhereDir.length > 0
            ? ComposeConfig.named( '_exclSubPaths',
                ...exclWhereDir.map((subPath) => PartialConfig.excludeFiles([
                    // - top
                    ...prefixEach(`${xx}/${subPath}/${vF}`, ['.*']),
                    ...prefixEach(`${xx}/${subPath}/${hF}`, ['.*']),
                    // - visible sub
                    ...prefixEach(`${xx}/${subPath}/${vD}/${xx}/${vF}`, ['.*']),
                    ...prefixEach(`${xx}/${subPath}/${vD}/${xx}/${hF}`, ['.*']),
                    // - hidden sub
                    ...prefixEach(`${xx}/${subPath}/${hD}/${xx}/${vF}`, ['.*']),
                    ...prefixEach(`${xx}/${subPath}/${hD}/${xx}/${hF}`, ['.*']),
                ])))
            : {},

        // globals
        // TODO: globals as arg
        PartialConfig.targetGlobals(2022, `${sourceAssModSysId}`, Globals[`shared-node-browser`]),

        // ts specific
        sourceLangId === LangType.ts.id ? ComposeConfig.named( '_tsSpecific', 

            // TODO: root relative dir as arg? (here and globs above?)
            PartialConfig.tsConfigRootDir(`${CD}/`),
            PartialConfig.tsConfigProjects(
                ...[
                    `${CD}/tsconfig.${sourceAssModSysId}.json`,

                    // if this is the root config of a monorepo
                    // - also include all the tsconfig files in the sub packages
                    isRootConf && ROOT_PACKAGES_DIR.length > 0
                        ? `${CD}/${monoWithVisibleSubPackage}/tsconfig.${sourceAssModSysId}.json`
                        : '',
                    isRootConf && ROOT_PACKAGES_DIR.length > 0
                        ? `${CD}/${monoWithHiddenSubPackage}/tsconfig.${sourceAssModSysId}.json`
                        : '',
                ].filter((val) => val.length > 0)
            ),
        ) : {},

        // TODO: (later) should we support jsconfig.json as well?
        // - readup: https://code.visualstudio.com/docs/languages/jsconfig


        // base rules
        sourceLangId === LangType.js.id ? langJsBaseRules : {},
        sourceLangId === LangType.ts.id ? langTsBaseRules : {},

        // Specific rules: for /src directory types
        resourceLocationId === ResourceLocation.src.id ? ruleSetSrcCommon : {},
        resourceLocationId === ResourceLocation.src.id && sourceTypeId === SourceType.commonjs.id ? ruleSetSrcCjs : {},
        resourceLocationId === ResourceLocation.src.id && sourceTypeId === SourceType.module.id ? ruleSetSrcEsm : {},

        // Specific rules: for /dist directory types
        resourceLocationId === ResourceLocation.dist.id ? ruleSetDistCommon : {},
        resourceLocationId === ResourceLocation.dist.id && sourceAssModSysId === ModSysType.cjs.id ? ruleSetDistCjs : {},
        resourceLocationId === ResourceLocation.dist.id && sourceAssModSysId === ModSysType.esm.id ? ruleSetDistEsm : {},
    )
}




/** 
 * Note: {@linkcode EsLintTs.config} is just a helper/identity function:
 * - To provide type-checking/completions for the configuration object array.
 * - The equivalent jsDoc type is:
 *    @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile}
 * - @see {@link https://typescript-eslint.io/packages/typescript-eslint/#config} 
 */
const configs = [
    globalIncludes,
    globalExcludes,

    // // ==================== IMPORTANT ============================
    // // - `plugins` may not be re-specified in sub configs
    // // - It causes an error for some undocumented use-case
    // // - https://github.com/eslint/eslint/blob/389744be255717c507fafc158746e579ac08d77e/lib/config/flat-config-schema.js#L353
    // // - another posibility is that it only occurs when a particular
    // //   file matches on multiple configs, and then eslint tries to
    // //   merge them together, and is then unhappy even if the exact 
    // //   same plugin key and values is encountered again. See code link
    // //   above: it does not check if the plugin is the same, it just
    // //   checks if similar keys are present in the configs to be merged.
    // //
    // PartialConfig.jsEslintPluginAndParser(),
    // PartialConfig.tsEslintPluginAndParser(),
    // // -----------------------------------------------------------

    // src / <esm|cjs> / ts
    makeConfig(ResourceLocation.src.id, SourceType.module.id, LangType.ts.id, [], [], true ),
    makeConfig(ResourceLocation.src.id, SourceType.commonjs.id, LangType.ts.id, [], [], true ),

    // src / <esm|cjs> / js
    makeConfig(ResourceLocation.src.id, SourceType.module.id, LangType.js.id, [], [], true ),
    makeConfig(ResourceLocation.src.id, SourceType.commonjs.id, LangType.js.id, [], [], true ),
    // dist / <esm|cjs> / js
    makeConfig(ResourceLocation.dist.id, SourceType.module.id, LangType.js.id, [], [], true ),
    makeConfig(ResourceLocation.dist.id, SourceType.commonjs.id, LangType.js.id, [], [], true ),

];


if (LOG_VERBOSE) {
    console.log(`[${logTag}] Configurations:`);
    for (const cfg of configs) {
        console.log(`\n[${logTag}] --------------------------------`);

        const logInfo = {
            ...cfg,

            languageOptions: {
                ... cfg.languageOptions,
                parser: '{ ommitted for brevity }',
                globals: '{ ommitted for brevity }',
            },

            plugins: cfg.plugins ? `[${Object.keys(cfg.plugins).join(', ')}]` : cfg.plugins,
            files: Array.isArray(cfg.files) ? `[${cfg.files.join(', ')}]` : cfg.files,
            ignores: Array.isArray(cfg.ignores) ? `[${cfg.ignores.join(', ')}]` : cfg.ignores,
            rules: '{ ommitted for brevity }',
        };

        console.log( inspect( logInfo, { depth: 3 } ));
    }
}


export default configs;
export {
    configs,

    makeConfig,
    ResourceLocation,
    ModSysType,
    LangType,

    SourceType,
    FileType,
};


if (process.env.DEBUG && DEBUG_THIS) console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);
if (process.env.DEBUG && DEBUG_THIS && DEBUG_PAUSE) debugger;

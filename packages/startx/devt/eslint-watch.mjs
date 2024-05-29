
/**
 * @file ESLint Watcher (CLI Script)
 * 
 * @todo
 * - [ ] gracefully handle if the 'changed' file was deleted/renamed/moved/not found
 * - [ ] if the 'changed' file is a directory, then lint all files in that directory
 * - [ ] if the 'changed' file was a configuration file, then restart this script e.g.:
 *     - `tsconfig*.json`
 *     - `eslint*.*js`
 *     - `tasks.json` / `launch.json`
 */


import { exec } from 'child_process';
import Chokidar from 'chokidar';
import Path, { dirname, resolve } from 'path';
import FsAsync from 'fs/promises';
import { bundleRequire } from 'bundle-require';


import { inspect } from 'node:util';
import { getLogTag } from '../../../packages/startx/devt/common/locations.js';
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

const DRY_RUN = false;

const ESLINT_USE_CONFIG = true;
const ESLINT_USE_CACHE = true;
const ESLINT_VERBOSE = false;
const ESLINT_DEBUG = false;


const ESLINT_CONFIG_FILE = 'eslint.config.mjs';

const ESLINT_CACHE_FILE = '.cache/eslint';
const ESLINT_CACHE_CLEAN_ON_START = true;


// IMPLEMENTATION


if (process.env.DEBUG && DEBUG_THIS) console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);


class LogUtil{
    static _count = 0;
    static get count() {
        return ++this._count;
    }
    static get paddedCount() {
        return this.count.toString().padStart(4, '0');
    }
}


// const esLintOptions = {
//     baseConfig: null,
//     cache: true,
//     cacheLocation: `${CACHE_LOCATION}`,
//     cwd: process.cwd(),
//     ignorePatterns: null,
//     overrideConfig: null,
//     overrideConfigFile: `${ESLINT_CONFIG_FILE}`,
//     ruleFilter: () => true,
// };


// // Function to get ESLint configurations
// async function getEslintConfigs() {
//     const eslint = new ESLint(esLintOptions);

//     const configFile = await eslint.findConfigFile();
//     const configs = await eslint.calculateConfigForFile(configFile);
//     return configs;
// }


// Function to resolve the ESLint configuration path
async function resolveConfigFilePath(cwd) {
    const configFilenames = [
      "eslint.config.js",
      "eslint.config.mjs",
      "eslint.config.cjs",
      "eslint.config.ts",
      "eslint.config.mts",
      "eslint.config.cts"
    ];
    for (const filename of configFilenames) {
      const fullPath = resolve(cwd, filename);
      try {
        await FsAsync.access(fullPath);
        return fullPath;
      } catch (_) {
        // then try the next filename
      }
    }
    throw new Error(`[${logTag}] ESLint configuration file not found in ${cwd}`);
  }
  
  // Function to read and parse ESLint config file
  async function getEslintConfigs(cwd) {
    const configPath = await resolveConfigFilePath(cwd);
    const { mod } = await bundleRequire({
      filepath: configPath,
      cwd: dirname(configPath)
    });
    const configs = Array.isArray(mod.default) ? mod.default : [mod.default];
    return configs;
  }
  

// Debounce function to limit how often a function can fire, with file aggregation
function debounce(func, wait) {
    let timeout;
    const fileSet = new Set();
    return (file) => {
      fileSet.add(file);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(Array.from(fileSet));
        fileSet.clear();
      }, wait);
    };
  }

  // Function to run ESLint
  function runEslint(files) {
    console.log(``);

    const logList = files.join('\n\t');
    if (DRY_RUN) {
      console.log(`[${logTag}] #${LogUtil.paddedCount} DRY-RUN: Linting ..\n\t${logList}`);
    }
    else { 
      console.log(`[${logTag}] #${LogUtil.paddedCount} Linting ..\n\t${logList}`);

        const cliOpts = [
            ...[ESLINT_USE_CONFIG ? `--config ${ESLINT_CONFIG_FILE}` : null],
            ...[ESLINT_USE_CACHE ? `--cache --cache-location ${ESLINT_CACHE_FILE}` : null],
            ...[ESLINT_DEBUG ? '--debug' : null],
            ...[ESLINT_VERBOSE ? null : '--no-warn-ignored'],
            //
            // '--quiet',                         // Report errors only - default: false
            //
            // '--no-error-on-unmatched-pattern', // Prevent errors when pattern is unmatched
            // '--exit-on-fatal-error',           // Exit with exit code 2 in case of fatal error - default: false      
            // '--no-warn-ignored',               // Suppress warnings when the file list includes ignored files        
            // '--pass-on-no-patterns',           // Exit with exit code 0 in case no file patterns are passed
            '--stats',                         // Add statistics to the lint report - default: false
            //
            '--color',                         // Force enabling/disabling of color
            //
        ].filter((opt) => opt !== null && opt !== undefined);

      exec(`npx eslint ${cliOpts.join(' ')} ${files.join(' ')}`, 
      { 
        maxBuffer: 1024 * 1024 * 4, // maybe this can now be removed or reduces since NODE_DEBUG is suppressed?
        env: {
            ...process.env,
            NODE_DEBUG: '' // suppress node debug output
        }
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`\n[${logTag}] Error:`);
          if (error.code === 2) {
            console.error(`\n[${logTag}]   | Fatal error:\n`, error);
          } else {
            console.warn(`\n[${logTag}]   | Non-fatal error:\n`, error);
          }
        }
        if (stdout) {
          console.log(`\n[${logTag}] StdOut:`);
          stdout.split('\r\n').forEach((line) => {
            console.log(`[${logTag}]   | ${line}`);
          });
        }
        if (stderr) {
          const lines = stderr.split('\r\n')
          .map((line) => {
            if (['Debugger attached.', 'Waiting for the debugger to disconnect...'].some((str) => stderr.includes(str))) {
              return '';
            } else {
              return line;
            }
          })
          .filter((line) => !!line);
          if (lines.length > 0) {
            console.error(`\n[${logTag}] StdErr:`);
            lines.forEach((line) => {
              console.error(`[${logTag}]   | ${line}`);
            });
          }
          else {
            console.log(`.`);
          }
        }
      }
    );
    }
  }
  
  // Function to extract file patterns from ESLint configurations
  function getFilePatterns(configs) {
    const includePatterns = new Set();
    const ignorePatterns = new Set();
  
    configs.forEach(config => {
      if (config.files) {
        config.files.forEach(pattern => includePatterns.add(pattern));
      }
      if (config.ignores) {
        config.ignores.forEach(pattern => ignorePatterns.add(pattern));
      }
    });
  
    return { includePatterns: Array.from(includePatterns), ignorePatterns: Array.from(ignorePatterns) };
  }
  
// Main function to watch files and run ESLint
async function watchFiles() {
    const cwd = process.cwd();
    const configs = await getEslintConfigs(cwd);
    const { includePatterns, ignorePatterns } = getFilePatterns(configs);
  
    const watcher = Chokidar.watch(includePatterns, {
      ignored: ignorePatterns,
      persistent: true,
    });
  
    const debouncedRunEslint = debounce(runEslint, 300);
  
    watcher
      .on('add', debouncedRunEslint)
      .on('change', debouncedRunEslint)
      .on('unlink', debouncedRunEslint);
  
    console.log(`[${logTag}] Waiting for file changes...`);
}
  
// Main function to run the watcher
async function main() {

    // Start with a clean cache?
    if (ESLINT_CACHE_CLEAN_ON_START) {
        const resolvedCacheLocation = Path.resolve(process.cwd(), ESLINT_CACHE_FILE);
        console.log(`[${logTag}] Cleaning cache at ${resolvedCacheLocation}`);
        try {
            await FsAsync.rm(resolvedCacheLocation, { recursive: true, force: true });
            const fd = await FsAsync.open(resolvedCacheLocation, 'w');
            await fd.close();
        } catch (error) {
            console.error(`[${logTag}] Error: ${error}`);
        }
    }

    // Start watching files
    watchFiles().catch(error => console.error(`[${logTag}] Error: Failed to watch files: ${error}`));
}

main();
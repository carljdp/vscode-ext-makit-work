import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// TODO: if you plan to include source maps in the commited code, you should also:
// - also rename .js.map files to .cjs.map and .mjs.map
// - also update the sourceMappingURL inside the index.cjs and index.mjs files
// but bot necessary if you're not planning to include source maps in the commited code


// this filter function is an afterthought, but it's a good idea to have one
const filePathFilter = (filePath) => {
    return path.basename(filePath) === 'index.jsx';
};


const fallbackArgs = {
    packageName: 'preloader',
    scriptsDir: 'scripts',
    outputDir: 'dist',
    dryRun: false // <-- Set to true if you dont like living on the edge
};

const combinedArgs = {
    packageName: String(process.argv[2] || fallbackArgs.packageName),
    scriptsDir: String(process.argv[3] || fallbackArgs.scriptsDir),
    outputDir: String(process.argv[4] || fallbackArgs.outputDir),
    dryRun: Boolean(process.argv[5] || fallbackArgs.dryRun)
};

const logTag = combinedArgs.dryRun
    ? `compile-suf (dry-run)`
    : `compile-suf`;


const importMetaFile = import.meta.url;
const importMetaDir = path.dirname(importMetaFile);

const thisFileUrl = new URL(import.meta.url);
const thisFileHref = thisFileUrl.href;
const thisFilePath = fileURLToPath(thisFileUrl);

const thisFileDirUrl = new URL(importMetaDir);
const thisFileDirHref = thisFileDirUrl.href;
const thisFileDirPath = fileURLToPath(thisFileDirUrl);

const thisFileParentDirUrl = new URL(path.join(importMetaDir, '..'));
const thisFileParentDirHref = thisFileParentDirUrl.href;
const thisFileParentDirPath = fileURLToPath(thisFileParentDirUrl);



async function pathExists(pathToCheck) {
    try {
        await fs.access(pathToCheck, fs.constants.F_OK);
        return true;
    } catch (_) {
        return false;
    }
}


const getOutputDirIfContextCorrect = async (packageName, scriptsDir, outputDir) => {

    const thisFileDirName = path.basename(thisFileDirPath);
    if (thisFileDirName !== scriptsDir) {
        throw new Error(`[${logTag}] Expected to be in the "${scriptsDir}" directory, but found "${thisFileDirName}"`);
    }

    const expectedPackageRoot = thisFileParentDirPath;
    if (!await pathExists(expectedPackageRoot)) {
        throw new Error(`[${logTag}] Expected to find the package root directory`);
    }

    const expectedPackageJson = path.join(expectedPackageRoot, 'package.json');
    if (!await pathExists(expectedPackageJson)) {
        throw new Error(`[${logTag}] Expected to find a package.json file in the package root`);
    }

    let parsed;
    try {
        const packageJson = await fs.readFile(expectedPackageJson, 'utf-8');
        parsed = JSON.parse(packageJson);
        if (parsed && parsed.name !== packageName) {
            throw new Error(`[${logTag}] This script should be in the "scripts" directory of the "${packageName}" package`);
        }
    } catch (error) {
        throw new Error(`[${logTag}] Failed to read or parse ${expectedPackageJson}`);
    }

    const expectedOutputDir = path.join(expectedPackageRoot, outputDir);
    if (!await pathExists(expectedOutputDir)) {
        throw new Error(`[${logTag}] Expected to find an "${outputDir}" directory in the package root`);
    }


    // Below was added as an afterthought, but it's a good idea to have a package.json in the output directories

    const packageJsonShared = {
        name: parsed.name,
        version: parsed.version
    };

    const packageJsonForEsmDir = {
        ...packageJsonShared,
        module: 'index.js',
        type: 'module'
    }
    const packageJsonForCjsDir = {
        ...packageJsonShared,
        main: 'index.js',
        type: 'commonjs'
    }

    const esmPackageJsonPath = path.join(expectedOutputDir, 'esm', 'package.json');
    const cjsPackageJsonPath = path.join(expectedOutputDir, 'cjs', 'package.json');

    await fs.writeFile(esmPackageJsonPath, JSON.stringify(packageJsonForEsmDir, null, 2));
    await fs.writeFile(cjsPackageJsonPath, JSON.stringify(packageJsonForCjsDir, null, 2));

    return expectedOutputDir;
};

/**
 * Recursively renames file extensions in a directory with a dry-run option.
 * @param {string} directory The starting directory path.
 * @param {string} oldExt The old extension to be replaced.
 * @param {string} newExt The new extension to use.
 * @param {boolean} dryRun If true, no actual renaming will be performed.
 */
async function renameExtensions(directory, oldExt, newExt, dryRun = true) {
    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                // Recursively call renameExtensions if the entry is a directory
                await renameExtensions(entryPath, oldExt, newExt, dryRun);
            } else if (path.extname(entry.name) === oldExt) {

                if (filePathFilter(entryPath)) {
                    const newFilePath = entryPath.replace(oldExt, newExt);
                    if (dryRun) {
                        console.log(`[${logTag}] Would rename: ${entryPath} to ${path.basename(newFilePath)}`);
                    } else {
                        await fs.rename(entryPath, newFilePath);
                        console.log(`[${logTag}] Renamed: ${entryPath} to ${path.basename(newFilePath)}`);
                    }
                }
                else {
                    console.log(`[${logTag}] Skipped: ${entryPath}`);
                }
            }
        }
    } catch (err) {
        console.error(`[${logTag}] Error processing directory:`, err);
    }
}

async function run({ packageName, scriptsDir, outputDir, dryRun = true }) {

    console.log(`[${logTag}] ${dryRun ? "Running in dry-run mode (not live):" : "Running in live mode (not dry-run):"}`);

    try {
        const actualOutputDir = await getOutputDirIfContextCorrect(packageName, scriptsDir, outputDir);

        const renameTasks = [
            {
                directory: path.join(actualOutputDir, 'cjs'),
                oldExt: '.js',
                newExt: '.cjs'
            },
            {
                directory: path.join(actualOutputDir, 'esm'),
                oldExt: '.js',
                newExt: '.mjs'
            }
        ];

        // Use map to create an array of promises
        const results = await Promise.all(renameTasks.map(async task => {
            if (await pathExists(task.directory)) {
                return renameExtensions(task.directory, task.oldExt, task.newExt, dryRun);
            } else {
                console.log(`[${logTag}] Directory not found: ${task.directory}`);
                return null; // Return null or appropriate value for missing directory
            }
        }));

        // Optional: Do something with results if needed
        console.log(`[${logTag}] Finished output file-extention renaming.`);

    } catch (error) {
        console.error(`[${logTag}] Failed to complete output file-extention renaming:`, error);
    }

}


run(combinedArgs);
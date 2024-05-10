'use strict';
//@ts-check

import fsSync, { promises as fsAsync, Dir, Dirent } from 'node:fs';

import * as P from 'node:path';

import { strict as assert } from 'node:assert';

import util from 'node:util';
import _ from 'lodash';
import { dir } from 'node:console';

/**
 * @enum {string}
 * @readonly
 */
const Binary = {
    'npm': 'JavaScript package manager',
    'npx': 'Run a command from an npm package',
};

/**
 * @enum {string}
 * @readonly
 */
const Commands = {
    'npm': 'JavaScript package manager',
    'access': 'Set access level on published packages',
    'adduser': 'Add a registry user account',
    'audit': 'Run a security audit',
    'bugs': 'Bugs for a package in a web browser maybe',
    'cache': 'Manipulates packages cache',
    'ci': 'Install a project with a clean slate',
    'completion': 'Tab completion for npm',
    'config': 'Manage the npm configuration files',
    'dedupe': 'Reduce duplication',
    'deprecate': 'Deprecate a version of a package',
    'diff': 'The registry diff command',
    'dist- tag': 'Modify package distribution tags',
    'docs': 'Docs for a package in a web browser maybe',
    'doctor': 'Check your environments',
    'edit': 'Edit an installed package',
    'exec': 'Run a command from an npm package',
    'explain': 'Explain installed packages',
    'explore': 'Browse an installed package',
    'find-dupes': 'Find duplication in the package tree',
    'fund': 'Retrieve funding information',
    'help': 'Search npm help documentation',
    'help-search': 'Get help on npm',
    'hook': 'Manage registry hooks',
    'init': 'Create a package.json file',
    'install': 'Install a package',
    'install-ci-test': 'Install a project with a clean slate and run tests',
    'install-test': 'Install package(s) and run tests',
    'link': 'Symlink a package folder',
    'login': 'Login to a registry user account',
    'logout': 'Log out of the registry',
    'ls': 'List installed packages',
    'org': 'Manage orgs',
    'outdated': 'Check for outdated packages',
    'owner': 'Manage package owners',
    'pack': 'Create a tarball from a package',
    'ping': 'Ping npm registry',
    'pkg': 'Manages your package.json',
    'prefix': 'Display prefix',
    'profile': 'Change settings on your registry profile',
    'prune': 'Remove extraneous packages',
    'publish': 'Publish a package',
    'query': 'Retrieve a filtered list of packages',
    'rebuild': 'Rebuild a package',
    'repo': 'Open package repository page in the browser',
    'restart': 'Restart a package',
    'root': 'Display npm root',
    'run-script': 'Run arbitrary package scripts',
    'sbom': 'Generate a Software Bill of Materials(SBOM)',
    'search': 'Search for packages',
    'shrinkwrap': 'Lock down dependency versions for publication',
    'star': 'Mark your favorite packages',
    'stars': 'View packages marked as favorites',
    'start': 'Start a package',
    'stop': 'Stop a package',
    'team': 'Manage organization teams and team memberships',
    'test': 'Test a package',
    'token': 'Manage your authentication tokens',
    'uninstall': 'Remove a package',
    'unpublish': 'Remove a package from the registry',
    'unstar': 'Remove an item from your favorite packages',
    'update': 'Update a package',
    'version': 'Bump a package version',
    'view': 'View registry info',
    'whoami': 'Display npm username',
    'npx': 'Run a command from an npm package',
};

/**
 * @enum {string}
 * @readonly
 */
const NpmLifeCycleScript = {

    /** @type {string} */
    init: 'init',

    /** @type {string} */
    preinstall: 'preinstall',

    /** @type {string} */
    install: 'install',

    /** @type {string} */
    postinstall: 'postinstall',

    /** @type {string} */
    preprepare: 'preprepare',

    /** @type {string} */
    prepare: 'prepare',

    /** @type {string} */
    postprepare: 'postprepare',

    /** @type {string} */
    prepublish: 'prepublish',

    /** @type {string} */
    publish: 'publish',

    /** @type {string} */
    prepublishOnly: 'prepublishOnly',

    /** @type {string} */
    prepack: 'prepack',

    /** @type {string} */
    pack: 'pack',

    /** @type {string} */
    postpack: 'postpack',

    /** @type {string} */
    dependencies: 'dependencies',
};


// Define your package.json content
const packageJson = {
    name: 'your-project-name',
    version: '1.0.0',
    description: 'Your project description',
    main: 'index.js',
    // Change this if your entry point file is different
    scripts: {
        start: 'node index.js' // Adjust this based on your project setup
    },
    author: 'Your Name',
    license: 'MIT',
    // Adjust as needed
    dependencies: {
        // Add your project dependencies here
    },
    devDependencies: {
        // Add your project devDependencies here
    }
};

// // Write the package.json file
// fsSync.writeFile('draft.package.json', JSON.stringify(packageJson, null, 2), err => {
//     if (err) {
//         console.error('Error writing package.json file:', err);
//     } else {
//         console.log('package.json file generated successfully.');
//     }
// });

/** @enum {string} DirentType */
const DirentType = {
    directory: 'directory',
    file: 'file',
};


/** @typedef {import('node:fs').PathLike} PathLike */
/** @typedef {import('node:fs').Dirent} Dirent */



// class NullObject {
//     constructor() {
//         return Object.create(null);
//     }
// }


class Box {

    /** @type {any[]|undefined} */
    #values;

    /** @type {any[]|undefined} */
    #errors;

    /** @type {boolean|undefined} */
    #sealed;

    _assertUnsealed(extraMessage) {
        if (this.#sealed) {
            let msg = 'Sealed';
            msg += extraMessage ? `: ${extraMessage}` : '';
            throw new Error(msg);
        }
    }

    _assertSealed(extraMessage) {
        if (!this.#sealed) {
            let msg = 'Unsealed';
            msg += extraMessage ? `: ${extraMessage}` : '';
            throw new Error(msg);
        }
    }

    get values() {
        this._assertUnsealed('Cannot access values of a sealed Op');
        return this.#values || [];
    }

    set values(_ignored) {
        throw new Error('Use `resolve` method instead');
    }

    get errors() {
        this._assertUnsealed('Cannot access errors of a sealed Op');
        return this.#errors || [];
    }

    set errors(_ignored) {
        throw new Error('Use `reject` method instead');
    }

    get hasValues() {
        this._assertUnsealed('Cannot check for values on a sealed Op');
        const _values = this.#values || [];
        return _values.length !== 0;
    }

    get hasErrors() {
        this._assertUnsealed('Cannot check for errors on a sealed Op');
        const _errors = this.#errors || [];
        return _errors.length !== 0;
    }

    constructor() {
        this.#values = undefined;
        this.#errors = undefined;
        this.#sealed = false;
    }

    static new() {
        return new Box();
    }

    // static newResolveAndSeal(value) {
    //     return Box.new()
    //         ._resolve(value)
    //         .seal();
    // }

    // static newRejectAndSeal(reason, extra) {
    //     return Box.new()
    //         ._reject(value)
    //         .seal();
    // }

    seal() {
        this._assertUnsealed('Cannot seal an already sealed Op');
        this.#sealed = true;
        return this;
    }

    addValue(value) {
        this._assertUnsealed('Cannot add when sealed');
        // late initialized
        this.#values = [...this.#values || [], value];
        return this;
    }

    addProblem(reason, extra = undefined) {
        this._assertUnsealed('Cannot add when sealed');
        // late initialized
        this.#errors = [...this.#errors || [], { reason, extra }];
        return this;
    }

    unseal() {
        this._assertSealed('Cannot unseal an already unsealed Op');
        this.#sealed = false;
        return this;
    }

    assertSealedSuccess() {
        this.unseal();
        return this.hasValues && !this.hasErrors;
    }

    assertSealedFailure() {
        this.unseal();
        return this.hasErrors && !this.hasValues;
    }

    // adoptSealedValues() {
    //     this.unseal();
    //     const values = this.values;
    //     this.values = [];
    //     return [values[0], values.slice(1)];
    // }

    // adoptSealedErrors() {
    //     this.unseal();
    //     const errors = this.errors;
    //     this.errors = [];
    //     return [errors[0], errors.slice(1)];
    // }

    // adoptSealed() {
    //     this.unseal();
    //     return [this.values, this.errors];
    // }

}

class _String {

    #raw;
    #value;

    constructor(value) {
        this.#raw = value;
        this.#value = undefined;
    }

    get value() {
        this.#value = this.#raw.toString();
        return this.#value;
    }

    toString() {
        return this.value;
    }

    valueOf() {
        return this.value;
    }

    [Symbol.toPrimitive](hint) {
        return this.value;
    }

}


class _Union {

    #types;

    constructor(...types) {
        if (typeof types === 'object') {
            if (types instanceof Array || types instanceof Map || types instanceof Set) {
                types = [...types];
            }
        }
        else {
            throw new Error('Invalid types argument');
        }
    }

    static of(...types) {
        return new _Union(...types);
    }

    typeCheck(value) {
        return this.#types.some(type => value instanceof type);
    }


    toString() {
        return this.#types.join(' | ');
    }

    valueOf() {
        return this.#types;
    }

    [Symbol.toPrimitive](hint) {
        return this.toString();
    }

}

const PathLike = new _Union(String, Buffer, URL);


class _PathLike {
    typeofString = 'string';
    typeofBuffer = 'Buffer';
    typeofURL = 'URL';

    #pathLike;

    constructor(pathLike) {
        this.#pathLike = pathLike;
    }

    get type() {
        if (typeof this.#pathLike === 'string') {
            return _PathLike.typeofString;
        }
        if (this.#pathLike instanceof Buffer) {
            return _PathLike.typeofBuffer;
        }
        if (this.#pathLike instanceof URL) {
            return _PathLike.typeofURL;
        }
        throw new Error(`Invalid PathLike type: ${this.#pathLike}`);
    }

    get value() {
        switch (this.type) {
            case _PathLike.typeofString:
            case _PathLike.typeofBuffer:
            case _PathLike.typeofURL:
                return this.#pathLike.toString();
            default:
                throw new Error(`Invalid PathLike type: ${this.#pathLike}`);
        }
    }

    toString() {
        return this.value;
    }
    valueOf() {
        return this.value;
    }

}


function sealedOpGetIfPathLike(pathLike) {
    const result = Box.new();
    return (typeof pathLike === 'string' || pathLike instanceof Buffer || pathLike instanceof URL)
        ? result.addValue(pathLike).seal()
        : result.addProblem('Argument must be a PathLike').seal();
}

function sealedOpGetIfDirent(dirent) {
    const b = Box.new();
    return (dirent instanceof Dirent)
        ? b.addValue(dirent).seal()
        : b.addProblem('Argument must be a Dirent').seal();
}

/**
 * 
 * @param {Dirent|PathLike} direntOrPathLike 
 * @returns {Box}
 */
function sealedOpResolveDirentOrPathLike(direntOrPathLike) {
    const box = Box.new();

    if (direntOrPathLike === undefined || direntOrPathLike === null) {
        box.addProblem('direntOrPathLike is null or undefined', direntOrPathLike);
    }

    const direntOp = sealedOpGetIfDirent(direntOrPathLike);
    if (direntOp.assertSealedSuccess()) {
        box.addValue(direntOp.values[0]);
    }

    const pathlikeOp = sealedOpGetIfPathLike(direntOrPathLike);
    if (pathlikeOp.assertSealedSuccess()) {
        box.addValue(String(pathlikeOp.values[0]));
    }

    box.addProblem('Unable to resolve Dirent or PathLike', direntOrPathLike);

    return box.seal();
}


function getLeafInfo(direntOrPathLike) {
    try {
        const original = direntOrPathLike;


        const box = sealedOpResolveDirentOrPathLike(direntOrPathLike);

        if (box.assertSealedFailure()) {
            throw new Error(box.errors.pop(), box.errors);
        }
        const value = box.values[0];

        const fullPath = (value instanceof Dirent)
            ? P.join(value.path, value.name)
            : value;

        const normalized = P.normalize(fullPath);
        const resolved = P.resolve(normalized);

        const dirname = P.dirname(resolved);
        const basename = P.basename(resolved);

        const isFile = fsSync.statSync(resolved).isFile();

        return {
            original,
            normalized,
            resolved,
            dirname,
            basename,
            isFile,
        };

    }
    catch (error) {
        throw error;
    }
}

/** 
 * @param {PathLike} location 
 * @returns {string} 
 * @throws {Error}
 * @throws {Error} Only if the passed in argument resolves with an error
 */
function snapToClosestDir(direntOrPathLike) {
    try {
        if (direntOrPathLike === undefined || direntOrPathLike === null) {
            direntOrPathLike = '.';
        }

        const leaf = getLeafInfo(direntOrPathLike);
        const closest = leaf.isFile ? leaf.dirname : leaf.resolved
        return closest;

    } catch (error) {
        throw error;
    }
}

function getClosestDirContents(direntOrPathLike) {
    try {
        const fullPath = snapToClosestDir(direntOrPathLike)
        const contents = fsSync.readdirSync(fullPath, {
            withFileTypes: true,
            recursive: false
        });
        return contents;
    } catch (error) {
        throw error;
    }
}

let testUrl = new URL('file:///C:/Users/username/Documents/Projects/ProjectName');

// export type PathLike = string | Buffer | URL;
// export type PathOrFileDescriptor = PathLike | number;

/**
 * @enum {string} FsPathType
 * @readonly
 */
const FsPathType = {
    string: 'string',
    Buffer: 'Buffer',
    URL: 'URL',
    number: 'number',

}


// class FsEntry {

//     argValue;
//     argType;
//     argPath;

//     _stats;

//     name;
//     location;

//     /**
//      * @param {Dirent|PathLike} arg
//      * @returns {FsEntry}
//      */
//     constructor(arg) {
//         this.argValue = arg;

//         if (typeof this.argValue === 'object' && this.argValue instanceof Dirent) {
//             this.argType = 'Dirent';
//         }
//         else {
//             this.argType = 'PathLike';
//         }

//         this.stats = fsSync.statSync(this.argPath);
//     }

//     snapToClosestDir() {
//         switch (this.argType) {
//             case 'Dirent':
//                 return snapToClosestDir(this.argValue);
//             case 'PathLike':
//                 return snapToClosestDir(this.argValue);
//         }
//     }

// }

class FsEntry {

    #from

    constructor(from = undefined) {
        this.#from = undefined;
    }

    /**
     * @param {Dirent|PathLike} closestDir 
     * @returns {FsEntry}
     */
    static from(location) {
        const _dir = snapToClosestDir(location);
        return new FsEntry();
    }

}


const main = () => {
    const proj_root = snapToClosestDir();

    const src_dir = snapToClosestDir(P.join(proj_root, 'src'));

    const dirs = getClosestDirContents(src_dir)
        .filter(dirent => dirent.isDirectory());

    const subModules = dirs
        .map(dirent => getClosestDirContents(snapToClosestDir(dirent))
            .filter(dirent => dirent.isFile() && dirent.name === 'package.json')
            .map(dirent => dirent)
        )
        .flat(1);


    console.log(util.inspect(subModules, { depth: 1 }))
}
main();


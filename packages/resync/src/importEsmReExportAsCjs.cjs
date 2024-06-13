"use strict";
// @ts-check

const targetEsm = {
    "jsc": {
        "parser": {
            "syntax": "ecmascript",
            "jsx": false,
        },
        "loose": false,
        "minify": {
            "compress": false,
            "mangle": false,
        },
    },
    "module": {
        "type": "es6"
    },
    "minify": false,
    "isModule": true,
    "sourceMaps": false,
    "env": {
        "targets": {
            "node": "22.2.0"
        }
    }
};

const targetCjs = {
    "jsc": {
        "parser": {
            "syntax": "ecmascript",
            "jsx": false,
        },
        "loose": false,
        "minify": {
            "compress": false,
            "mangle": false,
        },
    },
    "module": {
        "type": "commonjs"
    },
    "minify": false,
    "isModule": true,
    "sourceMaps": false,
    "env": {
        "targets": {
            "node": "22.2.0"
        }
    }
};

function isEmptyObject(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

////////////////////////////////////////////////////////////////////////////////

const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const swc = require('@swc/core');

function syncImportEsm(modulePath) {
    const absPath = path.resolve(modulePath);
    const code = fs.readFileSync(absPath, 'utf8');

    // Need to transpile the ESM code to CJS, for the VM context
    const transpiledCode = swc.transformSync(code, targetCjs).code;

    // Create a VM context
    const sandbox = { module: { exports: {} }, exports: {} };
    const context = vm.createContext(sandbox);

    // Wrap the transpiled code to simulate a module environment
    const wrapper = `(function (exports, require, module, __filename, __dirname) { ${transpiledCode} });`;
    const script = new vm.Script(wrapper, { filename: absPath });

    // Execute the script in the VM context
    const __filename = absPath;
    const __dirname = path.dirname(absPath);
    const runScriptInContext = script.runInContext(context);

    // Call the wrapper function with the module-specific arguments
    runScriptInContext(sandbox.exports, require, sandbox.module, __filename, __dirname);

    // Capture the exports from the module
    return isEmptyObject(sandbox.module.exports)
        ? sandbox.exports
        : sandbox.module.exports;
}

////////////////////////////////////////////////////////////////////////////////

const myModule = syncImportEsm(path.join(__dirname, 'esmModule.mjs'));
//const myModule = {
//    ...syncImportEsm(path.join(__dirname, 'esmModule.mjs'))
//};

console.assert(myModule && !isEmptyObject(myModule), 'Expected myModule to be an object');

module.exports = myModule;


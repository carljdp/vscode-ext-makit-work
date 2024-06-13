

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

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import swc from '@swc/core';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);


// Function to sync import a CJS module
function syncImportCjs(modulePath) {
    const absPath = path.resolve(modulePath);
    const code = fs.readFileSync(absPath, 'utf8');

    // Transpile source to CJS, for the VM context
    const transpiledCode = swc.transformSync(code, targetCjs).code;

    // Create a VM context
    const sandbox = { module: { exports: {} }, exports: {} };
    const context = vm.createContext(sandbox);

    // Wrap the CJS code to simulate a module environment
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




const myModule = syncImportCjs(path.join(__dirname, 'cjsModule.cjs'));
//const myModule = {
//    ...syncImportCjs(path.join(__dirname, 'cjsModule.cjs'))
//};

console.assert(myModule && !isEmptyObject(myModule), 'Expected myModule to be an object');

export default myModule;


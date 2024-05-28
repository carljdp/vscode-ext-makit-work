"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OnFail", {
    enumerable: true,
    get: function() {
        return OnFail;
    }
});
const _vscode = /*#__PURE__*/ _interop_require_wildcard(require("vscode"));
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
const _jsoncparser = /*#__PURE__*/ _interop_require_wildcard(require("jsonc-parser"));
const _fs = require("fs");
const _promises = require("fs/promises");
const _FileHandler = require("../utils/FileHandler");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function validateData(data) {
    return 'key' in data && 'value' in data;
}
const filePath = _path.join(__dirname, 'data', 'file.json');
var OnFail;
(function(OnFail) {
    OnFail[OnFail["LogAndReturnNull"] = 0] = "LogAndReturnNull";
    OnFail[OnFail["ThrowError"] = 1] = "ThrowError";
})(OnFail || (OnFail = {}));
async function readJsonFile(filePath, fileEncoding = 'utf8', onFail = 0) {
    try {
        const fileData = await (0, _promises.readFile)(filePath, fileEncoding);
        let jsonParseErrors = [];
        const parsedJson = _jsoncparser.parse(fileData, jsonParseErrors, {
            disallowComments: false,
            allowTrailingComma: true,
            allowEmptyContent: true
        });
        // Check if there were any errors during parsing
        if (jsonParseErrors.length === 0) {
            return parsedJson;
        } else {
            if (onFail === 1) {
                throw new Error('JSONC parsing errors');
            } else {
                console.error('JSONC parsing errors:', jsonParseErrors);
                return null;
            }
        }
    } catch (error) {
        if (onFail === 1) {
            throw error; // Rethrow back to the caller
        } else {
            console.error('Failed to read or parse JSON file:', error);
            return null;
        }
    }
}
async function getJsonData(onFail = 0) {
    try {
        const jsonData = await readJsonFile(filePath, 'utf8', onFail);
        if (!validateData(jsonData)) {
            if (onFail === 1) {
                throw new Error('Invalid JSON format');
            } else {
                console.error('Invalid JSON format');
                return null;
            }
        }
        return jsonData;
    } catch (error) {
        if (onFail === 1) {
            throw error; // Rethrow back to the caller
        } else {
            console.error('Failed to get JSON data:', error);
            return null;
        }
    }
}
function readExtensionsJson() {
    const workspaceFolders = _vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        console.log('No workspace is open.');
        return;
    }
    // Assuming you want to read extensions.json from the first workspace folder
    const workspacePath = workspaceFolders[0].uri.fsPath;
    const extensionsJsonPath = _path.join(workspacePath, '.vscode', 'extensions.json');
    // Check if extensions.json exists
    if ((0, _fs.existsSync)(extensionsJsonPath)) {
        const fileContent = _FileHandler.FileHandler.initOnce({
            lockFileOptions: {}
        }).cautiousReadFile(extensionsJsonPath);
    // readFile(extensionsJsonPath, 'utf8', (err, data) => {
    //     if (err) {
    //         console.error('Error reading extensions.json:', err);
    //         return;
    //     }
    //     try {
    //         const extensionsJson = JSON.parse(data);
    //         console.log('extensions.json content:', extensionsJson);
    //         // Now you can work with the extensionsJson object
    //     } catch (parseError) {
    //         console.error('Error parsing extensions.json:', parseError);
    //     }
    // });
    } else {
        console.log('extensions.json does not exist.');
    }
}
// Example usage
readExtensionsJson();

//# sourceMappingURL=readNonPublicJsonFiles.js.map
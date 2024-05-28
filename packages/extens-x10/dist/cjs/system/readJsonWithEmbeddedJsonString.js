"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _fs = require("fs");
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
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
function unwrapNestedJson(input) {
    const replacements = [
        [
            '"{',
            '{'
        ],
        [
            '}"',
            '}'
        ],
        [
            '"[',
            '['
        ],
        [
            ']"',
            ']'
        ],
        [
            '\\"',
            '"'
        ]
    ];
    let result = input;
    for (const [target, replacement] of replacements){
        const safeRegex = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    }
    return result;
}
function readFileFromVSCodeData(filePath) {
    return _fs.promises.readFile(filePath, 'utf8');
}
// Example usage
const dataDirPath = _path.join(process.env.APPDATA || '', 'Code', 'User', 'workspaceStorage');
const fullPath = _path.join(dataDirPath, 'yourSpecificFile.json');
readFileFromVSCodeData(fullPath).then((data)=>console.log(data)).catch((error)=>console.error('Error reading file:', error));

//# sourceMappingURL=readJsonWithEmbeddedJsonString.js.map
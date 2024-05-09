"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function unwrapNestedJson(input) {
    const replacements = [
        ['"{', '{'],
        ['}"', '}'],
        ['"[', '['],
        [']"', ']'],
        ['\\"', '"']
    ];
    let result = input;
    for (const [target, replacement] of replacements) {
        const safeRegex = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    }
    return result;
}
// Step 1: Read the JSON file
// const jsonContent = fs.readFileSync('path/to/yourfile.json', 'utf8');
// TODO: error handling for file read
// Step 2: Unwrap the nested JSON
// const unwrappedJson = unwrapNestedJson(jsonContent);
// Step 3: Parse the unwrapped JSON
// TODO: error handling for JSON parse
const path = __importStar(require("path"));
function readFileFromVSCodeData(filePath) {
    return fs_1.promises.readFile(filePath, 'utf8');
}
// Example usage
const dataDirPath = path.join(process.env.APPDATA || '', 'Code', 'User', 'workspaceStorage');
const fullPath = path.join(dataDirPath, 'yourSpecificFile.json');
readFileFromVSCodeData(fullPath)
    .then(data => console.log(data))
    .catch(error => console.error('Error reading file:', error));

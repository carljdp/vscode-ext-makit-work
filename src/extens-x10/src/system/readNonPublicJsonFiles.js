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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnFail = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const jsoncParser = __importStar(require("jsonc-parser"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const FileHandler_1 = require("../utils/FileHandler");
function validateData(data) {
    return 'key' in data && 'value' in data;
}
const filePath = path.join(__dirname, 'data', 'file.json');
var OnFail;
(function (OnFail) {
    OnFail[OnFail["LogAndReturnNull"] = 0] = "LogAndReturnNull";
    OnFail[OnFail["ThrowError"] = 1] = "ThrowError";
})(OnFail || (exports.OnFail = OnFail = {}));
function readJsonFile(filePath_1) {
    return __awaiter(this, arguments, void 0, function* (filePath, fileEncoding = 'utf8', onFail = OnFail.LogAndReturnNull) {
        try {
            const fileData = yield (0, promises_1.readFile)(filePath, fileEncoding);
            let jsonParseErrors = [];
            const parsedJson = jsoncParser.parse(fileData, jsonParseErrors, {
                disallowComments: false,
                allowTrailingComma: true,
                allowEmptyContent: true,
            });
            // Check if there were any errors during parsing
            if (jsonParseErrors.length === 0) {
                return parsedJson;
            }
            else {
                if (onFail === OnFail.ThrowError) {
                    throw new Error('JSONC parsing errors');
                }
                else {
                    console.error('JSONC parsing errors:', jsonParseErrors);
                    return null;
                }
            }
        }
        catch (error) {
            if (onFail === OnFail.ThrowError) {
                throw error; // Rethrow back to the caller
            }
            else {
                console.error('Failed to read or parse JSON file:', error);
                return null;
            }
        }
    });
}
function getJsonData() {
    return __awaiter(this, arguments, void 0, function* (onFail = OnFail.LogAndReturnNull) {
        try {
            const jsonData = yield readJsonFile(filePath, 'utf8', onFail);
            if (!validateData(jsonData)) {
                if (onFail === OnFail.ThrowError) {
                    throw new Error('Invalid JSON format');
                }
                else {
                    console.error('Invalid JSON format');
                    return null;
                }
            }
            return jsonData;
        }
        catch (error) {
            if (onFail === OnFail.ThrowError) {
                throw error; // Rethrow back to the caller
            }
            else {
                console.error('Failed to get JSON data:', error);
                return null;
            }
        }
    });
}
function readExtensionsJson() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        console.log('No workspace is open.');
        return;
    }
    // Assuming you want to read extensions.json from the first workspace folder
    const workspacePath = workspaceFolders[0].uri.fsPath;
    const extensionsJsonPath = path.join(workspacePath, '.vscode', 'extensions.json');
    // Check if extensions.json exists
    if ((0, fs_1.existsSync)(extensionsJsonPath)) {
        const fileContent = FileHandler_1.FileHandler.initOnce({
            lockFileOptions: {},
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
    }
    else {
        console.log('extensions.json does not exist.');
    }
}
// Example usage
readExtensionsJson();

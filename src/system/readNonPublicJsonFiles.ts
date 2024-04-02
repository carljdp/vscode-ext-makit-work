

import * as vscode from 'vscode';

import * as path from 'path';


import * as jsoncParser from 'jsonc-parser';

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

import { FileHandler } from '../utils/FileHandler';

// code --list-extensions --show-versions
// format: publisher.name@version
//  - allowed characters: [a-z0-9-]
//  - first & last character: [a-z]


interface MyData {
    key: string;
    value: number;
}

function validateData(data: any): data is MyData {
    return 'key' in data && 'value' in data;
}

const filePath = path.join(__dirname, 'data', 'file.json');

export enum OnFail {
    LogAndReturnNull,
    ThrowError
}

async function readJsonFile(filePath: string, fileEncoding: BufferEncoding = 'utf8', onFail: OnFail = OnFail.LogAndReturnNull): Promise<any> {
    try {
        const fileData = await readFile(filePath, fileEncoding);

        let jsonParseErrors: jsoncParser.ParseError[] = [];
        const parsedJson = jsoncParser.parse(fileData, jsonParseErrors, {
            disallowComments: false,
            allowTrailingComma: true,
            allowEmptyContent: true,
        });

        // Check if there were any errors during parsing
        if (jsonParseErrors.length === 0) {
            return parsedJson;
        } else {
            if (onFail === OnFail.ThrowError) {
                throw new Error('JSONC parsing errors');
            }
            else {
                console.error('JSONC parsing errors:', jsonParseErrors);
                return null;
            }
        }
    } catch (error) {
        if (onFail === OnFail.ThrowError) {
            throw error; // Rethrow back to the caller
        }
        else {
            console.error('Failed to read or parse JSON file:', error);
            return null;
        }
    }
}

async function getJsonData(onFail: OnFail = OnFail.LogAndReturnNull) {
    try {
        const jsonData = await readJsonFile(filePath, 'utf8', onFail);
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
    } catch (error) {
        if (onFail === OnFail.ThrowError) {
            throw error; // Rethrow back to the caller
        }
        else {
            console.error('Failed to get JSON data:', error);
            return null;
        }
    }
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
    if (existsSync(extensionsJsonPath)) {

        const fileContent = FileHandler.initOnce({
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

    } else {
        console.log('extensions.json does not exist.');
    }
}

// Example usage
readExtensionsJson();

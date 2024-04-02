

import { promises as fs } from 'fs';


function unwrapNestedJson(input: string): any {
  const replacements: Array<[string, string]> = [
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




import * as path from 'path';

function readFileFromVSCodeData(filePath: string): Promise<string> {
    return fs.readFile(filePath,'utf8');
}

// Example usage
const dataDirPath = path.join(process.env.APPDATA || '', 'Code', 'User', 'workspaceStorage');
const fullPath = path.join(dataDirPath, 'yourSpecificFile.json');

readFileFromVSCodeData(fullPath)
    .then(data => console.log(data))
    .catch(error => console.error('Error reading file:', error));

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let __filename: string;
let __dirname: string;

if (typeof import.meta !== 'undefined' && import.meta.url) {
  __filename = fileURLToPath(import.meta.url);
  __dirname = dirname(__filename);
} else {
  // Fallback for CommonJS
  const { __filename: cjsFilename, __dirname: cjsDirname } = require('path');
  __filename = cjsFilename;
  __dirname = cjsDirname;
}

//get the working directory of the node process that called this script
const CALLER_DIR = process.cwd();

// get the full path to this script
const SCRIPT_DIR = __dirname;
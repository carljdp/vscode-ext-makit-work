"use strict";
// @ts-check

import { promises as fs } from 'fs';
import path from 'path';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const importMetaFile = import.meta.url;
const importMetaDir = path.dirname(importMetaFile);

const thisFileUrl = new URL(import.meta.url);
const thisFileHref = thisFileUrl.href;
const thisFilePath = fileURLToPath(thisFileUrl);

const thisFileDirUrl = new URL(importMetaDir);
const thisFileDirHref = thisFileDirUrl.href;
const thisFileDirPath = fileURLToPath(thisFileDirUrl);

const thisFileParentDirUrl = new URL(path.join(importMetaDir, '..'));
const thisFileParentDirHref = thisFileParentDirUrl.href;
const thisFileParentDirPath = fileURLToPath(thisFileParentDirUrl);

const logTag = 'bootstrap:devtools:copy-package-json';


// indicators indicating that the script is running in the correct context
//
// files expected to be present in the package root:
// - package.json
// - node_modules
// - src
// - .gitiignore

const packageRootExpectedFiles = [
    'package.json',
    'node_modules',
    'src',
    '.gitignore',
];


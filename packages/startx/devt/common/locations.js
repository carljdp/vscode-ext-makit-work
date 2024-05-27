"use strict";
// @ts-check

/**
 * @file A utility module for getting the file location of the calling function.
 * @author Carl J du Preez <carljdp@gmail.com>
 * 
 * NOTE
 * - For each nesting level of a location function, add 1 to the stackOffset,
 *   even in your own functions, where you call the location function from.
 * 
 * @example
 * ```
 * import { Location } from "./locations.js";
 * 
 * const nestedLocationFn = (n = 0) => {
 *     Location.logThisLocation(n + 1); // increment the stackOffset
 * };
 * const testFn = () => {
 *     nestedLocationFn(); 
 * };
 * testFn(); // logs `testFn` location
 * Location.report();
 * ```
 * 
 * @example
 * ```
 * import { getLogTag } from './locations.js';
 * 
 * const logTag = getLogTag();
 * if (process.env.DEBUG) {
 *    console.log(`DEBUG: File: ${logTag}`);
 * }
 * ```
 * 
 * @example
 * ```
 * import { Location } from './locations.js';
 *
 * Location.logThisLocation();
 * Location.report();
 * ```
 * 
 */

import Path from "node:path";
import { fileURLToPath } from 'node:url';

/**
 * This is the last time we assemble this tag manually!!!
 * - by the end of this file, we will have a utility function to get the log tag
 * @type {string}
 */
const logTag = Path.basename(fileURLToPath(import.meta.url));


// CONSTANTS


const DEBUG = false;


// IMPLEMENTATION


if (DEBUG && process.env.DEBUG) { 
    console.log(`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮`);
}

/**
 * A class representing the call-site location obtained from a stack trace line.
 * See {@link https://nodejs.org/api/errors.html#errorstack | Error.stack} 
 */
class CallSiteLocation {

    /**
     * The identifier of the location.
     * @type {string|undefined}
     * @private
     */
    _identifierName;

    /**
     * The file path of the location (as parsed from the stack trace)
     * @type {string|undefined}
     * @private
     */
    _fullFilePath;

    /**
     * The line number of the location.
     * @type {number|undefined}
     * @private
     */
    _line;

    /**
     * The column number of the location.
     * @type {number|undefined}
     * @private
     */
    _column;


    /**
     * Create a new instance of the LocationInfo class. Pass in the identifier,
     * file path, line number, and column number as paresed from the stack 
     * trace.
     * @param {string} identifier 
     * @param {string} filePath 
     * @param {number} lineNumber 
     * @param {number} [columnNumber=0] 
     */
    constructor(identifier, filePath, lineNumber, columnNumber = 0) {
        this._identifierName = identifier;
        this._fullFilePath = filePath;
        this._line = lineNumber;
        this._column = columnNumber;
    }

    /**
     * Get the full path the directory of the location.
     * @type {string|undefined}
     */
    get dirname() {
        return Path.dirname(this._fullFilePath);
    }

    /**
     * Get the <filename>.<ext> only, without the path.
     * @type {string|undefined}
     */
    get basename() {
        return Path.basename(this._fullFilePath);
    }

    /**
     * Get the line number of the location.
     * @type {number|undefined}
     */
    get line() {
        return this._line;
    }

    /**
     * Get the column number of the location.
     * @type {number|undefined}
     */
    get column() {
        return this._column;
    }

    /**
     * The (probable) module system as determined from the file path.
     * @type {'cjs'|'esm'|'internal'|'unknown'}
     */
    get moduleSystem() {
        const str = this.toString();
        if (str.includes(':')) {
            if (str.includes('://')) {
                //  if the frame represents a call in a user program
                // (using ES module system), or its dependencies.
                return 'esm';
            } else if (str.startsWith('/')) {
                // if the frame represents a call in a user program
                // (using CommonJS module system), or its dependencies.
                return 'cjs';
            } else {
                // if the frame represents a call internal to Node.js.
                return 'node-internal';
            }
        } 
        else if (str.includes('native')) {
            //  if the frame represents a call internal to V8
            return 'internal';
        } else {
            return 'unknown';
        }
    }

    /**
     * 
     * @returns {URL|null}
     */
    toURL() {
        switch (this.moduleSystem) {
            case 'cjs':
                return new URL(`file://${this._fullFilePath}`);
            case 'esm':
                return new URL(`${this._fullFilePath}`);
            case 'internal':
            case 'unknown':
                return null;
        }
    }

    /**
     * 
     * @returns {string|null}
     */
    toHref() {
        const maybeFileUrl = this.toURL();
        if (maybeFileUrl) {
            return maybeFileUrl.href;
        }
        return null;
    }

    /**
     * 
     * @returns {string|null}
     */
    toPath() {
        const maybeFileUrl = this.toURL();
        if (maybeFileUrl) {
            return fileURLToPath(maybeFileUrl);
        }
        return null;
    }
        

    /**
     * Get the <file>:<line>:<column> string representation of the location.
     * @type {string}
     */
    toString() {
        return `${this._identifierName} (${this._fullFilePath}:${this._line}:${this._column})`;
    }

    /**
     * Alias for `toString()`
     */
    valueOf() {
        return this.toString();
    }
    
    get [Symbol.toPrimitive]() {
        return (hint) => {
            switch (hint) {
                case 'number':
                    return Number(Boolean(this._fullFilePath && this._fullFilePath.length > 0));
                case 'string':
                default:
                    return this.toString();
            }
        }
    }

    get [Symbol.toStringTag]() {
        return 'LocationInfo';
    }
}

class Location {

    // STATICS

    static __parent = null;

    static staticClone() {
        return class extends Location {
            static __parent = Location.__parent;
            constructor(stackOffset = 0) {
                super(stackOffset + 1);
            }
        }
    }

    // STATIC

    /**
     * A global static array of file `location` hits.
     * @type { CallSiteLocation[] }
     * @private
     */
    static _hits = [];

    /**
     * Get the global static array of file `location` hits.
     * @type { CallSiteLocation[] }
     * @readonly
     * @static
     */
    static get hits() {
        return Location._hits;
    }

    /**
     * Get the `location` of where this function was invoked.
     * @param {number} [stackOffset=0] 
     * @returns {CallSiteLocation}
     */
    static getThisLocation = (stackOffset = 0) => {
        return _fileLocationFromStackFrame(stackOffset + 1);
    }

    /**
     * Print out the `locations` from within `hits` (to the console).
     * @returns {void}
     */
    static pinReport = () => {
        console.log(`<static> Location.hits:`);
        console.table(Location.hits);
    }

    /**
     * Save the file-location of where the function was invoked to the `hits` array.
     * @param {number} [stackOffset=0]
     * @returns {void}
     */
    static pinDrop = (stackOffset = 0) => {
        Location._hits.push(new Location(stackOffset + 1).originLocation);
    }

    /**
     * Create a new instance of the Location class.
     * @param {number} [stackOffset=0]
     */
    constructor(stackOffset = 0) {
        this._origin_location = Location.getThisLocation(stackOffset + 1);
    };


    // INSTANCE PROPERTIES

    /**
     * The location of where the instance was created.
     * @type { CallSiteLocation }
     * @private
     */
    _origin_location;

    /**
     * Get the location of where the instance was created.
     * @type { CallSiteLocation }
     */
    get originLocation() {
        return this._origin_location;
    }
}


/** 
 * A utility function to get matches and their indices from a string based on a regular expression
 * @param {string} str
 * @param {RegExp} regex
 * @returns { { match: string, start: number, end: number }[] }
 */
const _getRegexMatchesWithIndices = (str, regex) => {
    if (!regex.global) {
        // Create a new regex with the same pattern and original flags plus the global flag
        const flags = regex.flags + 'g';
        regex = new RegExp(regex.source, flags);
    }

    let match;
    const matches = [];
    while ((match = regex.exec(str)) !== null) {
        matches.push({
            match: match[0],
            start: match.index,
            end: match.index + match[0].length
        });
    }
    return matches;
}

/** 
 * Parses a single stack trace line to extract the file path, line number, and column number.
 * @param {string} line
 * @returns {CallSiteLocation}
 */
const _parseStackLine = (line) => {
    let stackLine = line.replace(/^\s*at /, "").trim();

    let identifier = "";
    let filePath = "";
    let lineNumber = "0";
    let columnNumber = "0";

    let numberParts = _getRegexMatchesWithIndices(stackLine, /:\d+/g);
    if (numberParts.length === 0) {
        // insert a ':0:0'
        const lastParen = stackLine.lastIndexOf(')');
        const insertIndex = lastParen > -1 ? lastParen : stackLine.length - 1;
        stackLine = `${stackLine.slice(0, insertIndex)}:0:0${stackLine.slice(insertIndex)}`;
        // re-parse the line
        numberParts = _getRegexMatchesWithIndices(stackLine, /:\d+/g);
    }
    else if (numberParts.length === 1) {
        // insert a ':0'
        stackLine = `${stackLine.slice(0, numberParts[0].end)}:0${stackLine.slice(numberParts[0].end)}`;
        // re-parse the line
        numberParts = _getRegexMatchesWithIndices(stackLine, /:\d+/g);
    }

    if (numberParts.length !== 2) {
        throw new Error(`Failed to parse stack line: ${stackLine}`);
    }
    else {
        lineNumber = numberParts[0].match.substring(1);
        columnNumber = numberParts[1].match.substring(1);
    }

    stackLine = stackLine.replace(`:${lineNumber}:${columnNumber}`, "");

    const firstOpenParen = stackLine.indexOf('(');
    const lastCloseParen = stackLine.lastIndexOf(')');
    const foundBothParens = (firstOpenParen > -1 && lastCloseParen > -1 && firstOpenParen < lastCloseParen);
    const fountNeitherParen = (firstOpenParen === -1 && lastCloseParen === -1);


    if (foundBothParens) {
        filePath = stackLine.substring(firstOpenParen + 1, lastCloseParen);
        stackLine = stackLine.replace(`(${filePath})`, "").trim();
    } else if (fountNeitherParen) {
        filePath = stackLine;
        stackLine = "";
    }

    identifier = stackLine === "" ? "<root>" : stackLine;

    return new CallSiteLocation(
        identifier, 
        filePath, 
        parseInt(lineNumber), 
        parseInt(columnNumber));
}

/** 
 * Extracts the stack frame location information based on an offset.
 * 
 * @todo Not tested with async functions.
 * 
 * @param {number} [stackOffset=0]
 * @returns { CallSiteLocation }
 */
const _fileLocationFromStackFrame = (stackOffset = 0) => {
    if (stackOffset === undefined || stackOffset === null || typeof stackOffset !== 'number') {
        stackOffset = 0;
    }
    // store temp
    const tempPrepFn = Error.prepareStackTrace;
    const tempLimit = Error.stackTraceLimit;

    const targetSiteNumber = stackOffset + 2;

    Error.stackTraceLimit = targetSiteNumber;
    // set the prepare stack trace function
    Error.prepareStackTrace = (_, stack) => stack;

    /** @type {NodeJS.CallSite} */
    const callSites = new Error().stack;

    const callSite = callSites[callSites.length - 1];

    const site = {
        columnNumber: callSite.getColumnNumber(),
        enclosingColumnNumber: callSite.getEnclosingColumnNumber(),
        enclosingLineNumber: callSite.getEnclosingLineNumber(),
        evalOrigin: callSite.getEvalOrigin(),
        fileName: callSite.getFileName(),
        _function: callSite.getFunction(),
        functionName: callSite.getFunctionName(),
        lineNumber: callSite.getLineNumber(),
        methodName: callSite.getMethodName(),
        position: callSite.getPosition(),
        promiseIndex: callSite.getPromiseIndex(),
        scriptHash: callSite.getScriptHash(),
        scriptNameOrSourceUrl: callSite.getScriptNameOrSourceURL(),
        _this: callSite.getThis(),
        typeName: callSite.getTypeName(),
        isAsync: callSite.isAsync(),
        isConstructor: callSite.isConstructor(),
        isEval: callSite.isEval(),
        isNative: callSite.isNative(),
        isPromiseAll: callSite.isPromiseAll(),
        isToplevel: callSite.isToplevel(),
        toString: callSite.toString()
    };

    // No longer needed?
    // const parsedLines = new Error().stack.split('\n')
    //     .slice(stackOffset + 2, stackOffset + 3)
    //     .map(_parseStackLine);

    // restore temp
    Error.prepareStackTrace = tempPrepFn;
    Error.stackTraceLimit = tempLimit;

    // return new CallSiteLocationInfo(
    //     parsedLines[0]._identifierName, 
    //     parsedLines[0]._fullFilePath, 
    //     parsedLines[0]._line, 
    //     parsedLines[0]._column
    // );
    return new CallSiteLocation(
        site.functionName || site.methodName || site.typeName || (site.isToplevel && Path.basename(site.scriptNameOrSourceUrl)) || "unknown",
        site.fileName, 
        site.lineNumber,
        site.columnNumber
    );
}

/**
 * Utility function that returns the filename where the function is invoked.
 * 
 * @returns {string} The file name.
 */
const getLogTag = (options = {filebase: true, dirbase: true, stackOffset: 0}) => {
    const opts = {
        filebase: options.filebase === undefined ? true : Boolean(options.filebase),
        dirbase: options.dirbase === undefined ? true : Boolean(options.dirbase),
        stackOffset: options.stackOffset === undefined ? 0 : Number(options.stackOffset)
    };
    const fullFilePath = _fileLocationFromStackFrame(opts.stackOffset + 1)._fullFilePath;
    const parts = [
        opts.dirbase ? Path.basename(Path.dirname(fullFilePath)) : "",
        opts.filebase ? Path.basename(fullFilePath) : "",
    ]

    return parts.filter(Boolean).join('/');
};


export default void 0;
export { 
    Location,
    getLogTag
};

if (DEBUG && process.env.DEBUG) { 
    console.log(`╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${logTag} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯`);
}
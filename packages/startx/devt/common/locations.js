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

import { basename } from "node:path";


const DEBUG = false;


class LocationInfo {
    /**
     * The identifier of the location.
     * @type {string}
     */
    identifier;

    /**
     * The file path of the location.
     * @type {string}
     */
    filePath;

    /**
     * The line number of the location.
     * @type {number}
     */
    lineNumber;

    /**
     * The column number of the location.
     * @type {number}
     */
    columnNumber;

    constructor(identifier, filePath, lineNumber, columnNumber) {
        this.identifier = identifier;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }


    get dirPath() {
        return Path.dirname(this.filePath);
    }

    get fileLine() {
        return this.lineNumber;
    }

    get fileColumn() {
        return this.columnNumber;
    }

    toString() {
        return `${this.identifier} (${this.filePath}:${this.lineNumber}:${this.columnNumber})`;
    }

    valueOf() {
        return this.toString();
    }
    
    get [Symbol.toPrimitive]() {
        return (hint) => {
            switch (hint) {
                case 'number':
                    return Number(Boolean(this.filePath && this.filePath.length > 0));
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

    /**
     * An array of file location hits.
     * @type { LocationInfo[] }
     * @private
     */
    static _hits = [];

    /**
     * Get the file location hits.
     * @type { LocationInfo[] }
     */
    static get hits() {
        return Location._hits;
    }

    /**
     * Get the file location of the calling function.
     * @param {number} [stackOffset=0] 
     * @returns {LocationInfo}
     */
    static getThisLocation = (stackOffset = 0) => {
        return _fileLocationFromStackFrame(stackOffset + 1);
    }

    /**
     * Print the file location hits to the console.
     */
    static report = () => {
        console.log(`<static> Location.hits:`);
        console.table(Location.hits);
    }

    /**
     * Add the file location of the calling function to the hits array.
     * @param {number} [stackOffset=0]
     * @returns {void}
     */
    static logThisLocation = (stackOffset = 0) => {
        Location._hits.push(new Location(stackOffset + 1).location);
    }

    constructor(stackOffset = 0) {
        this._location = Location.getThisLocation(stackOffset + 1);
    };

    /**
     * The location of where the instance was created.
     * @type { LocationInfo }
     */
    _location;
    get location() {
        return this._location;
    }
}


/** 
 * A utility function to get matches and their indices from a string based on a regular expression
 * @type { (str: string, regex: RegExp) => { match: string, start: number, end: number }[] }
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
 * @type { (line: string) => LocationInfo }
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

    return new LocationInfo(
        identifier, 
        filePath, 
        parseInt(lineNumber), 
        parseInt(columnNumber));
}

/** 
 * Extracts the stack frame location information based on an offset.
 * @param {number} [stackOffset=0]
 * @returns { LocationInfo }
 */
const _fileLocationFromStackFrame = (stackOffset = 0) => {
    if (stackOffset === undefined || stackOffset === null || typeof stackOffset !== 'number') {
        stackOffset = 0;
    }
    const parsedLines = new Error().stack.split('\n')
        .slice(stackOffset + 2, stackOffset + 3)
        .map(_parseStackLine);
    return new LocationInfo(
        parsedLines[0].identifier, 
        parsedLines[0].filePath, 
        parsedLines[0].lineNumber, 
        parsedLines[0].columnNumber
    );
}

/**
 * Returns the file name where the function is called.
 * @type { (stackOffset: number) => string }
 */
const getLogTag = (stackOffset = 0) => {
    return basename(_fileLocationFromStackFrame(stackOffset + 1).filePath)
};

const logTag = getLogTag();
if (DEBUG && process.env.DEBUG) {
    console.log(`DEBUG: File: ${logTag}`);
}


export default void 0;
export { 
    Location,
    getLogTag
};
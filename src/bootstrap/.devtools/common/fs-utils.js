import Path from 'node:path';

import fsSync from 'fs';
import fsAsync from 'fs/promises';

import JSON5 from 'json5';
import { parse as parseJsonc } from 'jsonc-parser';



const _DEBUG_ = true;

/** @type {(dirOrFilePathStr: string) => Promise<boolean>} */
export async function pathExistsAsync(dirOrFilePathStr) {
    try {
        const resolvedPath = Path.resolve(dirOrFilePathStr);
        await fsAsync.access(resolvedPath, fsAsync.constants.F_OK);
        return true;
    } catch (error) {
        if (_DEBUG_) {
            console.log(`fs-utils.pathExistsAsync() failed. Path: ${dirOrFilePathStr}\n${error}`);
        }
        return false;
    }
}

/** @type {(dirOrFilePathStr: string) => boolean} */
export function pathExistsSync(dirOrFilePathStr) {
    try {
        const resolvedPath = Path.resolve(dirOrFilePathStr);
        fsSync.accessSync(resolvedPath, fsSync.constants.F_OK);
        return true;
    } catch (error) {
        if (_DEBUG_) {
            console.log(`fs-utils.pathExistsSync() failed. Path: ${dirOrFilePathStr}\n${error}`);
        }
        return false;
    }
}

/** Read a file (async) and return the content as a string.
 * @param {string} strPathToFileWithExt
 * @returns {Promise<string>}
 * @throws {Error} when the file read fails
 */
export async function readFileAsync(strPathToFileWithExt) {
    try {
        if (!await pathExistsAsync(strPathToFileWithExt)) {
            throw new Error(`File not found: ${strPathToFileWithExt}`);
        }
        return await fsAsync.readFile(strPathToFileWithExt, 'utf8');
    }
    catch (error) {
        if (_DEBUG_) {
            console.log(`fs-utils.readFileAsync() failed. Path: ${strPathToFileWithExt}\n${error}`);
        }
        throw error;
    }
}

/** Read a file (sync) and return the content as a string.
 * @param {string} strPathToFileWithExt
 * @returns {string}
 * @throws {Error} when the file read fails
 */
export function readFileSync(strPathToFileWithExt) {
    try {
        if (!pathExistsSync(strPathToFileWithExt)) {
            throw new Error(`File not found: ${strPathToFileWithExt}`);
        }
        return fsSync.readFileSync(strPathToFileWithExt, 'utf8');
    }
    catch (error) {
        if (_DEBUG_) {
            console.log(`fs-utils.readFileSync() failed. Path: ${strPathToFileWithExt}\n${error}`);
        }
        throw error;
    }
}


/** Write a file (async).
 * @param {string} strPathToFileWithExt - the relative or absolute path to the file (including the file name and extension)
 * @param {string} strFileContent - the content to write to the file
 * @returns {Promise<void>}
 * @throws {Error} when the file write fails
 */
export async function writeFileAsync(strPathToFileWithExt, strFileContent) {
    try {
        await fsAsync.writeFile(strPathToFileWithExt, strFileContent);
    }
    catch (error) {
        if (_DEBUG_) {
            console.log(`fs-utils.writeFileAsync() failed. Path: ${strPathToFileWithExt}\n${error}`);
        }
        throw error;
    }
}

/** Write a file (sync).
 * @param {string} strPathToFileWithExt - the relative or absolute path to the file (including the file name and extension)
 * @param {string} strFileContent - the content to write to the file
 * @returns {void}
 * @throws {Error} when the file write fails
 */
export function writeFileSync(strPathToFileWithExt, strFileContent) {
    try {
        fsSync.writeFileSync(strPathToFileWithExt, strFileContent);
    }
    catch (error) {
        if (_DEBUG_) {
            console.log(`fs-utils.writeFileSync() failed. Path: ${strPathToFileWithExt}\n${error}`);
        }
        throw error;
    }
}


/**
 * 
 * @typedef {'JSON'|'JSONC'|'JSON5'} FileTypeEnumKeys
 * - the keys of the enum
 * 
 * @typedef {'json'|'jsonc'|'json5'} FileTypeEnumExtensions
 * - the values of the enum
 * 
 * @typedef { {[sym in FileTypeEnumKeys]: FileTypeEnumKeys} } JsonFileTypeNames
 * maps the symbols to the keys
 * 
 * @typedef { {[sym in FileTypeEnumKeys]: FileTypeEnumExtensions} } JsonFileTypeExtensions
 * maps the symbols to the values
 */

/**
 * @typedef {Object} JsonFileCtorOpts
 * @property {string} [fileDir]
 * @property {string} [fileName]
 * @property {FileTypeEnumKeys} [fileType]
 * @property {object|any[]|string|null|undefined} [fileContent]
 */

export class JsonFile {

    /** @type {JsonFileTypeNames} */
    static get TypeName() {
        return {
            JSON: 'JSON',
            JSONC: 'JSONC',
            JSON5: 'JSON5',
        };
    };

    /** @type {FileTypeEnumKeys[]} */
    static get validTypes() {
        return Object.values(JsonFile.TypeName);
    }

    /** @type {JsonFileTypeExtensions} */
    static get TypeExtension() {
        return {
            JSON: 'json',
            JSONC: 'jsonc',
            JSON5: 'json5',
        };
    };

    /** @type {FileTypeEnumExtensions[]} */
    static get validExtensions() {
        return Object.values(JsonFile.TypeExtension);
    }

    /** @type {Required<JsonFileCtorOpts>} */
    static get _defaultOptions() {
        return Object.assign(new Object(), {
            fileDir: './',
            fileName: '.temp',
            fileType: JsonFile.TypeName.JSON,
            fileContent: {},
        });
    }


    /** Parse plain JSON content
     * @param {string} stringFileContent the string content of the file to parse
     * @returns {object|any[]} if parsing is successful
     * @throws {Error} when parsing fails
     */
    static parseJson(stringFileContent) {
        try {
            return JSON.parse(stringFileContent);
        }
        catch (error) {
            if (_DEBUG_) {
                console.log(`JsonFile.parseJson() failed. Content:\n${stringFileContent}\n${error}`);
            }
            throw error;
        }
    }

    /** Parse JSONC content
     * @param {string} stringFileContent the string content of the file to parse
     * @returns {object|any[]} if parsing is successful
     * @throws {Error} when parsing fails
     */
    static parseJsonC(stringFileContent) {
        try {
            return parseJsonc(stringFileContent);
        }
        catch (error) {
            if (_DEBUG_) {
                console.log(`JsonFile.parseJsonC() failed. Content:\n${stringFileContent}\n${error}`);
            }
            throw error;
        }
    }

    /** Parse JSON5 content
     * @param {string} stringFileContent the string content of the file to parse
     * @returns {object|any[]} if parsing is successful
     * @throws {Error} when parsing fails
     */
    static parseJson5(stringFileContent) {
        try {
            return JSON5.parse(stringFileContent);
        }
        catch (error) {
            if (_DEBUG_) {
                console.log(`JsonFile.parseJson5() failed. Content:\n${stringFileContent}\n${error}`);
            }
            throw error;
        }
    }

    /**
     * @param {JsonFileCtorOpts | ((originOptions: JsonFileCtorOpts) => JsonFileCtorOpts) } [options]
     * @returns {JsonFile}
     */
    cloneStateless(options) {
        const _options = (typeof options === 'function')
            ? options(this.#options)
            : options;
        return new JsonFile(Object.assign(new Object(), this.#options, _options));
    }

    /**
     * @param {JsonFileCtorOpts | ((originOptions: JsonFileCtorOpts) => JsonFileCtorOpts) } [options]
     * @returns {JsonFile}
     */
    cloneStateful(options) {
        const clone = this.cloneStateless(options);
        clone.state = Object.assign(new Object(), this.state);
        return clone;
    }


    /**
     * @param {JsonFileCtorOpts} [options]
     */
    constructor(options) {
        this.#options = JsonFile._tryNormalizeOptions(options);

        if (this.#options.fileContent) {

            switch (typeof this.#options.fileContent) {
                case 'object':
                    this.state.rawMaybeValidStr = undefined;
                    this.state.confirmedValidStr = JSON.stringify(this.#options.fileContent);
                    this.state.parsedContent = this.#options.fileContent;
                    break;
                case 'string':
                    this.state.rawMaybeValidStr = this.#options.fileContent;
                    this.state.confirmedValidStr = undefined;
                    this.state.parsedContent = undefined;
                    break;
                default:
                    throw new Error('Unsupported file content type');

            }

        }

    }

    /** @type {Object & JsonFileCtorOpts} */
    #options;

    /**
     * @type {{
     *     rawMaybeValidStr: string|undefined,
     *     confirmedValidStr: string|undefined,
     *     parsedContent: object|any[]|undefined
     * }}
     */
    state = Object.assign(new Object(), {
        rawMaybeValidStr: undefined,
        confirmedValidStr: undefined,
        parsedContent: undefined
    });

    /** Concatenate the file directory, name, and extension. Does not resolve the path.
     * @type {string} */
    get pathNameExt() {
        if (!this.#options || !this.#options.fileDir || !this.#options.fileName || !this.#options.fileType) {
            throw new Error('Missing required options');
        }
        return Path.join(this.#options.fileDir,
            `${this.#options.fileName}.${JsonFile.TypeExtension[this.#options.fileType]}`);
    }

    /** Chainable `readIn` - does not throw on error 
     * @returns {JsonFile} for chaining
     */
    readIn() {
        try {
            this.state.rawMaybeValidStr = readFileSync(this.pathNameExt);
        }
        catch (error) {
            if (_DEBUG_) {
                console.log(`JsonFile.read() failed. Path: ${this.pathNameExt}\n${error}`);
            }
        }
        return this; // for chaining
    }

    /** Chainable `writeOut` - does not throw on error 
     * @returns {JsonFile} for chaining
     */
    writeOut() {
        try {
            if (this.state.confirmedValidStr && this.state.parsedContent !== undefined) {
                const pretty = JSON.stringify(this.state.parsedContent, null, 4);
                writeFileSync(this.pathNameExt, pretty);
            }
            else {
                console.log(this.state);

                throw new Error('Invalid state. Cannot write out.');
            }
        }
        catch (error) {
            if (_DEBUG_) {
                console.log(`JsonFile.write() failed. Path: ${this.pathNameExt}\n${error}`);
            }
        }
        return this; // for chaining
    }

    /** Chainable `parse` - does not throw on error
     * @description
     * - Attempts to parse the raw content.
     * - If successful, sets the confirmed valid string.
     * - If unsuccessful, sets the parsed content to undefined.
     * - Assumes the raw content has already been read from storage.
     * @returns {JsonFile} for chaining
     */
    parse() {
        if (this.state.confirmedValidStr) {
            // done, already parsed!
        }
        else if (!this.state.rawMaybeValidStr) {
            if (_DEBUG_) {
                console.log(`JsonFile.parse() failed. Missing raw content.`);
            }
            this.state.confirmedValidStr = undefined;
        }
        else {
            try {
                switch (this.#options.fileType) {
                    case JsonFile.TypeName.JSON:
                        this.state.parsedContent = JsonFile.parseJson(this.state.rawMaybeValidStr);
                        this.state.confirmedValidStr = this.state.rawMaybeValidStr;
                        break;
                    case JsonFile.TypeName.JSONC:
                        this.state.parsedContent = JsonFile.parseJsonC(this.state.rawMaybeValidStr);
                        this.state.confirmedValidStr = this.state.rawMaybeValidStr;
                        break;
                    case JsonFile.TypeName.JSON5:
                        this.state.parsedContent = JsonFile.parseJson5(this.state.rawMaybeValidStr);
                        this.state.confirmedValidStr = this.state.rawMaybeValidStr;
                        break;
                    default:
                        throw new Error(`Unsupported file type: ${this.#options.fileType}`);
                }
            } catch (error) {
                if (_DEBUG_) {
                    console.log(`JsonFile.parse() failed. Content:\n${this.state.rawMaybeValidStr}\n${error}`);
                }
                this.state.parsedContent = undefined;
                this.state.confirmedValidStr = undefined;
            }
        }

        return this; // for chaining
    }

    /** @type {import('type-fest').JsonObject} */
    get parsedContent() {
        // @ts-expect-error - the content was already parsed
        return this.state.parsedContent;
    }

    get confirmedValidStr() {
        return this.state.confirmedValidStr;
    }

    /**
     * @param {string|undefined} string 
     * @returns {boolean}
     */
    static _endsWithValidExtension(string) {
        const _string = (string || '').toLowerCase();
        return JsonFile.validExtensions
            .map(ext => `.${ext}`)
            .some(dotExt => _string.endsWith(dotExt));
    }

    /**
     * @param {string|undefined} fileNameExt - the extension (with or without the file name or dot)
     * @returns {FileTypeEnumKeys}
     * @throws {Error} when the extension is not recognized
     */
    static _typeEnumFromExt(fileNameExt) {
        if (fileNameExt === undefined || typeof fileNameExt !== 'string' || fileNameExt.trim() === '') {
            throw new Error('Reverse enum lookup: Empty file extension.');
        }
        const ext = (fileNameExt.includes('.')
            ? fileNameExt.split('.').pop() || ''
            : fileNameExt).toLowerCase();
        if (ext === '' || !JsonFile.validExtensions.some(validExt => validExt === ext)) {
            throw new Error(`Reverse enum lookup: '${ext}' is not a recognized file extension.`);
        }
        const type = JsonFile.validTypes.find(key => JsonFile.TypeExtension[key] === ext);
        if (type === undefined) {
            throw new Error(`Reverse enum lookup: Unknown file extension: ${ext}`);
        }
        return type;
    }

    /**
     * Try to normalize the options, and infer the file type when possible.
     * @param {JsonFileCtorOpts} [options]
     * @returns {JsonFileCtorOpts}
     * @throws {Error} When there is insufficient information to create a valid set of options
     */
    static _tryNormalizeOptions(options) {
        const _options = Object.assign(new Object(), options)

        const _fileNameEndsWithValidExtension = this._endsWithValidExtension(_options.fileName);
        let _gotTypeFromFileName = false;

        const _fileDirEndsWithValidExtension = this._endsWithValidExtension(_options.fileDir);
        let _gotTypeFromFileDir = false;

        try {
            if (_options.fileType && JsonFile.validTypes.includes(_options.fileType)) {
                // all good
            }
            else if (_options.fileName && _fileNameEndsWithValidExtension) {
                _options.fileType = this._typeEnumFromExt(_options.fileName.split('.').pop());
                _gotTypeFromFileName = true;
            }
            else if (_options.fileDir && _fileDirEndsWithValidExtension) {
                _options.fileType = this._typeEnumFromExt(_options.fileDir.split('.').pop());
                _gotTypeFromFileDir = true;
            }
            else {
                throw new Error('Could not determine file type from options');
            }
            // still here? then we have a valid type, and where it came from

            if (_fileNameEndsWithValidExtension && _gotTypeFromFileName) {
                // remove the last n characters from the file name, to the last dot
                _options.fileName = (_options.fileName || '').slice(0, (_options.fileName || '').lastIndexOf('.'));
            }
            if (_fileDirEndsWithValidExtension && _gotTypeFromFileDir) {
                // remove the last n characters from the file dir, to the last dot
                _options.fileDir = (_options.fileDir || '').slice(0, (_options.fileDir || '').lastIndexOf('.'));
            }

            const onlyPathAndName = Path.join(
                (_options.fileDir || JsonFile._defaultOptions.fileDir),
                (_options.fileName || JsonFile._defaultOptions.fileName)
            );
            _options.fileName = Path.basename(onlyPathAndName);
            _options.fileDir = Path.dirname(onlyPathAndName);

            _options.fileContent = options ? options.fileContent : undefined;

        } catch (error) {
            if (_DEBUG_) {
                console.log(`JsonFile._normalizeOptions() failed.\n${error}`);
            }
            throw error;
        }

        return _options;

    }

}
"use strict";
// file: src/utils/FileHandler.ts
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const lockfile = __importStar(require("lockfile"));
const EnvConf_cjs_1 = require("../../../dev/EnvConf.cjs");
// Purpose: 
// - We are attempting to read and write to files owned by vscode, so
// - we need to be cautious about how we handle these files.
/**
 * A class that provides file handling with a lock file to prevent concurrent
 * read/write operations on the same file.
 *
 * @note This class is a singleton and must be initialized before use.
 * @note Not optimized for multiple sequential reads or writes. Use with caution.
 * @note The lockfile library gracefully handles lock files on process terminations.
 *
 * @example Initialize the FileHandler singleton instance:
 * ```typescript
 * const fileHandler = FileHandler.initOnce({
 *    lockFileOptions: { retries: 5, retryWait: 100 }
 * });
 * ```
 */
class FileHandler {
    /** Private constructor - invoked via initOnce() */
    constructor(options) {
        this._lockFileOptions = options.lockFileOptions;
    }
    /**
     * Initializes the FileHandler singleton instance.
     * @param options The options to use for the FileHandler.
     * @returns The initialized FileHandler instance.
     * @throws Error if the FileHandler is already initialized.
     * @note This method must be called before using the FileHandler.
     */
    static initOnce(options) {
        if (FileHandler._initialized || FileHandler._instance !== null) {
            throw FileHandler.error('instance', 'init', new Error('Already initialized, cannot reinitialize'));
        }
        FileHandler._instance = new FileHandler(options);
        FileHandler._initialized = true;
        return FileHandler.instance;
    }
    /**
     * Returns the singleton instance of the FileHandler.
     * @returns The FileHandler instance.
     * @throws Error if the FileHandler is not initialized.
     * @note Call init() attempting to access the FileHandler instance.
     */
    static get instance() {
        if (!FileHandler._initialized || FileHandler._instance === null) {
            throw FileHandler.error('instance', 'get', new Error('Not yet initialized, call init() first'));
        }
        return FileHandler._instance;
    }
    /**
     * Acquires a lock on a file.
     * @returns A promise that resolves when the lock is acquired.
     */
    acquireLock(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const _lockFilePath = FileHandler.getLockFilePath(filePath);
            return new Promise((resolve, reject) => {
                lockfile.lock(_lockFilePath, this._lockFileOptions, (err) => {
                    if (err) {
                        reject(FileHandler.error('lock', `acquire\n\tfile: ${filePath}`, err));
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Releases a lock on a file.
     * @returns A promise that resolves when the lock is released.
     */
    releaseLock(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const _lockFilePath = FileHandler.getLockFilePath(filePath);
            return new Promise((resolve, reject) => {
                lockfile.unlock(_lockFilePath, (err) => {
                    if (err) {
                        reject(FileHandler.error('lock', `release\n\tfile: ${filePath}`, err));
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Writes data to a file (with caution - using a lock file).
     * @param filePath The path to the file to write.
     * @param data The data to write to the file.
     * @param encoding Default is 'utf8'.
     * @throws Error if the file could not be written, or if the lock could not be acquired or released.
     * @note Not optimized for multiple sequential writes. Use with caution.
     */
    cautiousWriteFile(filePath_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (filePath, data, encoding = 'utf8') {
            try {
                yield this.acquireLock(filePath);
                yield fs_extra_1.default.writeFile(filePath, data, encoding);
            }
            catch (err) {
                throw FileHandler.error('file', `write\n\tfile: ${filePath}`, err);
            }
            finally {
                yield this.releaseLock(filePath);
            }
        });
    }
    /**
     * Reads data from a file (with caution - using a lock file)
     * @param filePath The path to the file to read.
     * @param encoding Default is 'utf8'.
     * @returns Returns the file content as a string.
     * @throws Error if the file could not be read, or if the lock could not be acquired or released.
     * @note Not optimized for multiple sequential reads. Use with caution.
     */
    cautiousReadFile(filePath_1) {
        return __awaiter(this, arguments, void 0, function* (filePath, encoding = 'utf8') {
            try {
                yield this.acquireLock(filePath);
                return yield fs_extra_1.default.readFile(filePath, encoding);
            }
            catch (err) {
                throw FileHandler.error('file', `read\n\tfile: ${filePath}`, err);
            }
            finally {
                yield this.releaseLock(filePath);
            }
        });
    }
    static getLockFilePath(filePath) {
        // Simple strategy: append ".lock" to the original file path. Adjust as needed.
        return `${filePath}.lock`;
    }
    static error(duringOp, failedTo, error) {
        let message = `[FileHandler] Error: During ${duringOp} failed to ${failedTo}\n\tError: '${error.message}'`;
        if (EnvConf_cjs_1._isDebug_) {
            message += `\n\tStack: ${error.stack}`;
        }
        return new Error(`[FileHandler] Error: During ${duringOp} failed to ${failedTo}\n\t'${error.message}'`);
    }
}
exports.FileHandler = FileHandler;
/** When true, returned errors include stack trace */
FileHandler._debug = false;
FileHandler._instance = null;
/** Turns true once initOnce() is called with init options */
FileHandler._initialized = false;

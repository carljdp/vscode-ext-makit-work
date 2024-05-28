// file: src/utils/FileHandler.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FileHandler", {
    enumerable: true,
    get: function() {
        return FileHandler;
    }
});
const _fsextra = /*#__PURE__*/ _interop_require_default(require("fs-extra"));
const _lockfile = /*#__PURE__*/ _interop_require_wildcard(require("lockfile"));
const _EnvConf = require("../dev/EnvConf.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
class FileHandler {
    /** When true, returned errors include stack trace */ static _debug = false;
    static _instance = null;
    /** Turns true once initOnce() is called with init options */ static _initialized = false;
    /** The options to use when acquiring the lock. */ _lockFileOptions;
    /** Private constructor - invoked via initOnce() */ constructor(options){
        this._lockFileOptions = options.lockFileOptions;
    }
    /**
     * Initializes the FileHandler singleton instance.
     * @param options The options to use for the FileHandler.
     * @returns The initialized FileHandler instance.
     * @throws Error if the FileHandler is already initialized.
     * @note This method must be called before using the FileHandler.
     */ static initOnce(options) {
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
     */ static get instance() {
        if (!FileHandler._initialized || FileHandler._instance === null) {
            throw FileHandler.error('instance', 'get', new Error('Not yet initialized, call init() first'));
        }
        return FileHandler._instance;
    }
    /**
     * Acquires a lock on a file.
     * @returns A promise that resolves when the lock is acquired.
     */ async acquireLock(filePath) {
        const _lockFilePath = FileHandler.getLockFilePath(filePath);
        return new Promise((resolve, reject)=>{
            _lockfile.lock(_lockFilePath, this._lockFileOptions, (err)=>{
                if (err) {
                    reject(FileHandler.error('lock', `acquire\n\tfile: ${filePath}`, err));
                } else {
                    resolve();
                }
            });
        });
    }
    /**
     * Releases a lock on a file.
     * @returns A promise that resolves when the lock is released.
     */ async releaseLock(filePath) {
        const _lockFilePath = FileHandler.getLockFilePath(filePath);
        return new Promise((resolve, reject)=>{
            _lockfile.unlock(_lockFilePath, (err)=>{
                if (err) {
                    reject(FileHandler.error('lock', `release\n\tfile: ${filePath}`, err));
                } else {
                    resolve();
                }
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
     */ async cautiousWriteFile(filePath, data, encoding = 'utf8') {
        try {
            await this.acquireLock(filePath);
            await _fsextra.default.writeFile(filePath, data, encoding);
        } catch (err) {
            throw FileHandler.error('file', `write\n\tfile: ${filePath}`, err);
        } finally{
            await this.releaseLock(filePath);
        }
    }
    /**
     * Reads data from a file (with caution - using a lock file)
     * @param filePath The path to the file to read.
     * @param encoding Default is 'utf8'.
     * @returns Returns the file content as a string.
     * @throws Error if the file could not be read, or if the lock could not be acquired or released.
     * @note Not optimized for multiple sequential reads. Use with caution.
     */ async cautiousReadFile(filePath, encoding = 'utf8') {
        try {
            await this.acquireLock(filePath);
            return await _fsextra.default.readFile(filePath, encoding);
        } catch (err) {
            throw FileHandler.error('file', `read\n\tfile: ${filePath}`, err);
        } finally{
            await this.releaseLock(filePath);
        }
    }
    static getLockFilePath(filePath) {
        // Simple strategy: append ".lock" to the original file path. Adjust as needed.
        return `${filePath}.lock`;
    }
    static error(duringOp, failedTo, error) {
        let message = `[FileHandler] Error: During ${duringOp} failed to ${failedTo}\n\tError: '${error.message}'`;
        if (_EnvConf._isDebug_) {
            message += `\n\tStack: ${error.stack}`;
        }
        return new Error(`[FileHandler] Error: During ${duringOp} failed to ${failedTo}\n\t'${error.message}'`);
    }
}

//# sourceMappingURL=FileHandler.js.map
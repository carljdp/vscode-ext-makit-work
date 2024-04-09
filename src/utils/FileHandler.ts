// file: src/utils/FileHandler.ts

import fs from 'fs-extra';
import * as lockfile from 'lockfile';

import { _isDebug_ } from '../common/Environment';

import { storageService } from '../services';

export interface FileHandlerOptions {
    lockFileOptions: lockfile.Options;
}

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
export class FileHandler {
    /** When true, returned errors include stack trace */
    public static _debug: boolean = false;

    private static _instance: FileHandler | null = null;

    /** Turns true once initOnce() is called with init options */
    private static _initialized: boolean = false;

    /** The options to use when acquiring the lock. */
    private _lockFileOptions: lockfile.Options;

    /** Private constructor - invoked via initOnce() */
    private constructor(options: FileHandlerOptions) {
        this._lockFileOptions = options.lockFileOptions;
    }

    /**
     * Initializes the FileHandler singleton instance.
     * @param options The options to use for the FileHandler.
     * @returns The initialized FileHandler instance.
     * @throws Error if the FileHandler is already initialized.
     * @note This method must be called before using the FileHandler.
     */
    public static initOnce(options: FileHandlerOptions): FileHandler | never {
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
    public static get instance(): FileHandler | never {
        if (!FileHandler._initialized || FileHandler._instance === null) {
            throw FileHandler.error('instance', 'get', new Error('Not yet initialized, call init() first'));
        }
        return FileHandler._instance;
    }

    /**
     * Acquires a lock on a file.
     * @returns A promise that resolves when the lock is acquired.
     */
    private async acquireLock(filePath: string): Promise<void> {
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
    }

    /**
     * Releases a lock on a file.
     * @returns A promise that resolves when the lock is released.
     */
    private async releaseLock(filePath: string): Promise<void> {
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
    }

    /**
     * Writes data to a file (with caution - using a lock file).
     * @param filePath The path to the file to write.
     * @param data The data to write to the file.
     * @param encoding Default is 'utf8'.
     * @throws Error if the file could not be written, or if the lock could not be acquired or released.
     * @note Not optimized for multiple sequential writes. Use with caution.
     */
    async cautiousWriteFile(filePath: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
        try {
            await this.acquireLock(filePath);
            await fs.writeFile(filePath, data, encoding);
        } catch (err) {
            throw FileHandler.error('file', `write\n\tfile: ${filePath}`, err as Error);
        } finally {
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
     */
    async cautiousReadFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
        try {
            await this.acquireLock(filePath);
            return await fs.readFile(filePath, encoding);
        } catch (err) {
            throw FileHandler.error('file', `read\n\tfile: ${filePath}`, err as Error);
        } finally {
            await this.releaseLock(filePath);
        }
    }

    private static getLockFilePath(filePath: string): string {
        // Simple strategy: append ".lock" to the original file path. Adjust as needed.
        return `${filePath}.lock`;
    }

    private static error(duringOp: string, failedTo: string, error: Error): Error {
        let message = `[FileHandler] Error: During ${duringOp} failed to ${failedTo}\n\tError: '${error.message}'`;

        if (_isDebug_) {
            message += `\n\tStack: ${error.stack}`;
        }

        return new Error(`[FileHandler] Error: During ${duringOp} failed to ${failedTo}\n\t'${error.message}'`);
    }
}

// file: src/services/StorageService.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StorageService", {
    enumerable: true,
    get: function() {
        return StorageService;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _fsextra = /*#__PURE__*/ _interop_require_default(require("fs-extra"));
const _Service = require("../common/Service");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class StorageService extends _Service.Service {
    // static fileCache = new Map<string, Record<string, any>>();
    constructor(key){
        super();
        this.instanceKey = Symbol.for(key || 'Storage');
    }
    cwd() {
        return process.cwd();
    }
    // static async memoizedReadFile(filePath: string): Promise<string> {
    //     const currentHash = await StorageService.calculateFileHash(filePath);
    //     if (StorageService.fileCache.has(filePath) && StorageService.fileCache.get(filePath) === currentHash) {
    //         console.log('File unchanged. Using cached data.');
    //         return; // Assuming you store the file content somewhere or have another method to return cached content
    //     }
    //     fs.readFile(filePath, 'utf8', (err, data) => {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }
    //         // Update the cache with the latest hash
    //         fileCache.set(filePath, currentHash);
    //         // Here you would normally process the file data and possibly cache it as well
    //         console.log(data);
    //     });
    // }
    // static async calculateFileHash(filePath: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         const hash = crypto.createHash('sha256');
    //         const stream = fs.createReadStream(filePath);
    //         stream.on('data', (chunk) => {
    //             hash.update(chunk);
    //         });
    //         stream.on('end', () => {
    //             resolve(hash.digest('hex'));
    //         });
    //         stream.on('error', (err) => {
    //             reject(err);
    //         });
    //     });
    // }
    async fileSize(location, name, factor = 1, fallback = 4096) {
        try {
            const pathToFile = _path.default.join(location, name);
            const stats = await _fsextra.default.stat(pathToFile);
            return stats.size;
        } catch (error) {
            this.instanceError('fileSize', 'get file size', error);
            return fallback;
        }
    }
    async readFile(location, name, byRefBuffer, encoding = 'utf8') {
        try {
            const pathToFile = _path.default.join(location, name);
            const fileData = await _fsextra.default.readFile(pathToFile, {
                encoding: encoding,
                flag: 'r'
            });
            byRefBuffer.set(Buffer.from(fileData, 'utf8'));
            return true;
        } catch (error) {
            this.instanceError('readFile', 'read file', error);
            return false;
        }
    }
    async writeFile(location, name, byRefBuffer, encoding = 'utf8') {
        let result = false;
        try {
            const pathToFile = _path.default.join(location, name);
            await _fsextra.default.writeFile(pathToFile, byRefBuffer, {
                encoding: encoding,
                flag: 'w'
            });
            result = true;
        } catch (error) {
            this.instanceError('writeFile', 'write file', error);
        }
        return result;
    }
}

//# sourceMappingURL=StorageService.js.map
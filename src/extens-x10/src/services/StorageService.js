"use strict";
// file: src/services/StorageService.ts
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
exports.StorageService = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const Service_1 = require("../../common/Service");
class StorageService extends Service_1.Service {
    // static fileCache = new Map<string, Record<string, any>>();
    constructor(key) {
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
    fileSize(location_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (location, name, factor = 1, fallback = 4096) {
            try {
                const pathToFile = path_1.default.join(location, name);
                const stats = yield fs_extra_1.default.stat(pathToFile);
                return stats.size;
            }
            catch (error) {
                this.instanceError('fileSize', 'get file size', error);
                return fallback;
            }
        });
    }
    readFile(location_1, name_1, byRefBuffer_1) {
        return __awaiter(this, arguments, void 0, function* (location, name, byRefBuffer, encoding = 'utf8') {
            try {
                const pathToFile = path_1.default.join(location, name);
                const fileData = yield fs_extra_1.default.readFile(pathToFile, {
                    encoding: encoding,
                    flag: 'r',
                });
                byRefBuffer.set(Buffer.from(fileData, 'utf8'));
                return true;
            }
            catch (error) {
                this.instanceError('readFile', 'read file', error);
                return false;
            }
        });
    }
    writeFile(location_1, name_1, byRefBuffer_1) {
        return __awaiter(this, arguments, void 0, function* (location, name, byRefBuffer, encoding = 'utf8') {
            let result = false;
            try {
                const pathToFile = path_1.default.join(location, name);
                yield fs_extra_1.default.writeFile(pathToFile, byRefBuffer, {
                    encoding: encoding,
                    flag: 'w'
                });
                result = true;
            }
            catch (error) {
                this.instanceError('writeFile', 'write file', error);
            }
            return result;
        });
    }
}
exports.StorageService = StorageService;

// file: src/services/StorageService.ts

import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';

import { IService, Service } from '../common/Service';


interface IStorageService extends IService {

    // instance members common to all storage-like things

    cwd(): string;

    // sepertor(): string;

    readFile(location: string, name: string, data: Uint8Array): Promise<boolean>;

    writeFile(location: string, name: string, data: Uint8Array): Promise<boolean>;

}

class StorageService extends Service implements IStorageService {

    // static fileCache = new Map<string, Record<string, any>>();

    public constructor(key?: string) {
        super();
        this.instanceKey = Symbol.for(key || 'Storage');
    }

    public cwd(): string {
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

    public async fileSize(location: string, name: string, factor: number = 1, fallback: number = 4096): Promise<number> {
        try {
            const pathToFile = path.join(location, name);
            const stats = await fs.stat(pathToFile);
            return stats.size;
        } catch (error) {
            this.instanceError('fileSize', 'get file size', error as Error);
            return fallback;
        }
    }

    public async readFile(location: string, name: string, byRefBuffer: Buffer, encoding: BufferEncoding = 'utf8'): Promise<boolean> {
        try {
            const pathToFile = path.join(location, name);
            const fileData = await fs.readFile(pathToFile, {
                encoding: encoding,
                flag: 'r',
            });
            byRefBuffer.set(Buffer.from(fileData, 'utf8'));
            return true;
        } catch (error) {
            this.instanceError('readFile', 'read file', error as Error);
            return false;
        }
    }

    public async writeFile(location: string, name: string, byRefBuffer: Buffer, encoding: BufferEncoding = 'utf8'): Promise<boolean> {
        let result = false;
        try {
            const pathToFile = path.join(location, name);
            await fs.writeFile(pathToFile, byRefBuffer, {
                encoding: encoding,
                flag: 'w'
            });
            result = true;
        } catch (error) {
            this.instanceError('writeFile', 'write file', error as Error);
        }
        return result;
    }

}

export { IStorageService, StorageService };
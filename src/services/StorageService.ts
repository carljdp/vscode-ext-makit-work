// file: src/services/StorageService.ts

import path from 'path';
import fs from 'fs-extra';

import { IService, Service } from '../common/Service';


interface IStorageService extends IService {

    // instance members common to all storage-like things

    cwd(): string;

    // sepertor(): string;

    readFile(location: string, name: string, data: Uint8Array): Promise<boolean>;

    writeFile(location: string, name: string, data: Uint8Array): Promise<boolean>;

}

class StorageService extends Service implements IStorageService {

    public constructor(key?: string) {
        super();
        this.instanceKey = Symbol.for(key || 'Storage');
    }

    public cwd(): string {
        return process.cwd();
    }

    public async readFile(location: string, name: string, buffer: Uint8Array): Promise<boolean> {
        try {
            const pathToFile = path.join(location, name);
            const newData = await fs.readFile(pathToFile);
            const combinedData = new Uint8Array(buffer.length + newData.length);
            combinedData.set(buffer, 0);
            combinedData.set(newData, buffer.length);
            // replace the original data with the combined data
            buffer.set(combinedData);
            return true;
        } catch (error) {
            this.instanceError('readFile', 'read file', error as Error);
            return false;
        }
    }

    public async writeFile(location: string, name: string, buffer: Uint8Array): Promise<boolean> {
        let result = false;
        try {
            const pathToFile = path.join(location, name);
            await fs.writeFile(pathToFile, buffer, {
                encoding: 'utf8', // default: 'utf8'
                flag: 'w', // default: 'w'
                mode: 0o666, // default: 0o666 (owner:rw-, group:rw-, others:rw-)
            });
            result = true;
        } catch (error) {
            this.instanceError('writeFile', 'write file', error as Error);
        }
        return result;
    }

}

export { IStorageService, StorageService };
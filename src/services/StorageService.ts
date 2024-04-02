// file: src/services/StorageService.ts

import fs from 'fs-extra';

import { IOrigin, Origin } from '../common/Origin';
import { IService, Service } from '../common/Service';
import { ISingleton, Singleton } from '../common/Singleton';


interface IStorage extends IOrigin {

    // instance members common to all storage-like things

    cwd(): string;
    // pwd(): string;

    // sepertor(): string;

    // readFile(location: string, name: string, encoding: string, data: string): string | Error;

    // writeFile(location: string, name: string, encoding: string, data: string): string | Error;

}

class Storage extends Origin implements IStorage {

    public constructor() {
        super();
        this.instanceKey = Symbol.for("Storage");
    }

    public cwd(): string {
        return process.cwd();
    }

}

export { IStorage, Storage };
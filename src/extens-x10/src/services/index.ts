

import { Service } from '../../../common/Service';
import { Registry } from '../../../common/Registry';

import { StorageService } from './StorageService';


const services = new Registry<Service>();

const storageServiceKey = services.register(new StorageService());

export const storageService = services.getAs<StorageService>(storageServiceKey);



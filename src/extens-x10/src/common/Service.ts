


import { _isProd_, _isDev_, _isDebug_ } from '../dev/EnvConf.js';

import { ISingleton, Singleton } from './Singleton';


interface IService extends ISingleton {

    // props common to all services

}

abstract class Service extends Singleton implements IService {

    // implementation common to all services

    public constructor(key?: string) {
        super();
        this.instanceKey = Symbol.for(key || 'Service');
    }

}

export { IService, Service };
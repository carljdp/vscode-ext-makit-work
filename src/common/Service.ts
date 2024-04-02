


import { _isDebug_ } from './Environment';

import { IOrigin, Origin } from './Origin';
import { ISingleton, Singleton } from './Singleton';


interface IService extends ISingleton {

    // props common to all services

}

abstract class Service extends Singleton implements IService {

    // implementation common to all services

    public constructor() {
        super();
        this.instanceKey = Symbol.for(`AbstractService`);
    }

}

export { IService, Service };
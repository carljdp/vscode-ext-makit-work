// file src/common/Singleton.ts


import { IOrigin, Origin } from './Origin';


interface ISingleton extends IOrigin {

    // instance members common to all singletons

    /** Symbol key for the singleton instance */
    instanceKey: Required<Readonly<Symbol>>;

}

abstract class Singleton extends Origin implements ISingleton {

    // implementation common to all singletons

    public instanceKey;

    // the 'necessary evil' static unsafe property :(
    protected static instance: Singleton | undefined = undefined;

    public constructor(key?: string) {
        super();
        this.instanceKey = Symbol.for(key || 'Singleton');
    }

    public static getInstance(): Singleton | undefined {
        return Singleton.instance;
    }

};

export { ISingleton, Singleton };

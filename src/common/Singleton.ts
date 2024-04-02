// file src/common/Singleton.ts


import { IOrigin, Origin } from './Origin';



interface ISingleton extends IOrigin {

    // instance members common to all singletons

    instanceKey: Required<Readonly<Symbol>>;

}

abstract class Singleton extends Origin implements ISingleton {

    // the 'necessary evil' static unsafe property :(
    protected static instance: Singleton | undefined = undefined;

    public constructor() {
        super();
        this.instanceKey = Symbol.for(`AbstractSingleton`);
    }

    public static getInstance(): Singleton | undefined {
        return Singleton.instance;
    }

};

export { ISingleton, Singleton };

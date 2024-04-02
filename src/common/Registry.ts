

import { IOrigin, Origin } from './Origin';
import { Singleton } from './Singleton';


interface IRegistry<T extends IOrigin> extends IOrigin {

    // members common to all registries

    registerOfItems: Readonly<Map<Symbol, T>>;

    register(instance: T): Symbol;

    get<U extends Origin>(this: IRegistry<T>, key: Symbol): U

}


abstract class Registry<T extends Singleton> extends Singleton implements IRegistry<T> {

    // implementation common to all registries

    public constructor() {
        super();
        this.instanceKey = Symbol.for(`AbstractRegistry`);
    }

    public registerOfItems: Readonly<Map<Symbol, T>> = new Map<Symbol, T>();

    public register(this: IRegistry<T>, instance: T): Symbol {
        this.instanceDebug(`Adding '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);

        if (this.registerOfItems.has(instance.instanceKey)) {
            this.instanceError('addToRegister', 'add instance',
                new Error(`An instance with the same key '${instance.instanceKey.toString()}' already exists, ` +
                    `try using a different key.`
                ));
        }

        this.registerOfItems.set(instance.instanceKey, instance);
        this.instanceDebug(`Added '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);
        return instance.instanceKey;
    }

    public get<U extends Singleton>(this: IRegistry<T>, key: Symbol): U {
        this.instanceDebug(`Getting instance with key '${key.toString()}'`);

        if (!this.registerOfItems.has(key)) {
            this.instanceError('getFromRegister', 'get instance',
                new Error(`No instance with key '${key.toString()}' exists, ` +
                    `try adding an instance first.`
                ));
        }

        const instance = (this.registerOfItems.get(key) as any & U) as U;
        this.instanceDebug(`Returning '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);
        return instance;
    }


}

export { IRegistry, Registry };

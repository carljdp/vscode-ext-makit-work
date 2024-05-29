

import { IOrigin, Origin } from './Origin';
import { Singleton } from './Singleton';


interface IRegistry<T extends Singleton> extends Singleton {

    // members common to all registries

    registerOfItems: Readonly<Map<Symbol, T>>;

    register(instance: T): Symbol;

    getAs<U extends Singleton>(this: Registry<T>, key: Symbol): U

}


class Registry<T extends Singleton> extends Singleton implements IRegistry<T> {

    // implementation common to all registries

    public constructor() {
        super();
        this.instanceKey = Symbol.for(`AbstractRegistry`);
    }

    public registerOfItems: Readonly<Map<Symbol, T>> = new Map<Symbol, T>();

    public register(this: Registry<T>, instance: T): Symbol {
        this.instanceDebug(`Adding a '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);

        if (this.registerOfItems.has(instance.instanceKey)) {
            throw this.instanceError('addToRegister', 'add instance',
                new Error(`An instance with the same key '${instance.instanceKey.toString()}' already exists, ` +
                    `try using a different key.`
                ));
        }

        this.registerOfItems.set(instance.instanceKey, instance);
        this.instanceDebug(`Added a '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);
        return instance.instanceKey;
    }

    public getAs<U extends Singleton>(this: Registry<T>, key: Symbol): U {
        this.instanceDebug(`Get the object where key '${key.toString()}'`);

        if (!this.registerOfItems.has(key)) {
            throw this.instanceError('getAs<>', 'find instance with key',
                new Error(`No instance with key '${key.toString()}' in the registry, ` +
                    `try adding an instance first.`
                ));
        }

        const instance = (this.registerOfItems.get(key) as any & U) as U;
        this.instanceDebug(`Returning '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);
        return instance;
    }


}

export { IRegistry, Registry };

"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Registry", {
    enumerable: true,
    get: function() {
        return Registry;
    }
});
const _Singleton = require("./Singleton");
class Registry extends _Singleton.Singleton {
    // implementation common to all registries
    constructor(){
        super();
        this.instanceKey = Symbol.for(`AbstractRegistry`);
    }
    registerOfItems = new Map();
    register(instance) {
        this.instanceDebug(`Adding a '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);
        if (this.registerOfItems.has(instance.instanceKey)) {
            throw this.instanceError('addToRegister', 'add instance', new Error(`An instance with the same key '${instance.instanceKey.toString()}' already exists, ` + `try using a different key.`));
        }
        this.registerOfItems.set(instance.instanceKey, instance);
        this.instanceDebug(`Added a '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);
        return instance.instanceKey;
    }
    getAs(key) {
        this.instanceDebug(`Get the object where key '${key.toString()}'`);
        if (!this.registerOfItems.has(key)) {
            throw this.instanceError('getAs<>', 'find instance with key', new Error(`No instance with key '${key.toString()}' in the registry, ` + `try adding an instance first.`));
        }
        const instance = this.registerOfItems.get(key);
        this.instanceDebug(`Returning '${instance.constructor.name}' with key '${instance.instanceKey.toString()}'`);
        return instance;
    }
}

//# sourceMappingURL=Registry.js.map
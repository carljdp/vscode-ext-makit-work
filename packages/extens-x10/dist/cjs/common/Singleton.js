// file src/common/Singleton.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Singleton", {
    enumerable: true,
    get: function() {
        return Singleton;
    }
});
const _Origin = require("./Origin");
class Singleton extends _Origin.Origin {
    // implementation common to all singletons
    instanceKey;
    // the 'necessary evil' static unsafe property :(
    static instance = undefined;
    constructor(key){
        super();
        this.instanceKey = Symbol.for(key || 'Singleton');
    }
    static getInstance() {
        return Singleton.instance;
    }
}

//# sourceMappingURL=Singleton.js.map
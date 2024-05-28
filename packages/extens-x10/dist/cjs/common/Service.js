"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Service", {
    enumerable: true,
    get: function() {
        return Service;
    }
});
const _Singleton = require("./Singleton");
class Service extends _Singleton.Singleton {
    // implementation common to all services
    constructor(key){
        super();
        this.instanceKey = Symbol.for(key || 'Service');
    }
}

//# sourceMappingURL=Service.js.map
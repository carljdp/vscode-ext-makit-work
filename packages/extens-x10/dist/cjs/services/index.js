"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "storageService", {
    enumerable: true,
    get: function() {
        return storageService;
    }
});
const _Registry = require("../common/Registry");
const _StorageService = require("./StorageService");
const services = new _Registry.Registry();
const storageServiceKey = services.register(new _StorageService.StorageService());
const storageService = services.getAs(storageServiceKey);

//# sourceMappingURL=index.js.map
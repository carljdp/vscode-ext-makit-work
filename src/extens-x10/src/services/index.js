"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const Registry_1 = require("../../../common/Registry");
const StorageService_1 = require("./StorageService");
const services = new Registry_1.Registry();
const storageServiceKey = services.register(new StorageService_1.StorageService());
exports.storageService = services.getAs(storageServiceKey);
